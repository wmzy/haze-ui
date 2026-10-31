import type { ComponentPropsWithoutRef, Ref } from 'react';

import type { CalendarCellRender, CalendarPickerMode } from '../Calendar/Calendar';

import { css } from '@linaria/core';
import { useCallback, useId, useRef, useState } from 'react';

import {
  formatDateOf,
  formatWeekValue,
  getISOWeek,
  parseCivilDate,
  weekStartDate,
} from '../../utils/date-math';
import { pickerFieldInputSm } from '../../utils/field-skin';
import { FloatingPanel, useFloating, useOpenAdaptor } from '../../utils/floating';
import { panelSurfaceBare } from '../../utils/panel-skin';
import { PickerInputTrigger } from '../../utils/picker-trigger';
import { PresetRows } from '../../utils/preset-list-rows';
import { mergeRefs } from '../../utils/refs';

import { useStrings } from '../LocaleProvider';

import Calendar from '../Calendar/Calendar';

import {
  applyTimeToCivilDate,
  formatDateTimeValue,
  normalizeTime,
  splitDateTimeValue,
  timeOf,
} from './datetime';

/** One shortcut row at the top of the dropdown panel: clicking applies
 * `value` (serialized per `picker`) and closes the panel. */
type DatepickerPreset = {
  /** Visible row copy. */
  label: string;
  /**
   * Applied value — "YYYY-MM-DD" (date), an ISO week "YYYY-Www" (week),
   * "YYYY-MM" (month), "YYYY-Qn" (quarter) or "YYYY" (year), matching
   * `picker`. With a custom `format`, presets carry the consumer's own
   * serialization and pass through untouched.
   */
  value: string;
};

type DatepickerCoreProps = {
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Calendar granularity; forwarded to the panel's Calendar and
   * followed by `value`/`onChange` serialization. */
  picker?: CalendarPickerMode;
  min?: string;
  max?: string;
  /** Disables individual dates on the panel's Calendar (see Calendar's
   * `disabledDate`). Applies to the day grid and the header drill-down
   * grids alike. */
  disabledDate?: (date: Date) => boolean;
  /** Shortcut rows rendered above the calendar; clicking applies the
   * preset and closes the panel. */
  presets?: DatepickerPreset[];
  /**
   * Renders a time input below the calendar; `value` serializes as
   * `"YYYY-MM-DD HH:mm"`, or with seconds as `"YYYY-MM-DD HH:mm:ss"`
   * (`{ seconds: true }`). Applies to the default date granularity
   * only; without it the value keeps the plain `"YYYY-MM-DD"` format
   * (plain-date and minute-precision values stay accepted in seconds
   * mode — the missing parts read as `00`).
   */
  showTime?: boolean | { seconds?: boolean };
  /**
   * Custom serialization hook: when provided, picks serialize through
   * it (`format(date-of-pick)`) instead of the built-in
   * `"YYYY-MM-DD [HH:mm[:ss]]"` format, and the trigger input displays
   * the resulting string verbatim. Pair with `parse` so a controlled
   * value round-trips back into the calendar's anchor and highlight.
   */
  format?: (date: Date) => string;
  /**
   * Custom parse hook (the `format` counterpart): reads the value
   * string back into a Date for the calendar's month view, day
   * highlight and the time input. Returns `null` for text it does not
   * recognize (the calendar then opens unanchored). The trigger stays
   * readOnly — parsing serves controlled-value display, not typing.
   */
  parse?: (text: string) => Date | null;
  locale?: string;
  weekStartsOn?: 0 | 1;
  placeholder?: string;
  className?: string;
  /** Appends custom content inside the panel's picker cells (see
   * Calendar's `cellRender`). */
  cellRender?: CalendarCellRender;
  /** Forwarded to the trigger `<input>` (not the wrapper div). */
  ref?: Ref<HTMLInputElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'children'>;

const wrapper = css`
  position: relative;
  display: inline-block;
`;

/* Trigger deltas on the shared picker field skin
   (utils/field-skin.ts): the readonly combobox sizes like a full-width
   block field, carries the leading the skin's typography pairs with,
   and shows the pointer cursor a picker trigger earns. Composed with
   `pickerFieldInput` at the trigger — additive properties only. */
const input = css`
  display: block;
  width: 100%;
  line-height: var(--haze-leading-normal);
  cursor: pointer;
  box-sizing: border-box;
`;

/* The dropdown panel wears the shared bare picker surface
   (utils/panel-skin.ts) verbatim — border, radius, fill, elevation and
   the forced-colors border restatement. */

/* Time footer (showTime): a hairline-separated row anchoring the
   hour/minute input to the panel's bottom edge, mirroring the preset
   rows' inset so both bookends align. */
const timeRow = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--haze-space-2);
  padding: var(--haze-space-2) var(--haze-space-3);
  border-block-start: 1px solid var(--haze-color-border);
`;

const timeLabel = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-muted);
`;

/* Time-input deltas on the shared sm picker field skin
   (utils/field-skin.ts): strip the native time input's spinner chrome;
   the leading pairs with the skin's typography. */
const timeInput = css`
  appearance: none;
  line-height: var(--haze-leading-normal);
`;

export default function DatepickerCore({
  value,
  onChange,
  open,
  onOpenChange,
  picker,
  min,
  max,
  disabledDate,
  presets,
  showTime,
  format,
  parse,
  locale,
  weekStartsOn,
  cellRender,
  placeholder,
  className,
  ref,
  ...rest
}: DatepickerCoreProps) {
  const strings = useStrings('datepicker');
  const inputRef = useRef<HTMLInputElement>(null);
  // The consumer's ref rides the same trigger input the floating
  // behavior anchors on.
  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => mergeRefs(inputRef, ref)(node),
    [inputRef, ref]
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // showTime applies to the day grid only; the coarser granularities
  // have no time-of-day to pick.
  const withTime =
    (showTime === true || typeof showTime === 'object') &&
    (picker ?? 'date') === 'date';
  const withSeconds = withTime && typeof showTime === 'object' &&
    showTime.seconds === true;

  // Custom format/parse pair: once either hook is provided the value is
  // the consumer's own serialization — picks serialize through `format`
  // and `parse` reads the controlled value back for the calendar.
  const custom = format !== undefined || parse !== undefined;
  const parsedDate = parse && value !== '' ? parse(value) : null;

  // Hour/minute(/second) held while no date is chosen yet — the
  // combined value cannot carry a time without its date part, so the
  // time input's edit parks here until the first pick applies it.
  // Purely internal UI state, never surfaced as a prop.
  const [pendingTime, setPendingTime] = useState(() =>
    withSeconds ? '00:00:00' : '00:00'
  );

  const split = withTime && !custom ? splitDateTimeValue(value) : null;
  // The calendar highlights and navigates by the date part alone; the
  // custom path derives it from `parse` instead of the built-in split
  // (the week mode wants the picked week's "YYYY-Www" serialization).
  const parsedWeek =
    parsedDate && picker === 'week'
      ? getISOWeek(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate()
        )
      : null;
  const dateValue = custom
    ? parsedWeek
      ? formatWeekValue(parsedWeek.year, parsedWeek.week)
      : parsedDate
        ? formatDateOf(parsedDate)
        : ''
    : withTime
      ? (split?.date ?? '')
      : value;
  // The time input always reads in the active precision (seconds mode
  // pads, minute mode truncates — see normalizeTime).
  const parsedTime = custom
    ? withTime && parsedDate
      ? timeOf(parsedDate, withSeconds)
      : null
    : (split?.time ?? null);
  const timeValue =
    parsedTime === null ? pendingTime : normalizeTime(parsedTime, withSeconds);

  /** Serialize a pick (plus optional parked time) through the active
   * format — the consumer hook when provided, the built-in
   * `"YYYY-MM-DD[ HH:mm[:ss]]"` serialization otherwise. Picks arrive
   * as `"YYYY-MM-DD"` (or `"YYYY-Www"` in the week mode); the week
   * value resolves to its Monday before `format` sees it. */
  const serialize = (dayValue: string, time?: string) => {
    if (custom && format) {
      const day =
        (picker === 'week' && weekStartDate(dayValue)) ||
        parseCivilDate(dayValue);
      if (!day) return time !== undefined ? formatDateTimeValue(dayValue, time) : dayValue;
      return format(
        time !== undefined ? applyTimeToCivilDate(day, time) : day
      );
    }
    return time !== undefined ? formatDateTimeValue(dayValue, time) : dayValue;
  };

  const setOpen = useOpenAdaptor(open, onOpenChange);

  const floating = useFloating({
    open,
    setOpen,
    triggerRef: inputRef,
    panelRef,
    animated: true,
  });

  return (
    <div x-class={[wrapper, className]} {...rest}>
      {/* The shared readonly combobox trigger (utils/picker-trigger):
          same DOM the local input rendered — pickerFieldInput skin,
          floating wiring, the popup aria set. Family deltas (width,
          leading, cursor) ride the `input` extension class. */}
      <PickerInputTrigger
        ref={setInputRef}
        behavior={floating}
        open={open}
        controlsId={panelId}
        className={input}
        value={value}
        placeholder={placeholder ?? strings.placeholder}
      />
      <FloatingPanel
        ref={panelRef}
        behavior={floating}
        placement="bottom"
        visualClass={panelSurfaceBare}
        id={panelId}
      >
        {presets && presets.length > 0 && (
          <PresetRows
            items={presets}
            keyOf={(preset) => `${preset.label}:${preset.value}`}
            labelOf={(preset) => preset.label}
            onPick={(preset) => {
              onChange(preset.value);
              onOpenChange(false);
            }}
          />
        )}
        <Calendar
          picker={picker}
          value={dateValue}
          min={min}
          max={max}
          disabledDate={disabledDate}
          locale={locale}
          weekStartsOn={weekStartsOn}
          cellRender={cellRender}
          onSelect={(date) => {
            if (withTime) {
              // Keep the panel open so the time can still be adjusted
              // after the date pick; outside click and Escape close it
              // through the floating behavior as usual.
              onChange(serialize(date, timeValue));
            } else {
              onChange(serialize(date));
              onOpenChange(false);
            }
          }}
        />
        {withTime && (
          <div data-slot='footer' x-class={[timeRow]}>
            <span data-slot='label' x-class={[timeLabel]}>{strings.time}</span>
            <input
              data-slot='time-input'
              type='time'
              step={withSeconds ? 1 : undefined}
              x-class={[pickerFieldInputSm, timeInput]}
              aria-label={strings.time}
              value={timeValue}
              onChange={(e) => {
                // Native time inputs report '' while cleared; fall back
                // to midnight so the next pick still serializes.
                const next =
                  e.target.value || (withSeconds ? '00:00:00' : '00:00');
                setPendingTime(next);
                if (dateValue) {
                  onChange(serialize(dateValue, next));
                }
              }}
            />
          </div>
        )}
      </FloatingPanel>
    </div>
  );
}

export type { DatepickerCoreProps, DatepickerPreset };
