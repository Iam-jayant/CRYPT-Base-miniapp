import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { motion } from 'framer-motion';
import { MarketplaceABI, GiftCardNFTABI } from '../contracts/abis';
import { MARKETPLACE_ADDRESS, GIFT_CARD_NFT_ADDRESS, TESTNET_TOKENS } from '../contracts/addresses';
import { getIPFSUrl, fetchMetadata } from '../services/ipfs';
import { useToast } from '../components/ToastContainer';
import { parseContractError } from '../utils/contractUtils';
import { cn } from '../lib/utils';

interface ArtistListing {
  listingId: bigint;
  artist: string;
  ipfsHash: string;
  price: bigint;
  active: boolean;
  metadata?: any;
}

interface GiftCardListing {
  listingId: bigint;
  seller: string;
  tokenId: bigint;
  price: bigint;
  active: boolean;
  metadata?: any;
  vaultAmount?: bigint;
  vaultToken?: string;
}

export default function Marketplace() {
  const { isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const publicClient = usePublicClient();
  const { showSuccess, showError, showInfo } = useToast();
  const [activeTab, setActiveTab] = useState<'designs' | 'giftcards'>('designs');
  const [artistListings, setArtistListings] = useState<ArtistListing[]>([]);
  const [giftCardListings, setGiftCardListings] = useState<GiftCardListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadListings();
  }, [activeTab, publicClient]);

  const loadListings = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'designs') {
        await loadArtistListings();
      } else {
        await loadGiftCardListings();
      }
    } catch (err) {
      const errorMsg = 'Failed to load listings';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadArtistListings = async () => {
    if (!publicClient) {
      setArtistListings([]);
      return;
    }

    try {
      // Get current block number
      const currentBlock = await publicClient.getBlockNumber();
      // Start from deployment block or 200k blocks back
      const fromBlock = currentBlock > 200000n ? currentBlock - 200000n : 0n;

      console.log(`🔍 Querying artist listings...`);
      console.log(`   Marketplace Address: ${MARKETPLACE_ADDRESS}`);
      console.log(`   Block Range: ${fromBlock} to ${currentBlock}`);

      // Fetch ArtistListingCreated events
      const logs = await publicClient.getLogs({
        address: MARKETPLACE_ADDRESS,
        event: {
          type: 'event',
          name: 'ArtistListingCreated',
          inputs: [
            { type: 'uint256', name: 'listingId', indexed: true },
            { type: 'address', name: 'artist', indexed: true },
            { type: 'string', name: 'ipfsHash', indexed: false },
            { type: 'uint256', name: 'price', indexed: false },
          ],
        },
        fromBlock,
        toBlock: 'latest',
      });

      console.log(`📋 Found ${logs.length} ArtistListingCreated events`);

      if (logs.length === 0) {
        console.warn('⚠️ No events found. This could mean:');
        console.warn('   1. No listings have been created yet');
        console.warn('   2. The contract address is incorrect');
        console.warn('   3. The events are outside the queried block range');
      }

      const listings: ArtistListing[] = [];

      for (const log of logs) {
        const { listingId, artist, ipfsHash, price } = log.args as any;

        console.log(`✓ Listing ${listingId}:`);
        console.log(`   IPFS: ${ipfsHash}`);
        console.log(`   Artist: ${artist}`);
        console.log(`   Price: ${price} wei`);

        listings.push({
          listingId,
          artist,
          ipfsHash,
          price,
          active: true,
        });
      }

      console.log(`✅ Total active artist listings: ${listings.length}`);
      setArtistListings(listings);
    } catch (err) {
      console.error('❌ Failed to load artist listings:', err);
      setArtistListings([]);
    }
  };

  const loadGiftCardListings = async () => {
    if (!publicClient) {
      setGiftCardListings([]);
      return;
    }

    try {
      // Get current block number
      const currentBlock = await publicClient.getBlockNumber();
      // For testnet, query from a reasonable starting block
      // Increased to 50000 blocks to catch older listings
      const fromBlock = currentBlock > 50000n ? currentBlock - 50000n : 0n;

      // Fetch GiftCardListed events
      const logs = await publicClient.getLogs({
        address: MARKETPLACE_ADDRESS,
        event: {
          type: 'event',
          name: 'GiftCardListed',
          inputs: [
            { type: 'uint256', name: 'listingId', indexed: true },
            { type: 'address', name: 'seller', indexed: true },
            { type: 'uint256', name: 'tokenId', indexed: true },
            { type: 'uint256', name: 'price', indexed: false },
          ],
        },
        fromBlock,
        toBlock: 'latest',
      });

      const listings: GiftCardListing[] = [];

      for (const log of logs) {
        const { listingId, seller, tokenId, price } = log.args as any;

        try {
          // Check if listing is still active
          const listingData = await publicClient.readContract({
            address: MARKETPLACE_ADDRESS,
            abi: MarketplaceABI,
            functionName: 'giftCardListings',
            args: [listingId],
          }) as any;

          if (!listingData.active) continue;

          // Fetch gift card metadata and vault info
          let metadata = {
            name: `Gift Card #${tokenId}`,
            description: 'NFT Gift Card',
            image: '',
          };

          let vaultAmount = BigInt(0);
          let vaultToken = '';

          try {
            const tokenURI = await publicClient.readContract({
              address: GIFT_CARD_NFT_ADDRESS,
              abi: GiftCardNFTABI,
              functionName: 'tokenURI',
              args: [tokenId],
            }) as string;

            if (tokenURI) {
              metadata = await fetchMetadata(tokenURI);
            }
          } catch (err) {
            console.warn(`Using placeholder metadata for token ${tokenId}`);
          }

          try {
            const vaultInfo = await publicClient.readContract({
              address: GIFT_CARD_NFT_ADDRESS,
              abi: GiftCardNFTABI,
              functionName: 'getVaultContents',
              args: [tokenId],
            }) as any;

            vaultAmount = vaultInfo.amount;
            vaultToken = vaultInfo.tokenAddress;
          } catch (err) {
            console.warn(`Failed to fetch vault info for token ${tokenId}`);
          }

          // Find token symbol
          const token = TESTNET_TOKENS.find(t => t.address.toLowerCase() === vaultToken.toLowerCase());
          const tokenSymbol = token?.symbol || 'TOKEN';

          listings.push({
            listingId,
            seller,
            tokenId,
            price,
            active: true,
            metadata,
            vaultAmount,
            vaultToken: tokenSymbol,
          });
        } catch (err) {
          console.error(`Failed to fetch listing ${listingId}:`, err);
        }
      }

      setGiftCardListings(listings);
    } catch (err) {
      console.error('Failed to load gift card listings:', err);
      setGiftCardListings([]);
    }
  };

  const handlePurchaseDesign = async (listingId: bigint, price: bigint) => {
    if (!isConnected) {
      showError('Please connect your wallet');
      return;
    }

    showInfo('Purchasing artist design...');

    try {
      writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MarketplaceABI,
        functionName: 'purchaseArtistDesign',
        args: [listingId],
        value: price,
      }, {
        onSuccess: (hash) => {
          showSuccess('Artist design purchased successfully!', hash);
          setTimeout(() => loadListings(), 3000);
        },
        onError: (err) => {
          const errorMsg = parseContractError(err);
          setError(errorMsg);
          showError(errorMsg);
        },
      });
    } catch (err) {
      const errorMsg = 'Failed to purchase design';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const handlePurchaseGiftCard = async (listingId: bigint, price: bigint) => {
    if (!isConnected) {
      showError('Please connect your wallet');
      return;
    }

    showInfo('Purchasing gift card...');

    try {
      writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MarketplaceABI,
        functionName: 'purchaseGiftCard',
        args: [listingId],
        value: price,
      }, {
        onSuccess: (hash) => {
          showSuccess('Gift card purchased successfully!', hash);
          setTimeout(() => loadListings(), 3000);
        },
        onError: (err) => {
          const errorMsg = parseContractError(err);
          setError(errorMsg);
          showError(errorMsg);
        },
      });
    } catch (err) {
      const errorMsg = 'Failed to purchase gift card';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-3">
          Marketplace
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Discover and trade NFT gift cards and artist designs
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex gap-2 p-1 bg-black/40 rounded-lg border border-white/10 max-w-md">
          <button
            onClick={() => setActiveTab('designs')}
            className={cn(
              "flex-1 px-4 py-2 rounded-md transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50",
              activeTab === 'designs'
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "text-slate-400 hover:text-slate-300"
            )}
          >
            🎨 Artist Designs
          </button>
          <button
            onClick={() => setActiveTab('giftcards')}
            className={cn(
              "flex-1 px-4 py-2 rounded-md transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50",
              activeTab === 'giftcards'
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "text-slate-400 hover:text-slate-300"
            )}
          >
            🎁 Gift Cards
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-500/10 backdrop-blur-md rounded-xl border border-red-500/20 p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mb-4"></div>
            <p className="text-slate-400">Loading marketplace...</p>
          </div>
        </div>
      )}

      {/* Artist Designs Tab */}
      {!loading && activeTab === 'designs' && (
        <div className="max-w-7xl mx-auto">
          {artistListings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-12"
            >
              <div className="text-center max-w-2xl mx-auto">
                <div className="text-6xl mb-6">🎨</div>
                <h3 className="text-2xl font-light text-white mb-4">Artist Design Marketplace</h3>
                <p className="text-slate-400 mb-4 leading-relaxed">
                  This feature requires an event indexing service (like The Graph) to efficiently query marketplace listings.
                </p>
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-6 mt-6">
                  <p className="text-violet-300 text-sm mb-3">💡 Coming Soon</p>
                  <p className="text-slate-400 text-sm">
                    For now, you can create and trade gift cards directly! Check out the Gift Cards tab.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artistListings.map((listing, index) => (
                <motion.div
                  key={listing.listingId.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-violet-500/30 transition-all group"
                >
                  {/* Design Image */}
                  <div className="relative aspect-square overflow-hidden bg-black/40">
                    <img
                      src={getIPFSUrl(`ipfs://${listing.ipfsHash}`)}
                      alt="Artist design"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%2318181b" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2364748b" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  {/* Design Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-slate-500 font-mono">
                        {listing.artist.slice(0, 6)}...{listing.artist.slice(-4)}
                      </span>
                      <span className="text-violet-400 font-medium">
                        {parseFloat(formatUnits(listing.price, 18)).toFixed(3)} MATIC
                      </span>
                    </div>

                    <button
                      onClick={() => handlePurchaseDesign(listing.listingId, listing.price)}
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium hover:from-violet-600 hover:to-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    >
                      Purchase Design
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gift Cards Tab */}
      {!loading && activeTab === 'giftcards' && (
        <div className="max-w-7xl mx-auto">
          {giftCardListings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-12"
            >
              <div className="text-center max-w-2xl mx-auto">
                <div className="text-6xl mb-6">🎁</div>
                <h3 className="text-2xl font-light text-white mb-4">Gift Card Marketplace</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  This feature requires an event indexing service (like The Graph) to efficiently query marketplace listings.
                </p>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 text-left">
                  <p className="text-blue-300 text-sm font-medium mb-3">📝 How to list your gift card:</p>
                  <ol className="text-slate-400 text-sm space-y-2 ml-5 list-decimal">
                    <li>Go to "My Gifts" page</li>
                    <li>Click "List for Sale" on any gift card</li>
                    <li>Set your price in MATIC</li>
                    <li>Confirm the transaction</li>
                  </ol>
                  <p className="text-slate-500 text-xs mt-4">
                    Note: Listings will appear here once indexing is set up.
                  </p>
                </div>

                <a
                  href="/my-gifts"
                  className="inline-block mt-6 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:from-violet-600 hover:to-purple-700 transition-all"
                >
                  Go to My Gifts
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {giftCardListings.map((listing, index) => (
                <motion.div
                  key={listing.listingId.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-violet-500/30 transition-all group"
                >
                  {/* Gift Card Image */}
                  <div className="relative aspect-square overflow-hidden bg-black/40">
                    {listing.metadata?.image ? (
                      <img
                        src={getIPFSUrl(listing.metadata.image)}
                        alt={listing.metadata.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%2318181b" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2364748b" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <span className="text-4xl">🎁</span>
                      </div>
                    )}
                  </div>

                  {/* Gift Card Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-white mb-2 truncate">
                      {listing.metadata?.name || `Gift Card #${listing.tokenId}`}
                    </h3>

                    {listing.metadata?.description && (
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                        {listing.metadata.description}
                      </p>
                    )}

                    {/* Vault Info */}
                    <div className="bg-black/40 rounded-xl p-3 mb-4 border border-white/5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Contains:</span>
                        <span className="text-white font-medium">
                          {listing.vaultAmount ? parseFloat(formatUnits(listing.vaultAmount, 18)).toFixed(2) : '0'} {listing.vaultToken || 'tokens'}
                        </span>
                      </div>
                    </div>

                    {/* Price and Seller */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Price</p>
                        <p className="text-violet-400 font-medium">
                          {parseFloat(formatUnits(listing.price, 18)).toFixed(3)} MATIC
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Seller</p>
                        <p className="text-slate-300 text-xs font-mono">
                          {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchaseGiftCard(listing.listingId, listing.price)}
                      className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium hover:from-violet-600 hover:to-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    >
                      Purchase Gift Card
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
