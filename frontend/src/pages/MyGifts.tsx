import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { motion } from 'framer-motion';
import { GiftCardNFTABI, MarketplaceABI } from '../contracts/abis';
import { GIFT_CARD_NFT_ADDRESS, MARKETPLACE_ADDRESS, TESTNET_TOKENS } from '../contracts/addresses';
import { fetchMetadata, getIPFSUrl } from '../services/ipfs';
import { useToast } from '../components/ToastContainer';
import { parseContractError } from '../utils/contractUtils';

interface GiftCard {
  tokenId: bigint;
  metadata: any;
  vaultToken: string;
  vaultAmount: bigint;
  isLiquidated: boolean;
  tokenSymbol?: string;
}

export default function MyGifts() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const publicClient = usePublicClient();
  const { showSuccess, showError, showInfo } = useToast();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingModal, setListingModal] = useState<{ show: boolean; tokenId?: bigint }>({ show: false });
  const [listingPrice, setListingPrice] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: totalSupply } = useReadContract({
    address: GIFT_CARD_NFT_ADDRESS,
    abi: GiftCardNFTABI,
    functionName: 'totalSupply',
  });

  useEffect(() => {
    if (isConnected && address && totalSupply) {
      loadGiftCards();
    }
  }, [isConnected, address, totalSupply]);

  const loadGiftCards = async () => {
    if (!address || !totalSupply || !publicClient) return;

    setLoading(true);
    const cards: GiftCard[] = [];

    try {
      const total = Number(totalSupply);
      
      // Limit to reasonable number to avoid timeouts
      const maxToCheck = Math.min(total, 50);
      
      // Check each token ID to see if user owns it
      for (let i = 0; i < maxToCheck; i++) {
        try {
          const tokenId = BigInt(i);
          
          // Check ownership using ownerOf - wrap in try/catch for non-existent tokens
          let owner: string;
          try {
            owner = await publicClient.readContract({
              address: GIFT_CARD_NFT_ADDRESS,
              abi: GiftCardNFTABI,
              functionName: 'ownerOf',
              args: [tokenId],
            }) as string;
          } catch (ownerErr) {
            // Token doesn't exist or error reading
            continue;
          }
          
          if (owner.toLowerCase() !== address.toLowerCase()) continue;
          
          // Fetch vault info first (faster than metadata)
          let vaultInfo: any;
          try {
            vaultInfo = await publicClient.readContract({
              address: GIFT_CARD_NFT_ADDRESS,
              abi: GiftCardNFTABI,
              functionName: 'getVaultContents',
              args: [tokenId],
            });
          } catch (vaultErr) {
            console.error(`Failed to fetch vault for token ${i}:`, vaultErr);
            continue;
          }
          
          const vaultToken = vaultInfo.tokenAddress as string;
          const vaultAmount = vaultInfo.amount as bigint;
          const isLiquidated = vaultInfo.liquidated as boolean;
          
          // Find token symbol
          const token = TESTNET_TOKENS.find(t => t.address.toLowerCase() === vaultToken.toLowerCase());
          const tokenSymbol = token?.symbol || 'TOKEN';
          
          // Fetch metadata (optional - use placeholder if fails)
          let metadata = {
            name: `Gift Card #${i}`,
            description: 'AI-generated gift card',
            image: ''
          };
          
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
          } catch (metadataErr) {
            console.warn(`Using placeholder metadata for token ${i}`);
          }
          
          cards.push({
            tokenId,
            metadata,
            vaultToken,
            vaultAmount,
            isLiquidated,
            tokenSymbol,
          });
        } catch (err) {
          console.error(`Error loading token ${i}:`, err);
        }
      }
      
      setGiftCards(cards);
      if (cards.length === 0) {
        showInfo('No gift cards found. Create your first one!');
      }
    } catch (err) {
      const errorMsg = 'Failed to load gift cards';
      setError(errorMsg);
      showError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLiquidate = async (tokenId: bigint) => {
    if (!isConnected) return;

    showInfo('Liquidating gift card...');

    try {
      writeContract({
        address: GIFT_CARD_NFT_ADDRESS,
        abi: GiftCardNFTABI,
        functionName: 'liquidate',
        args: [tokenId],
      }, {
        onSuccess: (hash) => {
          showSuccess('Gift card liquidated! Tokens transferred to your wallet.', hash);
          setTimeout(() => loadGiftCards(), 3000);
        },
        onError: (err) => {
          const errorMsg = parseContractError(err);
          setError(errorMsg);
          showError(errorMsg);
        },
      });
    } catch (err) {
      const errorMsg = 'Failed to liquidate gift card';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  const handleListForSale = async () => {
    if (!listingModal.tokenId || !listingPrice) {
      showError('Please enter a price');
      return;
    }

    try {
      const price = parseUnits(listingPrice, 18);
      const tokenId = listingModal.tokenId;

      showInfo('Listing gift card on marketplace...');

      writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MarketplaceABI,
        functionName: 'listGiftCard',
        args: [tokenId, price],
      }, {
        onSuccess: (hash) => {
          showSuccess('Gift card listed successfully!', hash);
          setListingModal({ show: false });
          setListingPrice('');
          setTimeout(() => loadGiftCards(), 3000);
        },
        onError: (err) => {
          const errorMsg = parseContractError(err);
          setError(errorMsg);
          showError(errorMsg);
        },
      });
    } catch (err) {
      const errorMsg = 'Failed to list gift card';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center">
            <h2 className="text-3xl font-light text-white mb-4">My Gift Cards</h2>
            <p className="text-slate-400 mb-6">Please connect your wallet to view your gift cards.</p>
            <div className="inline-block px-6 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm">
              Connect wallet to continue
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-3">
          My Gift Cards
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          View and manage your NFT gift cards
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mb-4"></div>
            <p className="text-slate-400">Loading your gift cards...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-red-500/10 backdrop-blur-md rounded-xl border border-red-500/20 p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && giftCards.length === 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-2xl font-light text-white mb-3">No Gift Cards Yet</h3>
            <p className="text-slate-400 mb-6">Create your first gift card to get started!</p>
            <a
              href="/create"
              className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:from-violet-600 hover:to-purple-700 transition-all"
            >
              Create Gift Card
            </a>
          </div>
        </div>
      )}

      {/* Gift Cards Grid */}
      {!loading && giftCards.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {giftCards.map((card, index) => (
              <motion.div
                key={card.tokenId.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-violet-500/30 transition-all group"
              >
                {/* Card Image */}
                <div className="relative aspect-square overflow-hidden bg-black/40">
                  {card.metadata.image ? (
                    <img
                      src={getIPFSUrl(card.metadata.image)}
                      alt={card.metadata.name}
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
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {card.isLiquidated ? (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-medium backdrop-blur-sm">
                        ✓ Claimed
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-medium backdrop-blur-sm">
                        🔒 Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-lg font-medium text-white mb-2 truncate">
                    {card.metadata.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {card.metadata.description}
                  </p>

                  {/* Vault Info */}
                  <div className="bg-black/40 rounded-xl p-4 mb-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-500 uppercase tracking-wide">Vault Contents</span>
                      <span className="text-xs text-slate-500">#{card.tokenId.toString()}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-light text-white">
                        {parseFloat(formatUnits(card.vaultAmount, 18)).toFixed(2)}
                      </span>
                      <span className="text-slate-400 text-sm">{card.tokenSymbol}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {!card.isLiquidated && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLiquidate(card.tokenId)}
                        className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium hover:from-violet-600 hover:to-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        Liquidate
                      </button>
                      <button
                        onClick={() => setListingModal({ show: true, tokenId: card.tokenId })}
                        className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 text-slate-300 text-sm font-medium hover:bg-black/60 hover:border-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                      >
                        List
                      </button>
                    </div>
                  )}

                  {card.isLiquidated && (
                    <div className="text-center py-2 text-sm text-slate-500">
                      This gift card has been liquidated
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Listing Modal */}
      {listingModal.show && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 pt-24 bg-black/60 backdrop-blur-sm"
          onClick={() => setListingModal({ show: false })}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setListingModal({ show: false })}
              className="absolute top-4 right-4 p-2 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6">
              {/* Modal Header */}
              <h2 className="text-2xl font-light text-white mb-6">
                List Gift Card for Sale
              </h2>

              {/* Price Input */}
              <div className="mb-6">
                <label htmlFor="listing-price" className="block text-sm font-medium text-slate-300 mb-2">
                  Price (MATIC)
                </label>
                <input
                  id="listing-price"
                  type="number"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-colors"
                />
                <p className="text-sm text-slate-400 mt-2">Set your listing price in MATIC</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setListingModal({ show: false })}
                  className="flex-1 px-6 py-3 rounded-lg bg-black/40 border border-white/10 text-slate-300 font-medium hover:bg-black/60 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleListForSale}
                  disabled={!listingPrice || parseFloat(listingPrice) <= 0}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  List for Sale
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
