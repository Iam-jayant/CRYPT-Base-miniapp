# Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Wallet with Test MATIC**
   - Get your wallet private key from MetaMask
   - Get test MATIC from: https://faucet.polygon.technology/
   - Select "Polygon Amoy" network
   - You'll need ~0.5 MATIC for deployment

2. **API Keys** (Optional for now, needed for full functionality later)
   - WalletConnect Project ID: https://cloud.walletconnect.com
   - Web3.Storage API Key: https://web3.storage
   - Hugging Face API Key: https://huggingface.co

## Step 1: Configure Environment

Edit the `.env` file in the root directory:

```bash
# Required for deployment
AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
PRIVATE_KEY=your_wallet_private_key_here

# Optional (for contract verification)
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

**⚠️ IMPORTANT:** Never commit your `.env` file with real private keys!

## Step 2: Deploy Contracts

Run the deployment script:

```bash
npm run deploy:amoy
```

This will deploy:
- Mock USDC (test token)
- Mock DAI (test token)
- GiftCardNFT contract
- Marketplace contract

The script will automatically update your `.env` and `frontend/.env` files with the deployed contract addresses.

## Step 3: Verify Deployment

After deployment, you'll see output like:

```
✅ Deployment complete!

📋 Contract Addresses:
   GiftCardNFT: 0x...
   Marketplace: 0x...
   Mock USDC: 0x...
   Mock DAI: 0x...

🔍 Verify on PolygonScan:
   https://amoy.polygonscan.com/address/0x...
```

Visit the PolygonScan links to verify your contracts are deployed.

## Step 4: Get Test Tokens

To test the gift card functionality, you need test tokens:

1. Go to PolygonScan for Mock USDC address
2. Click "Write Contract"
3. Connect your wallet
4. Call the `faucet()` function to get 1000 test USDC
5. Repeat for Mock DAI

## Step 5: Configure Frontend

The deployment script automatically updates `frontend/.env`, but verify it has:

```bash
VITE_GIFT_CARD_NFT_ADDRESS=0x...
VITE_MARKETPLACE_ADDRESS=0x...
VITE_MOCK_USDC_ADDRESS=0x...
VITE_MOCK_DAI_ADDRESS=0x...
VITE_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Step 6: Start Frontend

```bash
npm run frontend:dev
```

The app will be available at http://localhost:5173

## Troubleshooting

### "Insufficient balance" error
- Get more test MATIC from the faucet
- Wait a few minutes for the faucet transaction to confirm

### "Wrong network" in frontend
- Make sure MetaMask is connected to Polygon Amoy
- Network details:
  - Network Name: Polygon Amoy
  - RPC URL: https://rpc-amoy.polygon.technology/
  - Chain ID: 80002
  - Currency Symbol: MATIC
  - Block Explorer: https://amoy.polygonscan.com

### Deployment fails
- Check your private key is correct
- Ensure you have enough MATIC for gas
- Try again - sometimes RPC endpoints are slow

## Contract Verification (Optional)

To verify contracts on PolygonScan:

```bash
npx hardhat verify --network amoy <CONTRACT_ADDRESS>
```

You'll need a PolygonScan API key in your `.env` file.

## What's Next?

After deployment:
1. Test creating a gift card with mock tokens
2. Test the marketplace functionality
3. Implement the AI art generation (Task 5)
4. Implement the email claim system (Task 8)
5. Build out the full frontend (Tasks 7-15)

## Network Information

- **Network**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **RPC URL**: https://rpc-amoy.polygon.technology/
- **Explorer**: https://amoy.polygonscan.com
- **Faucet**: https://faucet.polygon.technology/

## Security Notes

- This is a testnet deployment - no real value
- Never use testnet private keys on mainnet
- Keep your `.env` file secure and never commit it
- The mock tokens have no real value
