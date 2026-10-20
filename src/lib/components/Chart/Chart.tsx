import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import type {
  ChartSeries,
  ChartTooltipEntry,
  ChartTooltipPayload,
  ChartType,
} from './chart-elements';

import { useMemo } from 'react';

import { css } from '@linaria/core';

import Empty from '../Empty/Empty';
import Spinner from '../Spinner/Spinner';

import {
  chartTree,
  resolveChartSeries,
} from './chart-elements';

type ChartProps<T> = {
  /** Which recharts chart family to render. `pie` maps each datum to one
   * sector named by `xKey` and valued by each series `key`; `radar` maps
   * each datum to one spoke named by `xKey`; `scatter` plots the numeric
   * `xKey` column against each series `key`. In the cartesian families
   * the chart `type` picks the container and the default series shape —
   * override the shape per series via `ChartSeries.type`. */
  type: ChartType;
  /** One datum per point (pie: per sector; radar: per spoke); series
   * values are read by `ChartSeries.key`. */
  data: T[];
  /** The series to plot — colors cycle through the semantic status tokens
   * when `color` is omitted. With `type='pie'` each series is one
   * concentric ring. In cartesian charts (line/area/bar) a per-series
   * `type` overrides that series' shape for composed charts (bars under a
   * line, a line over areas), and series sharing a `stackId` stack
   * (Area/Bar shapes). Both are ignored by pie/radar/scatter. */
  series: ChartSeries[];
  /** Datum field driving the X axis — the cartesian categories, the pie
   * sector names, the radar spoke names, or the numeric scatter X
   * column. */
  xKey: keyof T & string;
  /** Container height in px; the chart stretches to the full width. */
  height?: number;
  /** Pie only: inner radius in px (or a % string) — above 0 renders a
   * donut. Multiple pie series band the radial space evenly; a %
   * `innerRadius` offsets the innermost ring. Default `0`. */
  innerRadius?: number | string;
  /** Cartesian charts only: `vertical` swaps the axes for horizontal
   * bars/lines (ignored by `pie`). Default `'horizontal'`. */
  layout?: 'horizontal' | 'vertical';
  /** Replaces the default recharts tooltip. Receives the hovered label
   * (X value / sector name) plus one entry per series or sector. */
  renderTooltip?: (payload: ChartTooltipPayload<T>) => ReactNode;
  /** Renders a recharts Legend naming each series. Default `false`. */
  showLegend?: boolean;
  /** Renders background grid lines (cartesian and radar charts; ignored
   * by `pie`). Default `true`. */
  showGrid?: boolean;
  /** Renders a hover tooltip. Default `true`. */
  showTooltip?: boolean;
  /** Renders the screen-reader fallback table alongside the graphic —
   * a visually-hidden `<table>` mirroring the plotted data (caption names
   * the chart type and series, headers the `xKey` plus one column per
   * series label). Chart graphics expose nothing but their `aria-label`
   * to assistive tech, so the table is the data channel; keep it on
   * unless the surrounding page already tabulates the same data. Skipped
   * while `loading` or the `empty` state is showing. Default `true`. */
  fallbackTable?: boolean;
  /** Loading state, replacing the chart (and the fallback table): `true`
   * renders the default centered Spinner, any other node your own
   * placeholder. Takes precedence over `empty`. */
  loading?: ReactNode;
  /** Empty state shown when `data` is an empty array: `true` (or omitted)
   * renders the default Empty component, any other node your own
   * placeholder; `false` opts out and renders the (blank) chart. The
   * fallback table is skipped in this state. */
  empty?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

/** Fixed-height container: ResponsiveContainer measures its parent, so the
 * wrapper carries the height while width comes from the layout flow. */
const root = css`
  width: 100%;
`;

/** The chart graphic itself. `role='img'` + `aria-label` make the plot
 * addressable to assistive tech while collapsing its (inherently
 * uninterpretable) SVG noise — the sr-only fallback table is the data
 * channel, rendered as a sibling so `role='img'` cannot swallow it. */
const graphic = css`
  width: 100%;
  height: 100%;
`;

/** Loading/empty placeholder box: fills the fixed-height root and centers
 * its content, so the default Spinner/Empty (or a custom node) keeps the
 * chart's footprint instead of collapsing it. */
const stateBox = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

/* Screen-reader-only wrapper for the fallback table — the same clip-path
 * recipe as VisuallyHidden, on a `div` because `span > table` is invalid
 * HTML nesting (the library's local-sr-only convention, cf. Tabs/Sidebar). */
const visuallyHidden = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
`;

/* The fallback table is clipped away visually, but stays token-styled so a
 * consumer who unwraps it (or reads the DOM) meets the same chrome as the
 * rest of the library. */
const fallbackTableStyle = css`
  border-collapse: collapse;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);

  & caption {
    padding-block-end: var(--haze-space-2);
    font-weight: var(--haze-weight-medium);
    text-align: start;
  }

  & th,
  & td {
    padding: var(--haze-space-1) var(--haze-space-2);
    border: 1px solid var(--haze-color-border);
    text-align: start;
  }
`;

/** Accessible-name prefixes: `ChartType` mapped onto its plain-English
 * description for the graphic's `aria-label` and the table caption. */
const TYPE_LABELS: Record<ChartType, string> = {
  line: 'Line chart',
  area: 'Area chart',
  bar: 'Bar chart',
  pie: 'Pie chart',
  radar: 'Radar chart',
  scatter: 'Scatter chart',
};

/** One fallback-table cell: plotted values are primitives in practice —
 * anything else (objects, `null`/`undefined`) tabulates as blank rather
 * than the string "[object Object]"/"undefined". */
function formatCell(value: unknown): string {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }
  return '';
}

/** Token-driven chart over recharts: line, area, bar, pie, radar or
 * scatter series rendered with haze semantic colors, axis/grid/tooltip/legend chrome
 * toggles, and the default-omittable `series`/`xKey` mapping. Cartesian
 * charts double as composed charts — a per-series `type` mixes line/area/bar
 * shapes inside one chart, and `stackId` stacks the Area/Bar series sharing
 * an id. Accessibility: the graphic is a named `role='img'` (type + series,
 * overridable via `aria-label`) with a screen-reader-only fallback table
 * mirroring the data as its sibling; `loading`/`empty` states replace the
 * plot (Spinner/Empty defaults, node overrides) without disturbing the
 * fixed-height footprint. recharts is a haze-ui dependency — this module's
 * helpers import it statically, so under preserveModules only bundles that
 * actually render Chart include the dependency. */
export default function Chart<T>({
  type,
  data,
  series,
  xKey,
  height = 300,
  innerRadius = 0,
  layout = 'horizontal',
  renderTooltip,
  showLegend = false,
  showGrid = true,
  showTooltip = true,
  fallbackTable = true,
  loading,
  empty,
  'aria-label': ariaLabel,
  className,
  style,
  ...rest
}: ChartProps<T>) {
  const resolvedSeries = useMemo(() => resolveChartSeries(series), [series]);

  /* State priority: loading > empty > chart — a fetching chart must not
   * flash its (stale or blank) plot, and an empty dataset has nothing to
   * plot. Both states also skip the fallback table (there is no data to
   * tabulate). */
  const isLoading = loading !== undefined && loading !== null && loading !== false;
  const isEmpty = !isLoading && data.length === 0 && empty !== false;

  /* Accessible name shared by the graphic (role='img') and the fallback
   * table caption: chart type plus series labels. A consumer-supplied
   * aria-label wins (it is destructured out of `rest`, so it never
   * duplicates onto the root). */
  const typeLabel = TYPE_LABELS[type];
  const seriesList = resolvedSeries.map((entry) => entry.label).join(', ');
  const chartLabel = seriesList ? `${typeLabel}: ${seriesList}` : typeLabel;
  const accessibleLabel = ariaLabel ?? chartLabel;

  return (
    <div
      data-slot='chart'
      x-class={[root, className]}
      style={{ height, ...style }}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <div data-slot='chart-loading' x-class={[stateBox]}>
          {loading === true ? <Spinner /> : loading}
        </div>
      ) : isEmpty ? (
        <div data-slot='chart-empty' x-class={[stateBox]}>
          {empty === undefined || empty === null || empty === true ? (
            <Empty />
          ) : (
            empty
          )}
        </div>
      ) : (
        <>
          <div
            data-slot='chart-graphic'
            role='img'
            aria-label={accessibleLabel}
            x-class={[graphic]}
          >
            {chartTree({
              type,
              data,
              xKey,
              showGrid,
              showTooltip,
              showLegend,
              series: resolvedSeries,
              layout,
              innerRadius,
              renderTooltip: renderTooltip
                ? (payload) => renderTooltip(payload as ChartTooltipPayload<T>)
                : undefined,
            })}
          </div>
          {fallbackTable && (
            <div data-slot='fallback-table' x-class={[visuallyHidden]}>
              <table x-class={[fallbackTableStyle]}>
                <caption>{accessibleLabel}</caption>
                <thead>
                  <tr>
                    <th scope='col'>{xKey}</th>
                    {resolvedSeries.map((entry) => (
                      <th key={entry.key} scope='col'>
                        {entry.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((datum, index) => (
                    <tr key={index}>
                      <th scope='row'>{formatCell(datum[xKey])}</th>
                      {resolvedSeries.map((entry) => (
                        <td key={entry.key}>
                          {formatCell(datum[entry.key as keyof T])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export type {
  ChartProps,
  ChartSeries,
  ChartTooltipEntry,
  ChartTooltipPayload,
  ChartType,
};
