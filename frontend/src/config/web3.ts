import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygonMumbai } from 'wagmi/chains';

// Mumbai testnet configuration
export const config = getDefaultConfig({
  appName: 'NFT Gift Protocol',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [polygonMumbai],
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

// Mumbai testnet details
export const MUMBAI_TESTNET = {
  chainId: 80001,
  name: 'Polygon Mumbai',
  rpcUrl: import.meta.env.VITE_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
  blockExplorer: 'https://mumbai.polygonscan.com',
  faucet: 'https://faucet.polygon.technology/',
};
