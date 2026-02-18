import { motion, AnimatePresence } from 'framer-motion';
import { truncateAddress } from '../services/wallet';

export default function WalletButton({ walletAddress, chainId, balance, onConnect, isConnecting }) {
  const isPolygon = chainId === 137;

  if (!walletAddress) {
    return (
      <motion.button
        className="wallet-button flex items-center gap-2"
        onClick={onConnect}
        disabled={isConnecting}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {isConnecting ? (
          <>
            <div className="spinner w-4 h-4 border-2" />
            <span className="text-sm">Connecting...</span>
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="14" rx="2" />
              <path d="M16 14a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" />
              <path d="M2 10h20" />
            </svg>
            <span className="text-sm">Connect Wallet</span>
          </>
        )}
      </motion.button>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="wallet-button flex items-center gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Network status dot */}
        <div
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            isPolygon ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]' : 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)]'
          }`}
        />
        <div className="text-left">
          <div className="text-sm font-mono leading-tight">{truncateAddress(walletAddress)}</div>
          {balance && (
            <div className="text-xs text-gray-400 leading-tight">
              {parseFloat(balance).toFixed(4)} MATIC
            </div>
          )}
        </div>
        {!isPolygon && (
          <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full whitespace-nowrap">
            Switch Network
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
