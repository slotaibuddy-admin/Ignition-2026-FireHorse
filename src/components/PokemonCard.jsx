import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateCardFront, generateCardBack } from '../services/cardGenerator';

/**
 * PokemonCard Component
 * Displays a flippable Pokemon-style card with front and back
 * Front: Dynamic creature card with stats
 * Back: Static Fire Horse branded back
 */
export default function PokemonCard({ creatureData, cardImageUrl }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    // Generate card images
    try {
      setIsGenerating(true);

      // Generate front
      const front = generateCardFront(creatureData, cardImageUrl);
      setFrontImage(front);

      // Generate back
      const back = generateCardBack();
      setBackImage(back);

      setIsGenerating(false);
    } catch (err) {
      console.error('Error generating card:', err);
      setIsGenerating(false);
    }
  }, [creatureData, cardImageUrl]);

  const rarityGradient = {
    Common: 'from-gray-400 to-gray-600',
    Rare: 'from-blue-400 to-blue-600',
    Epic: 'from-purple-400 to-purple-600',
    Legendary: 'from-yellow-400 to-orange-600',
    Mythic: 'from-pink-400 to-red-600'
  };

  const rarityBg = rarityGradient[creatureData.rarity] || rarityGradient.Common;

  return (
    <div className="w-full h-full flex items-center justify-center gap-8 p-4 bg-gradient-to-b from-gray-900 to-black">
      {isGenerating ? (
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Rendering Card...</p>
        </div>
      ) : (
        <>
          {/* Card Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="cursor-pointer flex flex-col items-center gap-4 max-w-sm"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Flippable Card */}
            <div
              style={{
                perspective: '1000px',
                width: '320px',
                height: '384px'
              }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{
                  transformStyle: 'preserve-3d',
                  width: '100%',
                  height: '100%'
                }}
              >
                {/* Front of card */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    width: '100%',
                    height: '100%',
                    position: 'absolute'
                  }}
                  className={`bg-gradient-to-b ${rarityBg} rounded-xl border-4 flex items-center justify-center shadow-2xl`}
                >
                  {frontImage ? (
                    <img
                      src={frontImage}
                      alt="Card Front"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-white text-center px-4">
                      <p>Generating Card...</p>
                    </div>
                  )}

                  {/* Shine effect */}
                  <motion.div
                    animate={{
                      opacity: [0, 0.3, 0],
                      x: [-100, 200, -100]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none rounded-lg"
                  />
                </div>

                {/* Back of card - rotated 180 degrees */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    transform: 'rotateY(180deg)'
                  }}
                  className="bg-gradient-to-b from-gray-800 to-black rounded-xl border-4 border-yellow-500 flex items-center justify-center overflow-hidden shadow-2xl"
                >
                  {backImage ? (
                    <img
                      src={backImage}
                      alt="Card Back"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-center">Back Loading...</div>
                  )}

                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                      <defs>
                        <pattern id="diagonal" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                          <line x1="0" y1="0" x2="20" y2="20" stroke="yellow" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect x="0" y="0" width="100%" height="100%" fill="url(#diagonal)" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Click hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              className="text-center text-gray-400 text-sm"
            >
              {isFlipped ? '← Click to see front' : 'Click to flip card →'}
            </motion.p>
          </motion.div>

          {/* Info panel on the side - Hidden on mobile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block bg-black/60 backdrop-blur-sm rounded-lg p-4 max-w-xs border border-orange-500/30"
          >
            <h3 className="text-orange-400 font-bold mb-3">Card Details</h3>
            <div className="space-y-2 text-xs text-gray-300">
              <p>
                <span className="text-orange-400">Name:</span>
                <br />
                <span className="font-semibold">{creatureData.name}</span>
              </p>
              <p>
                <span className="text-orange-400">Rarity:</span>
                <br />
                <span className={`font-bold`}>
                  {creatureData.rarity}
                </span>
              </p>
              <p>
                <span className="text-orange-400">Year:</span> 2026
              </p>

              <div className="border-t border-orange-500/20 pt-2 mt-2">
                <p className="text-orange-400 text-xs font-semibold mb-1">Stats</p>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span>Power:</span>
                    <span className="font-bold text-orange-500">{creatureData.power}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Speed:</span>
                    <span className="font-bold text-blue-400">{creatureData.speed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Heat:</span>
                    <span className="font-bold text-red-500">{creatureData.heat}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>HP:</span>
                    <span className="font-bold text-green-400">{creatureData.hp}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-orange-500/20 pt-2 mt-2">
                <p className="text-orange-400 text-xs font-semibold mb-1">Weakness</p>
                <p className="text-yellow-300">→ {creatureData.weakness}</p>
              </div>

              <div className="border-t border-orange-500/20 pt-2 mt-2">
                <p className="text-orange-400 text-xs font-semibold mb-1">Resistance</p>
                <p className="text-green-300">→ {creatureData.resistance}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
