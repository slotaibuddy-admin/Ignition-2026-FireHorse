import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { ethers } from 'ethers';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));

// Raw body needed for Alchemy webhook HMAC signature verification
app.use('/webhook/alchemy', express.raw({ type: 'application/json' }));
app.use(express.json());

// ─── Config ──────────────────────────────────────────────────────────────────
const PORT                = process.env.PORT || 3000;
// Bundle price configured in USD now (fallback to $5)
const BUNDLE_PRICE_USD    = parseFloat(process.env.BUNDLE_PRICE_USD || '5');
const PAYMENT_ADDRESS     = (process.env.VITE_PAYMENT_ADDRESS || '').toLowerCase();
const ALCHEMY_SIGNING_KEY = process.env.ALCHEMY_WEBHOOK_SIGNING_KEY || '';
const ALCHEMY_API_KEY     = process.env.VITE_ALCHEMY_API_KEY || '';
const PRIVATE_KEY         = process.env.SERVER_PRIVATE_KEY || '';

if (!PRIVATE_KEY) {
  console.error('SERVER_PRIVATE_KEY is not set – signature grants will fail.');
}
const signerWallet = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY) : null;

// ─── In-memory grant store (replace with a DB in production) ─────────────────
// Map: lowercaseAddress → { txHash, signature, grantedAt, maticSent, eurValue }
const confirmed = new Map();

// ─── Processed tx hashes — anti-replay / idempotency ─────────────────────────
const processedTxHashes = new Set();

// ─── Rate limiting on check-payment ──────────────────────────────────────────
// Map: lowercaseAddress → { count, windowStart }
const pollRateMap = new Map();
const POLL_RATE_LIMIT   = 20;      // max requests per window
const POLL_RATE_WINDOW  = 60_000;  // 60 seconds

function checkPollRate(address) {
  const now = Date.now();
  const entry = pollRateMap.get(address);
  if (!entry || now - entry.windowStart > POLL_RATE_WINDOW) {
    pollRateMap.set(address, { count: 1, windowStart: now });
    return true;
  }
  entry.count++;
  return entry.count <= POLL_RATE_LIMIT;
}

// ─── CoinGecko price cache (60 s TTL, mirrors frontend logic) ────────────────
let priceCache = { rate: null, timestamp: 0 };
const CACHE_TTL_MS = 60_000;

async function fetchMaticEurRate() {
  const now = Date.now();
  if (priceCache.rate !== null && now - priceCache.timestamp < CACHE_TTL_MS) {
    return priceCache.rate;
  }

  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=eur'
  );
  if (!res.ok) {
    if (priceCache.rate !== null) return priceCache.rate; // use stale on failure
    throw new Error('CoinGecko unreachable');
  }

  const data = await res.json();
  const rate = data['matic-network']?.eur;
  if (!rate) throw new Error('Unexpected CoinGecko format');

  priceCache = { rate, timestamp: now };
  return rate;
}

// New: fetch MATIC/USD rate (used for bundle price comparisons)
let priceCacheUsd = { rate: null, timestamp: 0 };
async function fetchMaticUsdRate() {
  const now = Date.now();
  if (priceCacheUsd.rate !== null && now - priceCacheUsd.timestamp < CACHE_TTL_MS) {
    return priceCacheUsd.rate;
  }

  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd'
  );
  if (!res.ok) {
    if (priceCacheUsd.rate !== null) return priceCacheUsd.rate; // use stale on failure
    throw new Error('CoinGecko unreachable (usd)');
  }

  const data = await res.json();
  const rate = data['matic-network']?.usd;
  if (!rate) throw new Error('Unexpected CoinGecko format (usd)');

  priceCacheUsd = { rate, timestamp: now };
  return rate;
}

// ─── Alchemy webhook signature verification ──────────────────────────────────
function verifyAlchemySignature(rawBody, signature) {
  if (!ALCHEMY_SIGNING_KEY) {
    console.warn('ALCHEMY_WEBHOOK_SIGNING_KEY not set — skipping HMAC verification (dev mode).');
    return true;
  }
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', ALCHEMY_SIGNING_KEY);
  hmac.update(rawBody);
  const expected = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  );
}

// ─── Shared grant-issuing logic ──────────────────────────────────────────────
async function issueGrant(fromAddr, txHash, maticSent, usdValue) {
  // Idempotency: don't process the same tx twice
  if (processedTxHashes.has(txHash)) {
    console.log(`Tx ${txHash} already processed — skipping.`);
    return false;
  }

  if (!signerWallet) {
    console.error('No signer wallet configured — cannot issue grant.');
    return false;
  }

  const messageHash = ethers.solidityPackedKeccak256(
    ['address'],
    [fromAddr]
  );
  const signature = await signerWallet.signMessage(ethers.getBytes(messageHash));

  confirmed.set(fromAddr, {
    txHash,
    signature,
    grantedAt: new Date().toISOString(),
    maticSent,
    usdValue,
  });

  processedTxHashes.add(txHash);

  console.log(
    `Grant issued — ${fromAddr} paid ${maticSent} MATIC ~ USD${usdValue.toFixed(2)} | tx: ${txHash}`
  );
  return true;
}

// ─── Alchemy API: verify payment via alchemy_getAssetTransfers ───────────────
async function verifyPaymentViaAlchemy(senderAddress) {
  if (!ALCHEMY_API_KEY) {
    console.error('VITE_ALCHEMY_API_KEY not set — cannot verify via Alchemy API.');
    return null;
  }

  const url = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'alchemy_getAssetTransfers',
    params: [{
      fromBlock: '0x0',
      toBlock: 'latest',
      fromAddress: senderAddress,
      toAddress: PAYMENT_ADDRESS,
      category: ['external'],
      order: 'desc',
      maxCount: '0x5',
      withMetadata: true,
    }],
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error('Alchemy API error:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const transfers = data?.result?.transfers ?? [];

    // Find the most recent unprocessed transfer that meets the price threshold
    let rateUsd;
    try {
      rateUsd = await fetchMaticUsdRate();
    } catch {
      console.error('Price fetch failed during Alchemy verification.');
      return null;
    }

    for (const tx of transfers) {
      const maticSent = parseFloat(tx.value ?? 0);
      const usdValue  = maticSent * rateUsd;
      const txHash    = tx.hash;

      // Skip already processed
      if (processedTxHashes.has(txHash)) continue;

      // Check amount meets threshold (USD)
      if (usdValue >= BUNDLE_PRICE_USD) {
        return { txHash, maticSent, usdValue, fromAddr: senderAddress.toLowerCase() };
      }
    }

    return null; // no qualifying unprocessed transfer found
  } catch (err) {
    console.error('Alchemy API verification error:', err.message);
    return null;
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /webhook/alchemy
 * Alchemy Activity Webhook — fires when MATIC lands on PAYMENT_ADDRESS.
 *
 * Flow:
 *   1. Verify HMAC signature from Alchemy
 *   2. Find the activity directed to our payment address
 *   3. Fetch current MATIC/EUR rate from CoinGecko
 *   4. Validate: maticSent * rate >= BUNDLE_PRICE_EUR (19.99 EUR)
 *   5. Sign the user's address — this "voucher" lets them mint for free on-chain
 *   6. Store in confirmed map so the frontend can poll /api/check-payment
 */
app.post('/webhook/alchemy', async (req, res) => {
  const alchemySig = req.headers['x-alchemy-signature'];
  if (!verifyAlchemySignature(req.body, alchemySig)) {
    console.warn('Webhook HMAC mismatch — request rejected.');
    return res.status(401).send('Invalid signature');
  }

  let payload;
  try {
    payload = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).send('Bad JSON');
  }

  const activities = payload?.event?.activity ?? [];

  for (const activity of activities) {
    const toAddr   = (activity.toAddress   || '').toLowerCase();
    const fromAddr = (activity.fromAddress || '').toLowerCase();
    const maticSent = parseFloat(activity.value ?? 0);

    // Only process payments TO our configured payment address
    if (toAddr !== PAYMENT_ADDRESS) continue;

    // Fetch current MATIC/EUR rate
    let rate;
    try {
      rate = await fetchMaticEurRate();
    } catch (err) {
      console.error('Price fetch failed during webhook:', err.message);
      return res.status(503).send('Price service unavailable');
    }

    const usdValue = maticSent * rateUsd;

    if (usdValue < BUNDLE_PRICE_USD) {
      console.log(
        `Payment from ${fromAddr}: ${maticSent} MATIC = USD${usdValue.toFixed(2)} — below threshold USD${BUNDLE_PRICE_USD}`
      );
      continue; // amount too low — not a valid bundle payment
    }

    await issueGrant(fromAddr, activity.hash, maticSent, usdValue);
  }

  res.status(200).send('OK');
});

/**
 * GET /api/check-payment/:address
 * Frontend polls this after the MATIC tx is confirmed.
 * Returns { granted: true, signature, txHash } once validated,
 * or { granted: false } while still pending.
 *
 * If the webhook hasn't fired yet, falls back to Alchemy API verification
 * so the user isn't stuck waiting.
 *
 * The grant is consumed (deleted) on first successful read
 * so the signature cannot be reused.
 */
app.get('/api/check-payment/:address', async (req, res) => {
  const address = req.params.address.toLowerCase();

  // Rate limiting
  if (!checkPollRate(address)) {
    return res.status(429).json({ granted: false, error: 'Too many requests. Try again shortly.' });
  }

  // 1. Check if webhook already confirmed
  const grant = confirmed.get(address);
  if (grant) {
    confirmed.delete(address); // one-time use
    return res.json({
      granted:   true,
      signature: grant.signature,
      txHash:    grant.txHash,
    });
  }

  // 2. Fallback: verify payment via Alchemy API (in case webhook is delayed)
  const transfer = await verifyPaymentViaAlchemy(address);
  if (transfer) {
    const issued = await issueGrant(
      transfer.fromAddr,
      transfer.txHash,
      transfer.maticSent,
      transfer.eurValue
    );

    if (issued) {
      const newGrant = confirmed.get(address);
      if (newGrant) {
        confirmed.delete(address);
        return res.json({
          granted:   true,
          signature: newGrant.signature,
          txHash:    newGrant.txHash,
        });
      }
    }
  }

  return res.json({ granted: false });
});

/**
 * GET /api/verify-tx/:txHash
 * Directly verify a specific transaction hash against the payment address.
 * Useful for manual verification or support cases.
 */
app.get('/api/verify-tx/:txHash', async (req, res) => {
  const txHash = req.params.txHash;

  if (!ALCHEMY_API_KEY) {
    return res.status(503).json({ error: 'Alchemy API not configured' });
  }

  // Already processed?
  if (processedTxHashes.has(txHash)) {
    return res.json({ verified: true, status: 'already_processed', txHash });
  }

  const url = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

  try {
    const rpcRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      }),
    });

    const data = await rpcRes.json();
    const receipt = data?.result;

    if (!receipt) {
      return res.json({ verified: false, status: 'not_found' });
    }

    const toAddr = (receipt.to || '').toLowerCase();
    const isConfirmed = receipt.status === '0x1';

    if (toAddr !== PAYMENT_ADDRESS) {
      return res.json({ verified: false, status: 'wrong_recipient' });
    }

    if (!isConfirmed) {
      return res.json({ verified: false, status: 'tx_reverted' });
    }

    // Get the tx details for the value
    const txRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'eth_getTransactionByHash',
        params: [txHash],
      }),
    });
    const txData = await txRes.json();
    const tx = txData?.result;

    if (!tx) {
      return res.json({ verified: false, status: 'tx_not_found' });
    }

    const maticSent = parseFloat(ethers.formatEther(tx.value));
    let rate;
    try {
      rate = await fetchMaticEurRate();
    } catch {
      return res.status(503).json({ error: 'Price service unavailable' });
    }
    const eurValue = maticSent * rate;

    if (eurValue < BUNDLE_PRICE_EUR) {
      return res.json({
        verified: false,
        status: 'below_threshold',
        maticSent,
        eurValue: eurValue.toFixed(2),
        requiredEur: BUNDLE_PRICE_EUR,
      });
    }

    // Valid payment — issue grant
    const fromAddr = (tx.from || '').toLowerCase();
    await issueGrant(fromAddr, txHash, maticSent, eurValue);

    return res.json({
      verified: true,
      status: 'confirmed',
      txHash,
      from: fromAddr,
      maticSent,
      eurValue: eurValue.toFixed(2),
    });
  } catch (err) {
    console.error('Tx verification error:', err.message);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

/**
 * GET /api/webhook-status
 * Health check — returns configuration status and webhook readiness.
 */
app.get('/api/webhook-status', (_req, res) => {
  res.json({
    status: 'ok',
    webhookId: process.env.ALCHEMY_WEBHOOK_ID || null,
    hmacConfigured: !!ALCHEMY_SIGNING_KEY,
    alchemyApiConfigured: !!ALCHEMY_API_KEY,
    signerConfigured: !!signerWallet,
    paymentAddress: PAYMENT_ADDRESS || null,
    bundlePriceEur: BUNDLE_PRICE_EUR,
    pendingGrants: confirmed.size,
    processedTxCount: processedTxHashes.size,
  });
});

/**
 * POST /api/get-mint-signature
 * Generate signature for NFT minting
 * Body: { userAddress, metadataCID }
 * Returns: { signature }
 */
app.post('/api/get-mint-signature', async (req, res) => {
  try {
    const { userAddress, metadataCID } = req.body;
    
    if (!userAddress || !metadataCID) {
      return res.status(400).json({ error: 'Missing userAddress or metadataCID' });
    }
    
    if (!signerWallet) {
      return res.status(500).json({ error: 'Server signer not configured' });
    }
    
    // Create a message hash for signature
    // Sign: keccak256(abi.encodePacked(userAddress, metadataCID))
    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'string'],
      [userAddress, metadataCID]
    );
    
    // Sign with server wallet
    const signature = await signerWallet.signMessage(ethers.getBytes(messageHash));
    
    console.log(`Generated signature for ${userAddress}: ${signature.slice(0, 20)}...`);
    
    res.json({ signature });
  } catch (err) {
    console.error('Error generating signature:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/matic-price
 * Returns current MATIC/USD rate and configured bundle price (USD)
 */
app.get('/api/matic-price', async (_req, res) => {
  try {
    const rate = await fetchMaticUsdRate();
    res.json({ rate, bundlePriceUsd: BUNDLE_PRICE_USD });
  } catch {
    res.status(503).json({ error: 'Price unavailable' });
  }
});

/**
 * POST /api/create-payment-intent
 * Creates a Stripe Payment Intent for $2 NFT mint
 */
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, walletAddress } = req.body;

    if (!walletAddress || !amount) {
      return res.status(400).json({ error: 'Missing walletAddress or amount' });
    }

    // In production, call Stripe API:
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // cents
    //   currency,
    //   metadata: { walletAddress }
    // });
    // return res.json({ clientSecret: paymentIntent.client_secret, sessionId: paymentIntent.id });

    // For now, return mock response for development
    const mockClientSecret = `pi_test_${Date.now()}_${walletAddress.slice(2, 8)}`;
    const mockSessionId = `pi_${Date.now()}`;

    console.log(`Payment intent created: ${mockSessionId} for ${walletAddress}`);
    
    res.json({
      clientSecret: mockClientSecret,
      sessionId: mockSessionId,
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/create-paypal-order
 * Creates a PayPal order for $2 NFT mint
 */
app.post('/api/create-paypal-order', async (req, res) => {
  try {
    const { amount, walletAddress } = req.body;

    if (!walletAddress || !amount) {
      return res.status(400).json({ error: 'Missing walletAddress or amount' });
    }

    // In production, call PayPal API via @paypal/checkout-server-sdk
    // For now, return mock response
    const mockOrderId = `PAYPAL_${Date.now()}_${walletAddress.slice(2, 8)}`;
    const mockApprovalLink = `https://www.paypal.com/checkoutnow?token=EC-${walletAddress.slice(2)}TEST`;

    console.log(`PayPal order created: ${mockOrderId} for ${walletAddress}`);

    res.json({
      id: mockOrderId,
      links: [
        {
          rel: 'approve',
          href: mockApprovalLink,
        },
      ],
    });
  } catch (err) {
    console.error('Error creating PayPal order:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/verify-payment
 * Verifies payment completion and grants one free mint
 */
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { sessionId, walletAddress } = req.body;

    if (!sessionId || !walletAddress) {
      return res.status(400).json({ error: 'Missing sessionId or walletAddress' });
    }

    // In production, verify with Stripe or PayPal
    // For now, mock verification
    const verified = true;

    if (verified) {
      // Store payment record in mint database
      // Grant one free mint to the user
      confirmed.set(walletAddress.toLowerCase(), {
        sessionId,
        paidAt: new Date().toISOString(),
        amountUSD: 2,
        grantedMints: 1,
      });

      console.log(`Payment verified for ${walletAddress}: 1 free mint granted`);

      res.json({
        success: true,
        message: 'Payment verified. One free mint granted!',
        grantsRemaining: 1,
      });
    } else {
      res.status(400).json({ error: 'Payment not found or failed' });
    }
  } catch (err) {
    console.error('Error verifying payment:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Payment address  : ${PAYMENT_ADDRESS || '(not set)'}`);
  console.log(`Bundle price     : USD${BUNDLE_PRICE_USD}`);
  console.log(`Webhook ID       : ${process.env.ALCHEMY_WEBHOOK_ID || '(not set)'}`);
  console.log(`HMAC verification: ${ALCHEMY_SIGNING_KEY ? 'enabled' : 'DISABLED (dev mode)'}`);
  console.log(`Alchemy API key  : ${ALCHEMY_API_KEY ? 'configured' : '(not set)'}`);
  console.log(`Signer wallet    : ${signerWallet ? 'configured' : 'NOT configured'}`);
  console.log(`\n  Payment Endpoints:`);
  console.log(`  - POST /api/create-payment-intent (Stripe)`);
  console.log(`  - POST /api/create-paypal-order (PayPal)`);
  console.log(`  - POST /api/verify-payment`);
});
