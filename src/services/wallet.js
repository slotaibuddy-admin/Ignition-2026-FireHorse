import { BrowserProvider, JsonRpcProvider, formatEther, parseEther } from 'ethers';

const POLYGON_CHAIN_ID = 137;
const POLYGON_CHAIN_ID_HEX = '0x89';

const POLYGON_NETWORK_CONFIG = {
  chainId: POLYGON_CHAIN_ID_HEX,
  chainName: 'Polygon Mainnet',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: [
    `https://polygon-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
    'https://polygon-rpc.com',
  ],
  blockExplorerUrls: ['https://polygonscan.com/'],
};

export function getAlchemyProvider() {
  const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;
  if (!apiKey || apiKey === 'your_alchemy_api_key_here') {
    return new JsonRpcProvider('https://polygon-rpc.com');
  }
  return new JsonRpcProvider(
    `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}`
  );
}

export function isMetaMaskInstalled() {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

export async function connectWallet() {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_requestAccounts', []);

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found');
  }

  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  return { address: accounts[0], chainId };
}

export async function switchToPolygon() {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: POLYGON_CHAIN_ID_HEX }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [POLYGON_NETWORK_CONFIG],
      });
    } else {
      throw error;
    }
  }
}

export async function getBalance(address) {
  const provider = getAlchemyProvider();
  const balance = await provider.getBalance(address);
  return formatEther(balance);
}

/**
 * Send a MATIC payment for the bundle purchase.
 * The backend (Alchemy webhook) validates the amount against the live EUR rate.
 * On confirmation, it returns a signature that grants the free mint.
 *
 * @param {string} amountInMatic - MATIC amount calculated from live EUR/MATIC rate
 * @returns {Promise<string>} transaction hash
 */
export async function sendBundlePayment(amountInMatic) {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  const paymentAddress = import.meta.env.VITE_PAYMENT_ADDRESS;
  if (!paymentAddress || paymentAddress === '0xYourPaymentAddressHere') {
    throw new Error('Payment address is not configured');
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const tx = await signer.sendTransaction({
    to: paymentAddress,
    value: parseEther(String(amountInMatic)),
  });

  const receipt = await tx.wait();
  return receipt.hash;
}

export function truncateAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export { POLYGON_CHAIN_ID };
