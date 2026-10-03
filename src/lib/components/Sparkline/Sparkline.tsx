import type { ComponentPropsWithoutRef } from 'react';

// sibling module (not `styles.ts`) — Linaria derives dev class names from
// the file basename, and a shared `styles` basename collides with
// Button/styles.ts (identical `haze-styles__*` selectors cross-wire the
// two components' rules in dev AND collide in dist css)
import { base, toneFills, toneStrokes } from './sparkline-styles';

/**
 * Sparkline — a stateless inline-SVG mini trend chart (no recharts, no
 * hooks, RSC-safe). Point coordinates are normalized into a square
 * `0 0 100 100` viewBox stretched by `preserveAspectRatio="none"`, so
 * `width`/`height` size the rendered box freely without touching geometry;
 * `vector-effect="non-scaling-stroke"` keeps the 2px stroke crisp under
 * that non-uniform stretch.
 *
 * Accessibility contract: a sparkline is decorative by default — it
 * renders `aria-hidden="true"` and no role. Naming it (`aria-label` or
 * `aria-labelledby`) switches it to `role="img"` carrying that name (a
 * name makes the image addressable; no name keeps it out of the tree
 * entirely, which axe requires of every meaningful image). Every other
 * native `<svg>` attribute is forwarded via `...rest`.
 */
type SparklineProps = {
  /** Y values to plot, in series order; at least two points draw a path. */
  data: readonly number[];
  /** Rendered box width in px (geometry stays viewBox-normalized). */
  width?: number;
  /** Rendered box height in px. */
  height?: number;
  /** `area` adds a translucent token fill under the line. */
  variant?: 'line' | 'area';
  /** Semantic stroke color for the trend. */
  tone?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
  // `children` is omitted on purpose: the paths are the component, foreign
  // SVG children would fight the normalized geometry.
} & Omit<ComponentPropsWithoutRef<'svg'>, 'children'>;

/** Square viewBox both axes are normalized into. */
const VIEW = 100;
/** Vertical inset so the stroke band never kisses the viewBox edge. */
const Y_PAD = 8;
const MIN_POINTS = 2;

/**
 * Polyline `d`: x spread across the full viewBox, y mapped onto the padded
 * band [Y_PAD, VIEW - Y_PAD]. Flat series (min === max) render as a
 * midline instead of a degenerate NaN ramp.
 */
function buildLinePath(data: readonly number[]): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min;
  const last = data.length - 1;
  return data
    .map((value, index) => {
      const x = (index / last) * VIEW;
      const y =
        span === 0
          ? VIEW / 2
          : VIEW - Y_PAD - ((value - min) / span) * (VIEW - Y_PAD * 2);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

/** Area `d`: the line closed down to the viewBox bottom edge. */
function buildAreaPath(linePath: string): string {
  const bottom = VIEW.toFixed(2);
  return `${linePath} L${bottom} ${bottom} L0.00 ${bottom} Z`;
}

export default function Sparkline({
  data,
  width = 96,
  height = 28,
  variant = 'line',
  tone = 'primary',
  className,
  ...rest
}: SparklineProps) {
  // A sparkline is "named" via aria-label or aria-labelledby — either
  // makes it a meaningful image; otherwise it stays decorative and
  // aria-hidden erases it from the accessibility tree.
  const label = rest['aria-label'];
  const labelledBy = rest['aria-labelledby'];
  const labeled =
    (typeof label === 'string' && label.length > 0) ||
    (typeof labelledBy === 'string' && labelledBy.length > 0);
  const hasPlot = data.length >= MIN_POINTS;
  const linePath = hasPlot ? buildLinePath(data) : '';

  return (
    <svg
      {...rest}
      data-slot='sparkline'
      x-class={[base, className]}
      width={width}
      height={height}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      preserveAspectRatio='none'
      role={labeled ? 'img' : rest.role}
      aria-hidden={labeled ? undefined : true}
    >
      {hasPlot && variant === 'area' && (
        <path d={buildAreaPath(linePath)} x-class={[toneFills[tone]]} stroke='none' />
      )}
      {hasPlot && (
        <path
          d={linePath}
          x-class={[toneStrokes[tone]]}
          fill='none'
          stroke-width='2'
          stroke-linecap='round'
          stroke-linejoin='round'
          vector-effect='non-scaling-stroke'
        />
      )}
    </svg>
  );
}

export type { SparklineProps };
