import type { DrawerClassNames } from '../Drawer/Drawer';
import type { SelectClassNames } from '../Select/Select';
import type { ComboboxClassNames } from '../Combobox/Combobox';
import type { TagGroupClassNames } from '../TagGroup/TagGroup';
import type { MenuClassNames } from '../Menu/MenuContext';
import type { NotificationCenterClassNames } from '../NotificationCenter/NotificationCenter';
import type { ToastPlacement } from '../Toast/ToastContainer';
import type { CalendarPickerMode } from '../Calendar/Calendar';
import type { TimePickerFormat } from '../../utils/time-math';

import { createContext } from 'react';

/**
 * THE registration record for ConfigProvider prop defaults: one entry
 * per wired component, keyed by the exported component name, holding
 * the partial props that component resolves config-side. Adding a
 * component is one entry here plus the component's own
 * `useConfigDefaults('Name')` read — nothing else (the merge below and
 * the accessor in useConfigDefaults.ts are generic over this record).
 *
 * A simplified AntD-v6 `ConfigProvider` channel scoped to prop defaults
 * (theming stays on the token classes, i18n on `LocaleProvider`).
 * Each section names the defaults of one component; an explicit prop on
 * the component itself always beats anything set here, and a missing
 * provider leaves every component on its built-in defaults.
 */
type ComponentDefaultsSections = {
  /** `Button` prop defaults (CopyButton reads the same section). */
  Button: {
    /** Default `size` when the prop is omitted (built-in `'md'`). */
    size?: 'sm' | 'md' | 'lg';
  };
  /** `ButtonLink` prop defaults — the anchor wearing Button's skin. */
  ButtonLink: {
    /** Default `size` when the prop is omitted (built-in `'md'`). */
    size?: 'sm' | 'md' | 'lg';
  };
  /**
   * Toast defaults. `duration` covers toasts fired through `useToast()`;
   * the module-level `toast()` runs outside any React tree and keeps its
   * own 3000ms default regardless of config. `loading()` toasts keep
   * their persistent (0ms) semantics — config never re-arms them.
   */
  Toast: {
    /** Auto-dismiss budget in ms when a call omits `duration` (3000). */
    duration?: number;
    /** Viewport edge the stack is pinned to (`'bottom-right'`). */
    placement?: ToastPlacement;
    /** Max simultaneous toasts; oldest dropped on overflow (unbounded). */
    maxCount?: number;
  };
  /** `Tooltip` prop defaults. */
  Tooltip: {
    /** Hover/focus delay in ms before the tooltip appears (150). */
    delay?: number;
  };
  /** `HoverCard` prop defaults. */
  HoverCard: {
    /** Hover/focus dwell in ms before the card opens (200). */
    openDelay?: number;
    /**
     * Grace period in ms after the pointer leaves before the card
     * closes — the travel window into the panel (120; 300 when the
     * card renders `interactive`).
     */
    closeDelay?: number;
  };
  /** `Drawer` slot classes — merged under an explicit `classNames` prop. */
  Drawer: { classNames?: DrawerClassNames };
  /** `Select` slot classes — merged under an explicit `classNames` prop. */
  Select: { classNames?: SelectClassNames };
  /** `Combobox` slot classes — merged under an explicit `classNames` prop. */
  Combobox: { classNames?: ComboboxClassNames };
  /** `TagGroup` slot classes — merged under an explicit `classNames` prop. */
  TagGroup: { classNames?: TagGroupClassNames };
  /** `Input` prop defaults. */
  Input: {
    /** Default `size` when the prop is omitted (built-in `'md'`). */
    size?: 'sm' | 'md' | 'lg';
  };
  /** `Textarea` prop defaults. */
  Textarea: {
    /** Default `size` when the prop is omitted (built-in `'md'`). */
    size?: 'sm' | 'md' | 'lg';
  };
  /** `NumberInput` prop defaults. */
  NumberInput: {
    /** Default `size` when the prop is omitted (built-in `'md'`). */
    size?: 'sm' | 'md' | 'lg';
    /** Default increment/decrement `step` (built-in `1`). */
    step?: number;
  };
  /** `Datepicker` prop defaults. */
  Datepicker: {
    /** Calendar granularity when the prop is omitted (built-in `'date'`). */
    picker?: CalendarPickerMode;
    /** First day of the week for the day grid (locale-derived). */
    weekStartsOn?: 0 | 1;
  };
  /** `TimePicker` prop defaults. */
  TimePicker: {
    /** Column granularity / value serialization (built-in `'HH:mm'`). */
    format?: TimePickerFormat;
    /** 12-hour clock + AM/PM column, value stays 24-hour (built-in off). */
    use12Hours?: boolean;
  };
  /** `Menu` slot classes — merged under an explicit `classNames` prop. */
  Menu: { classNames?: MenuClassNames };
  /** `NotificationCenter` slot classes — merged under an explicit
   *  `classNames` prop. */
  NotificationCenter: { classNames?: NotificationCenterClassNames };
  /** `Pagination` prop defaults. */
  Pagination: {
    /** Default `size` when the prop is omitted (built-in `'md'`). */
    size?: 'sm' | 'md' | 'lg';
  };
  /** `Table` prop defaults. */
  Table: {
    /** Zebra-stripe even body rows (built-in off). */
    striped?: boolean;
    /** Full cell borders on every th/td (built-in off). */
    bordered?: boolean;
  };
};

/**
 * Component default overrides, keyed by the exported component name —
 * every section of {@link ComponentDefaultsSections}, optional.
 */
type HazeConfig = {
  [Section in keyof ComponentDefaultsSections]?: ComponentDefaultsSections[Section];
};

/**
 * Global spacing density. `'compact'` re-declares the spacing scale at
 * 75% (tokens/density.ts) inside density-aware components; `'normal'`
 * is the built-in scale. Carried in context, not DOM — each density-
 * aware component (Table today) applies the token classes itself.
 */
type HazeDensity = 'normal' | 'compact';

/**
 * The fully merged config visible below a `ConfigProvider`. The
 * provider resolves nesting itself (inner sections shallow-merge over
 * outer ones; an inner `density` wins, an unset one inherits), so the
 * context always carries one flat value — consumers never walk a chain.
 */
type ConfigContextValue = {
  /** Merged component defaults (see {@link HazeConfig}). */
  defaults: HazeConfig;
  /** Resolved spacing density (`'normal'` with no provider). */
  density: HazeDensity;
};

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

/**
 * Per-section shallow merge for nested providers: keys the inner
 * provider names win, keys it leaves unset keep the outer value, and
 * sections present on only one side pass through untouched. Pure — no
 * DOM access, SSR-safe.
 *
 * Generic over the registration record: the section keys come from the
 * two records themselves, so registering a new section in
 * `ComponentDefaultsSections` needs no edit here.
 */
function mergeConfig(
  outer: HazeConfig | undefined,
  inner: HazeConfig | undefined
): HazeConfig {
  if (outer === undefined) return inner ?? {};
  if (inner === undefined) return outer;
  const sectionKeys = [
    ...new Set([
      ...(Object.keys(outer) as (keyof HazeConfig)[]),
      ...(Object.keys(inner) as (keyof HazeConfig)[]),
    ]),
  ];
  // fromEntries' index-signature result is assignable to the all-optional
  // HazeConfig shape; each section value is a plain spread record.
  return Object.fromEntries(
    sectionKeys.map((key) => [
      key,
      { ...(outer[key] ?? {}), ...(inner[key] ?? {}) },
    ])
  );
}

export { ConfigContext, mergeConfig };
export type { HazeConfig, HazeDensity, ConfigContextValue, ComponentDefaultsSections };
