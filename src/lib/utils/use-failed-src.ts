import { useState } from 'react';

/**
 * Per-`src` image failure memory shared by Avatar and Image: `failed` is
 * true only while `src` is the very address whose load errored, so a
 * changed `src` (upload finished, user switched) renders as an image
 * again — the failure is never sticky across sources — and failing the
 * new source brings the fallback back. The caller wires `markFailed`
 * into the img's `error` handler (Image forwards the consumer's
 * `onError` first) and decides what a failed image renders.
 *
 * Purely internal UI state — never exposed as a controlled prop.
 * No DOM access (RSC-safe by inspection; Avatar and Image are not
 * RSC-listed, so no scripts/rsc-safe.mjs entry).
 */
export function useFailedSrc(src: string | undefined): [boolean, () => void] {
  // `undefined` = nothing has failed yet; an undefined src can never fail.
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined);
  const markFailed = () => setFailedSrc(src);
  return [failedSrc !== undefined && failedSrc === src, markFailed];
}
