import { useEffect } from 'react';
import '../styles/Toast.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
  txHash?: string;
}

export default function Toast({ message, type, duration = 5000, onClose, txHash }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '';
    }
  };

  const getTxExplorerUrl = (hash: string) => {
    return `https://amoy.polygonscan.com/tx/${hash}`;
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">{getIcon()}</span>
        <div className="toast-message">
          <p>{message}</p>
          {txHash && (
            <a
              href={getTxExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="toast-link"
            >
              View on Explorer →
            </a>
          )}
        </div>
        <button className="toast-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
}
