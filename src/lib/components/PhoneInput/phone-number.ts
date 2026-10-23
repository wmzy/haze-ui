import type { CountryCode } from 'libphonenumber-js';

import { isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Pure validity check for an E.164-ish value: `true` only when
 * libphonenumber can parse it as a complete, valid number. A country
 * makes national-format values ('13800138000') resolvable; values that
 * carry their own '+cc' prefix validate against themselves. Empty is
 * not valid.
 */
export function isValidPhone(value: string, country?: CountryCode): boolean {
  if (!value) return false;
  return isValidPhoneNumber(value, country);
}
