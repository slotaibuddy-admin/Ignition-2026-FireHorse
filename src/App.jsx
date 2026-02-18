import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import NFTViewer from './components/NFTViewer';
import GenerateButton from './components/GenerateButton';
import BundlePurchase from './components/BundlePurchase';
import GenerationProgressModal from './components/GenerationProgressModal';
import ExplosionEffect from './components/ExplosionEffect';
import Footer from './components/Footer';
import CountrySelector from './components/CountrySelector';
import PaymentModal from './components/PaymentModal';
import { generateCyberModule } from './services/gemini';
import { generateCardFront } from './services/cardGenerator';
import { mintNFT } from './services/alchemy';
import { uploadNFTToIPFS } from './services/ipfs';
import { getFallbackAsset } from './services/modelAssets';
import {
  isMetaMaskInstalled,
  connectWallet,
  switchToPolygon,
  getBalance,
  sendBundlePayment,
  POLYGON_CHAIN_ID
} from './services/wallet';
import { usdToMatic } from './utils/priceUtils';
import {
  getUserCountry,
  getRegionalSettings,
  formatPrice,
} from './services/geolocation';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const POLL_INTERVAL_MS = 5_000;
const POLL_MAX_ATTEMPTS = 36; // 36 × 5 s = 3 minutes

function App() {
  // NFT generation state
  const [module, setModule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardImageUrl, setCardImageUrl] = useState(null);
  
  // Generation flow state
  const [showGenerationProgress, setShowGenerationProgress] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const explosionTimeoutRef = useRef(null);

  // Minting state
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [ipfsMetadata, setIPFSMetadata] = useState(null);

  // Wallet state
  const [walletAddress, setWalletAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Refresh system state (persisted in localStorage)
  const [refreshesRemaining, setRefreshesRemaining] = useState(() => {
    const stored = localStorage.getItem('ignition_refreshes_remaining');
    return stored !== null ? parseInt(stored, 10) : 3;
  });
  const [totalGenerated, setTotalGenerated] = useState(() => {
    const stored = localStorage.getItem('ignition_total_generated');
    return stored !== null ? parseInt(stored, 10) : 0;
  });

  // Purchase modal state
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Regional & payment state
  const [showCountrySelector, setShowCountrySelector] = useState(() => {
    return !localStorage.getItem('ignition_country');
  });
  const [country, setCountry] = useState(null);
  const [regionalSettings, setRegionalSettings] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [priceInfo, setPriceInfo] = useState(null);

  // Initialize regional settings
  useEffect(() => {
    if (!showCountrySelector && !country) {
      getUserCountry().then((detected) => {
        const settings = getRegionalSettings(detected);
        setCountry(detected);
        setRegionalSettings(settings);
        setPriceInfo(formatPrice(2, settings)); // $2 per mint
      });
    }
  }, [showCountrySelector, country]);

  // Update pricing when regional settings change
  useEffect(() => {
    if (regionalSettings) {
      setPriceInfo(formatPrice(2, regionalSettings));
    }
  }, [regionalSettings]);

  // Persist refresh state to localStorage
  useEffect(() => {
    localStorage.setItem('ignition_refreshes_remaining', refreshesRemaining);
  }, [refreshesRemaining]);

  useEffect(() => {
    localStorage.setItem('ignition_total_generated', totalGenerated);
  }, [totalGenerated]);

  // MetaMask event listeners
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountChange = (accounts) => {
      if (accounts.length === 0) {
        setWalletAddress(null);
        setBalance(null);
        setChainId(null);
      } else {
        setWalletAddress(accounts[0]);
        getBalance(accounts[0]).then(setBalance).catch(console.error);
      }
    };

    const handleChainChange = (newChainIdHex) => {
      const newChainId = parseInt(newChainIdHex, 16);
      setChainId(newChainId);
      if (walletAddress) {
        getBalance(walletAddress).then(setBalance).catch(console.error);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountChange);
    window.ethereum.on('chainChanged', handleChainChange);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountChange);
      window.ethereum.removeListener('chainChanged', handleChainChange);
    };
  }, [walletAddress]);

  // Generate handler with refresh tracking and progress modal
  const handleGenerate = async () => {
    if (refreshesRemaining <= 0) {
      setShowPaymentModal(true);
      return;
    }

    setShowGenerationProgress(true);
    setError(null);
    setMintSuccess(false);

    try {
      const newModule = await generateCyberModule();
      setModule(newModule);
      
      // Ensure asset3dType is valid
      if (newModule.asset3dType && newModule.asset3dType.trim() === '') {
        newModule.asset3dType = getFallbackAsset(newModule.asset3dType);
      }
      
      setRefreshesRemaining((prev) => prev - 1);
      setTotalGenerated((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
      console.error('Generation error:', err);
      setShowGenerationProgress(false);
    }
  };

  // Handle generation progress modal completion
  const handleGenerationComplete = () => {
    setShowGenerationProgress(false);
    setShowExplosion(true);
    
    // Auto-hide explosion after animation
    if (explosionTimeoutRef.current) {
      clearTimeout(explosionTimeoutRef.current);
    }
    explosionTimeoutRef.current = setTimeout(() => {
      setShowExplosion(false);
    }, 2500);
  };

  // Generate card image when module changes
  useEffect(() => {
    if (module) {
      try {
        const frontImage = generateCardFront(module);
        setCardImageUrl(frontImage);
      } catch (err) {
        console.error('Card generation error:', err);
      }
    }
  }, [module]);

  // Gas-sponsored mint handler with IPFS metadata
  const handleMint = async () => {
    if (!module || !cardImageUrl) return;

    setIsMinting(true);
    try {
      // Step 1: Upload NFT to IPFS (card + metadata)
      console.log('Uploading NFT to IPFS...');
      const ipfsResult = await uploadNFTToIPFS(cardImageUrl, module);
      setIPFSMetadata(ipfsResult);

      if (!ipfsResult.metadataURI) {
        throw new Error('Failed to get IPFS metadata URI');
      }

      // Step 2: Prepare signature from backend
      const signatureFromBackend = await getSignatureFromBackend(walletAddress, ipfsResult.ipfsMetadataHash);
      
      if (!signatureFromBackend) {
        throw new Error('Failed to get mint signature from backend');
      }

      // Step 3: Mint via Alchemy AA with signature and IPFS metadata
      console.log('Minting NFT with signature and IPFS metadata...');
      const result = await mintNFT(signatureFromBackend, ipfsResult.ipfsMetadataHash);
      console.log('Transaction sponsored successfully:', result.hash);
      setMintSuccess(true);
    } catch (err) {
      console.error('Minting error:', err);
      setError(`Minting failed: ${err.message}. Please try again.`);
    } finally {
      setIsMinting(false);
    }
  };

  // Helper: Request signature from backend
  const getSignatureFromBackend = async (userAddress, metadataCID) => {
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${BACKEND_URL}/api/get-mint-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAddress,
          metadataCID
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get signature from backend');
      }
      
      const data = await response.json();
      return data.signature;
    } catch (err) {
      console.error('Error getting signature from backend:', err);
      throw err;
    }
  };

  // Handle STL download
  const handleDownloadSTL = async () => {
    if (!module) return;
    
    try {
      alert('STL Download: Feature requires 3D model loader integration. Coming soon!');
    } catch (err) {
      console.error('STL export error:', err);
      setError('Failed to export STL file. Please try again.');
    }
  };

  // Wallet connection handler
  const handleConnectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const result = await connectWallet();
      setWalletAddress(result.address);
      setChainId(result.chainId);

      if (result.chainId !== POLYGON_CHAIN_ID) {
        try {
          await switchToPolygon();
          setChainId(POLYGON_CHAIN_ID);
        } catch (switchErr) {
          console.error('Network switch error:', switchErr);
        }
      }

      const bal = await getBalance(result.address);
      setBalance(bal);
    } catch (err) {
      if (err.code !== 4001) {
        console.error('Wallet connection error:', err);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // MATIC payment + backend polling bundle purchase handler
  const handlePurchaseBundle = async () => {
    if (!walletAddress) {
      await handleConnectWallet();
      return;
    }

    setIsPurchasing(true);
    try {
      // 1. Get live MATIC equivalent of USD bundle price
      const bundleUsd = parseFloat(import.meta.env.VITE_PRICE_USD) || 5.0;
      const { maticAmount } = await usdToMatic(bundleUsd);
      // Add a small buffer (1%) so slight price movement doesn't cause under-payment
      const maticToSend = (maticAmount * 1.01).toFixed(6);

      // 2. Send the MATIC payment via MetaMask
      const txHash = await sendBundlePayment(maticToSend);
      console.log('Payment tx sent:', txHash);

      // 3. Poll backend until Alchemy webhook (or API fallback) confirms the grant
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          // Primary: poll by address (webhook or API fallback will pick it up)
          const res  = await fetch(`${BACKEND_URL}/api/check-payment/${walletAddress}`);
          const data = await res.json();

          if (data.granted) {
            clearInterval(poll);
            setRefreshesRemaining((prev) => prev + 3);
            setShowBundleModal(false);
            setIsPurchasing(false);
            return;
          }

          // After 30s of polling, also try direct tx verification as second fallback
          if (attempts >= 6 && txHash) {
            const verifyRes = await fetch(`${BACKEND_URL}/api/verify-tx/${txHash}`);
            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              // Re-check the grant after tx verification issued it
              const grantRes = await fetch(`${BACKEND_URL}/api/check-payment/${walletAddress}`);
              const grantData = await grantRes.json();
              if (grantData.granted) {
                clearInterval(poll);
                setRefreshesRemaining((prev) => prev + 3);
                setShowBundleModal(false);
                setIsPurchasing(false);
                return;
              }
            }
          }

          if (attempts >= POLL_MAX_ATTEMPTS) {
            clearInterval(poll);
            setIsPurchasing(false);
            setError(`Payment sent (tx: ${txHash}) but server validation is taking longer than expected. Please contact support with your transaction hash.`);
          }
        } catch (pollErr) {
          console.error('Poll error:', pollErr);
        }
      }, POLL_INTERVAL_MS);

    } catch (err) {
      if (err.code !== 4001) { // 4001 = user rejected
        console.error('Purchase error:', err);
        setError('Your Blaze Runner is almost ready! Please try the payment again.');
      }
      setIsPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header
        walletAddress={walletAddress}
        chainId={chainId}
        balance={balance}
        onConnect={handleConnectWallet}
        isConnecting={isConnecting}
      />

      {/* Section 1: Hero */}
      <HeroSection />

      {/* Section 2: The Forge (generate + display) */}
      <section id="forge" className="min-h-screen py-20 px-4 relative">
        {/* Explosion effect overlay */}
        {showExplosion && module && (
          <ExplosionEffect
            isActive={showExplosion}
            onComplete={() => setShowExplosion(false)}
            intensity={1.2}
          />
        )}

        <div className="max-w-6xl mx-auto space-y-12">
          {/* Section header */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl font-bold fire-text mb-3">The Forge</h2>
            <p className="text-lg md:text-xl text-gray-400">Generate unique Fire Horse NFTs • Year of the Dragon 2026</p>
            <div className="section-divider max-w-xs mx-auto mt-6" />
          </motion.div>

          {/* Generate button with refresh counter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <GenerateButton
              onClick={handleGenerate}
              isLoading={showGenerationProgress}
              refreshesRemaining={refreshesRemaining}
              isLocked={refreshesRemaining <= 0}
              onUnlock={() => setShowBundleModal(true)}
            />
          </motion.div>

          {/* Error display */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="glass-card p-6 max-w-2xl w-full mx-auto border-red-500 border-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p className="text-red-400 text-center">
                  <span className="font-bold">Error:</span> {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* NFT Viewer with 3D and Card toggle */}
          {module && cardImageUrl && (
            <motion.div
              key={module.uniqueId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <NFTViewer
                creatureData={module}
                cardImageUrl={cardImageUrl}
                onDownloadSTL={handleDownloadSTL}
                onMint={handleMint}
                isMinting={isMinting}
              />
            </motion.div>
          )}

          {/* Empty state */}
          {!module && !showGenerationProgress && !error && (
            <motion.div
              className="glass-container p-8 max-w-2xl w-full mx-auto text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-gray-400 text-lg">
                Click the button above to generate your unique Fire Horse NFT.
              </p>
              <p className="text-gray-600 text-sm mt-2">
                View in 2D Card or 3D, download for printing, and mint on Polygon Network.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Section 3: About */}
      <section id="about" className="py-20 px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold fire-text text-center mb-12">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-lg font-bold text-white mb-2">Generate</h3>
              <p className="text-gray-400 text-sm">
                AI creates unique creatures with stats, rarity, and lore. 3 free generations included.
              </p>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">🎴</div>
              <h3 className="text-lg font-bold text-white mb-2">Card + 3D</h3>
              <p className="text-gray-400 text-sm">
                View as Pokemon-style card or interactive 3D model. Download STL files for 3D printing.
              </p>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">⛓️</div>
              <h3 className="text-lg font-bold text-white mb-2">IPFS Storage</h3>
              <p className="text-gray-400 text-sm">
                Metadata stored on IPFS. Decentralized, permanent, and secure on blockchain.
              </p>
            </div>
            <div className="glass-card p-6 text-center">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-lg font-bold text-white mb-2">Mint Free</h3>
              <p className="text-gray-400 text-sm">
                Zero gas fees via Alchemy sponsorship. Own your NFT on Polygon instantly.
              </p>
            </div>
          </div>

          {totalGenerated > 0 && (
            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-gray-500 text-sm">
                {totalGenerated} creature{totalGenerated !== 1 ? 's' : ''} forged so far
              </span>
            </motion.div>
          )}
        </motion.div>
      </section>

      <Footer />

      {/* Country Selector Modal - shown on first visit */}
      <CountrySelector
        isOpen={showCountrySelector}
        onSelect={(selectedCountry) => {
          const settings = getRegionalSettings(selectedCountry);
          setCountry(selectedCountry);
          setRegionalSettings(settings);
          setPriceInfo(formatPrice(2, settings));
          setShowCountrySelector(false);
        }}
      />

      {/* Generation Progress Modal */}
      <GenerationProgressModal
        isOpen={showGenerationProgress}
        onComplete={handleGenerationComplete}
      />

      {/* Payment Modal - shown after 3 free generations */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={(paymentData) => {
          // Grant one free mint after payment
          setRefreshesRemaining(1);
          setShowPaymentModal(false);
          // Could also trigger mint here
        }}
        regionalSettings={regionalSettings}
        priceInfo={priceInfo}
        walletAddress={walletAddress}
        isProcessing={isPurchasing}
      />

      {/* Bundle purchase modal */}
      <AnimatePresence>
        {showBundleModal && (
          <BundlePurchase
            onClose={() => setShowBundleModal(false)}
            onPurchase={handlePurchaseBundle}
            isPurchasing={isPurchasing}
            walletAddress={walletAddress}
            onConnectWallet={handleConnectWallet}
            priceInfo={priceInfo}
            regionalSettings={regionalSettings}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
