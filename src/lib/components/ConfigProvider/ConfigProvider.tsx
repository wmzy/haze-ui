import type { ReactNode } from 'react';

import type { HazeConfig, HazeDensity } from './ConfigContext';

import { useContext, useMemo } from 'react';

import { ConfigContext, mergeConfig } from './ConfigContext';

type ConfigProviderProps = {
  /**
   * Component defaults, keyed by exported component name (see
   * `HazeConfig`). Nested providers layer: the inner provider's keys win
   * per component section (shallow merge), keys it leaves unset keep the
   * outer value. Explicit props on a component always beat config values.
   */
  defaults?: HazeConfig;
  /**
   * Global spacing density for the subtree. `'compact'` re-declares the
   * spacing scale at 75% (tokens/density.ts) inside density-aware
   * components — Table today; `'normal'` (the built-in) leaves the
   * ambient scale. Nested providers: an inner `density` wins, one that
   * omits it inherits the outer value. Explicit per-component props (a
   * component's own density-ish sizing, e.g. DataTable's `size`) stay
   * on their own axis and keep winning over the ambient scale.
   */
  density?: HazeDensity;
  children: ReactNode;
};

/**
 * Supplies library-wide component defaults and spacing density to the
 * subtree — the AntD-v6-ConfigProvider idea, scoped to defaults +
 * density. Theming stays on the token classes (`lightTheme` / brand
 * themes) and copy on `LocaleProvider`; the two providers are independent contexts and may
 * be mounted in either order, nested in one another, or used alone.
 *
 * Renders no DOM and touches no browser API — safe under SSR (string
 * render and hydration alike). A client-boundary module (React context):
 * the lib build stamps `'use client'` on it.
 */
export default function ConfigProvider({
  defaults,
  density,
  children,
}: ConfigProviderProps) {
  const parent = useContext(ConfigContext);
  const value = useMemo(
    () => ({
      defaults: mergeConfig(parent?.defaults, defaults),
      // Inner density wins; an inner provider that omits it keeps the
      // outer value; no provider anywhere resolves to 'normal'.
      density: density ?? parent?.density ?? 'normal',
    }),
    [parent, defaults, density]
  );

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

export type { ConfigProviderProps };
