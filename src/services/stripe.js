/**
 * Stripe payment service - handles credit card and Apple Pay / Google Pay
 */

// In production, initialize Stripe with your public key
let stripeInstance = null;

export async function initializeStripe() {
  if (stripeInstance) return stripeInstance;

  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  if (!stripePublicKey) {
    console.warn('Stripe public key not configured');
    return null;
  }

  // Dynamic import to avoid loading Stripe unless needed
  const { loadStripe } = await import('@stripe/stripe-js');
  stripeInstance = await loadStripe(stripePublicKey);
  
  return stripeInstance;
}

/**
 * Create a Stripe Payment Intent for $2 mint
 * @param {string} email - User email
 * @param {string} walletAddress - Ethereum wallet address
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @returns {Object} - { clientSecret, sessionId }
 */
export async function createPaymentIntent(email, walletAddress, currency = 'USD') {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        walletAddress,
        currency,
        amount: 2, // $2 per mint
      }),
    });

    if (!response.ok) {
      throw new Error(`Payment intent creation failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Payment intent error:', error);
    throw error;
  }
}

/**
 * Confirm Stripe payment via Elements UI
 */
export async function confirmStripePayment(stripe, elements, clientSecret) {
  if (!stripe || !elements) {
    throw new Error('Stripe not initialized');
  }

  const result = await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/checkout-success`,
    },
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.paymentIntent;
}

/**
 * Setup PayPal subscription (not needed for one-time $2 payment, but kept for future)
 */
export async function createPayPalOrder(amount, walletAddress) {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-paypal-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount, // In dollars
        walletAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(`PayPal order creation failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('PayPal order error:', error);
    throw error;
  }
}

/**
 * Check if payment was successful and grant NFT mint
 */
export async function verifyPaymentComplete(sessionId, walletAddress) {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        walletAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(`Payment verification failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
}
