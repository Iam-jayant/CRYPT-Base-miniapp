# Pinata Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Step 1: Get Your Pinata JWT

1. Go to [https://pinata.cloud](https://pinata.cloud) and sign up (free)
2. Navigate to **API Keys** in the sidebar
3. Click **New Key**
4. Enable these permissions:
   - ✅ `pinFileToIPFS`
   - ✅ `pinJSONToIPFS`
5. Name it "NFT Gift Protocol"
6. Click **Create Key**
7. **Copy the JWT immediately** (you won't see it again!)

### Step 2: Add to Your Project

Open `frontend/.env` and add:

```env
VITE_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your_actual_jwt_here
```

### Step 3: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
npm run frontend:dev
```

## ✅ Verify It's Working

1. Go to "List Your Art" page
2. Upload an image
3. Check browser console for:
   ```
   ✓ Image uploaded to IPFS via Pinata: QmXxx...
   ```

## 🎯 What You Get

- ✅ Real IPFS storage (not mock)
- ✅ Images persist forever
- ✅ Accessible to anyone
- ✅ 1GB free storage
- ✅ Fast, reliable uploads

## ⚠️ Common Issues

**"Upload failed: 401"**
- JWT is invalid or incomplete
- Make sure you copied the entire token

**"Still using mock storage"**
- Check that JWT is in `frontend/.env` (not root `.env`)
- Variable name must be exactly `VITE_PINATA_JWT`
- Restart dev server after adding

**"Upload failed: 403"**
- Check API key permissions include `pinFileToIPFS`
- You may have hit free tier limits

## 📚 Need More Help?

See the full [IPFS_SETUP_GUIDE.md](./IPFS_SETUP_GUIDE.md) for detailed instructions and troubleshooting.
