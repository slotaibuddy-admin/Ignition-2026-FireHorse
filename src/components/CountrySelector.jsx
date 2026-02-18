import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { detectCountry, getRegionalSettings, saveCountryPreference } from '../services/geolocation';

/**
 * Country selector modal - shown on first visit
 */
export default function CountrySelector({ onSelect, isOpen }) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [detectedCountry, setDetectedCountry] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    // Auto-detect country on mount
    detectCountry().then((country) => {
      setDetectedCountry(country);
      setSelectedCountry(country);
      setIsLoading(false);
    });
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedCountry) {
      saveCountryPreference(selectedCountry);
      onSelect(selectedCountry);
    }
  };

  const commonCountries = [
    'US', 'GB', 'DE', 'FR', 'IT', 'ES',
    'JP', 'AU', 'CA', 'BR', 'IN', 'SG',
  ];

  const topCountries = [
    { code: 'US', name: '🇺🇸 United States' },
    { code: 'GB', name: '🇬🇧 United Kingdom' },
    { code: 'DE', name: '🇩🇪 Germany' },
    { code: 'FR', name: '🇫🇷 France' },
    { code: 'JP', name: '🇯🇵 Japan' },
    { code: 'AU', name: '🇦🇺 Australia' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
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
            <h2 className="text-3xl font-bold text-white mb-2">Welcome!</h2>
            <p className="text-gray-400 mb-6">
              Where are you located? We'll customize currency and payment methods for you.
            </p>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400" />
              </div>
            ) : (
              <>
                {/* Top countries quick select */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {topCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => setSelectedCountry(country.code)}
                      className={`p-3 rounded-lg transition-all ${
                        selectedCountry === country.code
                          ? 'bg-orange-500/40 border-2 border-orange-400'
                          : 'bg-white/5 border-2 border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <span className="text-sm font-medium">{country.name}</span>
                    </button>
                  ))}
                </div>

                {detectedCountry && selectedCountry === detectedCountry && (
                  <p className="text-xs text-gray-500 text-center mb-4">
                    ✓ We detected your location
                  </p>
                )}

                <motion.button
                  onClick={handleConfirm}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all"
                >
                  Continue
                </motion.button>

                <button
                  onClick={() => {
                    // Show all countries dropdown
                    // For now, just proceed with detected
                    if (detectedCountry) {
                      setSelectedCountry(detectedCountry);
                    }
                  }}
                  className="w-full mt-3 py-2 text-gray-400 text-sm hover:text-gray-300 transition"
                >
                  All Countries →
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
