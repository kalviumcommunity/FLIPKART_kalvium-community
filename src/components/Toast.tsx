'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  text: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (text: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, variant: ToastVariant = 'info') => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, text, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
              t.variant === 'success' ? 'bg-flipkart-green' : t.variant === 'error' ? 'bg-red-600' : 'bg-gray-900'
            }`}
          >
            {t.variant === 'success' && <CheckCircle2 size={16} />}
            {t.variant === 'error' && <XCircle size={16} />}
            {t.variant === 'info' && <Info size={16} />}
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
