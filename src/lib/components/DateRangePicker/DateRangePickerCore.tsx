import type { ReactNode } from 'react';

import { css } from '@linaria/core';

import { pickerFieldInput } from '../../utils/field-skin';
import { PresetRows } from '../../utils/preset-list-rows';

import { useStrings } from '../LocaleProvider';

import Calendar from '../Calendar/Calendar';

/** One shortcut row at the top of the range panel: clicking applies
 * `range` as the start/end pair. */
type DateRangePickerPreset = {
  /** Visible row copy. */
  label: string;
  /** Applied range as two "YYYY-MM-DD" strings. */
  range: [string, string];
};

type DateRangePickerCoreProps = {
  startDate: string;
  endDate: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  separator?: ReactNode;
  /**
   * Number of month grids in the range panel. `2` renders an inline
   * dual-month calendar below the inputs: the first pick sets the start
   * date, the second completes the range (a pick before the start
   * restarts it), and the two grids move together under one navigation.
   * The default keeps the plain two-input layout.
   * @default 1
   */
  months?: 1 | 2;
  /** Disables individual dates on the panel's Calendar (see Calendar's
   * `disabledDate`). */
  disabledDate?: (date: Date) => boolean;
  /** Shortcut rows at the top of the panel; clicking applies the
   * preset's range to the start/end pair. Providing presets renders
   * the inline panel even with the default `months={1}`. */
  presets?: DateRangePickerPreset[];
  className?: string;
};

const container = css`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--haze-space-2);
  font-family: var(--haze-font-sans);
`;

/* Dual-month layout: inputs stay on their own row, the calendar panel
   stacks below and never reflows the input row's baseline. */
const stackedContainer = css`
  flex-direction: column;
  align-items: flex-start;
`;

const inputsRow = css`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--haze-space-2);
`;

const panel = css`
  margin-block-start: var(--haze-space-2);
  /* max-width pairs with the border: border-box keeps the boundary
   * inside the 100% bound (panel-family box-sizing contract). Kept as a
   * whole local skin rather than composed over utils/panel-skin's bare
   * surface: the inline (non-floating) range panel floats one elevation
   * step lower (shadow-md vs the popover surface's shadow-lg), and a
   * same-property override layered over the shared class would resolve
   * by stylesheet order — which differs between the dev server and the
   * split-css dist. */
  box-sizing: border-box;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-md);
  max-width: 100%;
`;

/* Start/end input deltas on the shared picker field skin
   (utils/field-skin.ts): the native date inputs keep their inline pair
   sizing (no width/leading overrides) and carry the disabled arm.
   Composed with `pickerFieldInput` — additive properties only. */
const input = css`
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const sep = css`
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
`;

/* Shortcut rows heading the panel: the shared option-row skin from
   utils/preset-list-skin (SelectFloating's option-row style) — a
   hairline separating them from the calendars below. */

export default function DateRangePickerCore({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  separator = '–',
  months = 1,
  disabledDate,
  presets,
  className,
}: DateRangePickerCoreProps) {
  const strings = useStrings('dateRangePicker');

  // Two-click range semantics on the calendar panel: no start yet (or a
  // complete range) starts over with a fresh start; a pick at or after
  // the start completes the range; a pick before the start restarts it.
  const handleCalendarSelect = (date: string) => {
    if (!startDate || endDate) {
      onStartChange(date);
      onEndChange('');
    } else if (date < startDate) {
      onStartChange(date);
    } else {
      onEndChange(date);
    }
  };

  const hasPresets = presets !== undefined && presets.length > 0;

  const inputs = (
    <>
      <input
        data-slot='start-input'
        type="date"
        x-class={[pickerFieldInput, input]}
        aria-label={strings.startDate}
        value={startDate}
        onChange={(e) => onStartChange(e.target.value)}
      />
      <span data-slot='separator' x-class={[sep]}>{separator}</span>
      <input
        data-slot='end-input'
        type="date"
        x-class={[pickerFieldInput, input]}
        aria-label={strings.endDate}
        value={endDate}
        onChange={(e) => onEndChange(e.target.value)}
      />
    </>
  );

  // The inline panel exists for the dual-month calendar and on its own
  // for presets (shortcut rows above nothing still set both inputs).
  if (months !== 2 && !hasPresets) {
    return (
      <div data-slot='date-range-picker' x-class={[container, className]}>
        {inputs}
      </div>
    );
  }

  return (
    <div data-slot='date-range-picker' x-class={[container, stackedContainer, className]}>
      <div data-slot='inputs' x-class={[inputsRow]}>{inputs}</div>
      <div data-slot='panel' x-class={[panel]}>
        {hasPresets && (
          <PresetRows
            items={presets}
            keyOf={(preset) => `${preset.label}:${preset.range.join('~')}`}
            labelOf={(preset) => preset.label}
            onPick={(preset) => {
              onStartChange(preset.range[0]);
              onEndChange(preset.range[1]);
            }}
          />
        )}
        {months === 2 && (
          <Calendar
            months={2}
            rangeStart={startDate}
            rangeEnd={endDate}
            disabledDate={disabledDate}
            onSelect={handleCalendarSelect}
          />
        )}
      </div>
    </div>
  );
}

export type { DateRangePickerCoreProps, DateRangePickerPreset };
