import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export default function ModuleCard({ module, onMint, isMinting, mintSuccess }) {
  const [particles, setParticles] = useState([]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      color: ['#3b82f6', '#8b5cf6', '#fbbf24'][Math.floor(Math.random() * 3)]
    }));
    setParticles(newParticles);
  }, []);

  const getRarityClass = (rarity) => {
    const rarityMap = {
      'Common': 'rarity-common',
      'Rare': 'rarity-rare',
      'Epic': 'rarity-epic',
      'Legendary': 'rarity-legendary',
      'Mythic': 'rarity-mythic'
    };
    return rarityMap[rarity] || 'rarity-common';
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -6;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 6;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <motion.div
      ref={cardRef}
      className="relative max-w-3xl w-full"
      style={{ perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 80, rotateX: 12 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Animated Energy Vortex Background */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="vortex-background">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="vortex-particle"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                }}
                animate={{
                  x: [0, Math.random() * 100 - 50, 0],
                  y: [0, Math.random() * 100 - 50, 0],
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Swirling energy rings */}
          <motion.div
            className="energy-ring energy-ring-1"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="energy-ring energy-ring-2"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="energy-ring energy-ring-3"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Main Card Content */}
        <div className="nft-glass-card relative z-10 p-6 md:p-10">
          <div className="space-y-6 md:space-y-8">
            {/* NFT Object with Glow and Pulse */}
            <div className="relative">
              <motion.div
                className="nft-object"
                animate={{
                  boxShadow: [
                    '0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(251, 191, 36, 0.4)',
                    '0 0 60px rgba(59, 130, 246, 0.8), 0 0 100px rgba(251, 191, 36, 0.6)',
                    '0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(251, 191, 36, 0.4)',
                  ],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Inner glow */}
                <div className="nft-inner-glow" />

                {/* NFT Content */}
                <div className="relative z-10 p-6 md:p-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                    {module.name}
                  </h2>
                  <motion.p
                    className={`text-2xl md:text-3xl font-bold ${getRarityClass(module.rarity)}`}
                    animate={{
                      textShadow: [
                        '0 0 10px rgba(251, 191, 36, 0.5)',
                        '0 0 20px rgba(251, 191, 36, 0.8)',
                        '0 0 10px rgba(251, 191, 36, 0.5)',
                      ],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {module.rarity}
                  </motion.p>

                  {/* Polygon Badge */}
                  <div className="flex justify-center mt-3">
                    <span className="polygon-badge">
                      <svg width="12" height="12" viewBox="0 0 38 33" fill="white">
                        <path d="M29 10.2c-.7-.4-1.6-.4-2.4 0L21 13.5l-3.8 2.1-5.5 3.3c-.7.4-1.6.4-2.4 0L5 16.3c-.7-.4-1.2-1.2-1.2-2.1v-5c0-.8.4-1.6 1.2-2.1l4.3-2.5c.7-.4 1.6-.4 2.4 0L16 7.2c.7.4 1.2 1.2 1.2 2.1v3.3l3.8-2.2V7c0-.8-.4-1.6-1.2-2.1l-8-4.7c-.7-.4-1.6-.4-2.4 0L1.2 5C.4 5.4 0 6.2 0 7v9.4c0 .8.4 1.6 1.2 2.1l8.1 4.7c.7.4 1.6.4 2.4 0l5.5-3.2 3.8-2.2 5.5-3.2c.7-.4 1.6-.4 2.4 0l4.3 2.5c.7.4 1.2 1.2 1.2 2.1v5c0 .8-.4 1.6-1.2 2.1L29 27.5c-.7.4-1.6.4-2.4 0l-4.3-2.5c-.7-.4-1.2-1.2-1.2-2.1v-3.3l-3.8 2.2v3.3c0 .8.4 1.6 1.2 2.1l8.1 4.7c.7.4 1.6.4 2.4 0l8.1-4.7c.7-.4 1.2-1.2 1.2-2.1V16c0-.8-.4-1.6-1.2-2.1L29 10.2z"/>
                      </svg>
                      Polygon
                    </span>
                  </div>
                </div>

                {/* Particle effects emanating from NFT */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="nft-particle"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: [0, Math.cos((i * Math.PI * 2) / 8) * 150],
                      y: [0, Math.sin((i * Math.PI * 2) / 8) * 150],
                      opacity: [0.8, 0],
                      scale: [0.5, 1.5],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </motion.div>
            </div>

            {/* Description */}
            <p className="text-gray-200 text-lg md:text-xl leading-relaxed text-center px-2 md:px-4">
              {module.description}
            </p>

            {/* Stats with animated bars */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {[
                { label: 'Power', value: module.power },
                { label: 'Speed', value: module.speed },
                { label: 'Heat', value: module.heat },
              ].map((stat) => (
                <div key={stat.label} className="stat-card">
                  <div className="text-3xl md:text-4xl font-bold fire-text">{stat.value}</div>
                  <div className="text-xs md:text-sm text-gray-300 mt-2 font-semibold">{stat.label}</div>
                  <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, var(--fire-orange), var(--fire-red))',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Gas-Sponsored - Free Mint */}
            <motion.div
              className="price-display"
              animate={{
                textShadow: [
                  '0 0 20px rgba(74, 222, 128, 0.8)',
                  '0 0 40px rgba(74, 222, 128, 1)',
                  '0 0 20px rgba(74, 222, 128, 0.8)',
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #4ade80 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              FREE
            </motion.div>
            <p className="text-center text-gray-400 text-sm -mt-4 mb-2">
              Gas fees sponsored - zero cost to you
            </p>

            {/* CTA Mint Button */}
            <AnimatePresence mode="wait">
              {mintSuccess ? (
                <motion.div
                  key="success"
                  className="cta-button text-center pointer-events-none"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  }}
                >
                  LICENSE SECURED
                </motion.div>
              ) : (
                <motion.button
                  key="mint"
                  className="cta-button"
                  onClick={onMint}
                  disabled={isMinting}
                  animate={isMinting ? {} : {
                    boxShadow: [
                      '0 0 20px rgba(251, 146, 60, 0.6), 0 0 40px rgba(239, 68, 68, 0.4)',
                      '0 0 40px rgba(251, 146, 60, 0.9), 0 0 60px rgba(239, 68, 68, 0.7)',
                      '0 0 20px rgba(251, 146, 60, 0.6), 0 0 40px rgba(239, 68, 68, 0.4)',
                    ],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  whileHover={isMinting ? {} : { scale: 1.1 }}
                  whileTap={isMinting ? {} : { scale: 0.95 }}
                  aria-label="Mint this NFT for free with gas sponsoring"
                  role="button"
                >
                  {isMinting ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="spinner w-6 h-6 border-2" />
                      SECURING LICENSE...
                    </span>
                  ) : (
                    'LOCK THIS TRIGGER FOR FREE'
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Psychological Trigger Texts */}
            <div className="space-y-3 mt-4 md:mt-6">
              <motion.div
                className="trigger-text-scarcity"
                animate={{
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                LIMITED EDITION - ALMOST GONE
              </motion.div>
              <motion.div
                className="trigger-text-exclusivity"
                animate={{
                  textShadow: [
                    '0 0 10px rgba(251, 191, 36, 0.5)',
                    '0 0 20px rgba(251, 191, 36, 0.8)',
                    '0 0 10px rgba(251, 191, 36, 0.5)',
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                UNLOCK EXCLUSIVE POWER NOW
              </motion.div>
            </div>

            {/* Unique ID */}
            {module.uniqueId && (
              <div className="text-center pt-2">
                <span className="nft-hash">ID: {module.uniqueId}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
