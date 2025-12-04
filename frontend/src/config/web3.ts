import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygonAmoy } from 'wagmi/chains';

// Amoy testnet configuration
export const config = getDefaultConfig({
  appName: 'NFT Gift Protocol',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [polygonAmoy],
  ssr: false,
});

// Contract addresses (will be filled after deployment)
export const CONTRACTS = {
  GIFT_CARD_NFT: import.meta.env.VITE_GIFT_CARD_NFT_ADDRESS || '',
  MARKETPLACE: import.meta.env.VITE_MARKETPLACE_ADDRESS || '',
};

// IPFS and API configurations
export const API_CONFIG = {
  WEB3_STORAGE_KEY: import.meta.env.VITE_WEB3_STORAGE_API_KEY || '',
  HUGGINGFACE_KEY: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
  EMAILJS: {
    SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
    TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
    PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  },
};

// Amoy testnet details
export const AMOY_TESTNET = {
  chainId: 80002,
  name: 'Polygon Amoy',
  rpcUrl: import.meta.env.VITE_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology/',
  blockExplorer: 'https://amoy.polygonscan.com',
  faucet: 'https://faucet.polygon.technology/',
};
