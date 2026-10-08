import type { ComponentPropsWithoutRef } from 'react';

type NumberFormatterProps = {
  /** The numeric value to render. */
  value: number;
  /** Intl.NumberFormat options minus locale — the locale is taken from
   * the LocaleProvider (falls back to the document locale). */
  formatOptions?: Intl.NumberFormatOptions;
  /** Explicit locale override (defaults to the LocaleProvider locale). */
  locale?: string;
  /** Text prepended/appended outside the formatted number. */
  prefix?: string;
  suffix?: string;
} & Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'prefix'>;

/**
 * Presentational number formatting — a thin, token-free numeric text
 * node driven by Intl. Stat's display value is the styled display
 * surface; this is the formatter for inline text ("共 12,345 条").
 */
export default function NumberFormatter({
  value,
  formatOptions,
  locale,
  prefix,
  suffix,
  ...rest
}: NumberFormatterProps) {
  // Intl.NumberFormat is fully SSR-stable for a given locale+options; a
  // missing locale falls back to the runtime default so SSR output
  // matches the client's first render locale.
  const text = new Intl.NumberFormat(locale, formatOptions).format(value);
  return (
    <span data-slot='number-formatter' {...rest}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}

export type { NumberFormatterProps };
