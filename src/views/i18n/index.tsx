/* eslint-disable react-refresh/only-export-components */
/*
 * Docs-site locale layer: a client-side language switch with no routing
 * involvement (URLs stay locale-agnostic English slugs).
 *
 * Resolution order for the initial locale:
 *   1. localStorage('haze-docs-lang') — the user's last explicit choice;
 *   2. navigator.language starting with zh/ja/de/fr — browser preference;
 *   3. 'en' — the source dictionary, always complete.
 *
 * The active dictionary `t` is `en` deep-merged with the locale overrides,
 * so any key the locale file has not translated yet renders the English
 * fallback — the dictionary is incrementally expandable by design. Switching
 * persists the choice and syncs document.documentElement.lang for assistive
 * tech.
 *
 * Components under test (and any stray consumer outside the provider)
 * get a working English fallback instead of a throw: several suites
 * render Home / CommandPalette standalone (Home.test.tsx,
 * CommandPalette.test.tsx).
 */

import type { ReactNode } from 'react';
import type { RichText } from './en';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { de } from './de';
import { en } from './en';
import { fr } from './fr';
import { ja } from './ja';
import { zh } from './zh';

export type SiteLocale = 'en' | 'zh' | 'ja' | 'de' | 'fr';

/** Every locale the site offers; keep in sync with DICTS/SiteLocale. */
export const SITE_LOCALES = [
  'en',
  'zh',
  'ja',
  'de',
  'fr',
] as const satisfies readonly SiteLocale[];

/** Narrow an untrusted value (storage, switcher event) to a SiteLocale. */
export function isSiteLocale(value: unknown): value is SiteLocale {
  return (
    typeof value === 'string' &&
    (SITE_LOCALES as readonly string[]).includes(value)
  );
}

export const LOCALE_STORAGE_KEY = 'haze-docs-lang';

export type SiteLocaleValue = {
  locale: SiteLocale;
  setLocale: (locale: SiteLocale) => void;
  /** Merged dictionary: locale overrides on top of the complete en base. */
  t: typeof en;
};

/** Locale dictionaries allowed by the provider; keep in sync with SiteLocale. */
const DICTS: Partial<Record<SiteLocale, Record<string, unknown>>> = {
  zh,
  ja,
  de,
  fr,
};

/* <html lang> per locale; only zh needs a region tag (site copy is
 * Simplified Chinese, not zh-TW etc.). */
const HTML_LANG: Record<SiteLocale, string> = {
  en: 'en',
  zh: 'zh-CN',
  ja: 'ja',
  de: 'de',
  fr: 'fr',
};

/** navigator.language prefix → locale, checked in order (en needs none). */
const BROWSER_PREFIXES: readonly (readonly [string, SiteLocale])[] = [
  ['zh', 'zh'],
  ['ja', 'ja'],
  ['de', 'de'],
  ['fr', 'fr'],
];

/** Resolve the initial locale (storage > browser language > en). */
export function resolveInitialLocale(): SiteLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isSiteLocale(stored)) return stored;
  } catch {
    /* storage unavailable (privacy mode / SSR) */
  }
  if (typeof navigator !== 'undefined') {
    const language = navigator.language.toLowerCase();
    for (const [prefix, locale] of BROWSER_PREFIXES) {
      if (language.startsWith(prefix)) return locale;
    }
  }
  return 'en';
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Deep-merge an override dictionary onto the en base (maps merge, leaves replace). */
export function mergeStrings<T>(base: T, override: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    const baseValue = out[key];
    if (isPlainObject(value) && isPlainObject(baseValue)) {
      out[key] = mergeStrings(baseValue, value);
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

const SiteLocaleContext = createContext<SiteLocaleValue | null>(null);

export function SiteLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SiteLocale>(resolveInitialLocale);

  const setLocale = useCallback((next: SiteLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* storage unavailable — keep the in-memory switch working */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  const t = useMemo(() => {
    const dict = DICTS[locale];
    return dict ? mergeStrings(en, dict) : en;
  }, [locale]);

  const value = useMemo<SiteLocaleValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <SiteLocaleContext.Provider value={value}>
      {children}
    </SiteLocaleContext.Provider>
  );
}

/** Standalone English fallback so provider-less renders (tests) keep working. */
const fallbackValue: SiteLocaleValue = {
  locale: 'en',
  setLocale: () => undefined,
  t: en,
};

export function useSiteLocale(): SiteLocaleValue {
  return useContext(SiteLocaleContext) ?? fallbackValue;
}

/**
 * Expand `{placeholder}` tokens in a dictionary string. Unknown tokens are
 * left verbatim so a missing value is visible instead of silently dropped.
 */
export function fill(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (token, key: string) => {
    const value = values[key];
    return value === undefined ? token : String(value);
  });
}

/** Render a RichText paragraph: strings pass through, code/strong/em/link get tags. */
export function Rich({
  text,
  codeClass,
}: {
  text: RichText;
  codeClass?: string;
}) {
  return (
    <>
      {text.map((seg, i) => {
        if (typeof seg === 'string') return seg;
        if ('code' in seg) {
          return (
            <code key={i} className={codeClass}>
              {seg.code}
            </code>
          );
        }
        if ('strong' in seg) return <strong key={i}>{seg.strong}</strong>;
        if ('em' in seg) return <em key={i}>{seg.em}</em>;
        return (
          <a key={i} href={seg.href} target='_blank' rel='noreferrer'>
            {seg.link}
          </a>
        );
      })}
    </>
  );
}
