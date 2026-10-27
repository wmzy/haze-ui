/**
 * Pure linear-gradient value model for the ColorPicker family: a
 * tolerant parser of CSS `linear-gradient()` strings, canonical
 * serialization, and the preset-entry union the sugar layer accepts.
 *
 * Mirrors `color-math.ts`'s contract — byte-stable round trips through
 * canonical forms, invalid input is `null` (never throws) so the
 * component treats it as "not a gradient" and falls back to the solid
 * path. Only `linear-gradient()` is the subject matter; radial/conic/
 * repeating variants return `null`.
 */

import type { Rgb } from './color-math';

import { clamp } from '../../utils/math';

import { formatColor, parseColor, rgbHexKey } from './color-math';

/** One gradient stop: a canonical CSS color string and its position on the 0..100% scale. */
export type GradientStop = { color: string; position: number };

/** A parsed linear gradient: angle in degrees (0..360) and 2+ stops sorted by position. */
export type Gradient = { angle: number; stops: GradientStop[] };

/**
 * One `presets` entry: a plain color string (the original flat-list
 * shape), a labeled group of solid colors, or a single gradient
 * (rendered as a preview bar of the actual gradient).
 */
export type ColorPickerPreset =
  | string
  | { label?: string; colors: string[] }
  | { label?: string; gradient: string };

/** Numbers serialize without floating-point noise: 2 decimals max, trailing zeros trimmed. */
function fmtNum(value: number): string {
  return String(Math.round(value * 100) / 100);
}

/**
 * Splits a function argument list on top-level commas — `rgba(1, 2, 3,
 * 0.5) 50%` stays one argument. Returns `null` on unbalanced parens or
 * empty segments.
 */
function splitArgs(input: string): string[] | null {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of input) {
    if (ch === '(') depth += 1;
    else if (ch === ')') {
      depth -= 1;
      if (depth < 0) return null;
    } else if (ch === ',' && depth === 0) {
      if (current.trim() === '') return null;
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  if (depth !== 0 || current.trim() === '') return null;
  parts.push(current.trim());
  return parts;
}

const ANGLE_DEG_RE = /^(-?\d*\.?\d+)(deg)?$/;
const TO_KEYWORDS_RE = /^to\s+(top|bottom|right|left)(?:\s+(top|bottom|right|left))?$/;

/**
 * The leading angle argument: `<number>deg` (a bare number is treated
 * as degrees) or `to <side> [<side>]` keywords per the CSS math (`to
 * top` = 0deg, clockwise) — or `null` when the argument is a color
 * stop (the angle was omitted).
 */
function parseAngleArg(arg: string): number | null {
  const deg = ANGLE_DEG_RE.exec(arg);
  if (deg) return Number(deg[1]);

  const keywords = TO_KEYWORDS_RE.exec(arg);
  if (keywords) {
    const dx = keywords.includes('right') ? 1 : keywords.includes('left') ? -1 : 0;
    const dy = keywords.includes('bottom') ? 1 : keywords.includes('top') ? -1 : 0;
    if (dx !== 0 || dy !== 0) {
      // atan2(dx, -dy): `to top` → 0, `to right` → 90, `to bottom right` → 135.
      return (Math.atan2(dx, -dy) * 180) / Math.PI;
    }
  }
  return null;
}

/** A stop argument: `<color> [<position>%]?` — the position may be absent. */
const STOP_RE = /^(.+?)\s+(-?\d*\.?\d+)\s*%?$/;

function parseStopArg(arg: string): { color: Rgb; position: number | null } | null {
  const match = STOP_RE.exec(arg);
  const [colorPart, positionPart] =
    match === null ? [arg, null] : [match[1] ?? '', Number(match[2])];
  const parsed = parseColor(colorPart);
  if (!parsed) return null;
  return {
    color: parsed.rgb,
    position: positionPart === null || !Number.isFinite(positionPart) ? null : positionPart,
  };
}

/**
 * Fills omitted stop positions the CSS way: the first stop defaults to
 * 0%, the last to 100%, and stops between two positioned neighbors
 * interpolate evenly between them.
 */
function fillMissingPositions(positions: (number | null)[]): number[] {
  const n = positions.length;
  if (n <= 1) return positions.map((p) => p ?? 0);
  const resolved = [...positions];
  if (resolved[0] === null) resolved[0] = 0;
  if (resolved[n - 1] === null) resolved[n - 1] = 100;
  let start = 0;
  while (start < n) {
    if (resolved[start] !== null) {
      start += 1;
      continue;
    }
    let end = start;
    while (resolved[end] === null) end += 1;
    const from = resolved[start - 1] ?? 0;
    const to = resolved[end] ?? 100;
    for (let k = start; k < end; k++) {
      resolved[k] = from + ((to - from) * (k - start + 1)) / (end - start + 1);
    }
    start = end;
  }
  return resolved as number[];
}

/**
 * Canonical form: angle modulo 360, positions clamped to 0..100, stops
 * sorted by position (stable), and consecutive stops sharing a
 * position AND a color collapsed — distinct colors at one position
 * survive (the CSS hard-stop technique).
 */
export function normalizeGradient(gradient: Gradient): Gradient {
  const stops = gradient.stops
    .map((stop) => ({ color: stop.color, position: clamp(stop.position, 0, 100) }))
    .sort((a, b) => a.position - b.position);
  const deduped = stops.filter(
    (stop, index) =>
      index === 0 ||
      stop.position !== stops[index - 1]?.position ||
      rgbHexKey(parseColor(stop.color)?.rgb ?? {r: 0, g: 0, b: 0}) !==
        rgbHexKey(parseColor(stops[index - 1]?.color ?? '')?.rgb ?? {r: 0, g: 0, b: 0})
  );
  return {
    angle: (((gradient.angle % 360) + 360) % 360),
    stops: deduped,
  };
}

/**
 * Parses a CSS `linear-gradient()` string into the value model:
 * `Ndeg` / `to`-keyword angles (default 180deg, the CSS `to bottom`),
 * colors in any format `parseColor` accepts, positions as percentages
 * (omitted positions follow the CSS distribution rules). Stop colors
 * canonicalize to hex (`#rrggbb` / `#rrggbbaa`), the angle to 0..360,
 * stops sort by position. Returns `null` for anything that is not a
 * 2+ stop linear gradient — the solid-color path handles those.
 */
export function parseGradient(input: string): Gradient | null {
  const raw = input.trim();
  const wrapper = /^linear-gradient\((.*)\)$/i.exec(raw);
  if (!wrapper) return null;
  const args = splitArgs(wrapper[1] ?? '');
  if (args === null || args.length < 2) return null;

  // The angle may be omitted entirely (then every argument is a stop).
  const firstAngle = parseAngleArg(args[0] ?? '');
  const angle = firstAngle === null ? 180 : firstAngle;
  const stopArgs = firstAngle === null ? args : args.slice(1);

  const parsedStops = stopArgs
    .map((arg) => parseStopArg(arg))
    .filter((stop): stop is { color: Rgb; position: number | null } => stop !== null);
  if (parsedStops.length < 2) return null;

  const positions = fillMissingPositions(parsedStops.map((stop) => stop.position));
  return normalizeGradient({
    angle,
    stops: parsedStops.map((stop, index) => ({
      color: formatColor(stop.color, 'hex', true),
      position: positions[index] ?? 0,
    })),
  });
}

/**
 * Serializes to the canonical CSS string —
 * `linear-gradient(90deg, #667eea 0%, #764ba2 100%)`. The input is
 * normalized first (clamped, sorted, deduplicated), so the output of a
 * round trip is byte-identical.
 */
export function serializeGradient(gradient: Gradient): string {
  const normalized = normalizeGradient(gradient);
  const stops = normalized.stops
    .map((stop) => `${stop.color} ${fmtNum(stop.position)}%`)
    .join(', ');
  return `linear-gradient(${fmtNum(normalized.angle)}deg, ${stops})`;
}

/**
 * The gradient a solid color opens into when the mode toggles: a
 * 90deg two-stop run from the color to white (functional color values
 * — the component's subject matter, like the hue spectrum).
 */
export function gradientFromColor(rgb: Rgb): Gradient {
  return {
    angle: 90,
    stops: [
      { color: formatColor(rgb, 'hex', true), position: 0 },
      { color: '#ffffff', position: 100 },
    ],
  };
}
