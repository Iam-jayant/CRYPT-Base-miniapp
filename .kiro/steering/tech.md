# Technology Stack

## Smart Contracts

- **Language**: Solidity 0.8.28
- **Framework**: Hardhat 3.0+
- **Libraries**: OpenZeppelin Contracts 5.4.0
- **Web3 Library**: Viem 2.40+
- **Testing**: Hardhat Toolbox with Viem

### Contract Architecture

- `GiftCardNFT.sol`: ERC-721 with token vaults, uses ReentrancyGuard and SafeERC20
- `Marketplace.sol`: Escrow-based marketplace for designs and NFTs
- `MockERC20.sol`: Test tokens (USDC, DAI) for development

### Security Patterns

- ReentrancyGuard on all state-changing functions
- SafeERC20 for token transfers
- Custom errors for gas efficiency
- Access control with Ownable pattern

## Frontend

- **Framework**: React 19 + TypeScript 5.9
- **Build Tool**: Vite 7.2
- **Routing**: React Router 7.9
- **Styling**: Tailwind CSS 3.4
- **Web3**: Wagmi 2.19 + RainbowKit 2.2
- **State**: TanStack Query 5.90
- **Animation**: Framer Motion 12.23 + GSAP 3.13

### Frontend Architecture

- Page-based routing in `src/pages/`
- Reusable components in `src/components/`
- Web3 config in `src/config/web3.ts`
- Service layer for IPFS, AI art, email
- Utility functions for contract interactions and error handling

### Key Libraries

- **clsx + tailwind-merge**: Conditional styling via `cn()` utility
- **@emailjs/browser**: Email delivery for gift cards
- **ogl**: WebGL effects for visual polish

## Infrastructure

- **Blockchain**: Polygon Amoy testnet (80002)
- **Storage**: IPFS via web3.storage
- **AI**: Hugging Face Stable Diffusion API
- **Email**: EmailJS service

## Common Commands

### Smart Contracts

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Amoy testnet
npm run deploy:amoy

# Verify setup
npm run verify-setup
```

### Frontend

```bash
# Install dependencies
cd frontend && npm install

# Start dev server (localhost:5173)
npm run frontend:dev

# Build for production
npm run frontend:build

# Preview production build
cd frontend && npm run preview
```

### Development Workflow

1. Compile contracts: `npm run compile`
2. Deploy to Amoy: `npm run deploy:amoy`
3. Copy contract addresses to `frontend/.env`
4. Start frontend: `npm run frontend:dev`

## Environment Variables

### Root `.env`
- Deployment keys, RPC URLs, API keys
- Contract addresses (auto-updated by deploy script)

### Frontend `.env`
- All variables prefixed with `VITE_`
- Contract addresses, API keys, WalletConnect project ID
- Must manually copy API keys from root `.env`

## Build System

- **Hardhat**: Compiles Solidity, runs tests, deploys contracts
- **Vite**: Fast HMR, optimized builds, TypeScript support
- **TypeScript**: Strict mode enabled, type-safe contract interactions
- Artifacts stored in `artifacts/` and `cache/`
