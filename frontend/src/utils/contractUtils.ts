import { type WriteContractErrorType } from 'wagmi/actions';

/**
 * Parse contract error messages to user-friendly text
 */
export function parseContractError(error: WriteContractErrorType | Error | unknown): string {
  if (!error) return 'Unknown error occurred';

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Common error patterns
  if (errorMessage.includes('User rejected') || errorMessage.includes('User denied')) {
    return 'Transaction was rejected';
  }

  if (errorMessage.includes('insufficient funds')) {
    return 'Insufficient funds for transaction';
  }

  if (errorMessage.includes('gas required exceeds')) {
    return 'Transaction would fail - check your inputs';
  }

  if (errorMessage.includes('AlreadyLiquidated')) {
    return 'This gift card has already been liquidated';
  }

  if (errorMessage.includes('NotTokenOwner')) {
    return 'You do not own this NFT';
  }

  if (errorMessage.includes('InsufficientBalance')) {
    return 'Insufficient token balance';
  }

  if (errorMessage.includes('InvalidTokenAddress')) {
    return 'Invalid token address';
  }

  if (errorMessage.includes('nonce too low')) {
    return 'Transaction nonce error - please try again';
  }

  if (errorMessage.includes('network changed')) {
    return 'Network changed - please reconnect';
  }

  // Extract revert reason if available
  const revertMatch = errorMessage.match(/reverted with reason string '(.+?)'/);
  if (revertMatch) {
    return revertMatch[1];
  }

  // Return shortened error message
  if (errorMessage.length > 100) {
    return errorMessage.substring(0, 100) + '...';
  }

  return errorMessage;
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string): string {
  if (!hash || hash.length < 10) return hash;
  return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
}

/**
 * Get block explorer URL for transaction
 */
export function getTxExplorerUrl(txHash: string, chainId: number = 80002): string {
  const explorers: Record<number, string> = {
    80002: 'https://amoy.polygonscan.com/tx/',
    137: 'https://polygonscan.com/tx/',
    1: 'https://etherscan.io/tx/',
  };

  const baseUrl = explorers[chainId] || explorers[80002];
  return `${baseUrl}${txHash}`;
}

/**
 * Get block explorer URL for address
 */
export function getAddressExplorerUrl(address: string, chainId: number = 80002): string {
  const explorers: Record<number, string> = {
    80002: 'https://amoy.polygonscan.com/address/',
    137: 'https://polygonscan.com/address/',
    1: 'https://etherscan.io/address/',
  };

  const baseUrl = explorers[chainId] || explorers[80002];
  return `${baseUrl}${address}`;
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Check if error is user rejection
 */
export function isUserRejection(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return (
    errorMessage.includes('User rejected') ||
    errorMessage.includes('User denied') ||
    errorMessage.includes('user rejected')
  );
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Wait for transaction with timeout
 */
export async function waitForTransaction(
  _txHash: string,
  timeout: number = 60000
): Promise<boolean> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Transaction timeout'));
      }
    }, 1000);

    // This is a placeholder - actual implementation would use wagmi's waitForTransaction
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve(true);
    }, 5000);
  });
}
