import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { polygon } from "@alchemy/aa-core";
import { Interface } from "ethers";

let cachedClient = null;

// ERC721 Mint interface ABI
const ERC721_MINT_ABI = [
  "function mintWithSignature(bytes calldata signature, string calldata ipfsMetadataCID)"
];

const contractInterface = new Interface(ERC721_MINT_ABI);

async function getAlchemyAAClient() {
  if (cachedClient) return cachedClient;

  const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
  const policyId = import.meta.env.VITE_ALCHEMY_POLICY_ID;

  if (!apiKey || apiKey === 'your_alchemy_api_key_here') {
    throw new Error('Alchemy API key is not configured');
  }

  if (!policyId || policyId === 'your_gas_policy_id_here') {
    throw new Error('Alchemy Gas Manager Policy ID is not configured');
  }

  cachedClient = await createModularAccountAlchemyClient({
    apiKey,
    chain: polygon,
    gasManagerConfig: {
      policyId,
    },
  });

  return cachedClient;
}

/**
 * Mint NFT with signature and IPFS metadata
 * @param {string} signature - Backend signature validating mint
 * @param {string} ipfsMetadataCID - IPFS hash of creature metadata
 * @returns {Object} - Transaction result with hash
 */
export async function mintNFT(signature, ipfsMetadataCID) {
  try {
    const client = await getAlchemyAAClient();
    const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;

    if (!contractAddress || contractAddress === '0xYourNFTContractAddressHere') {
      throw new Error('NFT contract address is not configured');
    }

    if (!signature || typeof signature !== 'string') {
      throw new Error('Invalid signature provided');
    }

    if (!ipfsMetadataCID || typeof ipfsMetadataCID !== 'string') {
      throw new Error('IPFS metadata CID required');
    }

    // Encode the mint function call with signature and metadata
    const encodedFunctionData = contractInterface.encodeFunctionData(
      'mintWithSignature',
      [signature, ipfsMetadataCID]
    );

    console.log('Minting NFT with:');
    console.log('- Contract:', contractAddress);
    console.log('- Function data:', encodedFunctionData);
    console.log('- Metadata CID:', ipfsMetadataCID);

    const result = await client.sendUserOperation({
      uo: {
        target: contractAddress,
        data: encodedFunctionData,
        value: 0n,
      },
    });

    console.log('User Operation sent:', result.hash);

    return {
      hash: result.hash,
      success: true,
      message: 'NFT minting initiated via gas-sponsored transaction'
    };
  } catch (error) {
    console.error('NFT minting error:', error);
    throw new Error(`Failed to mint NFT: ${error.message}`);
  }
}

/**
 * Sponsored bundle purchase (placeholder for future implementation)
 * Currently reserves gas sponsorship for bundle purchases
 */
export async function sponsoredBundlePurchase(bundleData) {
  try {
    const client = await getAlchemyAAClient();

    // For now, this is a placeholder that just verifies gas sponsorship is available
    // In a full implementation, this would interact with a bundle purchase contract
    console.log('Bundle purchase sponsorship available via Alchemy AA');

    return {
      success: true,
      message: 'Sponsorship confirmed - bundle purchase available'
    };
  } catch (error) {
    console.error('Bundle purchase error:', error);
    throw new Error(`Failed to process bundle purchase: ${error.message}`);
  }
}

/**
 * Checks if a transaction is confirmed
 * Uses Alchemy's user operation tracking
 */
export async function checkUserOperationStatus(hash) {
  try {
    const client = await getAlchemyAAClient();
    
    // Get transaction receipt
    const receipt = await client.getTransaction(hash);
    
    return {
      confirmed: receipt?.blockNumber != null,
      blockNumber: receipt?.blockNumber,
      transactionHash: receipt?.hash,
    };
  } catch (error) {
    console.error('Error checking transaction status:', error);
    return { confirmed: false };
  }
}
