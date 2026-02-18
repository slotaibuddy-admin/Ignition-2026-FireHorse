import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useMaticPrice } from '../hooks/useMaticPrice';

export default function BundlePurchase({ onClose, onPurchase, isPurchasing, walletAddress, onConnectWallet }) {
  const { maticDisplay, usdAmount, isLoading, lastUpdated, refresh } = useMaticPrice();

  // Countdown to next price refresh (60 s)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(60);

  useEffect(() => {
    if (!lastUpdated) return;
    setSecondsUntilRefresh(60);
    const tick = setInterval(() => {
      setSecondsUntilRefresh((s) => {
        if (s <= 1) {
          clearInterval(tick);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  // Flash animation whenever price updates
  const [priceFlash, setPriceFlash] = useState(false);
  useEffect(() => {
    if (!lastUpdated) return;
    setPriceFlash(true);
    const t = setTimeout(() => setPriceFlash(false), 600);
    return () => clearTimeout(t);
  }, [lastUpdated]);

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-card"
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <motion.div
            className="text-5xl mb-3"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            &#x1F525;
          </motion.div>
          <h3 className="text-3xl font-bold fire-text mb-1">Unlock More Generations</h3>
          <p className="text-gray-400 text-sm">3 additional NFT generations on Polygon</p>
        </div>

        {/* Live price card */}
        <div className="glass-card p-5 mb-5 text-center" style={{ borderColor: 'rgba(255,107,0,0.3)' }}>
          {/* USD anchor price */}
          <div className="text-gray-300 text-sm uppercase tracking-wider font-semibold mb-1">Bundle Price</div>
          <div className="text-4xl font-black text-white mb-1">${usdAmount.toFixed(2)}</div>

          <div className="section-divider my-3" />

          {/* Live MATIC equivalent */}
          <div className="text-gray-400 text-xs mb-1 uppercase tracking-widest">≈ current MATIC equivalent</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={maticDisplay}
              className="price-display !text-5xl !my-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{
                opacity: 1,
                y: 0,
                color: priceFlash ? '#4ade80' : undefined,
              }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              {isLoading ? '…' : maticDisplay} MATIC
            </motion.div>
          </AnimatePresence>

          {/* Urgency countdown */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <motion.div
              className="w-2 h-2 rounded-full bg-orange-400"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs text-gray-500">
              Price updates in{' '}
              <span
                className={`font-bold tabular-nums ${
                  secondsUntilRefresh <= 10 ? 'text-orange-400' : 'text-gray-400'
                }`}
              >
                {secondsUntilRefresh}s
              </span>
            </span>
            <button
              onClick={refresh}
              className="text-xs text-gray-600 hover:text-gray-300 underline transition-colors"
              disabled={isLoading}
            >
              refresh
            </button>
          </div>

          {/* Polygon badge */}
          <div className="flex justify-center mt-3">
            <span className="polygon-badge">
              <svg width="10" height="10" viewBox="0 0 38 33" fill="white">
                <path d="M29 10.2c-.7-.4-1.6-.4-2.4 0L21 13.5l-3.8 2.1-5.5 3.3c-.7.4-1.6.4-2.4 0L5 16.3c-.7-.4-1.2-1.2-1.2-2.1v-5c0-.8.4-1.6 1.2-2.1l4.3-2.5c.7-.4 1.6-.4 2.4 0L16 7.2c.7.4 1.2 1.2 1.2 2.1v3.3l3.8-2.2V7c0-.8-.4-1.6-1.2-2.1l-8-4.7c-.7-.4-1.6-.4-2.4 0L1.2 5C.4 5.4 0 6.2 0 7v9.4c0 .8.4 1.6 1.2 2.1l8.1 4.7c.7.4 1.6.4 2.4 0l5.5-3.2 3.8-2.2 5.5-3.2c.7-.4 1.6-.4 2.4 0l4.3 2.5c.7.4 1.2 1.2 1.2 2.1v5c0 .8-.4 1.6-1.2 2.1L29 27.5c-.7.4-1.6.4-2.4 0l-4.3-2.5c-.7-.4-1.2-1.2-1.2-2.1v-3.3l-3.8 2.2v3.3c0 .8.4 1.6 1.2 2.1l8.1 4.7c.7.4 1.6.4 2.4 0l8.1-4.7c.7-.4 1.2-1.2 1.2-2.1V16c0-.8-.4-1.6-1.2-2.1L29 10.2z" />
              </svg>
              Polygon Mainnet
            </span>
          </div>
        </div>

        {/* What the user gets */}
        <div className="flex items-center justify-center gap-6 mb-5 text-sm">
          <div className="flex items-center gap-1.5 text-gray-300">
            <span className="text-green-400">&#x2713;</span> 3 generations unlocked
          </div>
          <div className="flex items-center gap-1.5 text-gray-300">
            <span className="text-green-400">&#x2713;</span> Free mint included
          </div>
        </div>

        {/* Action */}
        {!walletAddress ? (
          <motion.button
            className="fire-button w-full flex items-center justify-center gap-2 text-base"
            onClick={onConnectWallet}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="14" rx="2" />
              <path d="M16 14a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" />
              <path d="M2 10h20" />
            </svg>
            Connect Wallet to Pay
          </motion.button>
        ) : (
          <motion.button
            className="cta-button"
            onClick={onPurchase}
            disabled={isPurchasing || isLoading}
            whileHover={isPurchasing ? {} : { scale: 1.02 }}
            whileTap={isPurchasing ? {} : { scale: 0.98 }}
          >
            {isPurchasing ? (
              <span className="flex items-center justify-center gap-3">
                <div className="spinner w-5 h-5 border-2" />
                SENDING PAYMENT...
              </span>
            ) : (
              `PAY ${isLoading ? '…' : maticDisplay} MATIC`
            )}
          </motion.button>
        )}

        <p className="text-gray-600 text-xs text-center mt-3">
          Payment validated server-side · Free mint auto-granted on confirmation
        </p>

        <button
          className="text-gray-500 hover:text-gray-300 mt-3 text-sm w-full text-center transition-colors"
          onClick={onClose}
        >
          Maybe Later
        </button>
      </motion.div>
    </motion.div>
  );
}
