/**
 * Model Assets Service
 * Maps creature types to 3D model assets and handles asset metadata
 */

const MODEL_ASSETS = {
  phoenix: {
    name: 'Phoenix',
    modelPath: '/models/phoenix/phoenix.glb',
    scale: 1.2,
    rotation: { x: 0, y: 0, z: 0 },
    colorMultiplier: { r: 1.2, g: 0.8, b: 0.3 },
    description: 'A majestic bird creature wreathed in eternal flames',
    tags: ['bird', 'fire', 'legendary']
  },
  drake: {
    name: 'Drake',
    modelPath: '/models/drake/drake.glb',
    scale: 1.0,
    rotation: { x: 0, y: Math.PI, z: 0 },
    colorMultiplier: { r: 1.0, g: 0.6, b: 0.2 },
    description: 'A fearsome dragon-like creature of ancient fire',
    tags: ['dragon', 'fire', 'epic']
  },
  inferno_core: {
    name: 'Inferno Core',
    modelPath: '/models/inferno_core/core.glb',
    scale: 0.8,
    rotation: { x: 0.3, y: 0, z: 0 },
    colorMultiplier: { r: 1.3, g: 0.5, b: 0 },
    description: 'A crystalline sphere of pure cosmic fire energy',
    tags: ['crystal', 'fire', 'mythic']
  },
  blaze_wolf: {
    name: 'Blaze Wolf',
    modelPath: '/models/blaze_wolf/wolf.glb',
    scale: 1.1,
    rotation: { x: 0, y: 0.5, z: 0 },
    colorMultiplier: { r: 1.1, g: 0.7, b: 0.4 },
    description: 'A sleek canine guardian wreathed in dancing flames',
    tags: ['mammal', 'fire', 'rare']
  },
  magma_beast: {
    name: 'Magma Beast',
    modelPath: '/models/magma_beast/beast.glb',
    scale: 1.4,
    rotation: { x: 0.2, y: 0, z: 0 },
    colorMultiplier: { r: 1.2, g: 0.4, b: 0 },
    description: 'A hulking creature of molten rock and primordial power',
    tags: ['beast', 'fire', 'common']
  }
};

/**
 * Gets asset metadata for a creature type
 * @param {string} assetType - Type key (e.g., 'phoenix', 'drake')
 * @returns {Object|null} Asset metadata or null if not found
 */
export function getModelAsset(assetType) {
  return MODEL_ASSETS[assetType] || null;
}

/**
 * Gets all available asset types
 * @returns {string[]} Array of available asset type keys
 */
export function getAvailableAssetTypes() {
  return Object.keys(MODEL_ASSETS);
}

/**
 * Adjusts model colors based on creature stats (Power, Heat, Speed)
 * @param {string} assetType - Asset type
 * @param {Object} stats - Creature stats { power, speed, heat }
 * @returns {Object} Adjusted color multiplier
 */
export function getColorMultiplierForStats(assetType, stats) {
  const baseAsset = getModelAsset(assetType);
  if (!baseAsset) return { r: 1, g: 1, b: 1 };
  
  const multiplier = { ...baseAsset.colorMultiplier };
  
  // Increase intensity based on Heat stat
  const heatIntensity = stats.heat / 100;
  multiplier.r = Math.min(1.5, multiplier.r + heatIntensity * 0.3);
  multiplier.g = Math.max(0.2, multiplier.g - heatIntensity * 0.2);
  
  // Adjust for Power stat
  const powerScale = stats.power / 100;
  multiplier.r = Math.min(1.5, multiplier.r + powerScale * 0.1);
  
  return multiplier;
}

/**
 * Gets scaling adjustment based on creature stats
 * @param {string} assetType - Asset type
 * @param {Object} stats - Creature stats { power, speed, heat }
 * @returns {number} Scale multiplier
 */
export function getScaleForStats(assetType, stats) {
  const baseAsset = getModelAsset(assetType);
  if (!baseAsset) return 1;
  
  // Larger creatures have higher power stats
  const powerScale = (stats.power / 100) * 0.3;
  return baseAsset.scale * (1 + powerScale);
}

/**
 * Gets lighting configuration for a creature type
 * @param {string} assetType - Asset type
 * @returns {Object} Lighting configuration
 */
export function getLightingConfig(assetType) {
  const asset = getModelAsset(assetType);
  if (!asset) return getDefaultLightingConfig();
  
  // Different asset types get different lighting
  const configs = {
    phoenix: {
      ambientIntensity: 0.6,
      directionalIntensity: 1.2,
      directionalColor: 0xFF6B00,
      ambientColor: 0xFF8C00
    },
    drake: {
      ambientIntensity: 0.5,
      directionalIntensity: 1.0,
      directionalColor: 0xFF2D00,
      ambientColor: 0xFF6B00
    },
    inferno_core: {
      ambientIntensity: 0.8,
      directionalIntensity: 1.4,
      directionalColor: 0xFF1493,
      ambientColor: 0xFF8C00
    },
    blaze_wolf: {
      ambientIntensity: 0.5,
      directionalIntensity: 1.1,
      directionalColor: 0xFF8C00,
      ambientColor: 0xFF6B00
    },
    magma_beast: {
      ambientIntensity: 0.4,
      directionalIntensity: 0.9,
      directionalColor: 0xFF2D00,
      ambientColor: 0xDC143C
    }
  };
  
  return configs[assetType] || getDefaultLightingConfig();
}

/**
 * Default lighting configuration
 */
function getDefaultLightingConfig() {
  return {
    ambientIntensity: 0.5,
    directionalIntensity: 1.0,
    directionalColor: 0xFF6B00,
    ambientColor: 0xFF8C00
  };
}

/**
 * Gets camera configuration for viewing a creature
 * @param {string} assetType - Asset type
 * @returns {Object} Camera position and settings
 */
export function getCameraConfig(assetType) {
  const asset = getModelAsset(assetType);
  if (!asset) return getDefaultCameraConfig();
  
  const configs = {
    phoenix: {
      position: { x: 0, y: 1.5, z: 4 },
      fov: 50,
      near: 0.1,
      far: 1000
    },
    drake: {
      position: { x: 0, y: 1, z: 5 },
      fov: 45,
      near: 0.1,
      far: 1000
    },
    inferno_core: {
      position: { x: 0, y: 0, z: 3 },
      fov: 60,
      near: 0.1,
      far: 1000
    },
    blaze_wolf: {
      position: { x: 0, y: 1, z: 4 },
      fov: 50,
      near: 0.1,
      far: 1000
    },
    magma_beast: {
      position: { x: 0, y: 1.5, z: 6 },
      fov: 45,
      near: 0.1,
      far: 1000
    }
  };
  
  return configs[assetType] || getDefaultCameraConfig();
}

/**
 * Default camera configuration
 */
function getDefaultCameraConfig() {
  return {
    position: { x: 0, y: 1, z: 4 },
    fov: 50,
    near: 0.1,
    far: 1000
  };
}

/**
 * Validates if an asset type is available
 * @param {string} assetType - Asset type to validate
 * @returns {boolean} True if asset exists
 */
export function isValidAssetType(assetType) {
  return assetType in MODEL_ASSETS;
}

/**
 * Gets a random valid asset type (for testing/demo)
 * @returns {string} Random asset type key
 */
export function getRandomAssetType() {
  const types = getAvailableAssetTypes();
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Gets backup asset if primary is unavailable
 * @param {string} assetType - Primary asset type
 * @returns {string} Valid asset type (fallback or original)
 */
export function getFallbackAsset(assetType) {
  if (isValidAssetType(assetType)) return assetType;
  
  // Fallback hierarchy
  const fallbacks = ['phoenix', 'drake', 'inferno_core', 'blaze_wolf', 'magma_beast'];
  return fallbacks[0];
}
