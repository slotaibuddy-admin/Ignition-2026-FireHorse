import { useState } from 'react';
import { motion } from 'framer-motion';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

/**
 * Payment modal - shows after 3 free generations
 * Offers: Stripe (credit card), PayPal, or Crypto
 */
export default function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  regionalSettings,
  priceInfo,
  walletAddress,
  isProcessing,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [method, setMethod] = useState('stripe');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStripePayment = async () => {
    if (!stripe || !elements) {
      setError('Stripe not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent on backend
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/create-payment-intent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: 2, // $2
            currency: regionalSettings.code.toLowerCase(),
            walletAddress,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to create payment intent');

      const { clientSecret } = await response.json();

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent.status === 'succeeded') {
        onPaymentSuccess({
          method: 'stripe',
          transactionId: result.paymentIntent.id,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create PayPal order on backend
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/create-paypal-order`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: 2, // $2
            walletAddress,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to create PayPal order');

      const { id: orderId, links } = await response.json();

      // Redirect to PayPal
      const approvalLink = links.find((link) => link.rel === 'approve');
      if (approvalLink) {
        window.location.href = approvalLink.href;
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleCryptoPayment = () => {
    onPaymentSuccess({
      method: 'crypto',
      note: 'Redirect to Alchemy payment gateway',
    });
  };

  if (!isOpen) return null;

  const paymentMethods = regionalSettings.paymentMethods || ['stripe'];
  const { formatted } = priceInfo;

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass-container p-8 max-w-md w-full mx-4 rounded-2xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        <h2 className="text-3xl font-bold text-white mb-2">Unlock More NFTs</h2>
        <p className="text-gray-400 mb-6">
          You've used your 3 free generations. Create more for{' '}
          <span className="text-orange-400 font-bold">{formatted}</span> each.
        </p>

        {/* Payment method selector */}
        <div className="space-y-3 mb-6">
          {paymentMethods.includes('stripe') && (
            <button
              onClick={() => setMethod('stripe')}
              className={`w-full p-4 rounded-lg border-2 transition ${
                method === 'stripe'
                  ? 'border-orange-400 bg-orange-500/10'
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">💳</span>
                <div className="text-left">
                  <p className="font-bold text-white">Credit Card</p>
                  <p className="text-xs text-gray-400">Visa, Mastercard, Amex</p>
                </div>
              </div>
            </button>
          )}

          {paymentMethods.includes('paypal') && (
            <button
              onClick={() => setMethod('paypal')}
              className={`w-full p-4 rounded-lg border-2 transition ${
                method === 'paypal'
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">🅿️</span>
                <div className="text-left">
                  <p className="font-bold text-white">PayPal</p>
                  <p className="text-xs text-gray-400">Fast & secure</p>
                </div>
              </div>
            </button>
          )}

          {paymentMethods.includes('crypto') && (
            <button
              onClick={() => setMethod('crypto')}
              className={`w-full p-4 rounded-lg border-2 transition ${
                method === 'crypto'
                  ? 'border-purple-400 bg-purple-500/10'
                  : 'border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">⛓️</span>
                <div className="text-left">
                  <p className="font-bold text-white">Crypto (MATIC)</p>
                  <p className="text-xs text-gray-400">Zero gas fees</p>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Stripe card details form */}
        {method === 'stripe' && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '14px',
                    color: '#ffffff',
                    '::placeholder': {
                      color: '#888888',
                    },
                  },
                  invalid: {
                    color: '#fa755a',
                  },
                },
              }}
            />
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <motion.button
            onClick={() => {
              if (method === 'stripe') handleStripePayment();
              else if (method === 'paypal') handlePayPalPayment();
              else if (method === 'crypto') handleCryptoPayment();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Pay ' + formatted}
          </motion.button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          Secure payment powered by Stripe & PayPal
        </p>
      </motion.div>
    </motion.div>
  );
}
