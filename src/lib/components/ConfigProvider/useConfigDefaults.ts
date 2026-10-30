import type { HazeConfig, HazeDensity } from './ConfigContext';

import { useContext } from 'react';

import { ConfigContext } from './ConfigContext';

/**
 * The shared "no defaults" section — stable identity, so a provider-less
 * render never allocates and consumers keep referential equality.
 */
const EMPTY_SECTION = Object.freeze({}) as Readonly<Record<string, never>>;

/**
 * Reads one component's resolved defaults from the enclosing
 * `ConfigProvider` chain. Returns a frozen empty object when no provider
 * is mounted; callers fall through to their built-in defaults, so wiring
 * a component never changes its provider-less behavior.
 *
 * ## Wiring a new component (the internal pattern)
 *
 * 1. Register the section — ONE entry in the `ComponentDefaultsSections`
 *    record (`ConfigContext.ts`) named after the exported component:
 *
 *    ```ts
 *    MyComponent: { size?: 'sm' | 'md' | 'lg' };
 *    ```
 *
 *    That single entry types the provider prop (`defaults`), the nesting
 *    merge and this accessor at once — `mergeConfig` derives its section
 *    keys from the records it merges, so nothing else needs editing.
 *
 * 2. In the component, drop the destructuring default for each wired
 *    prop and resolve three tiers — explicit prop, config, built-in:
 *
 *    ```ts
 *    const config = useConfigDefaults('MyComponent');
 *    const size = sizeProp ?? config.size ?? 'md';
 *    ```
 *
 *    The built-in stays last so a missing provider renders exactly what
 *    the component rendered before the wiring (byte-identical).
 */
export function useConfigDefaults<K extends keyof HazeConfig>(
  component: K
): Readonly<NonNullable<HazeConfig[K]>> {
  const config = useContext(ConfigContext);
  return config?.defaults[component] ?? EMPTY_SECTION;
}

/**
 * Merges a component's ConfigProvider `classNames` section under the
 * prop record — per key, an explicit slot on the component wins over
 * the provider's. Returns the prop record itself (possibly undefined)
 * when the section has no `classNames`, so provider-less renders keep
 * referential identity. Pure companion to `useConfigDefaults`.
 */
export function mergeClassNames<T extends object>(
  config: { readonly classNames?: T },
  classNames: T | undefined
): T | undefined {
  return config.classNames
    ? { ...config.classNames, ...classNames }
    : classNames;
}

/**
 * Reads the resolved spacing density from the enclosing
 * `ConfigProvider` chain — `'normal'` with no provider, an inner
 * provider's value over an outer one. Density-aware components use this
 * to apply the token classes that re-declare the spacing scale for
 * their subtree (Table today; see tokens/density.ts for the island
 * contract — the spacing class must be re-declared alongside `compact`).
 */
export function useConfigDensity(): HazeDensity {
  return useContext(ConfigContext)?.density ?? 'normal';
}
