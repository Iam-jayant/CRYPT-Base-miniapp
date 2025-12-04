import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { motion } from 'framer-motion';
import { uploadImage } from '../services/ipfs';
import { MarketplaceABI } from '../contracts/abis';
import { MARKETPLACE_ADDRESS } from '../contracts/addresses';
import { useToast } from '../components/ToastContainer';
import { parseContractError } from '../utils/contractUtils';

export default function ListArt() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const { showSuccess, showError, showInfo } = useToast();

  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showError('File size must be less than 10MB');
      return;
    }

    // Validate file format
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      showError('Please upload a valid image file (JPG, PNG, GIF, or WEBP)');
      return;
    }

    setArtworkFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setArtworkPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateListing = async () => {
    if (!isConnected || !address) {
      showError('Please connect your wallet');
      return;
    }

    if (!artworkFile) {
      showError('Please select an artwork file');
      return;
    }

    if (!title.trim()) {
      showError('Please enter a title for your artwork');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      showError('Please enter a valid price');
      return;
    }

    setIsUploading(true);

    try {
      showInfo('Uploading artwork to IPFS...');

      // Upload artwork to IPFS
      const cid = await uploadImage(artworkFile);
      const priceInWei = parseUnits(price, 18);

      showInfo('Creating marketplace listing...');

      // Create artist listing
      writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MarketplaceABI,
        functionName: 'createArtistListing',
        args: [cid, priceInWei],
      }, {
        onSuccess: (hash) => {
          showSuccess('Artwork listed successfully on marketplace!', hash);
          setArtworkFile(null);
          setArtworkPreview(null);
          setTitle('');
          setPrice('');
          setIsUploading(false);
        },
        onError: (err) => {
          const errorMsg = parseContractError(err);
          showError(errorMsg);
          setIsUploading(false);
        },
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to list artwork';
      showError(errorMsg);
      setIsUploading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center">
            <h2 className="text-3xl font-light text-white mb-4">List Your Art</h2>
            <p className="text-slate-400 mb-6">Please connect your wallet to list your artwork on the marketplace.</p>
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
      <div className="max-w-4xl mx-auto mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-3">
          List Your Art
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Upload your artwork and list it on the marketplace for others to use
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6"
            >
              <h3 className="text-xl font-medium text-white mb-4">Upload Artwork</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="artwork-upload" className="block text-sm font-medium text-slate-300 mb-2">
                    Image File
                  </label>
                  <input
                    id="artwork-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    aria-label="Upload artwork image"
                    aria-describedby="upload-help-text"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-violet-500/20 file:text-violet-300 hover:file:bg-violet-500/30 file:cursor-pointer focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <p id="upload-help-text" className="text-sm text-slate-400 mt-2">
                    Max file size: 10MB. Formats: JPG, PNG, GIF, WEBP
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6"
            >
              <h3 className="text-xl font-medium text-white mb-4">Artwork Details</h3>

              <div>
                <label htmlFor="artwork-title" className="block text-sm font-medium text-slate-300 mb-2">
                  Title
                </label>
                <input
                  id="artwork-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Birthday Celebration Design"
                  disabled={isUploading}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-sm text-slate-400 mt-2">
                  Give your artwork a descriptive title
                </p>
              </div>
            </motion.div>

            {/* Price Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6"
            >
              <h3 className="text-xl font-medium text-white mb-4">Set Price</h3>

              <div>
                <label htmlFor="artwork-price" className="block text-sm font-medium text-slate-300 mb-2">
                  Price (MATIC)
                </label>
                <input
                  id="artwork-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                  disabled={isUploading}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-sm text-slate-400 mt-2">
                  Set the price buyers will pay to use your design
                </p>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                onClick={handleCreateListing}
                disabled={isUploading || !artworkFile || !title.trim() || !price || parseFloat(price) <= 0}
                aria-live="polite"
                aria-busy={isUploading}
                className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {isUploading ? 'Uploading to IPFS...' : 'Create Listing'}
              </button>
            </motion.div>

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-500/10 backdrop-blur-md rounded-xl border border-blue-500/20 p-6"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-blue-300 text-sm font-medium mb-2">How it works</p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Your artwork will be uploaded to IPFS and listed on the marketplace. Buyers can purchase your design to use for their gift cards.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* IPFS Warning */}
            {!import.meta.env.VITE_PINATA_JWT && 
             !import.meta.env.VITE_PINATA_API_KEY && 
             (!import.meta.env.VITE_WEB3_STORAGE_API_KEY || import.meta.env.VITE_WEB3_STORAGE_API_KEY.length < 30) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-yellow-500/10 backdrop-blur-md rounded-xl border border-yellow-500/20 p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="text-yellow-300 text-sm font-medium mb-2">IPFS Credentials Missing</p>
                    <p className="text-slate-400 text-sm leading-relaxed mb-2">
                      Using mock storage for development. Configure IPFS storage:
                    </p>
                    <ul className="text-slate-400 text-sm space-y-1 ml-4 mb-2">
                      <li>• <a 
                        href="https://pinata.cloud" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-yellow-300 hover:text-yellow-200 underline"
                      >
                        Pinata
                      </a> (recommended) - Add VITE_PINATA_JWT to .env</li>
                      <li>• <a 
                        href="https://nft.storage" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-yellow-300 hover:text-yellow-200 underline"
                      >
                        NFT.Storage
                      </a> - Add VITE_WEB3_STORAGE_API_KEY to .env</li>
                    </ul>
                    <p className="text-slate-500 text-xs">
                      Note: Mock storage works for testing but images won't persist or be accessible to others.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6"
            >
              <h3 className="text-xl font-medium text-white mb-4">Preview</h3>

              {artworkPreview ? (
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
                    <img
                      src={artworkPreview}
                      alt="Artwork preview"
                      className="w-full aspect-square object-cover"
                    />
                  </div>

                  {/* Preview Info */}
                  <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                    {title && (
                      <h4 className="text-white font-medium mb-2">{title}</h4>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-500">Your Artwork</span>
                      {price && parseFloat(price) > 0 && (
                        <span className="text-violet-400 font-medium">
                          {parseFloat(price).toFixed(3)} MATIC
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      This is how your artwork will appear on the marketplace
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-dashed border-white/10 bg-black/20 aspect-square flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-slate-400 text-sm">
                      Upload an image to see preview
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
