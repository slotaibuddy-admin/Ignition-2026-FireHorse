import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

/**
 * GenerationProgressModal
 * Displays the 3-step process of creature generation:
 * 1. Summoning - AI generates creature JSON
 * 2. Crafting - Card is rendered
 * 3. Finalizing - 3D model loads
 */
export default function GenerationProgressModal({ isOpen, onComplete }) {
  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setIsTransitioning(false);
      return;
    }

    // Auto-progress through steps
    const step1Timer = setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(2);
        setIsTransitioning(false);
      }, 600);
    }, 2200);

    const step2Timer = setTimeout(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(3);
        setIsTransitioning(false);
      }, 600);
    }, 4600);

    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 7000);

    return () => {
      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(completeTimer);
    };
  }, [isOpen, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-96 h-96 flex flex-col items-center justify-center"
          >
            {/* Background glow */}
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 40px rgba(255, 107, 0, 0.3)',
                  '0 0 80px rgba(255, 107, 0, 0.5)',
                  '0 0 40px rgba(255, 107, 0, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl"
            />

            {/* Main content container */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-8">
              {/* Step 1: Summoning */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="summoning"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="relative w-20 h-20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-full blur-lg opacity-70" />
                      <div className="absolute inset-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse" />
                      <div className="absolute inset-6 border-4 border-orange-300 rounded-full" />
                    </motion.div>

                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-orange-400 mb-2">Summoning...</h3>
                      <p className="text-gray-300 text-sm">Awakening your Fire Horse Creature</p>
                    </div>

                    {/* Progress bar */}
                    <motion.div
                      className="w-full h-1 bg-gray-700 rounded-full overflow-hidden"
                    >
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: 'easeInOut' }}
                        className="h-full bg-gradient-to-r from-orange-400 to-red-600"
                      />
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 2: Crafting */}
                {step === 2 && (
                  <motion.div
                    key="crafting"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          '0 0 20px rgba(255, 107, 0, 0.3)',
                          '0 0 40px rgba(255, 107, 0, 0.7)',
                          '0 0 20px rgba(255, 107, 0, 0.3)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative w-24 h-32 bg-gradient-to-b from-orange-600 to-red-700 rounded-xl border-2 border-orange-400 shadow-lg"
                    >
                      {/* Card shine effect */}
                      <motion.div
                        animate={{
                          opacity: [0, 0.6, 0],
                          x: [-100, 200, -100]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                      />
                    </motion.div>

                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-orange-400 mb-2">Crafting...</h3>
                      <p className="text-gray-300 text-sm">Rendering your Creature Card</p>
                    </div>

                    {/* Progress bar */}
                    <motion.div
                      className="w-full h-1 bg-gray-700 rounded-full overflow-hidden"
                    >
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: 'easeInOut' }}
                        className="h-full bg-gradient-to-r from-orange-400 to-red-600"
                      />
                    </motion.div>
                  </motion.div>
                )}

                {/* Step 3: Finalizing */}
                {step === 3 && (
                  <motion.div
                    key="finalizing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <motion.div
                      animate={{
                        rotateX: [0, 180, 360],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="relative w-24 h-24"
                      style={{ perspective: '1000px' }}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-600 rounded-xl border-2 border-purple-300 shadow-2xl flex items-center justify-center">
                        <span className="text-3xl">3D</span>
                      </div>
                    </motion.div>

                    <div className="text-center">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        Finalizing...
                      </h3>
                      <p className="text-gray-300 text-sm">Loading your 3D Creature</p>
                    </div>

                    {/* Progress bar */}
                    <motion.div
                      className="w-full h-1 bg-gray-700 rounded-full overflow-hidden"
                    >
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: 'easeInOut' }}
                        className="h-full bg-gradient-to-r from-purple-400 to-pink-600"
                      />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step indicators at bottom */}
              <div className="absolute bottom-8 flex gap-4">
                {[1, 2, 3].map((s) => (
                  <motion.div
                    key={s}
                    animate={{
                      scale: s === step ? 1.2 : 1,
                      opacity: s <= step ? 1 : 0.4,
                      backgroundColor: s < step ? '#10B981' : s === step ? '#F97316' : '#4B5563'
                    }}
                    transition={{ duration: 0.3 }}
                    className="w-3 h-3 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
