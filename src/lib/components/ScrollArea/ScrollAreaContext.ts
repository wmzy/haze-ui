import type { Dispatch, SetStateAction } from 'react';

import { createContext, useContext } from 'react';

/**
 * Scrollbar visibility mode, declared once on `<ScrollArea>` and read by
 * every thumb through context:
 *
 * - `'hover'` (default) — thumbs appear while the pointer is over the
 *   scroll area or while they are being dragged
 * - `'always'` — thumbs are always shown (when the axis overflows)
 * - `'scroll'` — thumbs appear for a moment after each scroll
 */
export type ScrollbarMode = 'hover' | 'always' | 'scroll';

type ScrollAreaContextValue = {
  /** Visibility mode declared on the root. */
  mode: ScrollbarMode;
  /** The mounted scrollable viewport (`null` before it attaches). */
  viewport: HTMLDivElement | null;
  /** Viewport registration — `<ScrollViewport>` calls it via its ref. */
  setViewport: Dispatch<SetStateAction<HTMLDivElement | null>>;
  /** Accessible name declared on the root; the viewport falls back to it. */
  label: string | undefined;
};

const ScrollAreaContext = createContext<ScrollAreaContextValue | undefined>(
  undefined
);

export const ScrollAreaProvider = ScrollAreaContext.Provider;

export function useScrollAreaContext() {
  const ctx = useContext(ScrollAreaContext);
  if (!ctx) {
    throw new Error('ScrollArea compound parts must be used within <ScrollArea>');
  }
  return ctx;
}
