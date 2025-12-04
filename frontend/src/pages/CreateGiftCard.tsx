import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { generateArt } from '../services/ai-art';
import { uploadImage, uploadMetadata } from '../services/ipfs';
import { sendGiftCardEmail, isEmailConfigured } from '../services/email';
import { GiftCardNFTABI, ERC20ABI } from '../contracts/abis';
import { GIFT_CARD_NFT_ADDRESS, TESTNET_TOKENS } from '../contracts/addresses';
import { useToast } from '../components/ToastContainer';
import { parseContractError } from '../utils/contractUtils';
import { PixelCard } from '../components/PixelCard';
import { cn } from '../lib/utils';

export default function CreateGiftCard() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  const { showSuccess, showError, showInfo } = useToast();

  const [prompt, setPrompt] = useState('');
  const [selectedToken, setSelectedToken] = useState<`0x${string}`>(TESTNET_TOKENS[0].address as `0x${string}`);
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [customTokenAddress, setCustomTokenAddress] = useState<`0x${string}`>('0x' as `0x${string}`);
  const [useCustomToken, setUseCustomToken] = useState(false);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [artworkMode, setArtworkMode] = useState<'ai' | 'upload'>('ai');

  const tokenAddress = (useCustomToken ? customTokenAddress : selectedToken) as `0x${string}`;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
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

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      fetch(reader.result as string)
        .then(res => res.blob())
        .then(blob => {
          setImageBlob(blob);
          handleArtworkReady();
        });
    };
    reader.readAsDataURL(file);
  };

  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: symbol } = useReadContract({
    address: tokenAddress,
    abi: ERC20ABI,
    functionName: 'symbol',
  });

  const handleGenerateArt = async () => {
    if (!prompt.trim()) {
      showError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    showInfo('Generating artwork...');

    try {
      const blob = await generateArt(prompt);
      const url = URL.createObjectURL(blob);
      setGeneratedImage(url);
      setImageBlob(blob);
      showSuccess('Artwork generated successfully!');
      handleArtworkReady();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate art';
      showError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMint = async () => {
    if (!isConnected || !address) {
      showError('Please connect your wallet');
      return;
    }

    if (!imageBlob) {
      showError('Please generate artwork first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showError('Please enter a valid amount');
      return;
    }

    setIsMinting(true);

    try {
      showInfo('Uploading artwork to IPFS...');

      // Upload image to IPFS
      const imageCID = await uploadImage(imageBlob);
      const imageURI = `ipfs://${imageCID}`;

      // Create metadata
      const metadata = {
        name: artworkMode === 'ai'
          ? `Gift Card - ${prompt.substring(0, 30)}`
          : `Gift Card - Custom Artwork`,
        description: artworkMode === 'ai'
          ? `AI-generated gift card: ${prompt}`
          : `Gift card with custom artwork`,
        image: imageURI,
        attributes: [
          {
            trait_type: 'Token',
            value: symbol || 'Unknown',
          },
          {
            trait_type: 'Amount',
            value: amount,
          },
        ],
      };

      showInfo('Uploading metadata to IPFS...');

      // Upload metadata to IPFS
      const metadataURI = await uploadMetadata(metadata);

      // Parse amount with 18 decimals
      const tokenAmount = parseUnits(amount, 18);

      showInfo('Requesting token approval...');

      // Step 1: Approve token spending
      const approvalPromise = new Promise<string>((resolve, reject) => {
        writeContract({
          address: tokenAddress,
          abi: ERC20ABI,
          functionName: 'approve',
          args: [GIFT_CARD_NFT_ADDRESS, tokenAmount],
        }, {
          onSuccess: (hash) => {
            showSuccess('Token approval submitted', hash);
            resolve(hash);
          },
          onError: (err) => {
            reject(err);
          },
        });
      });

      await approvalPromise;
      showInfo('Waiting for approval confirmation...');

      // Wait a bit for the approval to be mined
      await new Promise(resolve => setTimeout(resolve, 3000));

      showInfo('Creating gift card NFT...');

      // Step 2: Create gift card
      const createPromise = new Promise<string>((resolve, reject) => {
        writeContract({
          address: GIFT_CARD_NFT_ADDRESS,
          abi: GiftCardNFTABI,
          functionName: 'createGiftCard',
          args: [metadataURI, tokenAddress, tokenAmount],
        }, {
          onSuccess: (hash) => {
            showSuccess('Gift card created successfully!', hash);
            resolve(hash);
          },
          onError: (err) => {
            reject(err);
          },
        });
      });

      const createHash = await createPromise;

      // Send email if recipient email is provided
      if (recipientEmail && isEmailConfigured()) {
        try {
          showInfo('Sending email notification...');

          const claimUrl = `${window.location.origin}/claim`;
          const explorerUrl = `https://amoy.polygonscan.com/tx/${createHash}`;

          await sendGiftCardEmail({
            recipientEmail,
            senderAddress: address || '',
            tokenId: 'Pending',
            tokenSymbol: symbol as string || 'Token',
            amount,
            claimUrl,
            txHash: createHash,
            explorerUrl,
          });

          showSuccess('Email sent to recipient!');
        } catch (emailError) {
          console.error('Email send failed:', emailError);
          showError('Gift card created but email failed to send');
        }
      }

      // Reset form and close modal
      setPrompt('');
      setAmount('');
      setRecipientEmail('');
      setGeneratedImage(null);
      setUploadedImage(null);
      setImageBlob(null);
      setShowDetailsModal(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : parseContractError(err);
      showError(errorMsg);
    } finally {
      setIsMinting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center">
            <h2 className="text-3xl font-light text-white mb-4">Create Gift Card</h2>
            <p className="text-slate-400 mb-6">Please connect your wallet to create a gift card.</p>
            <div className="inline-block px-6 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm">
              Connect wallet to continue
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = artworkMode === 'ai' ? generatedImage : uploadedImage;
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Show modal when artwork is ready
  const handleArtworkReady = () => {
    setShowDetailsModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setGeneratedImage(null);
    setUploadedImage(null);
    setImageBlob(null);
    setAmount('');
    setRecipientEmail('');
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-white mb-3">
          Create Gift Card
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Generate unique artwork and lock tokens in an NFT
        </p>
      </div>

      {/* Split-Screen Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left Panel - Creation Form */}
        <div className="space-y-4 md:space-y-6">
          {/* Artwork Mode Selector */}
          <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <h3 className="text-xl font-medium text-white mb-4">Artwork Source</h3>

            <div role="tablist" aria-label="Artwork source selection" className="flex gap-2 p-1 bg-black/40 rounded-lg border border-white/10">
              <button
                role="tab"
                aria-selected={artworkMode === 'ai'}
                aria-controls="ai-generation-panel"
                onClick={() => {
                  setArtworkMode('ai');
                  setUploadedImage(null);
                }}
                className={cn(
                  "flex-1 px-4 py-2 rounded-md transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50",
                  artworkMode === 'ai'
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-slate-400 hover:text-slate-300"
                )}
              >
                AI Generate
              </button>
              <button
                role="tab"
                aria-selected={artworkMode === 'upload'}
                aria-controls="upload-panel"
                onClick={() => {
                  setArtworkMode('upload');
                  setGeneratedImage(null);
                }}
                className={cn(
                  "flex-1 px-4 py-2 rounded-md transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50",
                  artworkMode === 'upload'
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "text-slate-400 hover:text-slate-300"
                )}
              >
                Upload Image
              </button>
            </div>
          </div>

          {/* AI Generation Section */}
          {artworkMode === 'ai' && (
            <div
              id="ai-generation-panel"
              role="tabpanel"
              aria-labelledby="ai-generate-tab"
              className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-6"
            >
              <h3 className="text-xl font-medium text-white mb-4">Generate Artwork</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="ai-prompt" className="block text-sm font-medium text-slate-300 mb-2">
                    AI Art Prompt
                  </label>
                  <input
                    id="ai-prompt"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Happy birthday with balloons and cake"
                    disabled={isGenerating}
                    aria-describedby="prompt-help-text"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-colors"
                  />
                </div>

                <button
                  onClick={handleGenerateArt}
                  disabled={isGenerating || !prompt.trim()}
                  aria-live="polite"
                  aria-busy={isGenerating}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Artwork'}
                </button>
              </div>
            </div>
          )}

          {/* Upload Section */}
          {artworkMode === 'upload' && (
            <div
              id="upload-panel"
              role="tabpanel"
              aria-labelledby="upload-tab"
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
                    onChange={handleImageUpload}
                    aria-label="Upload gift card artwork image"
                    aria-describedby="upload-help-text"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-violet-500/20 file:text-violet-300 hover:file:bg-violet-500/30 file:cursor-pointer focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-colors"
                  />
                  <p id="upload-help-text" className="text-sm text-slate-400 mt-2">
                    Max file size: 10MB. Formats: JPG, PNG, GIF, WEBP
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Panel - Gallery */}
        <div className="lg:sticky lg:top-8 lg:self-start">
          <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/10 p-4 md:p-4.5 min-h-[360px] flex flex-col">
            <h3 className="text-lg md:text-xl font-medium text-white mb-4 md:mb-6">Gallery</h3>

            <div className="grid grid-cols-2 gap-4 md:gap-3 flex-1" role="list" aria-label="Example gift card designs">
              {/* Blue Card */}
              <PixelCard variant="blue" className="h-full min-h-[150px]" role="listitem" aria-label="Birthday Celebration gift card example">
                <div className="flex flex-col justify-center h-full">
                  <div>
                    <h4 className="text-white font-medium text-base mb-2">Birthday Celebration</h4>
                    <p className="text-slate-400 text-sm">Special gift for milestone moments</p>
                  </div>
                </div>
              </PixelCard>

              {/* Pink Card */}
              <PixelCard variant="pink" noFocus className="h-full min-h-[150px]" role="listitem" aria-label="Holiday Greetings gift card example">
                <div className="flex flex-col justify-center h-full">
                  <div>
                    <h4 className="text-white font-medium text-base mb-2">Holiday Greetings</h4>
                    <p className="text-slate-400 text-sm">Seasonal tokens of appreciation</p>
                  </div>
                </div>
              </PixelCard>

              {/* Yellow Card */}
              <PixelCard variant="yellow" className="h-full min-h-[150px]" role="listitem" aria-label="Achievement Reward gift card example">
                <div className="flex flex-col justify-center h-full">
                  <div>
                    <h4 className="text-white font-medium text-base mb-2">Achievement Reward</h4>
                    <p className="text-slate-400 text-sm">Recognize outstanding performance</p>
                  </div>
                </div>
              </PixelCard>

              {/* Default Card */}
              <PixelCard variant="default" className="h-full min-h-[150px]" role="listitem" aria-label="Thank You gift card example">
                <div className="flex flex-col justify-center h-full">
                  <div>
                    <h4 className="text-white font-medium text-base mb-2">Thank You Gift</h4>
                    <p className="text-slate-400 text-sm">Express gratitude with value</p>
                  </div>
                </div>
              </PixelCard>
            </div>
          </div>
        </div>
      </div>

      {/* Gift Card Details Modal */}
      {showDetailsModal && currentImage && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 pt-24 bg-black/60 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-2xl max-h-[calc(90vh-6rem)] overflow-y-auto bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 md:p-8">
              {/* Modal Header */}
              <h2 className="text-2xl md:text-3xl font-light text-white mb-6">
                Complete Your Gift Card
              </h2>

              {/* Artwork Preview */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-3">Artwork Preview</h3>
                <div className="rounded-xl overflow-hidden border border-white/20">
                  <img
                    src={currentImage}
                    alt={artworkMode === 'ai' ? `AI generated artwork: ${prompt}` : 'Uploaded gift card artwork'}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Gift Card Details Form */}
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-white">Gift Card Details</h3>

                {/* Custom Token Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomToken}
                    onChange={(e) => setUseCustomToken(e.target.checked)}
                    className="w-5 h-5 rounded border-white/20 bg-black/40 text-violet-500 focus:ring-violet-500"
                  />
                  <span className="text-slate-300 text-sm">Use custom token address</span>
                </label>

                {/* Token Selection */}
                {useCustomToken ? (
                  <div>
                    <label htmlFor="modal-custom-token-address" className="block text-sm font-medium text-slate-300 mb-2">
                      Custom Token Address
                    </label>
                    <input
                      id="modal-custom-token-address"
                      type="text"
                      value={customTokenAddress}
                      onChange={(e) => setCustomTokenAddress(e.target.value as `0x${string}`)}
                      placeholder="0x..."
                      aria-label="Custom ERC-20 token contract address"
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-colors"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="modal-token-select" className="block text-sm font-medium text-slate-300 mb-2">
                      Select Token
                    </label>
                    <select
                      id="modal-token-select"
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value as `0x${string}`)}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-colors"
                    >
                      {TESTNET_TOKENS.map((token) => (
                        <option key={token.address} value={token.address} className="bg-zinc-900">
                          {token.name} ({token.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label htmlFor="modal-token-amount" className="block text-sm font-medium text-slate-300 mb-2">
                    Amount
                  </label>
                  <input
                    id="modal-token-amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                    min="0"
                    aria-describedby="modal-balance-info modal-amount-error"
                    aria-invalid={!!(balance && amount && parseFloat(amount) > parseFloat(formatUnits(balance as bigint, 18)))}
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-colors"
                  />
                  {balance && (
                    <p id="modal-balance-info" className="text-sm text-slate-400 mt-2">
                      Balance: {formatUnits(balance as bigint, 18)} {symbol}
                    </p>
                  )}
                  {balance && amount && parseFloat(amount) > parseFloat(formatUnits(balance as bigint, 18)) && (
                    <p id="modal-amount-error" className="text-sm text-red-400 mt-2" role="alert">
                      Amount exceeds your token balance
                    </p>
                  )}
                </div>

                {/* Recipient Email */}
                <div>
                  <label htmlFor="modal-recipient-email" className="block text-sm font-medium text-slate-300 mb-2">
                    Recipient Email (Optional)
                  </label>
                  <input
                    id="modal-recipient-email"
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    aria-describedby="modal-email-help-text"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-colors"
                  />
                  <p id="modal-email-help-text" className="text-sm text-slate-400 mt-2">Send claim link via email</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 rounded-lg bg-black/40 border border-white/10 text-slate-300 font-medium hover:bg-black/60 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMint}
                    disabled={isMinting}
                    aria-live="polite"
                    aria-busy={isMinting}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    {isMinting ? 'Minting...' : 'Send Gift Card'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
