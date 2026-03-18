import type {ReactNode} from 'react';

import {createContext, useContext} from 'react';

type ToastItem = {
  id: number;
  variant: 'info' | 'success' | 'warning' | 'danger';
  content: ReactNode;
  duration: number;
};

type ToastContextValue = {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ToastContext.Provider;

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastContainer>');
  return ctx;
}

export type {ToastItem, ToastContextValue};
