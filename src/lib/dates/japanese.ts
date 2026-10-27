/**
 * Japanese imperial-calendar adapter. ICU's `japanese` calendar is the
 * Gregorian calendar with era-relative year display: month lengths,
 * leap years, and weekday math are structurally identical to gregory,
 * and only the year's *label* segments at imperial accessions (Reiwa 8
 * = 2026 CE). The adapter therefore keeps the year field at its plain
 * Gregorian numeric value (the offset-zero instance of
 * `makeGregorianLikeAdapter`) — era segmentation is a formatting
 * concern delegated to Intl's era piece, sampled on June 1 of the year
 * (after the May 1/January 8 accessions of the modern eras) — so month
 * arithmetic, grid math, and Date round-trips stay monotonic and
 * hazard-free.
 */
import type { HazeDateAdapter } from './adapter';

import { makeGregorianLikeAdapter } from './adapter';

/** June 1 — the era-sampling date: every modern accession (Meiji
 * September 1868 by proclamation, Taishō July 30 1912, Shōwa December
 * 25 1926, Heisei January 8 1989, Reiwa May 1 2019) precedes it except
 * Taishō's, so `era(1912)` reports Meiji — the era in force for most
 * of that civil year. */
const ERA_SAMPLE_MONTH = 5;
const ERA_SAMPLE_DAY = 1;

export const japaneseAdapter: HazeDateAdapter = makeGregorianLikeAdapter(
  'japanese',
  'japanese',
  0,
  { month: ERA_SAMPLE_MONTH, day: ERA_SAMPLE_DAY }
);
