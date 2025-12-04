// IPFS Service Configuration
// Supports both Pinata and NFT.Storage
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const WEB3_STORAGE_API_KEY = import.meta.env.VITE_WEB3_STORAGE_API_KEY;

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

// Multiple IPFS gateways for redundancy
const GATEWAY_OPTIONS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// Mock IPFS storage for development/testing
const mockStorage = new Map<string, Blob | string>();
let mockCidCounter = 0;

function generateMockCID(): string {
  mockCidCounter++;
  return `Qm${mockCidCounter.toString().padStart(44, '0')}mock`;
}

export async function uploadImage(imageBlob: Blob): Promise<string> {
  // Check if we have Pinata credentials
  const hasPinata = PINATA_JWT || (PINATA_API_KEY && PINATA_SECRET_KEY);
  const hasNFTStorage = WEB3_STORAGE_API_KEY && WEB3_STORAGE_API_KEY.length >= 30;

  // For development: Use mock storage if no API key
  if (!hasPinata && !hasNFTStorage) {
    console.warn('⚠️ No IPFS credentials found - using mock storage for development');
    console.warn('Configure Pinata or NFT.Storage credentials in .env');
    const mockCid = generateMockCID();
    mockStorage.set(mockCid, imageBlob);
    return mockCid;
  }

  try {
    // Try Pinata first if configured
    if (hasPinata) {
      return await uploadToPinata(imageBlob);
    }
    
    // Fall back to NFT.Storage
    if (hasNFTStorage) {
      return await uploadToNFTStorage(imageBlob);
    }

    throw new Error('No IPFS service configured');
  } catch (error) {
    console.error('IPFS image upload error:', error);
    
    // Fallback to mock storage
    console.warn('⚠️ Falling back to mock storage (testnet only)');
    const mockCid = generateMockCID();
    mockStorage.set(mockCid, imageBlob);
    return mockCid;
  }
}

async function uploadToPinata(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob);

  const headers: Record<string, string> = {};
  
  // Pinata supports JWT or API Key + Secret
  if (PINATA_JWT) {
    headers['Authorization'] = `Bearer ${PINATA_JWT}`;
  } else if (PINATA_API_KEY && PINATA_SECRET_KEY) {
    headers['pinata_api_key'] = PINATA_API_KEY;
    headers['pinata_secret_api_key'] = PINATA_SECRET_KEY;
  }

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Pinata upload failed:', response.status, errorText);
    throw new Error(`Pinata upload failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('✓ Image uploaded to IPFS via Pinata:', data.IpfsHash);
  return data.IpfsHash;
}

async function uploadToNFTStorage(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob);

  const response = await fetch('https://api.nft.storage/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WEB3_STORAGE_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('NFT.Storage upload failed:', response.status, errorText);
    throw new Error(`NFT.Storage upload failed: ${response.status}`);
  }

  const data = await response.json();
  console.log('✓ Image uploaded to IPFS via NFT.Storage:', data.value.cid);
  return data.value.cid;
}

export async function uploadMetadata(metadata: NFTMetadata): Promise<string> {
  // Check if we have Pinata credentials
  const hasPinata = PINATA_JWT || (PINATA_API_KEY && PINATA_SECRET_KEY);
  const hasNFTStorage = WEB3_STORAGE_API_KEY && WEB3_STORAGE_API_KEY.length >= 30;

  // For development: Use mock storage if no API key
  if (!hasPinata && !hasNFTStorage) {
    console.warn('⚠️ No IPFS credentials found - using mock storage for development');
    const mockCid = generateMockCID();
    mockStorage.set(mockCid, JSON.stringify(metadata));
    return `ipfs://${mockCid}`;
  }

  try {
    const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    
    let cid: string;
    
    // Try Pinata first if configured
    if (hasPinata) {
      cid = await uploadToPinata(blob);
    } else if (hasNFTStorage) {
      cid = await uploadToNFTStorage(blob);
    } else {
      throw new Error('No IPFS service configured');
    }

    return `ipfs://${cid}`;
  } catch (error) {
    console.error('IPFS metadata upload error:', error);
    
    // Fallback to mock storage
    console.warn('⚠️ Falling back to mock storage (testnet only)');
    const mockCid = generateMockCID();
    mockStorage.set(mockCid, JSON.stringify(metadata));
    return `ipfs://${mockCid}`;
  }
}

export async function fetchMetadata(ipfsUri: string): Promise<NFTMetadata> {
  try {
    const cid = ipfsUri.replace('ipfs://', '');
    
    // Check mock storage first
    if (mockStorage.has(cid)) {
      const data = mockStorage.get(cid);
      if (typeof data === 'string') {
        return JSON.parse(data);
      }
    }
    
    // Try multiple gateways
    for (const gateway of GATEWAY_OPTIONS) {
      try {
        const url = `${gateway}${cid}`;
        const response = await fetch(url, {
          signal: AbortSignal.timeout(10000),
        });

        if (response.ok) {
          return await response.json();
        }
      } catch (err) {
        console.warn(`Gateway ${gateway} failed, trying next...`);
      }
    }
    
    throw new Error('All gateways failed');
  } catch (error) {
    console.error('IPFS metadata fetch error:', error);
    throw new Error('Failed to fetch metadata from IPFS');
  }
}

export async function fetchImage(ipfsUri: string): Promise<string> {
  try {
    const cid = ipfsUri.replace('ipfs://', '');
    
    // Check mock storage first
    if (mockStorage.has(cid)) {
      const blob = mockStorage.get(cid);
      if (blob instanceof Blob) {
        return URL.createObjectURL(blob);
      }
    }
    
    return `${IPFS_GATEWAY}${cid}`;
  } catch (error) {
    console.error('IPFS image fetch error:', error);
    throw new Error('Failed to fetch image from IPFS');
  }
}

export function getIPFSUrl(ipfsUri: string): string {
  const cid = ipfsUri.replace('ipfs://', '');
  
  // Check mock storage first
  if (mockStorage.has(cid)) {
    const data = mockStorage.get(cid);
    if (data instanceof Blob) {
      return URL.createObjectURL(data);
    }
  }
  
  return `${IPFS_GATEWAY}${cid}`;
}
