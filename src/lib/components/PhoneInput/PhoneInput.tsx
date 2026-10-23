import type { ComponentPropsWithoutRef, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { CountryCode } from 'libphonenumber-js';

import type { SelectOption } from '../Select';

import { useContext, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useControl } from 'react-use-control';
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js';

import InputCore from '../Input/InputCore';
import { VisuallyHidden } from '../VisuallyHidden';
import { LocaleContext } from '../LocaleProvider/LocaleContext';
import { useStrings } from '../LocaleProvider';
import { Select } from '../Select';

import { isValidPhone } from './phone-number';
import { countrySelect, root, row } from './phone-input-styles';

/** E.164 value for typed national digits under the selected country. */
function toE164(display: string, country: CountryCode): string {
  const digits = display.replace(/\D/g, '');
  return digits ? `+${getCountryCallingCode(country)}${digits}` : '';
}

/**
 * The national part shown in the number field: everything after the
 * selected country's dial-code prefix, the parsed national number for
 * values of another country, or — best effort — the value minus a
 * leading '+'.
 */
function nationalPart(value: string, country: CountryCode): string {
  if (!value) return '';
  const prefix = `+${getCountryCallingCode(country)}`;
  if (value === prefix) return '';
  if (value.startsWith(prefix)) return value.slice(prefix.length);
  const parsed = parsePhoneNumberFromString(value);
  return parsed ? parsed.nationalNumber : value.replace(/^\+/, '');
}

/** Region names via one Intl.DisplayNames, ISO codes as fallback. */
function regionNamer(locale: string | undefined) {
  let names: Intl.DisplayNames | undefined;
  try {
    names = new Intl.DisplayNames([locale ?? 'en'], { type: 'region' });
  } catch {
    names = undefined;
  }
  return (code: CountryCode): string => {
    try {
      return names?.of(code) ?? code;
    } catch {
      return code;
    }
  };
}

/** '+86 China' options for the country Select, sorted by region name. */
function buildCountryOptions(
  locale: string | undefined
): SelectOption<CountryCode>[] {
  const nameOf = regionNamer(locale);
  return getCountries()
    .map((code) => ({
      code,
      name: nameOf(code),
      label: `+${getCountryCallingCode(code)} ${nameOf(code)}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale))
    .map(({ code, label }) => ({ value: code, label }));
}

type PhoneInputProps = {
  /**
   * E.164-ish phone value ('+8613800138000' or ''). Typing national
   * digits commits the value with the selected country's dial-code
   * prefix; a pasted international number parses on change and
   * switches the country to its own.
   */
  value?: ControlOrValue<string>;
  /** Selected country (ISO 3166-1 alpha-2); uncontrolled default 'US'. */
  country?: ControlOrValue<CountryCode>;
  /** Fires with the next country whenever the Select (or a parsed
   * international value) changes it. */
  onCountryChange?: (country: CountryCode) => void;
  /** Plain-value channel — the E.164 string, the shape `FormItem`'s
   * `input` binding wires (no native event passthrough: the composite
   * has no single DOM event to forward). */
  onChange?: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Forwarded to the number `<input>` — the element form bridges and
   * `ref.current.focus()` reach. */
  ref?: Ref<HTMLInputElement>;
} & Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'onChange' | 'size'>;

/**
 * International phone input: a country Select joined seamlessly to a
 * number field, backed by `libphonenumber-js`. Country names come from
 * the ambient LocaleProvider locale via `Intl.DisplayNames`; validity
 * is a derived announcement (`aria-invalid` + a screen-reader hint),
 * never leaked state — check it in render with `isValidPhone`.
 */
export default function PhoneInput({
  value: valueControl,
  country: countryControl,
  onCountryChange,
  onChange,
  size,
  className,
  disabled,
  placeholder,
  'aria-describedby': ariaDescribedBy,
  ref,
  ...rest
}: PhoneInputProps) {
  const strings = useStrings('phoneInput');
  const locale = useContext(LocaleContext)?.locale;
  const hintId = useId();

  const [value, setValue] = useControl(valueControl, '');
  const [country, setCountry, countryCtrl] = useControl<CountryCode>(
    countryControl,
    'US'
  );

  // Options are locale-dependent but static per locale — one memo.
  const options = useMemo(() => buildCountryOptions(locale), [locale]);

  // The number field shows the national part; it is internal UI state
  // (never a prop), synced from external value changes only.
  const [display, setDisplay] = useState(() => nationalPart(value, country));
  // The value this component last emitted — its echo back through the
  // control must not clobber what the user is typing.
  const emittedRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (emittedRef.current === value) return;
    emittedRef.current = value;
    const parsed = value ? parsePhoneNumberFromString(value) : undefined;
    if (parsed?.country && parsed.country !== country) {
      setCountry(parsed.country);
      onCountryChange?.(parsed.country);
      setDisplay(parsed.nationalNumber);
      return;
    }
    setDisplay(nationalPart(value, country));
  }, [value, country, setCountry, onCountryChange]);

  const commitValue = (next: string) => {
    emittedRef.current = next;
    setValue(next);
    onChange?.(next);
  };

  const handleCountryChange = (next: CountryCode | CountryCode[]) => {
    const code = Array.isArray(next) ? next[0] : next;
    if (!code || code === country) return;
    setCountry(code);
    onCountryChange?.(code);
    // Re-prefix the typed digits under the new dial code.
    const digits = display.replace(/\D/g, '');
    if (digits) commitValue(`+${getCountryCallingCode(code)}${digits}`);
  };

  const invalid = value !== '' && !isValidPhone(value, country);
  const describedBy =
    [ariaDescribedBy, invalid ? hintId : undefined].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div data-slot='phone-input' x-class={[root, className]}>
      <div data-slot='field' x-class={[row]}>
        <Select
          className={countrySelect}
          value={countryCtrl}
          onValuesChange={handleCountryChange}
          options={options}
          size={size}
          disabled={disabled}
          aria-label={strings.countryLabel}
        />
        <InputCore
          ref={ref}
          value={display}
          onChange={(next) => {
            setDisplay(next);
            commitValue(toE164(next, country));
          }}
          size={size}
          disabled={disabled}
          placeholder={placeholder ?? strings.placeholder}
          inputMode='tel'
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...rest}
        />
      </div>
      {invalid && (
        <VisuallyHidden role='status' id={hintId}>
          {strings.invalid}
        </VisuallyHidden>
      )}
    </div>
  );
}

export type { PhoneInputProps };
