# Deployment Guide: Fire Horse NFT Platform

## Current Status ✅
- **Backend**: Running on `http://localhost:3000`
- **Frontend**: Running on `http://localhost:5178`
- **All credentials configured**: Pinata, Alchemy, Stripe (payment link ready)

---

## Option 1: Deploy to Vercel (Recommended)

### Prerequisites
1. GitHub account with repository
2. Vercel account (https://vercel.com)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Fire Horse NFT Platform - Ready for Production"
git remote add origin https://github.com/YOUR_USERNAME/Ignition-2026-FireHorse.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com/new
2. Import the GitHub repository
3. Select **Ignition-2026-FireHorse**
4. Configure Build Settings:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables in Vercel
Go to Settings → Environment Variables and add:

```
# Frontend (public) variables
VITE_GEMINI_API_KEY=AIzaSyC2IkdtbHNU4rervNa0CgZtgEkhyVGdbiI
VITE_ALCHEMY_POLICY_ID=Cnq1arDASxPcI2a2ySOyZ
VITE_ALCHEMY_API_KEY=2iuPgsI4GBBwnmwGyKKg4
VITE_NFT_CONTRACT_ADDRESS=0xB929d04456D6938D4EEC148bf3ce68256C93E84e
VITE_PRICE_USD=5.00
VITE_PAYMENT_ADDRESS=0xB929d04456D6938D4EEC148bf3ce68256C93E84e
VITE_PINATA_API_KEY=4e6e579152a428d265ad
VITE_PINATA_SECRET_API_KEY=70b982280888f126cae6d96e6b02ff4c584cb51a9a10a6f4e0291213cb0e04d2
VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJkZDJjNDJjZC1hOGU3LTQ2MDUtYTZhOS0yN2I4ODA2ZmFmODgiLCJlbWFpbCI6InNsb3RhaWJ1ZGR5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0ZTZlNTc5MTUyYTQyOGQyNjVhZCIsInNjb3BlZEtleVNlY3JldCI6IjcwYjk4MjI4MDg4OGYxMjZjYWU2ZDk2ZTZiMDJmZjRjNTg0Y2I1MWE5YTEwYTZmNGUwMjkxMjEzY2IwZTA0ZDIiLCJleHAiOjE4MDI5NTY2OTV9.dc4sgzrx4uGjwR8Y0Kg1HZaESkQfIPZyTZNqd7KKH5g
VITE_STRIPE_PUBLIC_KEY=pk_test_replace_with_your_stripe_public_key
VITE_BACKEND_URL=https://your-backend-domain.com
```

### Step 4: Deploy Backend (Node.js Server)
The frontend is static HTML/CSS/JS. For the backend (payment signatures, webhooks), deploy to:
- **Railway**: https://railway.app (recommended for Node.js)
- **Render**: https://render.com
- **Heroku**: https://heroku.com

#### Railway Deployment:
1. Go to https://railway.app
2. Create new project
3. Connect GitHub repository
4. Configure environment variables (same as .env but without VITE_ prefix)
5. Set start command: `node server.js`
6. Railway auto-deploys on git push

#### Update Frontend Backend URL
After backend is deployed, add to Vercel environment variables:
```
VITE_BACKEND_URL=https://your-railway-app.up.railway.app
```

---

## Option 2: Deploy to Netlify

### Step 1: Connect GitHub
1. Go to https://app.netlify.com
2. Connect GitHub
3. Select repository
4. Build command: `npm run build`
5. Publish directory: `dist`

### Step 2: Add Environment Variables
Settings → Build & Deploy → Environment:
```
VITE_GEMINI_API_KEY=AIzaSyC2IkdtbHNU4rervNa0CgZtgEkhyVGdbiI
[... same as Vercel above ...]
```

### Step 3: Deploy Backend Same as Vercel (Railway/Render/Heroku)

---

## Environment Variables Checklist

### Frontend (VITE_ prefix - public)
- ✅ VITE_GEMINI_API_KEY
- ✅ VITE_ALCHEMY_POLICY_ID
- ✅ VITE_ALCHEMY_API_KEY
- ✅ VITE_NFT_CONTRACT_ADDRESS
- ✅ VITE_PRICE_USD
- ✅ VITE_PAYMENT_ADDRESS
- ✅ VITE_PINATA_API_KEY
- ✅ VITE_PINATA_SECRET_API_KEY
- ✅ VITE_PINATA_JWT
- ✅ VITE_STRIPE_PUBLIC_KEY
- ✅ VITE_BACKEND_URL (set after backend deployment)

### Backend (Server-side only)
- ✅ STRIPE_SECRET_KEY (for actual Stripe integration)
- ✅ PAYPAL_CLIENT_ID & PAYPAL_SECRET (for PayPal)
- ✅ SERVER_PRIVATE_KEY (already configured)
- ✅ ALCHEMY_WEBHOOK_SIGNING_KEY
- ✅ ALCHEMY_WEBHOOK_ID

---

## Recommended Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Users Browser                         │
└───────────────┬─────────────────────────────────┬────────────┘
                │                                 │
        ┌───────▼─────────────┐         ┌────────▼──────────────┐
        │  VERCEL / NETLIFY   │         │   RAILWAY / RENDER    │
        │  (Frontend React)   │◄───────►│  (Backend Node.js)    │
        │  - Static HTML/CSS  │         │  - API endpoints      │
        │  - IPFS uploads     │         │  - Webhooks           │
        │  - Wallet connect   │         │  - Signature signing  │
        └────────┬────────────┘         └────────┬──────────────┘
                 │                              │
                 │                              │
        ┌────────▼────────────┐        ┌────────▼──────────────┐
        │   Pinata (IPFS)     │        │   Alchemy Services    │
        │   - Image storage   │        │   - RPC + AA Gateway  │
        │   - Metadata CIDs   │        │   - Gas sponsorship   │
        └─────────────────────┘        └───────────────────────┘
                 │                              │
                 └───────────────┬──────────────┘
                                │
                    ┌───────────▼──────────────┐
                    │  Polygon Mainnet Chain  │
                    │  - Smart Contract       │
                    │  - NFT Minting          │
                    │  - Token Storage        │
                    └────────────────────────┘
```

---

## Monitoring & Testing After Deployment

### Test Endpoints
1. **Frontend**: https://your-vercel-domain.vercel.app
2. **Backend Health**: https://your-backend-domain.com/health
3. **Signature Endpoint**: POST https://your-backend-domain.com/api/get-mint-signature

### Test Flow
1. Open frontend in browser
2. Select country → Complete
3. Generate Fire Horse creature
4. After 3 free generations, click "Unlock More"
5. Choose payment method (Stripe, PayPal, or Crypto)
6. Complete payment
7. Mint NFT button enabled
8. Sign with wallet → Verify on Polygonscan

---

## Production Checklist

- [ ] Backend deployed to Railway/Render
- [ ] Frontend deployed to Vercel/Netlify
- [ ] All environment variables set correctly
- [ ] Stripe account integrated (not using payment link)
- [ ] PayPal credentials configured
- [ ] Alchemy webhook registered for Polygon mainnet
- [ ] Smart contract verified on Polygonscan
- [ ] User testing completed
- [ ] Monitor error logs in production

---

## Support & Troubleshooting

### Common Issues
1. **CORS errors**: Check FRONTEND_URL in backend .env
2. **IPFS upload fails**: Verify Pinata JWT is valid & not expired
3. **Payment not detected**: Check Alchemy webhook is registered
4. **Wallet connection fails**: Ensure MetaMask is installed
5. **NFT not minting**: Check smart contract address & user permissions

### Logs
- **Vercel/Netlify**: Deployments → View logs
- **Railway**: Logs tab in dashboard
- **Browser Console**: F12 → Console tab

---

## First Deployment: Summary

After completing above steps, your Fire Horse NFT Platform will be:
✅ Live on **Vercel/Netlify** (frontend)
✅ Running on **Railway** (backend)
✅ Storing metadata on **Pinata IPFS**
✅ Minting NFTs on **Polygon Mainnet**
✅ Gas-free minting via **Alchemy AA**

**Total Cost**: ~$10-20/month for hosting + blockchain gas fees

---

**Questions?** Check the [README.md](./README.md) for more technical details.
