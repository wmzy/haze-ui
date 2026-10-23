/**
 * `haze-ui/locales` — the LocaleProvider string packs standalone, without
 * the component tree: every built-in pack (`enUS` — the same object as
 * `defaultStrings` — plus `zhCN`, `jaJP`, `deDE`, `frFR`, `esES`, `itIT`,
 * `ptBR`, `ruRU`, `koKR`, `arSA`), `defaultStrings` itself, the
 * `createStrings(base, overrides)` pack deriver and the `HazeStrings` /
 * `LocaleProviderProps` types. For bundle-splitting a single pack or
 * type-checking a custom one — `LocaleProvider` and `useStrings` stay on
 * the main `haze-ui` entry.
 *
 * The re-exports point at the pack modules directly, never the
 * LocaleProvider barrel, so importing `haze-ui/locales` never pulls the
 * React component into the chunk graph.
 *
 * Stable public API: this module carries the same semver commitment as
 * the `haze-ui` component library — breaking changes land only on a
 * major version.
 */

export { defaultStrings, enUS } from '../components/LocaleProvider/locale';
export { zhCN } from '../components/LocaleProvider/zh-cn';
export { jaJP } from '../components/LocaleProvider/ja-jp';
export { deDE } from '../components/LocaleProvider/de-de';
export { frFR } from '../components/LocaleProvider/fr-fr';
export { esES } from '../components/LocaleProvider/es-es';
export { itIT } from '../components/LocaleProvider/it-it';
export { ptBR } from '../components/LocaleProvider/pt-br';
export { ruRU } from '../components/LocaleProvider/ru-ru';
export { koKR } from '../components/LocaleProvider/ko-kr';
export { arSA } from '../components/LocaleProvider/ar-sa';
export { createStrings } from '../components/LocaleProvider/strings';
export type { HazeStrings } from '../components/LocaleProvider/locale';
export type { LocaleProviderProps } from '../components/LocaleProvider/LocaleProvider';
