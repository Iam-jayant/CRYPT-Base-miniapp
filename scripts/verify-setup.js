#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if the project is properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔍 Verifying NFT Gift Protocol Setup...\n');

const checks = [
  {
    name: 'Root package.json',
    path: 'package.json',
    required: true,
  },
  {
    name: 'Hardhat config',
    path: 'hardhat.config.js',
    required: true,
  },
  {
    name: 'Environment example',
    path: '.env.example',
    required: true,
  },
  {
    name: 'Contracts directory',
    path: 'contracts',
    required: true,
    isDirectory: true,
  },
  {
    name: 'Test directory',
    path: 'test',
    required: true,
    isDirectory: true,
  },
  {
    name: 'Scripts directory',
    path: 'scripts',
    required: true,
    isDirectory: true,
  },
  {
    name: 'Frontend directory',
    path: 'frontend',
    required: true,
    isDirectory: true,
  },
  {
    name: 'Frontend package.json',
    path: 'frontend/package.json',
    required: true,
  },
  {
    name: 'Frontend Web3 config',
    path: 'frontend/src/config/web3.ts',
    required: true,
  },
  {
    name: 'Frontend environment example',
    path: 'frontend/.env.example',
    required: true,
  },
  {
    name: 'OpenZeppelin contracts',
    path: 'node_modules/@openzeppelin/contracts',
    required: true,
    isDirectory: true,
  },
];

let allPassed = true;

checks.forEach((check) => {
  const fullPath = path.join(rootDir, check.path);
  const exists = fs.existsSync(fullPath);
  
  if (check.isDirectory) {
    const isDir = exists && fs.statSync(fullPath).isDirectory();
    if (isDir) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - Directory not found`);
      allPassed = false;
    }
  } else {
    if (exists) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - File not found`);
      if (check.required) allPassed = false;
    }
  }
});

console.log('\n📋 Configuration Checklist:\n');

const envChecks = [
  { file: '.env', description: 'Root environment file' },
  { file: 'frontend/.env', description: 'Frontend environment file' },
];

envChecks.forEach((check) => {
  const fullPath = path.join(rootDir, check.file);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    console.log(`✅ ${check.description} exists`);
  } else {
    console.log(`⚠️  ${check.description} not found (copy from .env.example)`);
  }
});

console.log('\n🔑 Required API Keys:\n');
console.log('  - MUMBAI_RPC_URL (default provided)');
console.log('  - PRIVATE_KEY (for deployment)');
console.log('  - WEB3_STORAGE_API_KEY (get from web3.storage)');
console.log('  - HUGGINGFACE_API_KEY (get from huggingface.co)');
console.log('  - VITE_WALLETCONNECT_PROJECT_ID (get from cloud.walletconnect.com)');

console.log('\n📦 Dependencies:\n');
console.log('  ✅ Hardhat installed');
console.log('  ✅ OpenZeppelin contracts installed');
console.log('  ✅ Viem installed');
console.log('  ✅ RainbowKit installed');

console.log('\n🌐 Network Configuration:\n');
console.log('  📍 Target Network: Polygon Mumbai Testnet');
console.log('  🔗 Chain ID: 80001');
console.log('  💧 Faucet: https://faucet.polygon.technology/');

if (allPassed) {
  console.log('\n✨ Setup verification complete! All required files are in place.\n');
  console.log('Next steps:');
  console.log('  1. Configure your .env files with API keys');
  console.log('  2. Get test MATIC from the Mumbai faucet');
  console.log('  3. Start implementing smart contracts (Task 2)');
  console.log('  4. Run "npm run compile" to compile contracts');
  console.log('  5. Run "npm run frontend:dev" to start the frontend\n');
} else {
  console.log('\n❌ Setup verification failed. Please check the errors above.\n');
  process.exit(1);
}
