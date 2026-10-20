import type { ComponentPropsWithoutRef, FocusEvent, KeyboardEvent, Ref } from 'react';

import { css } from '@linaria/core';
import { Fragment, useRef, useState } from 'react';

import { mergeRefs } from '../../utils/refs';

/**
 * Shared segmented-input engine behind DateField and TimeField: a
 * role="group" of role="spinbutton" spans (year/month/day,
 * hour/minute/second, AM/PM) with roving tabindex, per-segment digit
 * buffering, arrow stepping and auto-advance — the keyboard-first field
 * shape React Aria's DateField/TimeField popularized.
 *
 * The engine owns only transient input state (focus position and the
 * pending per-segment edits). Committed values are derived: the consumer
 * parses its `value` prop into `values`, and every completed interaction
 * offers the merged segment values back through `serialize` — when it
 * returns a string the engine commits (`onChange`) and wipes the pending
 * edits; when it returns null (incomplete, or an impossible combination
 * like February 30th) nothing commits and the typed state stays visible.
 */

/** A numeric spinbutton segment (year/month/day, hour/minute/second). */
type NumericSegmentSpec = {
  kind: 'numeric';
  /** Segment identity, mirrored as `data-segment` on the rendered span. */
  key: string;
  /** Accessible segment name (aria-label). */
  label: string;
  min: number;
  max: number;
  /** Typed-digit capacity; focus auto-advances once it is gathered. */
  digits: number;
  /** Zero-pad width for committed values ('2026', '03'). */
  pad: number;
  /** Rendered while the segment is empty. */
  placeholder: string;
  /** Arrow stepping wraps at the bounds instead of clamping. */
  wrap?: boolean;
  /** Value an empty segment takes on the first ArrowUp/ArrowDown
   * (default `min`; the year segment passes the current year). */
  fallback?: number;
  /** aria-valuetext override (localized month names). */
  ariaValueText?: (value: number) => string;
};

/** A two-option toggle segment (AM/PM): 'a'/'p' type in, arrows switch. */
type PeriodSegmentSpec = {
  kind: 'period';
  key: string;
  label: string;
  /** The two option labels, value-addressed: [AM, PM]. */
  options: [string, string];
  placeholder: string;
};

type SegmentSpec = NumericSegmentSpec | PeriodSegmentSpec;

type SegmentedFieldProps = {
  segments: SegmentSpec[];
  /** Separator between adjacent segments; entry i follows segment i. */
  separators: string[];
  /** Committed per-segment values parsed from `value` (null = empty). */
  values: (number | null)[];
  /** Current serialized value; commits equal to it are swallowed. */
  value: string;
  /** Serializes merged segment values; null = incomplete/invalid, so no
   * commit happens and the container flags `data-invalid` when every
   * segment is filled yet the combination still fails. */
  serialize: (values: (number | null)[]) => string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  /** Forwarded to the current tab-stop segment (the roving-focus entry,
   * the element form bridges and `ref.current.focus()` reach). */
  ref?: Ref<HTMLSpanElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onChange'>;

const field = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-1);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-normal);
  padding: var(--haze-space-2) var(--haze-space-3);
  cursor: text;
  box-sizing: border-box;
  font-variant-numeric: tabular-nums;
  transition:
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);

  &:focus-within {
    outline: none;
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &[data-invalid] {
    border-color: var(--haze-color-danger);
  }
`;

const disabledField = css`
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
`;

const segment = css`
  border-radius: var(--haze-radius-sm);
  cursor: inherit;

  &:focus {
    outline: none;
    background: var(--haze-color-primary-subtle);
  }
`;

const emptySegment = css`
  color: var(--haze-color-text-muted);
`;

const separator = css`
  color: var(--haze-color-text-muted);
  user-select: none;
`;

/** Committed-or-pending value of one segment (null = empty). */
const displayValue = (spec: SegmentSpec, value: number): string =>
  spec.kind === 'period'
    ? spec.options[value as 0 | 1]
    : String(value).padStart(spec.pad, '0');

export default function SegmentedField({
  segments,
  separators,
  values,
  value,
  serialize,
  onChange,
  disabled = false,
  className,
  ref,
  ...rest
}: SegmentedFieldProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  /* Pending per-segment edits: null = none (committed display wins),
   * '' = cleared by Backspace, digits = mid-entry buffer. An override
   * shadows `values` until the next successful commit wipes them all. */
  const [overrides, setOverrides] = useState<(string | null)[]>(() =>
    segments.map(() => null)
  );
  const segmentRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const overrideAt = (
    current: (string | null)[],
    i: number,
    text: string
  ): (string | null)[] => {
    const next = segments.map((_, j) => current[j] ?? null);
    next[i] = text;
    return next;
  };

  const mergedOf = (current: (string | null)[]): (number | null)[] =>
    segments.map((_, i) => {
      const override = current[i] ?? null;
      if (override === null) return values[i] ?? null;
      if (override === '') return null;
      return Number(override);
    });

  const merged = mergedOf(overrides);
  const invalid =
    merged.every((v) => v !== null) && serialize(merged) === null;

  /* Offer a full set of segment values to the consumer; on a
   * serializable result commit and drop every pending edit. */
  const commitWith = (pending: (number | null)[]) => {
    const iso = serialize(pending);
    if (iso === null) return;
    if (iso !== value) onChange(iso);
    setOverrides(segments.map(() => null));
  };

  const move = (to: number) => {
    const target = Math.min(segments.length - 1, Math.max(0, to));
    setActiveIndex(target);
    segmentRefs.current[target]?.focus();
  };

  const typeDigit = (spec: NumericSegmentSpec, i: number, digit: string) => {
    const current = overrides[i] ?? null;
    const base = current !== null && current !== '' ? current : '';
    let text = base.length >= spec.digits ? digit : base + digit;
    // "15" typed into a 1–12 month restarts at the new digit.
    if (Number(text) > spec.max) text = digit;
    const nextOverrides = overrideAt(overrides, i, text);
    setOverrides(nextOverrides);
    // Segment is complete once its digits are gathered, or immediately
    // when no valid continuation exists ('5' in a 1–12 month).
    const complete =
      text.length >= spec.digits || Number(text) * 10 > spec.max;
    if (!complete) return;
    commitWith(mergedOf(nextOverrides));
    if (i < segments.length - 1) move(i + 1);
  };

  const step = (i: number, dir: 1 | -1) => {
    const spec = segments[i];
    if (!spec) return;
    const current = merged[i] ?? null;
    let next: number;
    if (spec.kind === 'period') {
      next = current === null ? (dir === 1 ? 0 : 1) : current === 1 ? 0 : 1;
    } else if (current === null) {
      // First arrow on an empty segment lands on the fallback (the
      // year's current year, otherwise the minimum) without stepping.
      next = spec.fallback ?? spec.min;
    } else {
      const base = current;
      if (spec.wrap) {
        next = base + dir;
        if (next > spec.max) next = spec.min;
        if (next < spec.min) next = spec.max;
      } else {
        next = Math.min(spec.max, Math.max(spec.min, base + dir));
      }
    }
    const text =
      spec.kind === 'period' ? String(next) : String(next).padStart(spec.pad, '0');
    const nextOverrides = overrideAt(overrides, i, text);
    setOverrides(nextOverrides);
    commitWith(mergedOf(nextOverrides));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>, i: number) => {
    if (disabled) return;
    const spec = segments[i];
    if (!spec) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      move(i - 1);
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      move(i + 1);
      return;
    }
    if (e.key === 'Tab') {
      // Tab walks the segments; at the field's edges it exits, flushing
      // any pending entry on the way out.
      if (e.shiftKey && i > 0) {
        e.preventDefault();
        move(i - 1);
      } else if (!e.shiftKey && i < segments.length - 1) {
        e.preventDefault();
        move(i + 1);
      } else {
        commitWith(merged);
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      step(i, 1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      step(i, -1);
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      setOverrides(overrideAt(overrides, i, ''));
      return;
    }
    if (spec.kind === 'period' && /^[ap]$/i.test(e.key)) {
      e.preventDefault();
      const nextOverrides = overrideAt(
        overrides,
        i,
        e.key.toLowerCase() === 'p' ? '1' : '0'
      );
      setOverrides(nextOverrides);
      commitWith(mergedOf(nextOverrides));
      return;
    }
    if (spec.kind === 'numeric' && /^[0-9]$/.test(e.key)) {
      e.preventDefault();
      typeDigit(spec, i, e.key);
    }
  };

  // Leaving the field flushes a pending single-digit entry ('1' in the
  // month commits as January once focus moves on); moves between
  // segments keep everything as-is.
  const handleBlur = (e: FocusEvent<HTMLSpanElement>) => {
    const to = e.relatedTarget;
    if (to instanceof Node && containerRef.current?.contains(to)) return;
    commitWith(merged);
  };

  return (
    <div
      role='group'
      data-invalid={invalid || undefined}
      x-class={[field, disabled && disabledField, className]}
      ref={containerRef}
      {...rest}
    >
      {segments.map((spec, i) => {
        const segmentValue = merged[i] ?? null;
        const override = overrides[i] ?? null;
        const text =
          override !== null && override !== ''
            ? spec.kind === 'period'
              ? spec.options[Number(override) as 0 | 1]
              : override
            : segmentValue === null
              ? spec.placeholder
              : displayValue(spec, segmentValue);
        const numeric = spec.kind === 'numeric';
        return (
          <Fragment key={spec.key}>
            <span
              role='spinbutton'
              data-slot='segment'
              data-segment={spec.key}
              aria-label={spec.label}
              aria-valuemin={numeric ? spec.min : 0}
              aria-valuemax={numeric ? spec.max : 1}
              aria-valuenow={segmentValue === null ? undefined : segmentValue}
              aria-valuetext={
                segmentValue === null
                  ? undefined
                  : numeric
                    ? spec.ariaValueText?.(segmentValue) ??
                      displayValue(spec, segmentValue)
                    : displayValue(spec, segmentValue)
              }
              aria-disabled={disabled || undefined}
              tabIndex={disabled || i !== activeIndex ? -1 : 0}
              x-class={[segment, segmentValue === null && emptySegment]}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onFocus={() => setActiveIndex(i)}
              onBlur={handleBlur}
              ref={mergeRefs(
                (node) => {
                  segmentRefs.current[i] = node;
                },
                i === activeIndex ? ref : undefined
              )}
            >
              {text}
            </span>
            {i < segments.length - 1 && (
              <span aria-hidden='true' data-slot='separator' x-class={separator}>
                {separators[i] ?? ''}
              </span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

export type { SegmentSpec, NumericSegmentSpec, PeriodSegmentSpec, SegmentedFieldProps };
