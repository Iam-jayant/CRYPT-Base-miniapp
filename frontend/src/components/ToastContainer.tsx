import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import Toast from './Toast';
import type { ToastType } from './Toast';
import '../styles/Toast.css';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
  txHash?: string;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, txHash?: string) => void;
  showSuccess: (message: string, txHash?: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [nextId, setNextId] = useState(0);

  const showToast = useCallback((message: string, type: ToastType, txHash?: string) => {
    const id = nextId;
    setNextId(prev => prev + 1);
    setToasts(prev => [...prev, { id, message, type, txHash }]);
  }, [nextId]);

  const showSuccess = useCallback((message: string, txHash?: string) => {
    showToast(message, 'success', txHash);
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            txHash={toast.txHash}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
