import type { ReactNode } from 'react';

import { presetList, presetRow } from './preset-list-skin';

/**
 * The shared preset shortcut-row list heading the Datepicker and
 * DateRangePicker panels: one `presets` slot of option rows (the shared
 * preset-list skin — SelectFloating's option-row look) whose clicks
 * apply the preset's value(s). Rendering only — what a row applies, its
 * key and whether the panel closes stay the callers' semantics, passed
 * as the `keyOf`/`labelOf`/`onPick` projections.
 *
 * Carries no CSS of its own (the skin rides with the consuming families
 * through the existing 'utils/preset-list-skin' sharedLayers entry), so
 * this module needs no registration.
 */
type PresetRowsProps<T> = {
  /** Presets to render, in order. */
  items: T[];
  /** React list key of a row — the serialized value it applies. */
  keyOf: (item: T, index: number) => string;
  /** Visible row copy. */
  labelOf: (item: T) => ReactNode;
  /** Applies the preset (and closes the panel where that applies). */
  onPick: (item: T, index: number) => void;
};

export function PresetRows<T>({ items, keyOf, labelOf, onPick }: PresetRowsProps<T>) {
  return (
    <div data-slot='presets' x-class={[presetList]}>
      {items.map((item, index) => (
        <button
          key={keyOf(item, index)}
          data-slot='preset'
          type='button'
          x-class={[presetRow]}
          onClick={() => onPick(item, index)}
        >
          {labelOf(item)}
        </button>
      ))}
    </div>
  );
}
