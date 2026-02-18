import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import PokemonCard from './PokemonCard';
import { getModelAsset, getCameraConfig, getLightingConfig, getColorMultiplierForStats, getScaleForStats } from '../services/modelAssets';

/**
 * NFTViewer Component
 * Displays creature as either 2D Pokemon-style card or 3D interactive model
 * Features:
 * - Toggle between Card and 3D view
 * - Interactive 3D rotation/zoom
 * - Dynamic lighting based on creature stats
 * - STL download support
 */
export default function NFTViewer({ creatureData, cardImageUrl, onDownloadSTL, onMint, isMinting }) {
  const [viewMode, setViewMode] = useState('card'); // 'card' or '3d'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const rotationTargetRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });

  // Initialize 3D scene
  useEffect(() => {
    if (viewMode !== '3d' || !canvasRef.current) return;

    setIsLoading(true);
    setError(null);

    const initScene = async () => {
      try {
        const container = canvasRef.current;
        // Give it a moment to render, then check size
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;

        if (width === 0 || height === 0) {
          throw new Error('Container has no size. Element might not be visible.');
        }

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0e27);
        sceneRef.current = scene;

        // Camera setup
        const cameraConfig = getCameraConfig(creatureData.asset3dType);
        const camera = new THREE.PerspectiveCamera(
          cameraConfig.fov,
          width / height,
          cameraConfig.near,
          cameraConfig.far
        );
        camera.position.set(
          cameraConfig.position.x,
          cameraConfig.position.y,
          cameraConfig.position.z
        );

        // Renderer setup - create new canvas
        const canvas = document.createElement('canvas');
        const renderer = new THREE.WebGLRenderer({
          canvas: canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        });
        
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Clear container and add renderer canvas
        container.innerHTML = '';
        container.appendChild(renderer.domElement);
        
        rendererRef.current = renderer;

        // Lighting
        const lightingConfig = getLightingConfig(creatureData.asset3dType);
        
        const ambientLight = new THREE.AmbientLight(lightingConfig.ambientColor, lightingConfig.ambientIntensity);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(lightingConfig.directionalColor, lightingConfig.directionalIntensity);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.far = 20;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        // Load 3D model
        const modelAsset = getModelAsset(creatureData.asset3dType);
        if (!modelAsset) {
          throw new Error(`No model found for asset type: ${creatureData.asset3dType}`);
        }

        const loader = new GLTFLoader();
        
        try {
          const gltf = await loader.loadAsync(modelAsset.modelPath);
          let model = gltf.scene;

          // Apply creature-specific modifications
          const scale = getScaleForStats(creatureData.asset3dType, {
            power: creatureData.power,
            speed: creatureData.speed,
            heat: creatureData.heat
          });

          model.scale.set(scale, scale, scale);
          model.rotation.order = 'YXZ';
          model.rotation.set(
            modelAsset.rotation.x,
            modelAsset.rotation.y,
            modelAsset.rotation.z
          );

          // Apply color modifications based on stats
          const colorMult = getColorMultiplierForStats(creatureData.asset3dType, {
            power: creatureData.power,
            speed: creatureData.speed,
            heat: creatureData.heat
          });

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;

              // Clone material to avoid shared references
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material = child.material.map(mat => {
                    const newMat = mat.clone();
                    if (newMat.color) {
                      newMat.color.r = Math.min(newMat.color.r * colorMult.r, 1);
                      newMat.color.g = Math.min(newMat.color.g * colorMult.g, 1);
                      newMat.color.b = Math.min(newMat.color.b * colorMult.b, 1);
                    }
                    return newMat;
                  });
                } else {
                  const newMat = child.material.clone();
                  if (newMat.color) {
                    newMat.color.r = Math.min(newMat.color.r * colorMult.r, 1);
                    newMat.color.g = Math.min(newMat.color.g * colorMult.g, 1);
                    newMat.color.b = Math.min(newMat.color.b * colorMult.b, 1);
                  }
                  child.material = newMat;
                }
              }
            }
          });

          scene.add(model);
          modelRef.current = model;
        } catch (modelError) {
          // Fallback: create a creature-specific geometric shape
          console.warn(`Failed to load model ${modelAsset.modelPath}, creating fallback shape...`, modelError);
          
          let geometry;
          let creatureName = creatureData.asset3dType || 'phoenix';
          
          // Create different shapes based on creature type
          if (creatureName === 'phoenix') {
            // Cone-like shape for phoenix
            geometry = new THREE.ConeGeometry(1, 2.5, 16, 4);
          } else if (creatureName === 'drake') {
            // Cylinder for dragon-like
            geometry = new THREE.CylinderGeometry(0.8, 1.2, 2.5, 8, 4);
          } else if (creatureName === 'blaze_wolf') {
            // Box for wolf-like
            geometry = new THREE.BoxGeometry(1.2, 1, 1.8);
          } else if (creatureName === 'magma_beast') {
            // Octahedron for beast
            geometry = new THREE.OctahedronGeometry(1, 2);
          } else if (creatureName === 'inferno_core') {
            // Icosphere for core
            geometry = new THREE.IcosahedronGeometry(1, 5);
          } else {
            geometry = new THREE.IcosahedronGeometry(1, 4);
          }
          
          const material = new THREE.MeshPhongMaterial({
            color: lightingConfig.directionalColor,
            emissive: 0x444444,
            shininess: 100,
            wireframe: false
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          
          // Apply color based on stats
          const colorMult = getColorMultiplierForStats(creatureData.asset3dType, {
            power: creatureData.power,
            speed: creatureData.speed,
            heat: creatureData.heat
          });
          
          material.color.r = Math.min(1, colorMult.r);
          material.color.g = Math.min(1, colorMult.g);
          material.color.b = Math.min(1, colorMult.b);
          material.emissive = new THREE.Color(0xFF6B00);
          material.emissiveIntensity = 0.3;
          
          scene.add(mesh);
          modelRef.current = mesh;
        }

        // Add ground plane
        const groundGeometry = new THREE.PlaneGeometry(20, 20);
        const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Mouse move listener for rotation
        const onMouseMove = (event) => {
          const rect = renderer.domElement.getBoundingClientRect();
          mouseRef.current.x = ((event.clientX - rect.left) / width) * 2 - 1;
          mouseRef.current.y = -((event.clientY - rect.top) / height) * 2 + 1;

          rotationTargetRef.current.y = mouseRef.current.x * Math.PI;
          rotationTargetRef.current.x = mouseRef.current.y * Math.PI * 0.5;
        };

        renderer.domElement.addEventListener('mousemove', onMouseMove);

        // Animation loop
        let frameId;
        const animate = () => {
          frameId = requestAnimationFrame(animate);

          // Smooth rotation interpolation
          if (modelRef.current) {
            rotationRef.current.x += (rotationTargetRef.current.x - rotationRef.current.x) * 0.05;
            rotationRef.current.y += (rotationTargetRef.current.y - rotationRef.current.y) * 0.05;

            modelRef.current.rotation.x = rotationRef.current.x;
            modelRef.current.rotation.y = rotationRef.current.y;

            // Floating animation
            modelRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.2;
          }

          renderer.render(scene, camera);
        };

        animate();
        setIsLoading(false);

        // Handle window resize
        const handleResize = () => {
          const newWidth = container.clientWidth || 800;
          const newHeight = container.clientHeight || 600;
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          renderer.domElement.removeEventListener('mousemove', onMouseMove);
          cancelAnimationFrame(frameId);
          renderer.dispose();
        };
      } catch (err) {
        console.error('3D Scene initialization error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    const cleanup = initScene();
    return () => {
      cleanup?.then(c => c?.()).catch(() => {});
    };
  }, [viewMode, creatureData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto border border-orange-500/30 rounded-xl overflow-hidden bg-gradient-to-b from-gray-900 to-black backdrop-blur-sm"
    >
      {/* Header with Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-orange-500/20 bg-black/50">
        <h2 className="text-xl font-bold text-orange-400">{creatureData.name}</h2>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('card')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === 'card'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Card
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('3d')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === '3d'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            3D View
          </motion.button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative w-full h-[600px] bg-black">
        <AnimatePresence mode="wait">
          {/* Card View */}
          {viewMode === 'card' && (
            <motion.div
              key="card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <PokemonCard creatureData={creatureData} cardImageUrl={cardImageUrl} />
            </motion.div>
          )}

          {/* 3D View */}
          {viewMode === '3d' && (
            <motion.div
              key="3d"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-black"
            >
              {isLoading && (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  <p className="text-gray-400">Loading 3D Model...</p>
                </div>
              )}

              {error && (
                <div className="text-center text-red-400 px-4">
                  <p className="text-lg font-bold mb-2">Error Loading Model</p>
                  <p className="text-sm text-gray-400">{error}</p>
                </div>
              )}

              {!isLoading && !error && (
                <>
                  <div ref={canvasRef} className="w-full h-full" />
                  {/* Zoom hint */}
                  <div className="absolute bottom-4 left-4 text-xs text-gray-500">
                    Drag to rotate • Scroll to zoom
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons Footer */}
      <div className="flex gap-3 p-4 border-t border-orange-500/20 bg-black/50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDownloadSTL}
          disabled={isMinting}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
        >
          ⬇️ Download STL
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onMint}
          disabled={isMinting}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 disabled:opacity-50 transition-all"
        >
          {isMinting ? '⏳ Minting...' : '🔥 Mint NFT'}
        </motion.button>
      </div>
    </motion.div>
  );
}
