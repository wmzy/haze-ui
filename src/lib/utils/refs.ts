import type { Ref } from 'react';

import { useCallback } from 'react';

/**
 * Compose several refs (object and/or callback) into one callback ref.
 *
 * The ref-forwarding pattern for components that need their own element
 * handle *and* forward the consumer's ref to the same node (React 19
 * ref-as-prop): the internal `useRef` and the forwarded `ref` prop both
 * receive every attach/detach.
 *
 * The returned callback always returns `undefined` (React 19 warns on
 * non-cleanup return values), so a consumer callback ref's own React 19
 * cleanup-function return is not surfaced — the usual merged-refs
 * trade-off, same as every component library.
 */
function mergeRefs<T>(
  ...refs: (Ref<T> | undefined)[]
): (node: T | null) => void {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  };
}

/**
 * Normalize one forwarded ref into a stable callback ref.
 *
 * The single-ref specialization of mergeRefs: a component that attaches
 * a forwarded ref through an intermediate callback site (cell 0, the
 * roving tab stop, the checked radio) needs the callback's identity
 * stable while the ref prop is — a fresh closure per render would make
 * React detach (old callback, null) and re-attach (new callback, node)
 * on every render pass. Behavior identical to the inline
 * useCallback((node) => mergeRefs(ref)(node), [ref]) it replaces.
 */
function useCallbackRef<T>(ref: Ref<T> | undefined): (node: T | null) => void {
  return useCallback((node: T | null) => mergeRefs(ref)(node), [ref]);
}

export { mergeRefs, useCallbackRef };
