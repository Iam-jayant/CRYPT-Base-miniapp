export const GIFT_CARD_NFT_ADDRESS = import.meta.env.VITE_GIFT_CARD_NFT_ADDRESS as `0x${string}`;
export const MARKETPLACE_ADDRESS = import.meta.env.VITE_MARKETPLACE_ADDRESS as `0x${string}`;
export const MOCK_USDC_ADDRESS = import.meta.env.VITE_MOCK_USDC_ADDRESS as `0x${string}`;
export const MOCK_DAI_ADDRESS = import.meta.env.VITE_MOCK_DAI_ADDRESS as `0x${string}`;

export const TESTNET_TOKENS = [
  {
    address: MOCK_USDC_ADDRESS,
    symbol: 'mUSDC',
    name: 'Mock USDC',
  },
  {
    address: MOCK_DAI_ADDRESS,
    symbol: 'mDAI',
    name: 'Mock DAI',
  },
] as const;
