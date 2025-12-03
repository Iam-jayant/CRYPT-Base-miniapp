import { useAccount, useEnsName, useBalance } from 'wagmi';
import { useConnectModal, useAccountModal, useChainModal } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { formatUnits } from 'viem';

export function CustomConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: balance } = useBalance({ address });
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { openChainModal } = useChainModal();

  // Format address
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Get balance display
  const balanceDisplay = balance 
    ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(2)} ${balance.symbol}`
    : "0.00 POL";

  if (!isConnected) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={openConnectModal}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-medium text-sm shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-200"
      >
        Connect Wallet
      </motion.button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Chain Switcher */}
      {chain && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openChainModal}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all duration-200 flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-slate-300 text-sm font-medium">
            {chain.name}
          </span>
        </motion.button>
      )}

      {/* Account Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={openAccountModal}
        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/50 backdrop-blur-md transition-all duration-200 flex items-center gap-3"
      >
        {/* Balance */}
        <span className="text-slate-300 text-sm font-medium">
          {balanceDisplay}
        </span>

        {/* Divider */}
        <div className="w-px h-4 bg-white/10" />

        {/* Address/ENS */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <span className="text-white text-sm font-medium">
            {ensName || (address ? formatAddress(address) : '')}
          </span>
        </div>
      </motion.button>
    </div>
  );
}
