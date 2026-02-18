/**
 * IPFS Service
 * Manages metadata storage on IPFS via Pinata
 * Stores:
 * - Card front image (PNG)
 * - NFT metadata JSON
 * - Card back image (PNG)
 */

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_SECRET_API_KEY;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

/**
 * Generates IPFS-compatible metadata for NFT
 * @param {Object} creatureData - Creature data from Gemini
 * @param {string} imageIPFSUrl - IPFS URL of card front image
 * @returns {Object} - Metadata object ready for IPFS
 */
export function generateMetadata(creatureData, imageIPFSUrl) {
  return {
    name: creatureData.name,
    description: creatureData.description,
    image: imageIPFSUrl,
    external_url: `${window.location.origin}`,
    attributes: [
      {
        trait_type: 'Rarity',
        value: creatureData.rarity
      },
      {
        trait_type: 'Power',
        value: creatureData.power.toString()
      },
      {
        trait_type: 'Speed',
        value: creatureData.speed.toString()
      },
      {
        trait_type: 'Heat',
        value: creatureData.heat.toString()
      },
      {
        trait_type: 'HP',
        value: creatureData.hp.toString()
      },
      {
        trait_type: 'Weakness',
        value: creatureData.weakness
      },
      {
        trait_type: 'Resistance',
        value: creatureData.resistance
      },
      {
        trait_type: 'Asset Type',
        value: creatureData.asset3dType
      },
      {
        trait_type: 'Generation Date',
        value: creatureData.generatedAt
      },
      {
        trait_type: 'Unique ID',
        value: creatureData.uniqueId
      }
    ],
    properties: {
      rarity: creatureData.rarity,
      asset3dType: creatureData.asset3dType,
      year: '2026',
      collection: 'Fire Horse NFT Collection'
    }
  };
}

/**
 * Uploads a file (image) to IPFS via Pinata
 * @param {Blob} fileBlob - File to upload (e.g., PNG image)
 * @param {string} filename - File name for Pinata
 * @returns {Promise<string>} - IPFS hash (CID)
 */
export async function uploadImageToIPFS(fileBlob, filename) {
  try {
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
      throw new Error('Pinata credentials not configured. Set VITE_PINATA_JWT or both VITE_PINATA_API_KEY and VITE_PINATA_SECRET_API_KEY');
    }

    const formData = new FormData();
    formData.append('file', fileBlob, filename);

    // Optional: Add metadata
    const pinataMetadata = {
      name: filename,
      keyvalues: {
        collection: 'Fire Horse NFT',
        type: 'card-image'
      }
    };
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

    const headers = {};
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_API_SECRET;
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error('IPFS image upload error:', error);
    throw error;
  }
}

/**
 * Uploads metadata JSON to IPFS via Pinata
 * @param {Object} metadata - Metadata object
 * @param {string} name - Metadata name
 * @returns {Promise<string>} - IPFS hash (CID)
 */
export async function uploadMetadataToIPFS(metadata, name = 'metadata.json') {
  try {
    if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
      throw new Error('Pinata credentials not configured');
    }

    const jsonString = JSON.stringify(metadata);
    const blob = new Blob([jsonString], { type: 'application/json' });

    const formData = new FormData();
    formData.append('file', blob, name);

    const pinataMetadata = {
      name: name,
      keyvalues: {
        collection: 'Fire Horse NFT',
        type: 'metadata'
      }
    };
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

    const headers = {};
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY;
      headers['pinata_secret_api_key'] = PINATA_API_SECRET;
    }

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Pinata metadata upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error('IPFS metadata upload error:', error);
    throw error;
  }
}

/**
 * Complete pipeline: uploads card image + metadata to IPFS
 * Returns the metadata CID for smart contract
 * @param {string} cardImageDataUrl - Data URL of card front (PNG)
 * @param {Object} creatureData - Creature metadata
 * @returns {Promise<Object>} - { metadataURI, imageURI, ipfsImageHash, ipfsMetadataHash }
 */
export async function uploadNFTToIPFS(cardImageDataUrl, creatureData) {
  try {
    // Step 1: Convert card image data URL to blob and upload
    const imageBlob = dataURLToBlob(cardImageDataUrl);
    const imageHash = await uploadImageToIPFS(imageBlob, `${creatureData.uniqueId}_front.png`);
    const imageURI = `ipfs://${imageHash}`;

    // Step 2: Generate and upload metadata
    const metadata = generateMetadata(creatureData, imageURI);
    const metadataHash = await uploadMetadataToIPFS(metadata, `${creatureData.uniqueId}_metadata.json`);
    const metadataURI = `ipfs://${metadataHash}`;

    console.log('NFT uploaded to IPFS:', {
      imageHash,
      metadataHash,
      imageURI,
      metadataURI
    });

    return {
      metadataURI,      // For smart contract (used in tokenURI)
      imageURI,         // For metadata reference
      ipfsImageHash: imageHash,
      ipfsMetadataHash: metadataHash
    };
  } catch (error) {
    console.error('NFT IPFS upload pipeline error:', error);
    throw error;
  }
}

/**
 * Converts a data URL to a Blob
 * @param {string} dataURL - Data URL
 * @returns {Blob} - Blob object
 */
function dataURLToBlob(dataURL) {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);

  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }

  return new Blob([u8arr], { type: mime });
}

/**
 * Gets a readable IPFS gateway URL from hash
 * @param {string} hash - IPFS hash (CID)
 * @returns {string} - Public IPFS gateway URL
 */
export function getIPFSGatewayURL(hash) {
  return `${PINATA_GATEWAY}/${hash}`;
}

/**
 * Verifies IPFS upload by checking if file is accessible
 * @param {string} hash - IPFS hash to verify
 * @returns {Promise<boolean>} - True if accessible
 */
export async function verifyIPFSUpload(hash) {
  try {
    const url = getIPFSGatewayURL(hash);
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('IPFS verification failed:', error);
    return false;
  }
}

/**
 * Fallback: Uses on-chain or centralized storage if IPFS unavailable
 * For production, implement proper fallback strategy
 */
export async function uploadWithFallback(cardImageDataUrl, creatureData) {
  try {
    // Try IPFS first
    return await uploadNFTToIPFS(cardImageDataUrl, creatureData);
  } catch (error) {
    console.warn('IPFS upload failed, using fallback...', error);
    
    // Fallback: Return a data-URI based metadata (not ideal, but functional)
    // In production, this should upload to a backup service like Arweave or use dataURL
    const metadata = {
      ...generateMetadata(creatureData, cardImageDataUrl),
      fallback: true
    };

    return {
      metadataURI: null, // Not supported in fallback
      imageURI: cardImageDataUrl,
      fallback: true,
      metadata: metadata
    };
  }
}
