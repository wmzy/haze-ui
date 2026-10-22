import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import { useId } from 'react';

import {
  root as rootClass,
  header as headerClass,
  label as labelClass,
  value as valueClass,
  track as trackClass,
  trackSizes,
  bar as barClass,
} from './meter-styles';

/** One threshold band: at `at` (and above, until the next threshold)
 * the meter wears `tone`. */
type MeterThreshold = {
  /** Lower bound of the band, in the same units as `value`/`min`/`max`. */
  at: number;
  /** Band color. Omitted keeps the default primary ink (a band that
   * only re-splits the scale without recoloring). */
  tone?: 'success' | 'warning' | 'danger';
};

/** The resolved band tone: `primary` when no threshold band contains
 * the value (or the matching band omitted its tone). */
type MeterTone = 'primary' | 'success' | 'warning' | 'danger';

/** Semantic slot classes for Meter (AntD v6 `classNames` shape; keys
 * follow the data-slot names). */
type MeterClassNames = {
  /** The gauge root (data-slot='meter', role='meter'). */
  root?: string;
  /** The label/value header row (data-slot='header'). */
  header?: string;
  /** The visible label (data-slot='label'). */
  label?: string;
  /** The numeric readout (data-slot='value'). */
  value?: string;
  /** The track (data-slot='track'). */
  track?: string;
  /** The filled bar (data-slot='bar'). */
  bar?: string;
};

type MeterOwnProps = {
  /** Current reading, in the same units as `min`/`max` (clamped into
   * range for both the bar width and `aria-valuenow`). */
  value: number;
  /** Lower bound of the scale. Defaults to 0. */
  min?: number;
  /** Upper bound of the scale. Defaults to 100. */
  max?: number;
  /** Threshold bands coloring the gauge; see {@link MeterThreshold}.
   * Order is irrelevant — bands are resolved by their `at` bound. */
  thresholds?: MeterThreshold[];
  /** Visible label rendered above the gauge and wired to the meter
   * element via `aria-labelledby` (any ReactNode names the meter). */
  label?: ReactNode;
  /** Render the current reading right-aligned in the header row. */
  showValue?: boolean;
  /** Track height; the same three steps as Progress. */
  size?: 'sm' | 'md' | 'lg';
  /** Slot classes (see {@link MeterClassNames}). */
  classNames?: MeterClassNames;
};

type MeterProps = MeterOwnProps & {
  className?: string;
  /** Forwarded to the root element (data-slot='meter'). */
  ref?: Ref<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, keyof MeterOwnProps | 'className' | 'children'>;

/**
 * Resolve the band the value falls into: the highest threshold whose
 * `at` bound the value meets (input order never matters — a sorted
 * scan short-circuits at the first bound above the value).
 */
function resolveTone(
  value: number,
  thresholds: readonly MeterThreshold[],
): MeterTone {
  let tone: MeterTone = 'primary';
  for (const threshold of [...thresholds].sort((a, b) => a.at - b.at)) {
    if (value < threshold.at) break;
    tone = threshold.tone ?? 'primary';
  }
  return tone;
}

/**
 * Read-only semantic gauge (React Aria / HeroUI Meter semantics):
 * a scalar reading on a min–max scale, exposed as `role='meter'` with
 * `aria-valuenow`/`aria-valuemin`/`aria-valuemax`. Unlike Progress
 * (task completion) a Meter is a live measurement — CPU load, storage
 * quota, signal strength — and its `thresholds` bands recolor the
 * gauge as the value crosses each bound.
 *
 * The meter element is the root itself, so a `label` prop wires
 * `aria-labelledby` to the visible label span; without one, pass
 * `aria-label` (or any native naming attribute) straight through the
 * rest props.
 */
export default function Meter({
  value,
  min = 0,
  max = 100,
  thresholds = [],
  label,
  showValue = false,
  size = 'md',
  classNames,
  className,
  ref,
  ...rest
}: MeterProps) {
  const labelId = useId();
  const clamped = Math.min(max, Math.max(min, value));
  const scale = max - min;
  const percent = scale > 0 ? ((clamped - min) / scale) * 100 : 0;
  const tone = resolveTone(clamped, thresholds);
  const hasLabel = label !== undefined && label !== null;

  return (
    <div
      ref={ref}
      role="meter"
      data-slot="meter"
      data-tone={tone}
      aria-valuenow={clamped}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-labelledby={hasLabel ? labelId : undefined}
      x-class={[rootClass, className, classNames?.root]}
      {...rest}
    >
      {(hasLabel || showValue) && (
        <div
          data-slot="header"
          x-class={[headerClass, classNames?.header]}
        >
          {hasLabel && (
            <span
              id={labelId}
              data-slot="label"
              x-class={[labelClass, classNames?.label]}
            >
              {label}
            </span>
          )}
          {showValue && (
            <span
              data-slot="value"
              x-class={[valueClass, classNames?.value]}
            >
              {clamped}
            </span>
          )}
        </div>
      )}
      <div
        data-slot="track"
        data-tone={tone}
        x-class={[trackClass, trackSizes[size], classNames?.track]}
      >
        <div
          data-slot="bar"
          data-tone={tone}
          x-class={[barClass, classNames?.bar]}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export type { MeterClassNames, MeterOwnProps, MeterProps, MeterThreshold, MeterTone };
