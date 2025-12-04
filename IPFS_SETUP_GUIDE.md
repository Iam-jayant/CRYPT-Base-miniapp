# IPFS Setup Guide

## Overview

The NFT Gift Protocol uses IPFS (InterPlanetary File System) for decentralized storage of NFT artwork and metadata. This guide will help you set up IPFS storage for your application.

The application supports two IPFS services:

- **Pinata** (Recommended) - More reliable, better performance
- **NFT.Storage** - Free tier, good for testing

## Option 1: Pinata (Recommended)

Pinata is a popular IPFS pinning service with excellent reliability and performance.

### Steps:

1. **Visit Pinata**

   - Go to [https://pinata.cloud](https://pinata.cloud)

2. **Sign Up**

   - Click "Sign Up" (free tier available)
   - Verify your email

3. **Generate JWT Token**

   - Once logged in, go to "API Keys" in the sidebar
   - Click "New Key" button
   - Configure permissions:
     - ✅ Enable "pinFileToIPFS"
     - ✅ Enable "pinJSONToIPFS" (if available)
   - Give it a name (e.g., "NFT Gift Protocol")
   - Click "Create Key"
   - **Important:** Copy the JWT token immediately (you won't see it again!)

4. **Add to Environment Variables**

   - Open `frontend/.env`
   - Add your Pinata JWT:

   ```
   VITE_PINATA_JWT=your_pinata_jwt_token_here
   ```

5. **Restart Development Server**
   - Stop your dev server (Ctrl+C)
   - Run `npm run frontend:dev` again
   - The application will now use Pinata for IPFS storage

### Alternative: API Key + Secret

If you prefer using API Key + Secret instead of JWT:

1. In Pinata dashboard, create an API key with the same permissions
2. Copy both the API Key and Secret API Key
3. Add to `frontend/.env`:
   ```
   VITE_PINATA_API_KEY=your_api_key_here
   VITE_PINATA_SECRET_KEY=your_secret_key_here
   ```

## Option 2: NFT.Storage

NFT.Storage provides free IPFS storage specifically designed for NFTs.

### Steps:

1. **Visit NFT.Storage**

   - Go to [https://nft.storage](https://nft.storage)

2. **Sign Up**

   - Click "Sign Up" or "Login"
   - You can sign up with email or GitHub

3. **Generate API Key**

   - Once logged in, go to "API Keys" section
   - Click "New Key" or "+ API Key"
   - Give it a name (e.g., "NFT Gift Protocol")
   - Copy the generated API key

4. **Add to Environment Variables**

   - Open `frontend/.env`
   - Add your NFT.Storage key:

   ```
   VITE_WEB3_STORAGE_API_KEY=your_nft_storage_key_here
   ```

5. **Restart Development Server**
   - Stop your dev server (Ctrl+C)
   - Run `npm run frontend:dev` again
   - The application will now use NFT.Storage

## Mock Storage (Development Only)

If no valid credentials are configured, the application automatically falls back to mock storage:

- ✅ Works for local testing
- ✅ No setup required
- ❌ Images don't persist after page refresh
- ❌ Images aren't accessible to other users
- ❌ Not suitable for production or sharing

## Verifying IPFS Setup

After adding your credentials:

1. Go to "List Your Art" page
2. Upload an image
3. Check the browser console:
   - ✅ Pinata: `✓ Image uploaded to IPFS via Pinata: Qm...`
   - ✅ NFT.Storage: `✓ Image uploaded to IPFS via NFT.Storage: Qm...`
   - ❌ Fallback: `⚠️ Falling back to mock storage`

## Troubleshooting

### Pinata Issues

**"Upload failed: 401"**

- Your JWT token is invalid or expired
- Generate a new JWT from Pinata dashboard
- Make sure you copied the entire token

**"Upload failed: 403"**

- Check that your API key has "pinFileToIPFS" permission enabled
- Your account may have reached storage limits

### NFT.Storage Issues

**"Upload failed: 401"**

- Your API key is invalid or expired
- Generate a new key from nft.storage

**"Upload failed: 403"**

- Your account may have reached storage limits
- Check your nft.storage dashboard

### General Issues

**Still using mock storage**

- Make sure credentials are in `frontend/.env` (not root `.env`)
- Ensure variable names are exactly as shown above
- Restart your development server after adding credentials
- Check browser console for specific error messages

## Service Comparison

| Feature     | Pinata         | NFT.Storage |
| ----------- | -------------- | ----------- |
| Free Tier   | 1GB            | Unlimited   |
| Reliability | Excellent      | Good        |
| Speed       | Fast           | Moderate    |
| Setup       | JWT or API Key | API Key     |
| Best For    | Production     | Testing     |

## Production Considerations

For production deployment:

1. **Use Pinata** for better reliability and performance
2. Consider a paid plan for higher limits
3. Monitor your storage usage and costs
4. Implement proper error handling and retry logic
5. Consider using a CDN in front of IPFS gateways
6. Pin important content to multiple services for redundancy

## Resources

- [Pinata Documentation](https://docs.pinata.cloud/)
- [NFT.Storage Documentation](https://nft.storage/docs/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Best Practices for NFT Data](https://docs.opensea.io/docs/metadata-standards)
