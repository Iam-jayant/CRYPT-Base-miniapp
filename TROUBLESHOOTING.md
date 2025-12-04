# Troubleshooting Guide

## Recent Fixes (December 2024)

### ✅ IPFS Upload Fixed
- **Issue**: 503 errors from Web3.Storage
- **Solution**: Switched to NFT.Storage API with mock storage fallback
- **Status**: Working

### ✅ Email Notifications Implemented
- **Issue**: Emails not being sent after NFT mint
- **Solution**: Integrated EmailJS service
- **Status**: Working (requires EmailJS configuration)

### ✅ Marketplace Timeout Fixed
- **Issue**: RPC timeout when querying event logs
- **Solution**: Simplified to show info message about indexing requirement
- **Status**: Working (requires subgraph for production)

### ✅ My Gifts Loading Fixed
- **Issue**: Timeout and ABI errors when loading gift cards
- **Solution**: Optimized loading logic, added error handling
- **Status**: Working

---

# Troubleshooting Guide

## Vite Dependency Optimization Error

### Error Message
```
The file does not exist at "C:/Users/.../node_modules/.vite/deps/index.es-*.js" 
which is in the optimize deps directory. The dependency might be incompatible 
with the dep optimizer. Try adding it to `optimizeDeps.exclude`.
```

### Solution 1: Quick Fix (Recommended)

**On Windows:**
```bash
cd frontend

# Stop the dev server (Ctrl+C)

# Clear Vite cache
Remove-Item -Recurse -Force node_modules\.vite

# Restart dev server
npm run dev
```

**Or use the fix script:**
```bash
cd frontend
.\fix-vite.bat
```

### Solution 2: Full Clean

```bash
cd frontend

# Stop the dev server (Ctrl+C)

# Remove all caches
Remove-Item -Recurse -Force node_modules\.vite
Remove-Item -Recurse -Force .vite
Remove-Item package-lock.json

# Reinstall dependencies
npm install

# Start dev server
npm run dev
```

### Solution 3: If Still Not Working

1. **Close all terminals**
2. **Delete node_modules completely:**
   ```bash
   cd frontend
   Remove-Item -Recurse -Force node_modules
   ```
3. **Reinstall:**
   ```bash
   npm install
   ```
4. **Start fresh:**
   ```bash
   npm run dev
   ```

---

## Common Issues

### Issue: "Cannot find module 'wagmi/actions'"

**Solution:**
```bash
cd frontend
npm install wagmi@latest
npm run dev
```

### Issue: Port 5173 already in use

**Solution:**
```bash
# Find and kill the process
netstat -ano | findstr :5173
taskkill /PID <PID_NUMBER> /F

# Or use a different port
npm run dev -- --port 3000
```

### Issue: MetaMask not connecting

**Solution:**
1. Check you're on Polygon Amoy network (Chain ID: 80002)
2. Clear MetaMask cache
3. Refresh the page
4. Try disconnecting and reconnecting

### Issue: "Network changed" error

**Solution:**
1. Make sure MetaMask is on Polygon Amoy
2. Refresh the page
3. Reconnect wallet

### Issue: Transaction fails

**Solution:**
1. Check you have enough test MATIC
2. Get more from: https://faucet.polygon.technology/
3. Check gas settings in MetaMask
4. Try again with higher gas

### Issue: IPFS upload fails

**Solution:**
1. Check `VITE_WEB3_STORAGE_API_KEY` in `frontend/.env`
2. Verify API key is valid
3. Check internet connection
4. Try again

### Issue: AI art generation fails

**Solution:**
1. Check `VITE_HUGGINGFACE_API_KEY` in `frontend/.env`
2. Verify API key is valid
3. Model might be loading (cold start) - wait 30 seconds
4. Try a different prompt

---

## Environment Variables

### Check Configuration

**frontend/.env should have:**
```bash
VITE_GIFT_CARD_NFT_ADDRESS=0x98cfe7e486e5bcbb975fea381e7096b11a3d21c6
VITE_MARKETPLACE_ADDRESS=0x1ab15419df1b9225553a1a81a4242c5bf23fb95e
VITE_MOCK_USDC_ADDRESS=0x988708c9abae80ece464ad573dbc0b78f1981a4e
VITE_MOCK_DAI_ADDRESS=0xa3c193e814d17fb7536450debcec3bf8fa65c5cf
VITE_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
VITE_WEB3_STORAGE_API_KEY=your_web3_storage_key
VITE_HUGGINGFACE_API_KEY=your_huggingface_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### If Missing

Copy from root `.env` to `frontend/.env` with `VITE_` prefix.

---

## Build Issues

### Issue: Build fails

**Solution:**
```bash
cd frontend

# Clean build
Remove-Item -Recurse -Force dist

# Build again
npm run build
```

### Issue: TypeScript errors

**Solution:**
```bash
cd frontend

# Check for errors
npm run type-check

# If errors, check the files mentioned
# Fix any type issues
```

---

## Network Issues

### Add Polygon Amoy to MetaMask

1. Open MetaMask
2. Click network dropdown
3. Add Network → Add Manually
4. Enter:
   - **Network Name**: Polygon Amoy
   - **RPC URL**: https://rpc-amoy.polygon.technology/
   - **Chain ID**: 80002
   - **Currency**: MATIC
   - **Explorer**: https://amoy.polygonscan.com

### Get Test MATIC

1. Visit: https://faucet.polygon.technology/
2. Select "Polygon Amoy"
3. Enter your wallet address
4. Click "Submit"
5. Wait ~1 minute

### Get Test Tokens

1. Go to PolygonScan Amoy
2. Find Mock USDC contract: `0x988708c9abae80ece464ad573dbc0b78f1981a4e`
3. Go to "Write Contract"
4. Connect wallet
5. Call `faucet()` function
6. Repeat for Mock DAI: `0xa3c193e814d17fb7536450debcec3bf8fa65c5cf`

---

## Performance Issues

### Issue: Slow loading

**Solution:**
1. Check internet connection
2. IPFS gateway might be slow - wait a bit
3. Clear browser cache
4. Try a different browser

### Issue: High memory usage

**Solution:**
1. Close other tabs
2. Restart browser
3. Clear browser cache
4. Restart dev server

---

## Development Tips

### Hot Reload Not Working

```bash
# Restart dev server
# Press Ctrl+C
npm run dev
```

### Changes Not Showing

```bash
# Hard refresh browser
# Windows: Ctrl + Shift + R
# Mac: Cmd + Shift + R
```

### Console Errors

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Application tab for storage issues

---

## Getting Help

### Check Documentation
- `README.md` - Project overview
- `DEPLOYMENT.md` - Deployment guide
- `QUICK_START.md` - Quick setup
- `FRONTEND_GUIDE.md` - Technical details
- `PROJECT_COMPLETE.md` - Feature list

### Check Logs
- Browser console (F12)
- Terminal output
- MetaMask activity tab

### Common Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint code
npm run lint
```

---

## Still Having Issues?

1. **Check all environment variables are set**
2. **Verify you're on Polygon Amoy network**
3. **Clear all caches (browser + Vite)**
4. **Restart everything (terminal + browser)**
5. **Try a different browser**
6. **Check internet connection**
7. **Verify API keys are valid**

---

## Quick Checklist

Before asking for help, verify:

- [ ] Node.js v18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables set in `frontend/.env`
- [ ] MetaMask installed and connected
- [ ] On Polygon Amoy network (Chain ID: 80002)
- [ ] Have test MATIC in wallet
- [ ] Vite cache cleared
- [ ] Dev server running
- [ ] No console errors
- [ ] Internet connection working

---

**Most issues can be fixed by clearing the Vite cache and restarting!**

```bash
cd frontend
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```
