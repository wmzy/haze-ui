import type { ReactNode } from 'react';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * The DOM-portal primitive shared by overlay families (Dialog, Drawer,
 * Tour… render through their own wiring; this is the escape hatch for
 * composing your own). Radix/Mantine semantics: nothing renders until
 * the client mounts — a server render and the first client render both
 * produce no output, so hydration never mismatches and a missing
 * `document` (SSR) cannot throw. Not exported from the library barrel —
 * the public surface is curated behind the `haze-ui/headless` subpath.
 */

type PortalProps = {
  /** Content to render into the container. */
  children: ReactNode;
  /**
   * Portal target: an element or a lazy getter (evaluated after mount,
   * so `document.body` and query-based lookups are safe on every
   * render). Defaults to `document.body` — the overlay default that
   * escapes ancestor `overflow`/`transform`/`z-index` stacking contexts.
   */
  container?: HTMLElement | (() => HTMLElement);
  /**
   * Render `children` in place instead of through a portal — the
   * composition escape for "portal only when a consumer opts out of my
   * stacking context" (the same shape Radix uses for nested portals).
   */
  disabled?: boolean;
};

export function Portal({ children, container, disabled = false }: PortalProps) {
  // Resolved only after mount: the render path touches no DOM global,
  // so SSR (no `document`) and the hydration pass both render nothing.
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (disabled) return;
    // Same-element resolution is a no-op setState — React bails out, so
    // an inline `() => document.body` getter cannot loop the effect.
    // The mounted-gate setState is the React-endorsed portal pattern:
    // the container is an external system (the DOM) that render cannot
    // safely read on the server, so it is synced in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTarget(typeof container === 'function' ? container() : (container ?? document.body));
  }, [container, disabled]);

  if (disabled) return <>{children}</>;
  if (target === null) return null;
  return createPortal(children, target);
}

export type { PortalProps };
