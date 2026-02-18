const COINGECKO_URL_EUR =
  'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=eur';
const COINGECKO_URL_USD =
  'https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd';

// In-memory cache: { rate, timestamp }
let cache = { rate: null, timestamp: 0 };
let cacheUsd = { rate: null, timestamp: 0 };
const CACHE_TTL_MS = 60_000; // 60 seconds

/**
 * Fetch the current MATIC/EUR rate. Returns a cached value for up to 60 seconds.
 */
export async function fetchMaticEurRate() {
  const now = Date.now();
  if (cache.rate !== null && now - cache.timestamp < CACHE_TTL_MS) {
    return cache.rate;
  }

  const response = await fetch(COINGECKO_URL_EUR);
  if (!response.ok) {
    if (cache.rate !== null) return cache.rate;
    throw new Error('Failed to fetch MATIC price (eur)');
  }

  const data = await response.json();
  const rate = data['matic-network']?.eur;
  if (!rate) throw new Error('Unexpected CoinGecko response format (eur)');

  cache = { rate, timestamp: now };
  return rate;
}

/**
 * Fetch the current MATIC/USD rate. Returns a cached value for up to 60 seconds.
 */
export async function fetchMaticUsdRate() {
  const now = Date.now();
  if (cacheUsd.rate !== null && now - cacheUsd.timestamp < CACHE_TTL_MS) {
    return cacheUsd.rate;
  }

  const response = await fetch(COINGECKO_URL_USD);
  if (!response.ok) {
    if (cacheUsd.rate !== null) return cacheUsd.rate;
    throw new Error('Failed to fetch MATIC price (usd)');
  }

  const data = await response.json();
  const rate = data['matic-network']?.usd;
  if (!rate) throw new Error('Unexpected CoinGecko response format (usd)');

  cacheUsd = { rate, timestamp: now };
  return rate;
}

/**
 * Convert a USD amount to the equivalent MATIC amount.
 * @param {number} usdAmount - Amount in USD (e.g. 5)
 * @returns {Promise<{ maticAmount: number, rate: number }>} 
 */
export async function usdToMatic(usdAmount) {
  const rate = await fetchMaticUsdRate();
  const maticAmount = usdAmount / rate;
  return { maticAmount, rate };
}

/**
 * Convert a EUR amount to the equivalent MATIC amount.
 * @param {number} eurAmount - Amount in EUR (e.g. 19.99)
 * @returns {Promise<{ maticAmount: number, rate: number }>}
 */
export async function eurToMatic(eurAmount) {
  const rate = await fetchMaticEurRate();
  const maticAmount = eurAmount / rate;
  return { maticAmount, rate };
}
/**
 * Format a MATIC amount for display (4 decimal places).
 * @param {number} amount
 */
export function formatMatic(amount) {
  return amount.toFixed(4);
}
