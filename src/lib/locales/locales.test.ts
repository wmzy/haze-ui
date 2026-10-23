import type { HazeStrings, LocaleProviderProps } from './index';

import * as localeProvider from '../components/LocaleProvider';

import * as localePacks from './index';

// Computed access on a namespace import cannot be statically validated
// (import-x/namespace) — mirror it into a plain record first.
const packsRecord = localePacks as unknown as Record<string, unknown>;
const providerRecord =
  localeProvider as unknown as Record<string, unknown>;

const PACKS = [
  'enUS',
  'zhCN',
  'jaJP',
  'deDE',
  'frFR',
  'esES',
  'itIT',
  'ptBR',
  'ruRU',
  'koKR',
  'arSA',
] as const;

const VALUE_EXPORTS = [...PACKS, 'createStrings', 'defaultStrings'] as const;

describe('haze-ui/locales subpath', () => {
  it('re-exports every pack and helper by reference from the LocaleProvider module', () => {
    const drifted = VALUE_EXPORTS.filter(
      (name) => packsRecord[name] !== providerRecord[name]
    );
    expect(drifted).toEqual([]);
  });

  it('enUS aliases defaultStrings (the documented pack identity)', () => {
    expect(localePacks.enUS).toBe(localePacks.defaultStrings);
  });

  it('exports exactly the pack surface — no component or hook leaks in', () => {
    expect(Object.keys(localePacks).sort()).toEqual(
      [...VALUE_EXPORTS].sort()
    );
  });

  it('exposes the HazeStrings and LocaleProviderProps types (compile-time surface)', () => {
    const strings: HazeStrings = localePacks.defaultStrings;
    const props: LocaleProviderProps = { strings, children: null };
    expect(props.strings).toBe(localePacks.enUS);
  });
});
