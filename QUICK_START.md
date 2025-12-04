# Quick Start Guide

## Deploy in 3 Steps

### 1. Add Your Private Key

Edit `.env` file:

```bash
PRIVATE_KEY=your_metamask_private_key_here
```

**How to get your private key from MetaMask:**

1. Open MetaMask
2. Click the 3 dots menu
3. Account Details → Show Private Key
4. Enter password → Copy key

### 2. Get Test MATIC

Visit: https://faucet.polygon.technology/

- Select "Polygon Amoy"
- Paste your wallet address
- Click "Submit"
- Wait ~1 minute

### 3. Deploy

```bash
npm run deploy:amoy
```

## That's It!

After deployment:

- Contract addresses will be in `.env` and `frontend/.env`
- Visit the PolygonScan links shown in the output
- Get test tokens: Call `faucet()` on Mock USDC/DAI contracts

## Start Frontend

```bash
npm run frontend:dev
```

Open http://localhost:5173

## Add Amoy to MetaMask

If you don't have Amoy network:

1. Open MetaMask
2. Click network dropdown
3. Add Network → Add Manually
4. Enter:
   - Network Name: Polygon Amoy
   - RPC URL: https://rpc-amoy.polygon.technology/
   - Chain ID: 80002
   - Currency: MATIC
   - Explorer: https://amoy.polygonscan.com

## Troubleshooting

**"Insufficient balance"**
→ Get more test MATIC from faucet

**"Wrong network"**
→ Switch MetaMask to Polygon Amoy

**"Deployment failed"**
→ Check private key is correct
→ Ensure you have test MATIC

## What You Get

After deployment, you'll have:

- ✅ GiftCardNFT contract (create gift cards with tokens)
- ✅ Marketplace contract (trade gift cards and designs)
- ✅ Mock USDC (test token)
- ✅ Mock DAI (test token)

## Test the Contracts

1. Get test tokens:

   - Go to Mock USDC on PolygonScan
   - Connect wallet → Write Contract
   - Call `faucet()` → Get 1000 tokens

2. Create a gift card:

   - Approve GiftCardNFT to spend your tokens
   - Call `createGiftCard()` with metadata URI and token amount

3. List on marketplace:
   - Approve Marketplace to transfer your NFT
   - Call `listGiftCard()` with price

## Need More Help?

- Full guide: `DEPLOYMENT.md`
- Project status: `PROJECT_STATUS.md`
- Setup details: `README.md`
