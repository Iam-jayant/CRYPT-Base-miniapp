import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { generateArt } from '../services/ai-art';
import { uploadImage, uploadMetadata } from '../services/ipfs';
import { GiftCardNFTABI, ERC20ABI } from '../contracts/abis';
import { GIFT_CARD_NFT_ADDRESS, TESTNET_TOKENS } from '../contracts/addresses';
import { useToast } from '../components/ToastContainer';
import { parseContractError } from '../utils/contractUtils';

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tokenAddress = (useCustomToken ? customTokenAddress : selectedToken) as `0x${string}`;

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
    setError(null);
    showInfo('Generating artwork...');

    try {
      const blob = await generateArt(prompt);
      const url = URL.createObjectURL(blob);
      setGeneratedImage(url);
      setImageBlob(blob);
      showSuccess('Artwork generated successfully!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate art';
      setError(errorMsg);
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
    setError(null);
    setSuccess(null);

    try {
      showInfo('Uploading artwork to IPFS...');
      
      // Upload image to IPFS
      const imageCID = await uploadImage(imageBlob);
      const imageURI = `ipfs://${imageCID}`;

      // Create metadata
      const metadata = {
        name: `Gift Card - ${prompt.substring(0, 30)}`,
        description: `AI-generated gift card: ${prompt}`,
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
      
      // Approve token spending
      writeContract({
        address: tokenAddress,
        abi: ERC20ABI,
        functionName: 'approve',
        args: [GIFT_CARD_NFT_ADDRESS, tokenAmount],
      }, {
        onSuccess: (hash) => {
          showSuccess('Token approval confirmed', hash);
          showInfo('Creating gift card NFT...');
          
          // After approval, create gift card
          setTimeout(() => {
            writeContract({
              address: GIFT_CARD_NFT_ADDRESS,
              abi: GiftCardNFTABI,
              functionName: 'createGiftCard',
              args: [metadataURI, tokenAddress, tokenAmount],
            }, {
              onSuccess: async (hash) => {
                setSuccess('Gift card created successfully!');
                showSuccess('Gift card created successfully!', hash);
                
                // Send email if recipient email is provided
                if (recipientEmail && isEmailConfigured()) {
                  try {
                    showInfo('Sending email notification...');
                    
                    const claimUrl = `${window.location.origin}/claim`;
                    const explorerUrl = `https://amoy.polygonscan.com/tx/${hash}`;
                    
                    await sendGiftCardEmail({
                      recipientEmail,
                      senderAddress: address || '',
                      tokenId: 'Pending', // Will be available after transaction confirms
                      tokenSymbol: symbol as string || 'Token',
                      amount,
                      claimUrl,
                      txHash: hash,
                      explorerUrl,
                    });
                    
                    showSuccess('Email sent to recipient!');
                  } catch (emailError) {
                    console.error('Email send failed:', emailError);
                    showError('Gift card created but email failed to send');
                  }
                }
                
                // Reset form
                setPrompt('');
                setAmount('');
                setRecipientEmail('');
                setGeneratedImage(null);
                setImageBlob(null);
              },
              onError: (err) => {
                const errorMsg = parseContractError(err);
                setError(errorMsg);
                showError(errorMsg);
              },
            });
          }, 2000);
        },
        onError: (err) => {
          const errorMsg = parseContractError(err);
          setError(errorMsg);
          showError(errorMsg);
        },
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to mint gift card';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsMinting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="create-page">
        <h2>Create Gift Card</h2>
        <p>Please connect your wallet to create a gift card.</p>
      </div>
    );
  }

  return (
    <div className="create-page">
      <h2>🎨 Create AI Gift Card</h2>

      <div className="form-section">
        <label>
          AI Art Prompt
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Happy birthday with balloons and cake"
            disabled={isGenerating}
          />
        </label>

        <button onClick={handleGenerateArt} disabled={isGenerating || !prompt.trim()}>
          {isGenerating ? 'Generating...' : '✨ Generate Artwork'}
        </button>

        {generatedImage && (
          <div className="preview">
            <h3>Generated Artwork</h3>
            <img src={generatedImage} alt="Generated gift card" />
          </div>
        )}
      </div>

      {generatedImage && (
        <div className="form-section">
          <h3>Gift Card Details</h3>

          <label>
            <input
              type="checkbox"
              checked={useCustomToken}
              onChange={(e) => setUseCustomToken(e.target.checked)}
            />
            Use custom token address
          </label>

          {useCustomToken ? (
            <label>
              Custom Token Address
              <input
                type="text"
                value={customTokenAddress}
                onChange={(e) => setCustomTokenAddress(e.target.value as `0x${string}`)}
                placeholder="0x..."
              />
            </label>
          ) : (
            <label>
              Select Token
              <select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value as `0x${string}`)}>
                {TESTNET_TOKENS.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.name} ({token.symbol})
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Amount
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.01"
              min="0"
            />
            {balance && (
              <small>Balance: {formatUnits(balance as bigint, 18)} {symbol}</small>
            )}
          </label>

          <label>
            Recipient Email (Optional)
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
            />
            <small>Send claim link via email</small>
          </label>

          <button onClick={handleMint} disabled={isMinting}>
            {isMinting ? 'Minting...' : '🎁 Mint Gift Card'}
          </button>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="info-box">
        <p>💡 This uses testnet tokens only. Get test tokens by calling the faucet() function on the token contracts.</p>
      </div>
    </div>
  );
}
