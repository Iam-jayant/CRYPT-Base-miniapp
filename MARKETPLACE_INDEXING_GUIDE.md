# Marketplace Indexing Guide

## Current Issue

The marketplace is querying the last 10,000 blocks for listing events, but no events are being found. This could mean:

1. **Contracts were deployed recently** - The deployment block might be within the last 10,000 blocks, but the listing transaction happened in a different block range
2. **Transaction not confirmed** - The listing transaction might still be pending
3. **Need deployment block number** - We should query from the contract deployment block instead of a fixed range

## Quick Fix: Find Your Listing Transaction

1. Go to [Polygon Amoy Explorer](https://amoy.polygonscan.com/)
2. Search for the Marketplace contract address: `0x1ab15419df1b9225553a1a81a4242c5bf23fb95e`
3. Click on "Events" tab
4. Look for `ArtistListingCreated` events
5. Note the block number of your listing

## Temporary Solution: Query from Contract Deployment

Update the marketplace to query from the contract deployment block instead of the last 10,000 blocks.

### Steps:

1. Find the contract deployment block:
   - Go to https://amoy.polygonscan.com/address/0x1ab15419df1b9225553a1a81a4242c5bf23fb95e
   - Look for "Contract Creation" transaction
   - Note the block number

2. Update `frontend/src/pages/Marketplace.tsx`:
   ```typescript
   // Replace this line:
   const fromBlock = currentBlock > 10000n ? currentBlock - 10000n : 0n;
   
   // With the actual deployment block:
   const fromBlock = 12345678n; // Replace with actual deployment block
   ```

## Long-term Solution: The Graph Subgraph

For production, implement a subgraph to index marketplace events efficiently.

### Benefits:
- Fast queries
- No RPC rate limits
- Historical data
- Complex filtering

### Setup:
1. Create subgraph schema
2. Define event handlers
3. Deploy to The Graph
4. Query via GraphQL

## Alternative: Backend Indexer

Create a simple backend service that:
1. Listens for blockchain events
2. Stores them in a database
3. Provides REST API for frontend

This is simpler than The Graph but requires server maintenance.

## For Now

The marketplace will show listings from the last 10,000 blocks. If your listing is older, you'll need to:
1. Relist your artwork, OR
2. Update the `fromBlock` value as described above
