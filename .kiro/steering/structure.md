# Project Structure

## Root Directory

```
.
├── contracts/          # Solidity smart contracts
├── scripts/            # Deployment and utility scripts
├── test/              # Smart contract tests
├── artifacts/         # Compiled contract artifacts (generated)
├── cache/             # Hardhat cache (generated)
├── frontend/          # React frontend application
├── ignition/          # Hardhat Ignition modules
├── .env               # Root environment variables
├── hardhat.config.ts  # Hardhat configuration
├── package.json       # Root dependencies
└── tsconfig.json      # TypeScript config for contracts
```

## Smart Contracts (`contracts/`)

- `GiftCardNFT.sol`: Main NFT contract with token vaults
- `Marketplace.sol`: Marketplace for designs and NFT trading
- `MockERC20.sol`: Test ERC-20 tokens (USDC, DAI)

## Scripts (`scripts/`)

- `deploy-simple.js`: Deployment script using Viem
- `verify-setup.js`: Environment validation script

## Frontend Structure (`frontend/`)

```
frontend/
├── src/
│   ├── pages/              # Route components
│   │   ├── Home.tsx        # Landing page
│   │   ├── CreateGiftCard.tsx
│   │   ├── MyGifts.tsx
│   │   ├── Marketplace.tsx
│   │   ├── ListArt.tsx
│   │   └── ClaimGift.tsx
│   ├── components/         # Reusable UI components
│   │   ├── CustomConnectButton.tsx
│   │   ├── ToastContainer.tsx
│   │   ├── MagicBento.tsx
│   │   └── LightRays.tsx
│   ├── config/            # Configuration
│   │   └── web3.ts        # Wagmi, RainbowKit, contract addresses
│   ├── contracts/         # Contract ABIs and types
│   │   └── abis.ts
│   ├── services/          # External service integrations
│   │   ├── ipfs.ts        # IPFS upload/fetch
│   │   ├── ai-art.ts      # Stable Diffusion API
│   │   └── email.ts       # EmailJS integration
│   ├── utils/             # Utility functions
│   │   └── contractUtils.ts  # Error parsing, formatting
│   ├── lib/               # Shared libraries
│   │   └── utils.ts       # cn() utility for Tailwind
│   ├── App.tsx            # Main app component with routing
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── .env                   # Frontend environment variables
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS config
└── package.json           # Frontend dependencies
```

## Key Conventions

### File Naming
- React components: PascalCase (e.g., `CreateGiftCard.tsx`)
- Utilities/services: camelCase (e.g., `contractUtils.ts`)
- Config files: kebab-case (e.g., `vite.config.ts`)

### Import Organization
1. External libraries (React, Wagmi, etc.)
2. Internal components
3. Services and utilities
4. Types and constants
5. Styles

### Component Structure
- Pages in `src/pages/` handle routing and data fetching
- Components in `src/components/` are reusable UI elements
- Services in `src/services/` handle external API calls
- Utils in `src/utils/` provide helper functions

### Contract Interactions
- ABIs defined in `frontend/src/contracts/abis.ts`
- Contract addresses in `frontend/src/config/web3.ts`
- Use Wagmi hooks (`useWriteContract`, `useReadContract`)
- Error handling via `contractUtils.ts`

### Styling
- Tailwind CSS utility classes
- Custom animations in `tailwind.config.js`
- Global styles in `src/index.css`
- Component-specific CSS only when necessary
- Use `cn()` utility from `lib/utils.ts` for conditional classes

### State Management
- TanStack Query for async state
- Wagmi hooks for Web3 state
- React hooks for local state
- No global state management library

## Generated Files (Git Ignored)

- `artifacts/`: Compiled contract artifacts
- `cache/`: Hardhat compilation cache
- `frontend/dist/`: Production build output
- `frontend/node_modules/`: Frontend dependencies
- `node_modules/`: Root dependencies
