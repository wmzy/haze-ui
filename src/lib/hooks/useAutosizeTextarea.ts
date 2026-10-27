import type { RefCallback } from 'react';

import { useCallback, useMemo, useRef } from 'react';

/** Computed px value as a positive number, 0 when unresolvable (jsdom). */
function readablePx(value: string): number {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/** Line height in px; `normal`/unresolvable falls back to 1.5 × font. */
function readableLineHeight(computed: CSSStyleDeclaration): number {
  const line = readablePx(computed.lineHeight);
  if (line > 0) return line;
  return readablePx(computed.fontSize) * 1.5;
}

type UseAutosizeTextareaOptions = {
  /** Auto-grow cap in text rows; beyond it the textarea scrolls. */
  maxRows?: number;
};

type UseAutosizeTextareaResult = {
  /** Attach to the `<textarea>` whose height should track its content. */
  ref: RefCallback<HTMLTextAreaElement>;
  /**
   * Re-measure and apply the content height. Call it whenever the
   * content grows outside this hook's knowledge (user typing, external
   * value writes) — the classic `useEffect(resize, [value])` wiring.
   */
  resize: () => void;
  /** Collapse back to the element's intrinsic single-row height. */
  reset: () => void;
};

/**
 * Auto-growing textarea: one row tall, expanding with the content up to
 * `maxRows` (beyond the cap the textarea scrolls — `overflow-y` is the
 * host class's business). Height reset first (`auto`), then a
 * `scrollHeight` measure, so a previously applied height never feeds
 * back into the measurement; the row cap reads the computed line height
 * and block padding (fallback 1.5 × font size when the computed metrics
 * are unresolvable, e.g. jsdom).
 *
 * ```tsx
 * const { ref, resize, reset } = useAutosizeTextarea({ maxRows: 6 });
 * <textarea ref={ref} onChange={(e) => { setValue(e.target.value); resize(); }} />
 * ```
 *
 * `resize`/`reset` are safe before the ref attaches (no-ops) and stable
 * per `maxRows`; the handle object is referentially stable.
 */
export function useAutosizeTextarea({
  maxRows,
}: UseAutosizeTextareaOptions = {}): UseAutosizeTextareaResult {
  const nodeRef = useRef<HTMLTextAreaElement | null>(null);

  const setNode = useCallback((node: HTMLTextAreaElement | null) => {
    nodeRef.current = node;
  }, []);

  const resize = useCallback(() => {
    const el = nodeRef.current;
    if (!el) return;
    el.style.height = 'auto';
    let height = el.scrollHeight;
    if (maxRows) {
      const computed = getComputedStyle(el);
      const linePx = readableLineHeight(computed);
      if (linePx > 0) {
        const padY =
          readablePx(computed.paddingTop) + readablePx(computed.paddingBottom);
        height = Math.min(height, maxRows * linePx + padY);
      }
    }
    el.style.height = `${height}px`;
  }, [maxRows]);

  const reset = useCallback(() => {
    const el = nodeRef.current;
    if (el) el.style.height = 'auto';
  }, []);

  return useMemo(
    () => ({ ref: setNode, resize, reset }),
    [setNode, resize, reset]
  );
}

export type { UseAutosizeTextareaOptions, UseAutosizeTextareaResult };
