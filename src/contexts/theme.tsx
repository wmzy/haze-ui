/* eslint-disable react-refresh/only-export-components */
import type {ReactNode} from 'react';

import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

import {TOKEN_REGISTRY} from '@/lib';

type ThemeTokens = {
  light: Record<string, string>;
  dark: Record<string, string>;
};

type CustomTheme = {
  id: string;
  name: string;
  tokens: ThemeTokens;
};

type BaseTheme = 'light' | 'dark' | 'auto';

type ThemeState = {
  baseTheme: BaseTheme;
  customThemes: CustomTheme[];
  activeCustomThemeId: string | null;
};

type ResolvedMode = 'light' | 'dark';

type ThemeContextValue = ThemeState & {
  resolvedMode: ResolvedMode;
  setBaseTheme: (base: BaseTheme) => void;
  saveTheme: (theme: CustomTheme) => void;
  deleteTheme: (id: string) => void;
  setActiveTheme: (id: string | null) => void;
  activeCustomThemeStyle: Record<string, string>;
};

const STORAGE_KEY = 'haze-ui-themes';

function getSystemPreference(): ResolvedMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function migrateTheme(t: Record<string, unknown>): CustomTheme | null {
  if (typeof t.id !== 'string' || typeof t.name !== 'string') return null;
  const tokens = t.tokens;
  if (!tokens || typeof tokens !== 'object') return null;

  const rec = tokens as Record<string, unknown>;
  if (rec.light && rec.dark && typeof rec.light === 'object' && typeof rec.dark === 'object') {
    return t as unknown as CustomTheme;
  }
  // migrate flat tokens → both light and dark
  const flat = tokens as Record<string, string>;
  return {id: t.id, name: t.name, tokens: {light: {...flat}, dark: {...flat}}};
}

function loadFromStorage(): ThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {baseTheme: 'light', customThemes: [], activeCustomThemeId: null};
    const parsed: unknown = JSON.parse(raw);
    const data = parsed as Partial<ThemeState>;
    const base = data.baseTheme;
    return {
      baseTheme: base === 'dark' || base === 'auto' ? base : 'light',
      customThemes: Array.isArray(data.customThemes)
        ? (data.customThemes as Record<string, unknown>[])
            .map(migrateTheme)
            .filter((t): t is CustomTheme => t != null)
        : [],
      activeCustomThemeId: data.activeCustomThemeId ?? null,
    };
  } catch {
    return {baseTheme: 'light', customThemes: [], activeCustomThemeId: null};
  }
}

function saveToStorage(state: ThemeState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function buildDefaultTokens(mode: ResolvedMode): Record<string, string> {
  const result: Record<string, string> = {};
  for (const t of TOKEN_REGISTRY) {
    result[t.name] = mode === 'light' ? t.light : t.dark;
  }
  return result;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeProvider({children}: {children: ReactNode}) {
  const [state, setState] = useState<ThemeState>(loadFromStorage);
  const [systemMode, setSystemMode] = useState<ResolvedMode>(getSystemPreference);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemMode(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedMode: ResolvedMode = state.baseTheme === 'auto' ? systemMode : state.baseTheme;

  const setBaseTheme = useCallback((base: BaseTheme) => {
    setState((prev) => {
      const next = {...prev, baseTheme: base};
      saveToStorage(next);
      return next;
    });
  }, []);

  const saveTheme = useCallback((theme: CustomTheme) => {
    setState((prev) => {
      const existing = prev.customThemes.findIndex((t) => t.id === theme.id);
      const customThemes =
        existing >= 0
          ? prev.customThemes.map((t) => (t.id === theme.id ? theme : t))
          : [...prev.customThemes, theme];
      const next = {...prev, customThemes};
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteTheme = useCallback((id: string) => {
    setState((prev) => {
      const next = {
        ...prev,
        customThemes: prev.customThemes.filter((t) => t.id !== id),
        activeCustomThemeId: prev.activeCustomThemeId === id ? null : prev.activeCustomThemeId,
      };
      saveToStorage(next);
      return next;
    });
  }, []);

  const setActiveTheme = useCallback((id: string | null) => {
    setState((prev) => {
      const next = {...prev, activeCustomThemeId: id};
      saveToStorage(next);
      return next;
    });
  }, []);

  const activeCustomThemeStyle = useMemo(() => {
    if (!state.activeCustomThemeId) return {};
    const theme = state.customThemes.find((t) => t.id === state.activeCustomThemeId);
    if (!theme) return {};
    return theme.tokens[resolvedMode];
  }, [state.activeCustomThemeId, state.customThemes, resolvedMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...state,
      resolvedMode,
      setBaseTheme,
      saveTheme,
      deleteTheme,
      setActiveTheme,
      activeCustomThemeStyle,
    }),
    [state, resolvedMode, setBaseTheme, saveTheme, deleteTheme, setActiveTheme, activeCustomThemeStyle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export {ThemeProvider, useTheme, buildDefaultTokens};
export type {CustomTheme, ThemeTokens, ThemeState, BaseTheme, ResolvedMode};
