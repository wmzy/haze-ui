import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { useEffect, useRef, useState } from 'react';
import { css } from '@linaria/core';

import { pad2 } from '../../utils/time-math';

/** Decomposed remaining time handed to `format`/`render`. */
type CountdownParts = {
  /** Whole seconds left — `ceil` of the exact milliseconds so every
   * displayed second is a full second and the display lands on 0 exactly
   * at the deadline. */
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Deadline reached — parts are all zero and the clock has stopped. */
  finished: boolean;
};

type CountdownProps = {
  /** Deadline: epoch milliseconds or a `Date`. Changing it re-aims the
   * clock (and re-arms a spent `onFinish`). */
  value: number | Date;
  /** Fires exactly once when the deadline is reached. */
  onFinish?: () => void;
  /** Parts → display string. Default: adaptive — `1d 02:03:04` past a
   * day, `02:03:04` under it. */
  format?: (parts: CountdownParts) => string;
  /** Parts → arbitrary node — the render escape hatch next to `format`
   * for non-string output. */
  render?: (parts: CountdownParts) => ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'span'>, 'children'>;

/* Same rationale as CountUp: tabular-nums keeps the per-second ticks
 * width-stable, and size/color inherit so Countdown slots into Stat-like
 * contexts unchanged. */
const base = css`
  font-variant-numeric: tabular-nums;
  font-family: var(--haze-font-sans);
  font-size: inherit;
  color: inherit;
`;

function defaultFormat({ days, hours, minutes, seconds }: CountdownParts): string {
  const clock = `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  return days > 0 ? `${days}d ${clock}` : clock;
}

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;

/* Accessible name: the full remaining time in words at the same
 * granularity as the visible adaptive format (no "0 days" noise). */
function describeParts({ days, hours, minutes, seconds }: CountdownParts): string {
  const units: string[] = [];
  if (days > 0) units.push(plural(days, 'day'));
  if (days > 0 || hours > 0) units.push(plural(hours, 'hour'));
  units.push(plural(minutes, 'minute'), plural(seconds, 'second'));
  return `${units.join(', ')} remaining`;
}

export default function Countdown({
  value,
  onFinish,
  format,
  render,
  className,
  ...rest
}: CountdownProps) {
  const deadline = typeof value === 'number' ? value : value.getTime();
  // Wall-clock snapshot. Each tick re-reads Date.now() and schedules the
  // next wake on the deadline's second boundary — a setTimeout chain, so
  // no interval drift accumulates.
  const [now, setNow] = useState(() => Date.now());
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const remaining = deadline - now;
    if (remaining <= 0) {
      // Expired: clamp the display to zero and fire exactly once per
      // deadline — a fresh future `value` re-arms via the reset below.
      if (!finishedRef.current) {
        finishedRef.current = true;
        setNow(deadline);
        onFinishRef.current?.();
      }
      return;
    }
    finishedRef.current = false;
    // Wake exactly on the next second boundary of the deadline (500ms
    // left in a partial second → 500ms delay), not on a free-running
    // 1s interval.
    const ms = remaining % 1000;
    const timer = setTimeout(() => setNow(Date.now()), ms === 0 ? 1000 : ms);
    return () => clearTimeout(timer);
  }, [deadline, now]);

  const remaining = Math.max(0, deadline - now);
  const totalSeconds = Math.ceil(remaining / 1000);
  const parts: CountdownParts = {
    totalSeconds,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    finished: remaining === 0,
  };
  const label = format ? format(parts) : describeParts(parts);

  return (
    <span
      data-slot='countdown'
      aria-label={label}
      x-class={[base, className]}
      {...rest}
    >
      {render ? render(parts) : format ? format(parts) : defaultFormat(parts)}
    </span>
  );
}

export type { CountdownProps, CountdownParts };
