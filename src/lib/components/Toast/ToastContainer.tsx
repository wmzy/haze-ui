import type {ReactNode} from 'react';

import {css} from '@linaria/core';
import {useState, useCallback, useRef} from 'react';

import Toast from './Toast';
import {ToastProvider} from './ToastContext';
import type {ToastItem} from './ToastContext';

type ToastContainerProps = {
  children: ReactNode;
};

const container = css`
  position: fixed;
  bottom: var(--pbl-space-4);
  right: var(--pbl-space-4);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--pbl-space-2);
  pointer-events: none;
`;

export default function ToastContainer({children}: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    counterRef.current += 1;
    setToasts((prev) => [...prev, {...toast, id: counterRef.current}]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastProvider value={{toasts, addToast, removeToast}}>
      {children}
      <div className={container}>
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            duration={t.duration}
            onClose={() => removeToast(t.id)}
          >
            {t.content}
          </Toast>
        ))}
      </div>
    </ToastProvider>
  );
}

export type {ToastContainerProps};
