import type { Route } from '@native-router/react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

import { MemoryRouter, View } from '@native-router/react';

import { ThemeProvider } from '@/contexts/theme';
import { COMPONENT_GROUPS } from '@/views/Layout/component-groups';
import Home from '@/views/Home';
import Layout from '@/views/Layout/index';

import { de } from './de';
import { en } from './en';
import { fr } from './fr';
import {
  LOCALE_STORAGE_KEY,
  SITE_LOCALES,
  SiteLocaleProvider,
  fill,
  mergeStrings,
  resolveInitialLocale,
  useSiteLocale,
} from './index';
import { ja } from './ja';
import { zh } from './zh';

const GROUP_NAMES = COMPONENT_GROUPS.map((g) => g.group);
const COMPONENT_NAMES = COMPONENT_GROUPS.flatMap((g) =>
  g.items.map((i) => i.name)
);

const isRichSeg = (value: unknown): boolean =>
  typeof value === 'string' ||
  (typeof value === 'object' &&
    value !== null &&
    ('code' in value || 'strong' in value));

/* RichText paragraphs are arrays of segments; other arrays (setup steps)
 * hold structured objects and are validated element-wise instead. */
const isRichTextArray = (values: readonly unknown[]): boolean =>
  values.every(isRichSeg);

/*
 * Parity walk: zh must be a DeepPartial of en — every key zh uses must
 * exist in en with a compatible leaf (strings for strings, RichText
 * arrays for RichText arrays). A typo'd or stale zh key fails here
 * instead of silently never rendering.
 */
function walk(
  zhNode: unknown,
  enNode: unknown,
  path: string,
  errors: string[]
) {
  if (Array.isArray(zhNode)) {
    if (!Array.isArray(enNode)) {
      errors.push(`${path}: zh is an array but en is not`);
      return;
    }
    // isArray narrows unknown to any[] — re-scope through unknown[] so the
    // walk stays fully checked.
    const zhItems = zhNode as readonly unknown[];
    const enItems = enNode as readonly unknown[];
    if (isRichTextArray(enItems)) {
      for (const seg of zhItems) {
        if (!isRichSeg(seg)) {
          errors.push(
            `${path}: invalid RichText segment ${JSON.stringify(seg)}`
          );
        }
      }
      return;
    }
    zhItems.forEach((item, i) => {
      const enItem: unknown = enItems[i];
      if (enItem === undefined) {
        errors.push(`${path}[${i}]: zh has more entries than en`);
      } else {
        walk(item, enItem, `${path}[${i}]`, errors);
      }
    });
    return;
  }
  if (typeof zhNode === 'string') {
    if (Array.isArray(enNode)) {
      errors.push(
        `${path}: en is RichText but zh overrides with a plain string`
      );
    } else if (typeof enNode !== 'string') {
      errors.push(`${path}: en leaf is ${typeof enNode}, zh is string`);
    }
    return;
  }
  if (typeof zhNode === 'object' && zhNode !== null) {
    for (const [key, value] of Object.entries(zhNode)) {
      const enChild: unknown = (enNode as Record<string, unknown>)[key];
      if (enChild === undefined) {
        errors.push(`${path}.${key}: key missing in en dictionary`);
      } else {
        walk(value, enChild, `${path}.${key}`, errors);
      }
    }
    return;
  }
  errors.push(`${path}: unexpected zh leaf ${typeof zhNode}`);
}

describe('locale dictionaries', () => {
  it('zh only uses keys that exist in en (DeepPartial parity)', () => {
    const errors: string[] = [];
    walk(zh, en, 'zh', errors);
    expect(errors).toEqual([]);
  });

  it('covers every sidebar component with en and zh one-liners', () => {
    expect(Object.keys(en.components).length).toBeGreaterThanOrEqual(
      COMPONENT_NAMES.length
    );
    for (const name of COMPONENT_NAMES) {
      expect(en.components[name], `en blurb for ${name}`).toBeTruthy();
      expect(zh.components?.[name], `zh blurb for ${name}`).toBeTruthy();
    }
    // No stray keys: every dictionary entry maps to a real component.
    for (const name of Object.keys(zh.components ?? {})) {
      expect(COMPONENT_NAMES, `zh blurb key ${name}`).toContain(name);
    }
  });

  it('translates every component group name and no others', () => {
    const zhGroups: Record<string, string | undefined> =
      zh.componentGroups ?? {};
    expect(Object.keys(zhGroups).sort()).toEqual([...GROUP_NAMES].sort());
    for (const name of GROUP_NAMES) {
      expect(zhGroups[name]).not.toBe(name);
    }
  });

  it('falls back to en values for keys zh does not translate', () => {
    // browser.browsers is deliberately not overridden in zh (locale-free
    // strings) — the merged dictionary must keep the en value verbatim.
    const merged = mergeStrings(en, zh as Record<string, unknown>);
    expect(merged.gettingStarted.browser.browsers).toEqual(
      en.gettingStarted.browser.browsers
    );
    // Translated keys come through.
    expect(merged.nav.home).toBe(zh.nav?.home);
  });
});

/*
 * Same parity contract as zh for the newer packs: keys must be an en
 * subset, sidebar coverage complete, group names translated.
 */
describe.each([
  ['ja', ja],
  ['de', de],
  ['fr', fr],
] as const)('%s dictionary', (name, dict) => {
  it('only uses keys that exist in en (DeepPartial parity)', () => {
    const errors: string[] = [];
    walk(dict, en, name, errors);
    expect(errors).toEqual([]);
  });

  it('covers every sidebar component with a one-liner and no strays', () => {
    const blurbs: Record<string, string | undefined> = dict.components ?? {};
    for (const comp of COMPONENT_NAMES) {
      expect(blurbs[comp], `${name} blurb for ${comp}`).toBeTruthy();
    }
    // No stray keys: every dictionary entry maps to a real component.
    for (const key of Object.keys(blurbs)) {
      expect(COMPONENT_NAMES, `${name} blurb key ${key}`).toContain(key);
    }
  });

  it('translates every component group name and no others', () => {
    const groups: Record<string, string | undefined> =
      dict.componentGroups ?? {};
    expect(Object.keys(groups).sort()).toEqual([...GROUP_NAMES].sort());
    // True cognates (de/fr "Navigation", "Feedback") may match en verbatim,
    // so the zh-style `not.toBe` contract cannot apply wholesale — instead
    // the sentinel group "General" must differ, which catches an unedited
    // en copy of the whole table.
    expect(groups.General, `${name} group General`).not.toBe('General');
    for (const g of GROUP_NAMES) {
      expect(groups[g], `${name} group ${g}`).toBeTruthy();
    }
  });

  it('falls back to en values for keys it does not translate', () => {
    const merged = mergeStrings(en, dict as Record<string, unknown>);
    // browser.browsers is deliberately locale-free in every pack.
    expect(merged.gettingStarted.browser.browsers).toEqual(
      en.gettingStarted.browser.browsers
    );
    // Translated keys come through.
    expect(merged.nav.home).toBe(dict.nav?.home);
  });

  it('mirrors the zh key selection (same translated key paths)', () => {
    /** Collect every translated key path of a DeepPartial dictionary. */
    const keyPaths = (node: unknown, prefix: string, out: string[]) => {
      if (typeof node === 'object' && node !== null && !Array.isArray(node)) {
        for (const [key, value] of Object.entries(node)) {
          keyPaths(value, `${prefix}.${key}`, out);
        }
        return;
      }
      out.push(prefix);
    };
    const zhPaths: string[] = [];
    const dictPaths: string[] = [];
    keyPaths(zh, '', zhPaths);
    keyPaths(dict, '', dictPaths);
    expect(dictPaths.sort()).toEqual(zhPaths.sort());
  });
});

describe('resolveInitialLocale', () => {
  afterEach(() => {
    localStorage.clear();
    Reflect.deleteProperty(window.navigator, 'language');
  });

  it('prefers the persisted choice over the browser language', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    Object.defineProperty(window.navigator, 'language', {
      value: 'zh-CN',
      configurable: true,
    });
    expect(resolveInitialLocale()).toBe('en');
  });

  it('falls back to a zh browser language prefix', () => {
    Object.defineProperty(window.navigator, 'language', {
      value: 'zh-TW',
      configurable: true,
    });
    expect(resolveInitialLocale()).toBe('zh');
  });

  it.each([
    ['ja', 'ja-JP'],
    ['de', 'de-AT'],
    ['fr', 'fr-CA'],
  ] as const)('falls back to a %s browser language prefix', (locale, lang) => {
    Object.defineProperty(window.navigator, 'language', {
      value: lang,
      configurable: true,
    });
    expect(resolveInitialLocale()).toBe(locale);
  });

  it('defaults to en and ignores invalid stored values', () => {
    expect(resolveInitialLocale()).toBe('en');
    // 'pt' is a real language but not one the site offers.
    localStorage.setItem(LOCALE_STORAGE_KEY, 'pt');
    expect(resolveInitialLocale()).toBe('en');
  });
});

function Probe() {
  const { locale, setLocale, t } = useSiteLocale();
  return (
    <div>
      <output data-testid='locale'>{locale}</output>
      <output data-testid='nav-home'>{t.nav.home}</output>
      <output data-testid='browsers'>
        {t.gettingStarted.browser.browsers.join(',')}
      </output>
      {SITE_LOCALES.map((loc) => (
        <button key={loc} type='button' onClick={() => setLocale(loc)}>
          to-{loc}
        </button>
      ))}
    </div>
  );
}

/** Standalone switch harness for pages without their own switcher. */
function LocaleProbeButton() {
  const { setLocale } = useSiteLocale();
  return (
    <button type='button' onClick={() => setLocale('zh')}>
      to-zh
    </button>
  );
}

describe('SiteLocaleProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'en';
  });

  it('starts in en, switches to zh, persists and syncs <html lang>', async () => {
    const user = userEvent.setup();
    render(
      <SiteLocaleProvider>
        <Probe />
      </SiteLocaleProvider>
    );

    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('nav-home')).toHaveTextContent('Home');
    expect(document.documentElement.lang).toBe('en');

    await user.click(screen.getByRole('button', { name: 'to-zh' }));

    expect(screen.getByTestId('locale')).toHaveTextContent('zh');
    expect(screen.getByTestId('nav-home')).toHaveTextContent('首页');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('zh');
    expect(document.documentElement.lang).toBe('zh-CN');
  });

  it('boots in zh when the persisted choice says so, with en fallback for untranslated keys', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'zh');
    render(
      <SiteLocaleProvider>
        <Probe />
      </SiteLocaleProvider>
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('zh');
    expect(screen.getByTestId('nav-home')).toHaveTextContent('首页');
    // browser.browsers is deliberately untranslated — en value survives.
    expect(screen.getByTestId('browsers')).toHaveTextContent(
      'Chrome / Edge 84+'
    );
  });

  it('switches to ja/de/fr, persists and syncs <html lang>', async () => {
    const user = userEvent.setup();
    render(
      <SiteLocaleProvider>
        <Probe />
      </SiteLocaleProvider>
    );

    const cases = [
      { button: 'to-ja', lang: 'ja', home: 'ホーム' },
      { button: 'to-de', lang: 'de', home: 'Start' },
      { button: 'to-fr', lang: 'fr', home: 'Accueil' },
    ] as const;

    for (const { button, lang, home } of cases) {
      await user.click(screen.getByRole('button', { name: button }));

      expect(screen.getByTestId('locale')).toHaveTextContent(lang);
      expect(screen.getByTestId('nav-home')).toHaveTextContent(home);
      expect(document.documentElement.lang).toBe(lang);
      expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe(lang);
      // browser.browsers is deliberately untranslated — en value survives.
      expect(screen.getByTestId('browsers')).toHaveTextContent(
        'Chrome / Edge 84+'
      );
    }
  });
});

describe('useSiteLocale outside a provider', () => {
  it('returns a working English fallback (no throw)', () => {
    expect(() => render(<Probe />)).not.toThrow();
    expect(screen.getByTestId('nav-home')).toHaveTextContent('Home');
  });
});

describe('fill', () => {
  it('expands known tokens and keeps unknown ones verbatim', () => {
    expect(fill('No components match “{query}”', { query: 'btn' })).toBe(
      'No components match “btn”'
    );
    expect(fill('{count}+ 组件', { count: 122 })).toBe('122+ 组件');
    expect(fill('keep {unknown} intact', { other: 1 })).toBe(
      'keep {unknown} intact'
    );
  });
});

/* ─── Site smoke: Layout chrome + Home copy switch with the locale ─── */

function HomeStub() {
  return <div>home-view</div>;
}

const routes = [
  { path: '/', component: () => Promise.resolve({ default: HomeStub }) },
  {
    path: '/components/:name',
    component: () => Promise.resolve({ default: HomeStub }),
  },
  {
    path: '/getting-started',
    component: () => Promise.resolve({ default: HomeStub }),
  },
  {
    path: '/guides/:guide',
    component: () => Promise.resolve({ default: HomeStub }),
  },
] as Route[];

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }))
  );
  // jsdom has no matchMedia; Layout's useMediaQuery no-guards it, but the
  // header/Drawer code paths still expect the API shape on window.
  if (typeof window.matchMedia !== 'function') {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      })
    );
  }
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderSite() {
  return render(
    <ThemeProvider>
      <SiteLocaleProvider>
        <MemoryRouter routes={routes} initialEntries={['/']}>
          <Layout />
          <View />
        </MemoryRouter>
      </SiteLocaleProvider>
    </ThemeProvider>
  );
}

describe('Layout chrome localization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the English chrome by default', async () => {
    renderSite();
    await screen.findAllByText('home-view');

    expect(
      screen.getAllByRole('link', { name: 'Home' }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: 'Getting Started' }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: 'Dark mode' }).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('General').length).toBeGreaterThan(0);
    // Guide summaries are zh-only; nothing extra renders in en.
    expect(screen.queryByText(/token 类/)).not.toBeInTheDocument();
  });

  it('switches the whole sidebar to Chinese via the header switcher', async () => {
    const user = userEvent.setup();
    renderSite();
    await screen.findAllByText('home-view');

    await user.click(screen.getByRole('button', { name: '中文' }));

    await waitFor(() => {
      expect(
        screen.getAllByRole('link', { name: '首页' }).length
      ).toBeGreaterThan(0);
    });
    expect(
      screen.getAllByRole('link', { name: '快速上手' }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole('link', { name: '深色模式' }).length
    ).toBeGreaterThan(0);
    // Group titles and guide summaries localized.
    expect(screen.getAllByText('通用').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/token 类、useDarkMode 钩子/).length
    ).toBeGreaterThan(0);
    // English labels are gone from the nav.
    expect(
      screen.queryByRole('link', { name: 'Home' })
    ).not.toBeInTheDocument();
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('zh');
  });

  it('offers all five site languages in the header switcher', async () => {
    renderSite();
    await screen.findAllByText('home-view');

    for (const label of ['EN', '中文', '日本語', 'DE', 'FR']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('switches the whole sidebar to Japanese via the header switcher', async () => {
    const user = userEvent.setup();
    renderSite();
    await screen.findAllByText('home-view');

    await user.click(screen.getByRole('button', { name: '日本語' }));

    await waitFor(() => {
      expect(
        screen.getAllByRole('link', { name: 'ホーム' }).length
      ).toBeGreaterThan(0);
    });
    expect(
      screen.getAllByRole('link', { name: 'はじめに' }).length
    ).toBeGreaterThan(0);
    // Group titles and guide summaries localized.
    expect(screen.getAllByText('全般').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/明暗両方のトークンクラス/).length
    ).toBeGreaterThan(0);
    expect(document.documentElement.lang).toBe('ja');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('ja');
  });

  it('switches the whole sidebar to French via the header switcher', async () => {
    const user = userEvent.setup();
    renderSite();
    await screen.findAllByText('home-view');

    await user.click(screen.getByRole('button', { name: 'FR' }));

    await waitFor(() => {
      expect(
        screen.getAllByRole('link', { name: 'Accueil' }).length
      ).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Général').length).toBeGreaterThan(0);
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('fr');
  });
});

describe('Home copy localization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function renderHomeWithSwitcher() {
    return render(
      <SiteLocaleProvider>
        <MemoryRouter routes={routes} initialEntries={['/']}>
          <Home />
          <LocaleProbeButton />
        </MemoryRouter>
      </SiteLocaleProvider>
    );
  }

  it('renders the English hero by default and switches with the locale', async () => {
    const user = userEvent.setup();
    renderHomeWithSwitcher();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Build faster with Haze UI',
      })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'to-zh' }));

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: '用 Haze UI，构建更快',
      })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: '快速上手' }).length
    ).toBeGreaterThan(0);
  });
});
