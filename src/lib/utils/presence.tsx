/* eslint-disable react-refresh/only-export-components --
   internal primitives module (exit-settle helper + render-less component),
   not a fast-refresh boundary; consumers re-render through their own files. */
import type { ReactElement, Ref } from 'react';

import { cloneElement, useEffect, useRef, useState } from 'react';

/**
 * Internal exit-animation primitives shared by floating.tsx (animated
 * panels) and the modal/collapsible families: `whenExitSettles` waits out
 * an element's closing animation/transition, and `Presence` keeps a single
 * child mounted while that exit runs (or, with `keepMounted`, dormant
 * behind `hidden` + `inert` afterwards). Not exported from the library
 * barrel — the public surface is curated behind the `haze-ui/headless`
 * subpath.
 */

// ---------------------------------------------------------------------------
// whenExitSettles
// ---------------------------------------------------------------------------

/** Settles in flight, so a repeated call on an element cannot restart one. */
const settling = new WeakMap<HTMLElement, Promise<void>>();

/** Double frame request that survives environments without rAF. */
function doubleRequestFrame(callback: () => void): void {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => requestAnimationFrame(callback));
    return;
  }
  setTimeout(callback, 32);
}

/** Longest duration in a possibly comma-separated computed value, in ms. */
function longestDuration(value: string): number {
  let longest = 0;
  for (const entry of value.split(',')) {
    const trimmed = entry.trim();
    const parsed = Number.parseFloat(trimmed);
    if (Number.isNaN(parsed)) continue; // '', 'none', …
    const ms = trimmed.endsWith('ms') ? parsed : parsed * 1000;
    if (ms > longest) longest = ms;
  }
  return longest;
}

function settleExit(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    // Two frames: the closing styles must be applied before they can be read.
    doubleRequestFrame(() => {
      const style = getComputedStyle(el);
      const animationMs =
        longestDuration(style.animationDuration) +
        longestDuration(style.animationDelay);
      const transitionMs =
        longestDuration(style.transitionDuration) +
        longestDuration(style.transitionDelay);
      const animating =
        (style.animationName !== 'none' && animationMs > 0) ||
        (style.transitionProperty !== 'none' && transitionMs > 0);
      // No positive duration declared (jsdom never reports one) — already
      // settled; there is no exit animation to wait for.
      if (!animating) {
        resolve();
        return;
      }
      const finish = () => {
        el.removeEventListener('animationend', onAnimationEnd);
        el.removeEventListener('transitionend', onTransitionEnd);
        window.clearTimeout(fallback);
        resolve();
      };
      const onAnimationEnd = (event: AnimationEvent) => {
        if (event.target === el) finish();
      };
      const onTransitionEnd = (event: TransitionEvent) => {
        if (event.target === el) finish();
      };
      el.addEventListener('animationend', onAnimationEnd);
      el.addEventListener('transitionend', onTransitionEnd);
      // End events lost to canceled animations still settle at max duration.
      const fallback = window.setTimeout(
        finish,
        Math.max(animationMs, transitionMs)
      );
    });
  });
}

/**
 * Wait for `el`'s exit animation/transition to finish. Resolves immediately
 * when no positive duration is declared. Returns `null` for an element
 * outside the document (nothing visible to wait for), and the in-flight
 * promise for a repeated call — settles are not re-entrant per element.
 */
export function whenExitSettles(el: HTMLElement): Promise<void> | null {
  if (!el.isConnected) return null;
  const inFlight = settling.get(el);
  if (inFlight) return inFlight;
  const settle = settleExit(el);
  settling.set(el, settle);
  void settle.then(() => settling.delete(el));
  return settle;
}

// ---------------------------------------------------------------------------
// Presence
// ---------------------------------------------------------------------------

type PresenceDataState = 'open' | 'closed';

type PresenceChildProps = {
  'data-state'?: string;
  hidden?: boolean;
  inert?: boolean;
  ref?: Ref<HTMLElement>;
};

export type PresenceProps = {
  /** While true the child is mounted with `data-state="open"`. */
  present: boolean;
  /** Single element child; receives `data-state` and a merged ref. */
  children: ReactElement;
  /**
   * Called when the exit has settled — right before the child unmounts,
   * or (with `keepMounted`) when it goes dormant instead of unmounting.
   */
  onExited?: () => void;
  /**
   * Keep the child mounted after the exit settles (Radix `forceMount` /
   * Ark `hideMode="hidden"` semantics). The exit transition still runs
   * to completion; afterwards the child stays in the tree with
   * `data-state="closed"` plus the `hidden` and `inert` attributes —
   * a display:none effect that keeps inner state and effects alive
   * (form drafts, scroll containers, media) while excluding the subtree
   * from the accessibility tree and tab order. Re-presenting removes
   * the attributes and runs the enter transition again. A `keepMounted`
   * child never unmounts, including when `present` starts false (it
   * renders dormant from the first frame). Default `false` — behavior
   * identical to the unmount-on-exit contract.
   */
  keepMounted?: boolean;
};

export function Presence({
  present,
  children,
  onExited,
  keepMounted = false,
}: PresenceProps) {
  const [mounted, setMounted] = useState(present || keepMounted);
  const [dataState, setDataState] = useState<PresenceDataState>(() =>
    present ? 'open' : 'closed'
  );
  // Dormant = kept mounted after the exit settled (or never presented):
  // renders with `hidden` + `inert`. A keepMounted child that starts
  // closed is dormant immediately — there is no exit to wait for, so it
  // must never flash an un-hidden closed frame.
  const [dormant, setDormant] = useState(() => keepMounted && !present);
  const [prevPresent, setPrevPresent] = useState(present);
  const [prevKeepMounted, setPrevKeepMounted] = useState(keepMounted);
  const nodeRef = useRef<HTMLElement | null>(null);

  // Adjust state during render when `present` flips (the React-endorsed
  // pattern) so `data-state="open"` is on the very first presented frame.
  if (present !== prevPresent) {
    setPrevPresent(present);
    if (present) {
      setMounted(true);
      setDataState('open');
      setDormant(false);
    } else {
      setDataState('closed');
    }
  }
  // Toggling keepMounted mid-flight: on → the never-unmount contract
  // applies immediately (a closed-unmounted child remounts dormant); off
  // while dormant → unmount now (the exit already settled; there is
  // nothing left to animate). Turning it off mid-exit is handled by the
  // effect re-running and finishing into a regular unmount.
  if (keepMounted !== prevKeepMounted) {
    setPrevKeepMounted(keepMounted);
    if (keepMounted) {
      setMounted(true);
    } else if (!present && dormant) {
      setDormant(false);
      setMounted(false);
    }
  }

  useEffect(() => {
    // Dormant children already settled their exit — nothing to wait for.
    if (!mounted || dataState !== 'closed' || dormant) return;
    let active = true;
    const el = nodeRef.current;
    const settle = el ? whenExitSettles(el) : null;
    const finish = () => {
      if (!active) return;
      active = false;
      if (keepMounted) setDormant(true);
      else setMounted(false);
      onExited?.();
    };
    if (settle) void settle.then(finish);
    else finish();
    return () => {
      active = false;
    };
  }, [mounted, dataState, dormant, keepMounted, onExited]);

  if (!mounted) return null;

  /* eslint-disable react-hooks/refs, react-hooks/immutability --
     merging the consumer's ref requires a function ref injected via
     cloneElement plus a write into the consumer's ref object; both run at
     commit time (React invokes ref callbacks), never during render — the
     compiler analyzer cannot prove that and flags conservatively. */
  const child = children as ReactElement<PresenceChildProps>;
  const consumerRef = child.props.ref;
  return cloneElement(child, {
    ...(child.props['data-state'] === undefined
      ? {'data-state': dataState}
      : {}),
    // Dormant (kept-mounted closed) children are display:none'd and
    // excluded from AT/tab order via hidden + inert — the same rule as
    // data-state: never clobber a value the consumer set themselves.
    ...(dormant && child.props.hidden === undefined ? {hidden: true} : {}),
    ...(dormant && child.props.inert === undefined ? {inert: true} : {}),
    ref: (node: HTMLElement | null) => {
      nodeRef.current = node;
      if (typeof consumerRef === 'function') consumerRef(node);
      else if (consumerRef)
        (consumerRef).current = node;
    },
  });
}
