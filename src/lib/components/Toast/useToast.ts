import type {ReactNode} from 'react';

import {useCallback} from 'react';

import {useToastContext} from './ToastContext';

export default function useToast() {
  const {addToast} = useToastContext();

  return useCallback(
    (
      content: ReactNode,
      options?: {
        variant?: 'info' | 'success' | 'warning' | 'danger';
        duration?: number;
      },
    ) => {
      addToast({
        content,
        variant: options?.variant ?? 'info',
        duration: options?.duration ?? 3000,
      });
    },
    [addToast],
  );
}
