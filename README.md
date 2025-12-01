# NFT Gift Protocol 🎁

A decentralized gifting system that replaces traditional gift cards with customizable, AI-generated NFT art that holds transferable tokens.

## ⚠️ Important: Testnet Only

**This project runs exclusively on Polygon Mumbai testnet. No real tokens or value are involved.**

## Features

- 🎨 AI-generated gift card artwork using Stable Diffusion
- 💎 ERC-721 NFTs with embedded ERC-20 token vaults
- 📧 Email-based gift card delivery and claiming
- 🛒 Marketplace for artist designs and secondary NFT sales
- 💰 Liquidation mechanism to extract token value
- 🔗 Decentralized storage using IPFS

## Tech Stack

### Smart Contracts
- Solidity 0.8.28
- Hardhat development environment
- OpenZeppelin contracts
- Viem for Web3 interactions

### Frontend
- React + TypeScript
- Vite build tool
- RainbowKit for wallet integration
- Wagmi for Web3 hooks
- TanStack Query for state management

### Infrastructure
- Polygon Mumbai testnet (Chain ID: 80001)
- IPFS via web3.storage
- Hugging Face API for AI art generation
- EmailJS for email delivery

## Project Structure

```
.
├── contracts/          # Solidity smart contracts
├── test/              # Smart contract tests
├── scripts/           # Deployment scripts
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── config/    # Web3 and API configuration
│   │   └── ...
│   └── ...
├── .env.example       # Environment variables template
└── hardhat.config.js  # Hardhat configuration
```

## Getting Started

### Prerequisites

- Node.js v18+ and npm
- MetaMask or another Web3 wallet
- Mumbai testnet MATIC (get from [faucet](https://faucet.polygon.technology/))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CRYPT
```

2. Install root dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

4. Set up environment variables:
```bash
# Copy the example files
cp .env.example .env
cp frontend/.env.example frontend/.env

# Edit .env files with your configuration
```

### Configuration

#### Root `.env` file:
- `MUMBAI_RPC_URL`: Mumbai testnet RPC endpoint
- `PRIVATE_KEY`: Your wallet private key (for deployment)
- `POLYGONSCAN_API_KEY`: For contract verification
- `WEB3_STORAGE_API_KEY`: Get from [web3.storage](https://web3.storage)
- `HUGGINGFACE_API_KEY`: Get from [Hugging Face](https://huggingface.co)

#### Frontend `.env` file:
- `VITE_WALLETCONNECT_PROJECT_ID`: Get from [WalletConnect Cloud](https://cloud.walletconnect.com)
- Contract addresses (filled after deployment)
- API keys for IPFS and AI generation

### Development

#### Compile Smart Contracts
```bash
npm run compile
```

#### Run Tests
```bash
npm test
```

#### Start Frontend Development Server
```bash
npm run frontend:dev
```

The frontend will be available at `http://localhost:5173`

### Deployment

Deploy contracts to Mumbai testnet:
```bash
npm run deploy
```

After deployment, update the contract addresses in `frontend/.env`:
- `VITE_GIFT_CARD_NFT_ADDRESS`
- `VITE_MARKETPLACE_ADDRESS`

## Network Information

### Polygon Mumbai Testnet
- **Chain ID**: 80001
- **RPC URL**: https://rpc-mumbai.maticvigil.com
- **Block Explorer**: https://mumbai.polygonscan.com
- **Faucet**: https://faucet.polygon.technology/

## Usage

1. **Connect Wallet**: Use the connect button to link your MetaMask wallet
2. **Get Test MATIC**: Visit the Mumbai faucet to get test tokens
3. **Create Gift Card**: Generate AI art and mint an NFT with embedded tokens
4. **Send Gift**: Share via email or transfer directly
5. **Trade**: List on marketplace or purchase existing gift cards
6. **Liquidate**: Extract token value from owned gift cards

## Development Roadmap

See `.kiro/specs/nft-gift-protocol/tasks.md` for the complete implementation plan.

## License

MIT

## Contributing

This is a testnet-only educational project. Contributions are welcome!

## Support

For issues or questions, please open an issue on GitHub.
