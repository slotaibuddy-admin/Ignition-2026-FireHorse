import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ModuleCard({ module, price = "19.99" }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random particles for the vortex effect
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

  return (
    <div className="relative max-w-3xl w-full fade-in">
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
      <div className="nft-glass-card relative z-10 p-10">
        <div className="space-y-8">
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
              <div className="relative z-10 p-8">
                <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                  {module.name}
                </h2>
                <motion.p
                  className={`text-3xl font-bold ${getRarityClass(module.rarity)}`}
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
          <p className="text-gray-200 text-xl leading-relaxed text-center px-4">
            {module.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="text-4xl font-bold fire-text">{module.power}</div>
              <div className="text-sm text-gray-300 mt-2 font-semibold">Power</div>
            </div>
            <div className="stat-card">
              <div className="text-4xl font-bold fire-text">{module.speed}</div>
              <div className="text-sm text-gray-300 mt-2 font-semibold">Speed</div>
            </div>
            <div className="stat-card">
              <div className="text-4xl font-bold fire-text">{module.heat}</div>
              <div className="text-sm text-gray-300 mt-2 font-semibold">Heat</div>
            </div>
          </div>

          {/* Price Display - Large and Golden */}
          <motion.div
            className="price-display"
            animate={{
              textShadow: [
                '0 0 20px rgba(251, 191, 36, 0.8)',
                '0 0 40px rgba(251, 191, 36, 1)',
                '0 0 20px rgba(251, 191, 36, 0.8)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            € {price}
          </motion.div>

          {/* CTA Button - Aggressively Pulsing */}
          <motion.button
            className="cta-button"
            animate={{
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
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Purchase this NFT module now"
            role="button"
          >
            🔥 LOCK THIS TRIGGER NOW 🔥
          </motion.button>

          {/* Psychological Trigger Texts */}
          <div className="space-y-3 mt-6">
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
              ⚠️ LIMITED EDITION - ALMOST GONE
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
              ✨ UNLOCK EXCLUSIVE POWER NOW ✨
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
