
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return {
    success: (msg: string) => context.addToastLimited('success', msg),
    error: (msg: string) => context.addToastLimited('error', msg),
    info: (msg: string) => context.addToastLimited('info', msg),
    warning: (msg: string) => context.addToastLimited('warning', msg),
  };
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto dismiss
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  // Limite máximo de toasts simultâneas
  const addToastLimited = useCallback((type: ToastType, message: string) => {
    setToasts(prev => {
      const filtered = prev.slice(-4); // Mantém apenas últimos 4
      const id = Math.random().toString(36).substring(2, 9);
      return [...filtered, { id, type, message }];
    });

    // Auto dismiss
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-right duration-300
              ${toast.type === 'success' ? 'bg-white border-green-200 text-green-800 dark:bg-gray-800 dark:border-green-900 dark:text-green-400' : ''}
              ${toast.type === 'error' ? 'bg-white border-red-200 text-red-800 dark:bg-gray-800 dark:border-red-900 dark:text-red-400' : ''}
              ${toast.type === 'info' ? 'bg-white border-blue-200 text-blue-800 dark:bg-gray-800 dark:border-blue-900 dark:text-blue-400' : ''}
              ${toast.type === 'warning' ? 'bg-white border-yellow-200 text-yellow-800 dark:bg-gray-800 dark:border-yellow-900 dark:text-yellow-400' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
            {toast.type === 'warning' && <AlertTriangle size={20} />}
            
            <p className="text-sm font-medium">{toast.message}</p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
