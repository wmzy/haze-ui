/**
 * Pure OKLCH / OKLab color math. Zero dependencies.
 *
 * Conversion matrices and transfer functions follow Björn Ottosson's OKLab
 * reference implementation (https://bottosson.github.io/posts/oklab/):
 * sRGB gamma encode/decode, the linear-RGB→LMS matrix, the cube/cbrt
 * non-linearity, and the LMS'→OKLab matrix (plus its inverse).
 */

export type Oklch = {l: number; c: number; h: number; alpha?: number};

type LinearRgb = {r: number; g: number; b: number};
type Lab = {L: number; a: number; b: number};

const SRGB_LINEAR_CUTOFF = 0.04045;
const LINEAR_SRGB_CUTOFF = 0.0031308;
/** Tolerance used when testing whether a linear-RGB triple is inside the sRGB gamut. */
const GAMUT_EPSILON = 1e-5;

function srgbToLinear(channel: number): number {
  return channel <= SRGB_LINEAR_CUTOFF ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function linearToSrgb(channel: number): number {
  return channel <= LINEAR_SRGB_CUTOFF ? 12.92 * channel : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

function linearRgbToOklab({r, g, b}: LinearRgb): Lab {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

function oklabToLinearRgb({L, a, b}: Lab): LinearRgb {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

function lchToLab({l, c, h}: Oklch): Lab {
  const hue = (h * Math.PI) / 180;
  return {L: l, a: c * Math.cos(hue), b: c * Math.sin(hue)};
}

function labToLch({L, a, b}: Lab): Oklch {
  const hue = (Math.atan2(b, a) * 180) / Math.PI;
  return {l: L, c: Math.sqrt(a * a + b * b), h: hue < 0 ? hue + 360 : hue};
}

function inGamut(rgb: LinearRgb): boolean {
  return (
    rgb.r >= -GAMUT_EPSILON && rgb.r <= 1 + GAMUT_EPSILON &&
    rgb.g >= -GAMUT_EPSILON && rgb.g <= 1 + GAMUT_EPSILON &&
    rgb.b >= -GAMUT_EPSILON && rgb.b <= 1 + GAMUT_EPSILON
  );
}

/** Convert to linear sRGB, gamut-clamped via chroma reduction. */
function clampToGamut(color: Oklch): LinearRgb {
  return oklabToLinearRgb(lchToLab(clampChroma(color)));
}

/**
 * Reduce chroma until the color fits the sRGB gamut, preserving lightness and
 * hue exactly (unlike an 8-bit hex round-trip, which quantizes all channels).
 */
export function clampChroma(color: Oklch): Oklch {
  const l = Math.min(1, Math.max(0, color.l));
  const hue = (color.h * Math.PI) / 180;
  let low = 0;
  let high = Math.max(color.c, 0);
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    if (inGamut(oklabToLinearRgb({L: l, a: mid * Math.cos(hue), b: mid * Math.sin(hue)}))) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return color.alpha === undefined ? {l, c: low, h: color.h} : {l, c: low, h: color.h, alpha: color.alpha};
}

function channelToHex(channel: number): string {
  const value = Math.round(Math.min(1, Math.max(0, channel)) * 255);
  return value.toString(16).padStart(2, '0');
}

/** Parse `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` into OKLCH. */
export function parseHex(hex: string): Oklch {
  const match = /^#([0-9a-f]{3,8})$/i.exec(hex.trim());
  const digits = match?.[1];
  if (digits === undefined || (digits.length !== 3 && digits.length !== 4 && digits.length !== 6 && digits.length !== 8)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const expanded = digits.length === 3 || digits.length === 4
    ? digits.split('').map((d) => d + d).join('')
    : digits;
  const alpha = expanded.length === 8 ? parseInt(expanded.slice(6, 8), 16) / 255 : undefined;
  const lab = linearRgbToOklab({
    r: srgbToLinear(parseInt(expanded.slice(0, 2), 16) / 255),
    g: srgbToLinear(parseInt(expanded.slice(2, 4), 16) / 255),
    b: srgbToLinear(parseInt(expanded.slice(4, 6), 16) / 255),
  });
  const lch = labToLch(lab);
  return alpha === undefined ? lch : {...lch, alpha};
}

/**
 * Parse an `oklch(l c h)` or `oklch(l c h / a)` string. Lightness/chroma may
 * be given as percentages (`62.8%`), hue as degrees (`30deg`); the `none`
 * keyword is accepted for any channel.
 */
export function parseOklch(input: string): Oklch {
  const match = /^oklch\(\s*(none|[+-]?[\d.]+%?)\s+(none|[+-]?[\d.]+%?)\s+(none|[+-]?[\d.]+(?:deg)?)\s*(?:\/\s*(none|[+-]?[\d.]+%?)\s*)?\)$/i.exec(input.trim());
  if (!match) {
    throw new Error(`Invalid oklch color: ${input}`);
  }
  const toNumber = (raw: string | undefined, scale = 1): number => {
    if (raw === undefined || raw.toLowerCase() === 'none') return 0;
    return raw.endsWith('%') ? (parseFloat(raw) / 100) * scale : parseFloat(raw);
  };
  const l = Math.min(1, Math.max(0, toNumber(match[1])));
  const c = Math.max(0, toNumber(match[2]));
  const h = ((toNumber(match[3]) % 360) + 360) % 360;
  const alphaMatch = match[4];
  return alphaMatch === undefined ? {l, c, h} : {l, c, h, alpha: Math.min(1, Math.max(0, toNumber(alphaMatch)))};
}

/** Convert OKLCH to an sRGB hex string, gamut-clamped via chroma reduction. */
export function oklchToHex(color: Oklch): string {
  const rgb = clampToGamut(color);
  const hex = `#${channelToHex(linearToSrgb(rgb.r))}${channelToHex(linearToSrgb(rgb.g))}${channelToHex(linearToSrgb(rgb.b))}`;
  return color.alpha === undefined ? hex : hex + channelToHex(color.alpha);
}

/** Format as a CSS `oklch()` string: l/c to 3 decimals, h to 1 decimal. */
export function formatOklch(color: Oklch): string {
  const channels = `${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(1)}`;
  return color.alpha === undefined ? `oklch(${channels})` : `oklch(${channels} / ${color.alpha.toFixed(3)})`;
}

/** WCAG 2.x contrast ratio via sRGB relative luminance. */
export function wcagContrast(a: Oklch, b: Oklch): number {
  const luminance = (color: Oklch): number => {
    const {r, g, b: blue} = oklabToLinearRgb(lchToLab(color));
    return 0.2126 * r + 0.7152 * g + 0.0722 * blue;
  };
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Perceptual distance: Euclidean distance in OKLab space. */
export function deltaE(a: Oklch, b: Oklch): number {
  const labA = lchToLab(a);
  const labB = lchToLab(b);
  return Math.sqrt((labA.L - labB.L) ** 2 + (labA.a - labB.a) ** 2 + (labA.b - labB.b) ** 2);
}
