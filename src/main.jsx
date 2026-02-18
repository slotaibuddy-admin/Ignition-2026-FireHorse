import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Stripe Elements provider (optional — only active if key is set)
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || null;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {stripePromise ? (
      <Elements stripe={stripePromise}>
        <App />
      </Elements>
    ) : (
      <App />
    )}
  </StrictMode>,
)
