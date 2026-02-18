import { motion } from 'framer-motion';

export default function GenerateButton({ onClick, isLoading, refreshesRemaining, isLocked, onUnlock }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Refresh counter */}
      <motion.div
        className={`refresh-badge ${isLocked ? 'border-red-500/40 bg-red-500/10 text-red-400' : ''}`}
        key={refreshesRemaining}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        {isLocked
          ? 'No refreshes remaining'
          : `${refreshesRemaining} free refresh${refreshesRemaining !== 1 ? 'es' : ''} remaining`}
      </motion.div>

      {/* Button */}
      <motion.button
        className={`fire-button flex items-center gap-3 mx-auto text-lg px-8 py-4 ${
          isLocked ? 'grayscale opacity-60' : ''
        }`}
        onClick={isLocked ? onUnlock : onClick}
        disabled={isLoading}
        whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(255, 107, 0, 0.5)' }}
        whileTap={{ scale: 0.95 }}
      >
        {isLoading ? (
          <>
            <div className="spinner" />
            <span>Generating...</span>
          </>
        ) : isLocked ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <span>Get More Refreshes</span>
          </>
        ) : (
          <>
            <span>Generate Cyber Module</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
