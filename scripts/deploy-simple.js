import { createWalletClient, createPublicClient, http } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load compiled contracts
const GiftCardNFT = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../artifacts/contracts/GiftCardNFT.sol/GiftCardNFT.json'), 'utf8')
);
const Marketplace = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../artifacts/contracts/Marketplace.sol/Marketplace.json'), 'utf8')
);
const MockERC20 = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../artifacts/contracts/MockERC20.sol/MockERC20.json'), 'utf8')
);

async function main() {
  console.log("🚀 Starting deployment to Polygon Amoy testnet\n");

  // Setup account and clients
  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
  
  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(process.env.AMOY_RPC_URL),
  });

  const walletClient = createWalletClient({
    account,
    chain: polygonAmoy,
    transport: http(process.env.AMOY_RPC_URL),
  });

  console.log("📝 Deploying contracts with account:", account.address);

  const balance = await publicClient.getBalance({ address: account.address });
  console.log("💰 Account balance:", (Number(balance) / 1e18).toFixed(4), "MATIC\n");

  if (balance === 0n) {
    console.error("❌ Error: Insufficient balance. Get test MATIC from:");
    console.error("   https://faucet.polygon.technology/");
    process.exit(1);
  }

  // Deploy Mock USDC
  console.log("📦 Deploying Mock USDC...");
  const mockUSDCHash = await walletClient.deployContract({
    abi: MockERC20.abi,
    bytecode: MockERC20.bytecode,
    args: ["Mock USDC", "mUSDC", 1000000n],
  });
  const mockUSDCReceipt = await publicClient.waitForTransactionReceipt({ hash: mockUSDCHash });
  const mockUSDCAddress = mockUSDCReceipt.contractAddress;
  console.log("✅ Mock USDC deployed to:", mockUSDCAddress);

  // Deploy Mock DAI
  console.log("\n📦 Deploying Mock DAI...");
  const mockDAIHash = await walletClient.deployContract({
    abi: MockERC20.abi,
    bytecode: MockERC20.bytecode,
    args: ["Mock DAI", "mDAI", 1000000n],
  });
  const mockDAIReceipt = await publicClient.waitForTransactionReceipt({ hash: mockDAIHash });
  const mockDAIAddress = mockDAIReceipt.contractAddress;
  console.log("✅ Mock DAI deployed to:", mockDAIAddress);

  // Deploy GiftCardNFT
  console.log("\n📦 Deploying GiftCardNFT...");
  const giftCardNFTHash = await walletClient.deployContract({
    abi: GiftCardNFT.abi,
    bytecode: GiftCardNFT.bytecode,
  });
  const giftCardNFTReceipt = await publicClient.waitForTransactionReceipt({ hash: giftCardNFTHash });
  const giftCardNFTAddress = giftCardNFTReceipt.contractAddress;
  console.log("✅ GiftCardNFT deployed to:", giftCardNFTAddress);

  // Deploy Marketplace
  console.log("\n📦 Deploying Marketplace...");
  const marketplaceHash = await walletClient.deployContract({
    abi: Marketplace.abi,
    bytecode: Marketplace.bytecode,
    args: [giftCardNFTAddress],
  });
  const marketplaceReceipt = await publicClient.waitForTransactionReceipt({ hash: marketplaceHash });
  const marketplaceAddress = marketplaceReceipt.contractAddress;
  console.log("✅ Marketplace deployed to:", marketplaceAddress);

  // Save addresses
  const addresses = {
    GIFT_CARD_NFT_ADDRESS: giftCardNFTAddress,
    MARKETPLACE_ADDRESS: marketplaceAddress,
    MOCK_USDC_ADDRESS: mockUSDCAddress,
    MOCK_DAI_ADDRESS: mockDAIAddress,
  };

  console.log("\n📝 Updating environment files...");
  updateEnvFile(".env", addresses);
  updateEnvFile("frontend/.env", addresses, "VITE_");

  console.log("\n✅ Deployment complete!");
  console.log("\n📋 Contract Addresses:");
  console.log("   GiftCardNFT:", giftCardNFTAddress);
  console.log("   Marketplace:", marketplaceAddress);
  console.log("   Mock USDC:", mockUSDCAddress);
  console.log("   Mock DAI:", mockDAIAddress);
  console.log("\n🔍 Verify on PolygonScan:");
  console.log(`   https://amoy.polygonscan.com/address/${giftCardNFTAddress}`);
  console.log(`   https://amoy.polygonscan.com/address/${marketplaceAddress}`);
  console.log("\n💡 Get test tokens:");
  console.log(`   Call faucet() on Mock USDC: ${mockUSDCAddress}`);
  console.log(`   Call faucet() on Mock DAI: ${mockDAIAddress}`);
}

function updateEnvFile(filePath, addresses, prefix = "") {
  const envPath = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(envPath)) {
    console.warn(`⚠️  ${filePath} not found, skipping...`);
    return;
  }

  let content = fs.readFileSync(envPath, "utf8");

  for (const [key, value] of Object.entries(addresses)) {
    const envKey = prefix + key;
    const regex = new RegExp(`^${envKey}=.*$`, "m");

    if (regex.test(content)) {
      content = content.replace(regex, `${envKey}=${value}`);
    } else {
      content += `\n${envKey}=${value}`;
    }
  }

  fs.writeFileSync(envPath, content);
  console.log(`   ✅ Updated ${filePath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
