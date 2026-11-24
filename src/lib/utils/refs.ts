import type { Ref } from 'react';

import { useMemo } from 'react';

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
 * The hook form of mergeRefs: up to three refs composed into one callback
 * ref whose identity holds while every member ref does.
 *
 * The internal `useRef` and the forwarded `ref` prop both attach to the
 * same node, and React detaches (old callback, null) / re-attaches (new
 * callback, node) only when a member ref really was replaced — never on a
 * mere re-render, which an inline `ref={mergeRefs(a, b)}` or an unmemoized
 * arrow would do on every render pass. Behavior identical to the inline
 * useCallback((node) => mergeRefs(a, b)(node), [a, b]) it replaces.
 *
 * ```tsx
 * const inputRef = useRef<HTMLInputElement>(null);
 * const setInputRef = useMergedRefs(inputRef, ref);
 * // <InputCore ref={setInputRef} />
 * ```
 *
 * Fixed arity, not a rest list: the member refs are the memo dependency
 * list, which must stay an array literal for the React Compiler lint
 * (`react-hooks/use-memo`). Nearly every merge in this library is two
 * refs — the internal handle and the forwarded ref; ScrollViewport adds
 * the root's viewport registration as the third.
 *
 * @param first Ref to compose; `undefined` is skipped.
 * @param second Ref to compose; `undefined` is skipped.
 * @param third Ref to compose; `undefined` is skipped.
 * @returns A callback ref forwarding every attach/detach to each member.
 */
function useMergedRefs<T>(
  first: Ref<T> | undefined,
  second?: Ref<T>,
  third?: Ref<T>
): (node: T | null) => void {
  return useMemo(() => mergeRefs(first, second, third), [first, second, third]);
}

/**
 * Normalize one forwarded ref into a stable callback ref.
 *
 * The single-ref specialization of useMergedRefs: a component that
 * attaches a forwarded ref through an intermediate callback site (cell 0,
 * the roving tab stop, the checked radio) needs the callback's identity
 * stable while the ref prop is — a fresh closure per render would make
 * React detach (old callback, null) and re-attach (new callback, node) on
 * every render pass.
 *
 * @param ref The forwarded ref to normalize.
 * @returns A callback ref forwarding every attach/detach to `ref`.
 */
function useCallbackRef<T>(ref: Ref<T> | undefined): (node: T | null) => void {
  return useMergedRefs(ref);
}

export { mergeRefs, useCallbackRef, useMergedRefs };
