import {
  type StatusColor,
  statusLiveRoles,
  statusSubtleColors,
} from './status-skin';
import { statusSolidColors } from './status-solid-skin';
import { statusStrokeColors } from './status-stroke-skin';

const STATUS_COLORS = [
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
] as const satisfies readonly StatusColor[];

describe('status skin maps', () => {
  it('keys every map with the full semantic axis', () => {
    // One css map per module (status-skin / status-solid-skin /
    // status-stroke-skin): same-keyed maps in one module collide under
    // Linaria's member-key class naming and the emitted css silently
    // keeps a single rule per name — the wave-5 incident this split
    // fixed. Assert the axis stays complete in each sibling.
    for (const map of [statusSubtleColors, statusSolidColors, statusStrokeColors]) {
      expect(Object.keys(map)).toEqual([...STATUS_COLORS]);
    }
  });

  it('yields a Linaria class per entry', () => {
    for (const map of [statusSubtleColors, statusSolidColors, statusStrokeColors]) {
      for (const cls of Object.values(map)) {
        expect(typeof cls).toBe('string');
        expect(cls).toBeTruthy();
      }
    }
  });

  it('gives the sibling maps distinct class display names (collision guard)', () => {
    // Two maps sharing a key MUST NOT share a class string — that is
    // exactly the pre-split collision where one rule overwrote the
    // other at extraction time.
    for (const color of STATUS_COLORS) {
      const classes = new Set([
        statusSubtleColors[color],
        statusSolidColors[color],
        statusStrokeColors[color],
      ]);
      expect(classes.size).toBe(3);
    }
  });

  it('maps danger to the assertive alert role, everything else to polite status', () => {
    expect(Object.keys(statusLiveRoles)).toEqual([...STATUS_COLORS]);
    expect(statusLiveRoles.danger).toBe('alert');
    for (const color of STATUS_COLORS.filter((c) => c !== 'danger')) {
      expect(statusLiveRoles[color]).toBe('status');
    }
  });
});
