import type { CollisionPadding, CollisionStrategy } from './collision';

import { useMemo } from 'react';


import { toCollisionStrategy } from './collision';

/**
 * Memoized collision-strategy derivation for the floating surfaces
 * (Popover, Tooltip, HoverCard, DropdownMenu): adapts the component's
 * `collisionPadding` prop to the strategy object `useFloating` takes,
 * memoized on the prop so the object identity only changes when the
 * padding itself does — useFloatingPosition re-runs its effect on
 * every change of this object.
 *
 * Lives beside — not inside — utils/collision.ts: the geometry module
 * stays a pure function library (the headless barrel re-exports its
 * math), so it must not grow a react dependency for one hook.
 */
export function useCollisionStrategy(
  collisionPadding?: CollisionPadding
): CollisionStrategy | undefined {
  return useMemo(
    () => toCollisionStrategy(collisionPadding),
    [collisionPadding]
  );
}
