/**
 * Multi-calendar date adapters — a standalone published surface, not
 * wired into any component yet: Calendar renders Gregorian only. A
 * future Calendar `calendar` prop is the planned consumer of
 * `getAdapter`; until then import adapters directly from
 * 'haze-ui/dates'.
 */
export { gregoryAdapter } from './gregory';
export { islamicUmalquraAdapter } from './islamic';
export { persianAdapter } from './persian';
export { hebrewAdapter } from './hebrew';
export { japaneseAdapter } from './japanese';
export { buddhistAdapter } from './buddhist';
export { ethiopicAdapter } from './ethiopic';
export { getAdapter } from './registry';
export type {
  CivilDateParts,
  HazeDateAdapter,
  HazeCalendarIdentifier,
  MonthNameStyle,
} from './adapter';
export { formatInTimeZone, getZonedParts } from './timezone';
export type { ZonedParts } from './timezone';
