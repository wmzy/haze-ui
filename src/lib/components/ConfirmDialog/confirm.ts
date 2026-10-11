import type { ReactNode } from 'react';

import type { ConfirmDialogProps } from './ConfirmDialog';

import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import ConfirmDialog from './ConfirmDialog';

/**
 * Options for the imperative confirm — {@link ConfirmDialogProps} minus
 * the wired callbacks (the promise carries the answer, so `onClose`/
 * `onConfirm`/`onCancel` are derived paths, not inputs).
 */
type ConfirmOptions = Omit<
  ConfirmDialogProps,
  'onClose' | 'onConfirm' | 'onCancel' | 'open' | 'children'
> & {
  /** Dialog body copy. */
  children: ReactNode;
  /** Fired when the user confirms (before the promise resolves). */
  onConfirm?: () => void;
  /** Fired when the user cancels or dismisses (before rejection). */
  onCancel?: () => void;
};

/**
 * Imperative promise-based confirm dialog, the AntD `Modal.confirm`
 * shape: mounts a fresh ConfirmDialog into `document.body`, resolves
 * with `true` on confirm, `false` on cancel/dismiss, and unmounts on
 * settle. Safe to call outside React render (event handlers, async
 * flows); not safe during SSR (no-op `false`, no mount).
 *
 * ```ts
 * const ok = await confirm({ title: 'Discard draft?', children: '…', variant: 'danger' });
 * if (ok) discard();
 * ```
 *
 * Each call owns its own React root — multiple confirms stack (they
 * open as sibling dialogs; the top layer negotiates them).
 */
function confirm(options: ConfirmOptions): Promise<boolean> {
  const { onConfirm, onCancel, children, ...rest } = options;

  // Lacking a document (SSR, tests without DOM): no-op → false.
  if (typeof document === 'undefined') {
    return Promise.resolve(false);
  }

  return new Promise<boolean>((resolve) => {
    const host = document.createElement('div');
    host.setAttribute('data-haze-confirm-host', '');
    document.body.appendChild(host);
    const root = createRoot(host);
    let settled = false;

    const unmount = () => {
      // React 19 requires an idle beat between render and unmount on the
      // same root (flushSync inside render is not allowed)
      queueMicrotask(() => {
        root.unmount();
        host.remove();
      });
    };

    const settle = (answer: boolean, cb?: () => void) => {
      if (settled) return;
      settled = true;
      cb?.();
      flushSync(() => {
        /* render closed state before unmount so `onClose` flushes */
        root.render(
          createElement(ConfirmDialog, {
            ...rest,
            children,
            open: false,
            onConfirm: () => undefined,
            onCancel: () => undefined,
            onClose: () => undefined,
          })
        );
      });
      unmount();
      resolve(answer);
    };

    flushSync(() => {
      root.render(
        createElement(ConfirmDialog, {
          ...rest,
          children,
          open: true,
          onConfirm: () => settle(true, onConfirm),
          onCancel: () => settle(false, onCancel),
          onClose: () => settle(false, onCancel),
        })
      );
    });
  });
}

export { confirm };
export type { ConfirmOptions };
