import type { ComponentPropsWithoutRef, KeyboardEvent, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useRef } from 'react';
import { useControl } from 'react-use-control';

import { NativeHiddenFields } from '../../utils/native-form';
import { mergeRefs } from '../../utils/refs';

// sibling module (not `styles.ts`) — Linaria derives dev class names from
// the file basename, and a shared `styles` basename collides with
// Button/styles.ts (identical `haze-styles__*` selectors cross-wire the
// two components' rules in dev AND collide in dist css)
import { timeGridBase, timeGridButton, timeGridButtonSelected } from './time-grid-styles';

/**
 * TimeGrid — a single-select grid of `'HH:mm'` time slots generated
 * from a `from`..`to` window and a minute `step` (Mantine 8 TimeGrid
 * precedent). The selection is controllable state
 * (`ControlOrValue<string>` via useControl): pass a plain string for
 * uncontrolled usage, a control or `value` + `onChange` for the
 * controlled flow — `''` is the no-selection sentinel.
 *
 * Accessibility: an ARIA radio group — the root carries
 * `role="radiogroup"` (name it with `aria-label`), every slot is a
 * native `<button role="radio">` with `aria-checked`. Keyboard follows
 * the roving-tabindex radio/grid hybrid: the selected slot (else the
 * first enabled one) is the group's single tab stop; arrows move by
 * slot (left/right) or by row (`columns`, up/down), Home/End jump the
 * edges, and every move both focuses and selects — the radio pattern's
 * arrow-checks semantics. Disabled slots are skipped and unreachable.
 *
 * Form participation mirrors Segmented: a `name` renders a hidden
 * input bridge so `new FormData(form)` / server actions receive the
 * selected `'HH:mm'`; `''` submits nothing.
 */
type TimeGridClassNames = {
  /** The radiogroup root (`data-slot='time-grid'`). */
  root?: string;
  /** Every slot button (`data-slot='cell'`). */
  cell?: string;
};

type TimeGridProps = {
  /** Selected `'HH:mm'` slot — `ControlOrValue<string>`, `''` = none. */
  value?: ControlOrValue<string>;
  onChange?: (value: string) => void;
  /** Window start, `'HH:mm'`; default '00:00'. */
  from?: string;
  /** Window end, `'HH:mm'`, inclusive when step-aligned; default '23:00'. */
  to?: string;
  /** Slot cadence in minutes; default 60. */
  step?: number;
  /** Slots rendered unselectable (skipped by the keyboard rover too). */
  disabledValues?: readonly string[];
  /** Slots per row in the grid; default 4. */
  columns?: number;
  /** Display text per slot (defaults to the `'HH:mm'` value). */
  formatLabel?: (value: string) => string;
  /**
   * Form field name: renders a hidden input bridge next to the group
   * so `<form action={fn}>` / `new FormData(form)` receive the selected
   * slot. The `''` no-selection sentinel submits nothing.
   */
  name?: string;
  classNames?: TimeGridClassNames;
  className?: string;
  /** Forwarded to the group's focus target — the selected slot's button (falling back to the first enabled one). */
  ref?: Ref<HTMLButtonElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onChange'>;

const DEFAULT_FROM = '00:00';
const DEFAULT_TO = '23:00';
const DEFAULT_STEP = 60;
const DEFAULT_COLUMNS = 4;

/** `'HH:mm'` → minutes since midnight; null for malformed input. */
function parseTimeMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours > 23 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

/** Minutes since midnight → `'HH:mm'`. */
function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/** Inclusive from..to slot list; empty for a malformed or empty window. */
function buildSlots(from: string, to: string, step: number): string[] {
  const fromMinutes = parseTimeMinutes(from);
  const toMinutes = parseTimeMinutes(to);
  if (fromMinutes === null || toMinutes === null || fromMinutes > toMinutes || step <= 0) {
    return [];
  }
  const slots: string[] = [];
  for (let minutes = fromMinutes; minutes <= toMinutes; minutes += step) {
    slots.push(formatMinutes(minutes));
  }
  return slots;
}

export default function TimeGrid({
  value: valueControl,
  onChange,
  from = DEFAULT_FROM,
  to = DEFAULT_TO,
  step = DEFAULT_STEP,
  disabledValues,
  columns = DEFAULT_COLUMNS,
  formatLabel,
  name,
  classNames,
  className,
  style,
  ref,
  ...rest
}: TimeGridProps) {
  const [value, setValue] = useControl(valueControl, '');

  const slots = buildSlots(from, to, step);
  const disabled = new Set(disabledValues);
  const safeColumns = Math.max(1, Math.floor(columns));

  const firstEnabled = slots.findIndex((slot) => !disabled.has(slot));
  const lastEnabled = slots.findLastIndex((slot) => !disabled.has(slot));
  const selectedIndex = slots.indexOf(value);
  // The roving tab stop: the selected slot, else the first enabled one.
  const stopIndex =
    selectedIndex >= 0 && !disabled.has(value)
      ? selectedIndex
      : firstEnabled >= 0
        ? firstEnabled
        : 0;

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const commit = (next: string) => {
    setValue(next);
    onChange?.(next);
  };

  /** Next enabled index stepping by `delta`; null at the grid's edge. */
  const nextEnabled = (index: number, delta: number): number | null => {
    let next = index + delta;
    while (next >= 0 && next < slots.length && disabled.has(slots[next]!)) {
      next += delta > 0 ? 1 : -1;
    }
    if (next < 0 || next >= slots.length) return null;
    return next;
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const deltas: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: safeColumns,
      ArrowUp: -safeColumns,
    };
    let target: number | null;
    if (event.key in deltas) {
      target = nextEnabled(index, deltas[event.key]!);
    } else if (event.key === 'Home') {
      target = firstEnabled;
    } else if (event.key === 'End') {
      target = lastEnabled;
    } else {
      return;
    }
    // Arrows/Home/End are the group's selection keys — swallow the
    // native button behavior (Space scroll, Enter click) alike.
    event.preventDefault();
    if (target === null || target === index) return;
    const next = slots[target]!;
    commit(next);
    buttonRefs.current[target]?.focus();
  };

  const setNode = (index: number) => (node: HTMLButtonElement | null) => {
    buttonRefs.current[index] = node;
  };

  return (
    <>
      <div
        role='radiogroup'
        data-slot='time-grid'
        x-class={[timeGridBase, className, classNames?.root]}
        style={{
          gridTemplateColumns: `repeat(${safeColumns}, minmax(0, 1fr))`,
          ...style,
        }}
        {...rest}
      >
        {slots.map((slot, index) => (
          <button
            key={slot}
            /* The consumer's ref rides the group's tab stop — the
               selected (else first enabled) slot's button, the natural
               focus target — re-attaching as the selection moves. */
            ref={
              index === stopIndex
                ? mergeRefs(setNode(index), ref)
                : setNode(index)
            }
            type='button'
            role='radio'
            aria-checked={slot === value}
            data-slot='cell'
            data-selected={slot === value}
            disabled={disabled.has(slot)}
            tabIndex={index === stopIndex ? 0 : -1}
            onClick={() => commit(slot)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            x-class={[
              timeGridButton,
              slot === value && timeGridButtonSelected,
              classNames?.cell,
            ]}
          >
            {formatLabel ? formatLabel(slot) : slot}
          </button>
        ))}
      </div>
      <NativeHiddenFields name={name} values={value === '' ? [] : [value]} />
    </>
  );
}

export type { TimeGridProps, TimeGridClassNames };

