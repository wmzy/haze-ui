import { useCallback, useEffect, useRef } from 'react';

/**
 * The vaul/Base UI-style document-level touchmove guard (内部原语，不进
 * barrel): while a touch gesture is in its "convertible" window, the
 * engine must not get the chance to claim the touch for native
 * scrolling or the overscroll rubber-band — once it does, the pointer
 * stream is cancelled (`pointercancel`) and the gesture dies. The guard
 * preventDefaults eligible touchmoves from a `passive: false`
 * document listener that exists only while a gesture has claimed it.
 *
 * PullToRefresh's pull and BottomSheet's swipe-to-dismiss wore
 * verbatim copies of this plumbing (each file's comment named the
 * other as the same-type precedent): the decide predicate differs per
 * gesture (scroll-edge + direction + slop rules), everything else —
 * the paired install/remove, the stable listener identity, the
 * latest-decide-through-a-ref refresh and the unmount safety net — is
 * the same.
 *
 * Pure TS, no Linaria css — not registered in split-css sharedLayers.
 */

/**
 * Owns the document `touchmove` guard's lifecycle.
 *
 * `claim()` installs the listener (`passive: false` — the whole point:
 * a passive listener cannot preventDefault); `release()` removes it.
 * Both are idempotent (add/removeEventListener dedupe by listener
 * identity), and an unmount safety net removes a guard a mid-gesture
 * unmount (route change etc.) would otherwise leave behind as a
 * dangling closure swallowing the page's native scroll.
 *
 * The listener identity is stable for the hook's lifetime, so
 * claim/release always pair on the same function even across renders;
 * `decide` is read through a ref refreshed after every commit, so the
 * caller's predicate may close over per-render values (PullToRefresh's
 * `canRefresh` prop with unstable identity) without swapping the
 * guard mid-gesture.
 *
 * @param decide Whether this touchmove is inside the gesture's
 *   convertible window (already past its slop, at the right scroll
 *   edge, moving in the gesture's direction). Returning true
 *   preventDefaults the event; an already-prevented event is left
 *   untouched.
 * @returns `{claim, release}` — call from the gesture's take/release
 *   paths.
 */
export function useTouchScrollGuard(decide: (event: TouchEvent) => boolean): {
  /** Install the document touchmove guard (no-op while installed). */
  claim: () => void;
  /** Remove the document touchmove guard (no-op while absent). */
  release: () => void;
} {
  // The latest predicate, refreshed after every commit — the stable
  // listener always runs the freshest logic through this ref.
  const decideRef = useRef(decide);
  useEffect(() => {
    decideRef.current = decide;
  });

  // 必须恒定引用——addEventListener/removeEventListener 配对。
  const listener = useCallback((event: TouchEvent) => {
    if (event.defaultPrevented) return;
    if (decideRef.current(event)) event.preventDefault();
  }, []);

  // 卸载安全网：手势中途卸载（路由切换等）时摘掉 document 级监听，
  // 避免悬空闭包继续吞掉页面的原生滚动。
  useEffect(
    () => () => {
      document.removeEventListener('touchmove', listener);
    },
    [listener]
  );

  const claim = useCallback(() => {
    document.addEventListener('touchmove', listener, { passive: false });
  }, [listener]);

  const release = useCallback(() => {
    document.removeEventListener('touchmove', listener);
  }, [listener]);

  return { claim, release };
}
