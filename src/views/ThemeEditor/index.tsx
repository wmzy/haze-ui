import type {ChangeEvent} from 'react';
import type {TokenDef} from '@/lib';
import type {CustomTheme, ResolvedMode, ThemeTokens} from '@/contexts/theme';

import {useCallback, useMemo, useRef, useState} from 'react';
import {css} from '@linaria/core';

import {
  TOKEN_REGISTRY,
  lightTheme,
  darkTheme,
  spacing,
  typography,
  Button,
  Flex,
  Card,
  Badge,
  Select as HazeSelect,
  Option,
  Checkbox,
  Switch,
  Slider,
} from '@/lib';
import {useTheme, buildDefaultTokens} from '@/contexts/theme';
import {page, section} from '@/views/ComponentDetail/styles';

const editorGrid = css`
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--haze-space-6);
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const tokenGroup = css`
  margin-bottom: var(--haze-space-6);
`;

const groupTitle = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-base);
  font-weight: var(--haze-weight-semibold);
  color: var(--haze-color-text);
  margin: 0 0 var(--haze-space-3);
  text-transform: capitalize;
`;

const tokenRow = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-3);
  padding: var(--haze-space-1) 0;
  border-bottom: 1px solid var(--haze-color-border);

  &:last-child {
    border-bottom: none;
  }
`;

const tokenLabel = css`
  flex: 0 0 160px;
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const tokenInput = css`
  flex: 1;
  min-width: 0;
`;

const colorInputWrap = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  flex: 1;
  min-width: 0;
`;

const colorPicker = css`
  width: 32px;
  height: 32px;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-sm);
  padding: 0;
  cursor: pointer;
  background: none;

  &::-webkit-color-swatch-wrapper {
    padding: 2px;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
  }
`;

const nativeInput = css`
  display: block;
  width: 100%;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  padding: var(--haze-space-1) var(--haze-space-2);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-normal);

  &:focus {
    outline: none;
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

const previewPanel = css`
  position: sticky;
  top: var(--haze-space-4);
  padding: var(--haze-space-4);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
`;

const previewTitle = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-semibold);
  color: var(--haze-color-text);
  margin: 0 0 var(--haze-space-3);
`;

const previewSection = css`
  margin-bottom: var(--haze-space-4);

  & > p {
    font-family: var(--haze-font-sans);
    font-size: var(--haze-text-xs);
    color: var(--haze-color-text-muted);
    margin: 0 0 var(--haze-space-2);
  }
`;

const actions = css`
  display: flex;
  gap: var(--haze-space-3);
  margin-bottom: var(--haze-space-6);
  flex-wrap: wrap;
  align-items: center;
`;

const modeToggle = css`
  display: flex;
  gap: var(--haze-space-1);
  margin-bottom: var(--haze-space-4);
`;

const themeListStyle = css`
  margin-bottom: var(--haze-space-6);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  overflow: hidden;
`;

const themeItem = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-3);
  padding: var(--haze-space-2) var(--haze-space-3);
  border-bottom: 1px solid var(--haze-color-border);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);

  &:last-child {
    border-bottom: none;
  }
`;

const themeItemName = css`
  flex: 1;
  color: var(--haze-color-text);
`;

const themeItemCount = css`
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
`;

const hiddenFileInput = css`
  display: none;
`;

const CATEGORIES: TokenDef['category'][] = ['color', 'typography', 'spacing', 'radius', 'shadow'];

function isHexLike(v: string) {
  return /^#[0-9a-fA-F]{3,8}$/.test(v);
}

function rgbaToHex(rgba: string): string {
  const m = /rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/.exec(rgba);
  if (!m) return '#000000';
  const [, r, g, b] = m;
  return `#${[r, g, b].map((c) => Number(c).toString(16).padStart(2, '0')).join('')}`;
}

function toPickerValue(v: string): string {
  if (isHexLike(v)) return v;
  if (v.startsWith('rgba') || v.startsWith('rgb')) return rgbaToHex(v);
  return '#000000';
}

function countTokens(tokens: ThemeTokens): number {
  return Object.keys(tokens.light).length + Object.keys(tokens.dark).length;
}

export default function ThemeEditor() {
  const {saveTheme, deleteTheme, customThemes, setActiveTheme} = useTheme();

  const [activeMode, setActiveMode] = useState<ResolvedMode>('light');
  const [lightEdits, setLightEdits] = useState<Record<string, string>>({});
  const [darkEdits, setDarkEdits] = useState<Record<string, string>>({});
  const [themeName, setThemeName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lightDefaults = useMemo(() => buildDefaultTokens('light'), []);
  const darkDefaults = useMemo(() => buildDefaultTokens('dark'), []);

  const edits = activeMode === 'light' ? lightEdits : darkEdits;
  const defaults = activeMode === 'light' ? lightDefaults : darkDefaults;
  const setEdits = activeMode === 'light' ? setLightEdits : setDarkEdits;

  const currentValue = (name: string) => edits[name] ?? defaults[name] ?? '';

  const setToken = useCallback((name: string, value: string) => {
    setEdits((prev) => ({...prev, [name]: value}));
  }, [setEdits]);

  const resetAll = useCallback(() => {
    setLightEdits({});
    setDarkEdits({});
    setThemeName('');
    setEditingId(null);
  }, []);

  const buildChangedTokens = useCallback((
    editsMap: Record<string, string>,
    defaultsMap: Record<string, string>,
  ) => {
    const changed: Record<string, string> = {};
    for (const [k, v] of Object.entries(editsMap)) {
      if (v !== defaultsMap[k]) changed[k] = v;
    }
    return changed;
  }, []);

  const handleSave = useCallback(() => {
    const name = themeName.trim() || `Custom ${customThemes.length + 1}`;
    const tokens: ThemeTokens = {
      light: buildChangedTokens(lightEdits, lightDefaults),
      dark: buildChangedTokens(darkEdits, darkDefaults),
    };
    const id = editingId ?? `theme-${Date.now()}`;
    saveTheme({id, name, tokens});
    setActiveTheme(id);
    setEditingId(id);
  }, [themeName, lightEdits, darkEdits, lightDefaults, darkDefaults, customThemes.length, saveTheme, setActiveTheme, editingId, buildChangedTokens]);

  const handleEdit = useCallback((theme: CustomTheme) => {
    const loadedLight: Record<string, string> = {...lightDefaults, ...theme.tokens.light};
    const loadedDark: Record<string, string> = {...darkDefaults, ...theme.tokens.dark};
    setLightEdits(loadedLight);
    setDarkEdits(loadedDark);
    setThemeName(theme.name);
    setEditingId(theme.id);
  }, [lightDefaults, darkDefaults]);

  const handleDelete = useCallback((id: string) => {
    deleteTheme(id);
    if (editingId === id) resetAll();
  }, [deleteTheme, editingId, resetAll]);

  const handleDuplicate = useCallback((theme: CustomTheme) => {
    const dup: CustomTheme = {
      id: `theme-${Date.now()}`,
      name: `${theme.name} (Copy)`,
      tokens: {
        light: {...theme.tokens.light},
        dark: {...theme.tokens.dark},
      },
    };
    saveTheme(dup);
    handleEdit(dup);
    setActiveTheme(dup.id);
  }, [saveTheme, handleEdit, setActiveTheme]);

  const handleExport = useCallback((theme: CustomTheme) => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.replace(/\s+/g, '-').toLowerCase()}.haze-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw: unknown = JSON.parse(reader.result as string);
        const data = raw as Record<string, unknown>;
        if (typeof data.name !== 'string' || !data.tokens || typeof data.tokens !== 'object') return;
        const tokensRaw = data.tokens as Record<string, unknown>;
        const tokens: ThemeTokens =
          tokensRaw.light && tokensRaw.dark && typeof tokensRaw.light === 'object' && typeof tokensRaw.dark === 'object'
            ? {light: tokensRaw.light as Record<string, string>, dark: tokensRaw.dark as Record<string, string>}
            : {light: tokensRaw as unknown as Record<string, string>, dark: tokensRaw as unknown as Record<string, string>};
        const imported: CustomTheme = {
          id: `theme-${Date.now()}`,
          name: data.name,
          tokens,
        };
        saveTheme(imported);
        setActiveTheme(imported.id);
        handleEdit(imported);
      } catch { /* invalid file */ }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [saveTheme, setActiveTheme, handleEdit]);

  const grouped = useMemo(() => {
    const map = new Map<string, TokenDef[]>();
    for (const cat of CATEGORIES) map.set(cat, []);
    for (const token of TOKEN_REGISTRY) {
      map.get(token.category)?.push(token);
    }
    return map;
  }, []);

  const previewStyle = useMemo(() => {
    const style: Record<string, string> = {};
    for (const [k, v] of Object.entries(edits)) {
      if (v !== defaults[k]) style[k] = v;
    }
    return style;
  }, [edits, defaults]);
  const previewThemeClass = activeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <div className={page}>
      <h1>Theme Editor</h1>
      <p style={{color: 'var(--haze-color-text-secondary)', marginBottom: 'var(--haze-space-6)'}}>
        Customize design tokens for both light and dark modes. Each theme stores separate overrides per mode.
      </p>

      {customThemes.length > 0 && (
        <>
          <h2 style={{fontSize: 'var(--haze-text-base)', fontWeight: 600, margin: '0 0 var(--haze-space-3)'}}>
            Saved Themes
          </h2>
          <div className={themeListStyle}>
            {customThemes.map((t) => (
              <div key={t.id} className={themeItem}>
                <span className={themeItemName}>
                  {t.name}
                  {editingId === t.id && <Badge size="sm" variant="info" style={{marginLeft: 8}}>editing</Badge>}
                </span>
                <span className={themeItemCount}>
                  {countTokens(t.tokens)} overrides
                </span>
                <Button size="sm" variant="ghost" onClick={() => handleEdit(t)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDuplicate(t)}>Duplicate</Button>
                <Button size="sm" variant="ghost" onClick={() => handleExport(t)}>Export</Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(t.id)}>Delete</Button>
              </div>
            ))}
          </div>
        </>
      )}

      <div className={actions}>
        <input
          className={nativeInput}
          style={{maxWidth: 200}}
          placeholder="Theme name"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
        />
        <Button size="sm" onClick={handleSave}>
          {editingId ? 'Update Theme' : 'Save Theme'}
        </Button>
        <Button size="sm" variant="outline" onClick={resetAll}>Reset All</Button>
        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
          Import
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className={hiddenFileInput}
          onChange={handleImport}
        />
      </div>

      <div className={modeToggle}>
        <span style={{fontSize: 'var(--haze-text-xs)', color: 'var(--haze-color-text-muted)', marginRight: 'var(--haze-space-2)', alignSelf: 'center'}}>
          Mode:
        </span>
        <Button size="sm" variant={activeMode === 'light' ? 'solid' : 'ghost'} onClick={() => setActiveMode('light')}>
          Light
        </Button>
        <Button size="sm" variant={activeMode === 'dark' ? 'solid' : 'ghost'} onClick={() => setActiveMode('dark')}>
          Dark
        </Button>
      </div>

      <div className={editorGrid}>
        <div>

          {CATEGORIES.map((cat) => {
            const tokens = grouped.get(cat);
            if (!tokens?.length) return null;
            return (
              <div key={cat} className={tokenGroup}>
                <h2 className={groupTitle}>{cat}</h2>
                <div className={section}>
                  {tokens.map((token) => {
                    const val = currentValue(token.name);
                    return (
                      <div key={token.name} className={tokenRow}>
                        <span className={tokenLabel} title={token.name}>{token.label}</span>
                        {token.type === 'color' ? (
                          <div className={colorInputWrap}>
                            <input
                              type="color"
                              className={colorPicker}
                              value={toPickerValue(val)}
                              onChange={(e) => setToken(token.name, e.target.value)}
                            />
                            <input
                              className={nativeInput}
                              value={val}
                              onChange={(e) => setToken(token.name, e.target.value)}
                            />
                          </div>
                        ) : (
                          <div className={tokenInput}>
                            <input
                              className={nativeInput}
                              value={val}
                              onChange={(e) => setToken(token.name, e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div className={previewPanel} x-class={[previewThemeClass, spacing, typography]} style={previewStyle}>
            <h3 className={previewTitle}>Live Preview</h3>

            <div className={previewSection}>
              <p>Buttons</p>
              <Flex gap="var(--haze-space-2)" style={{flexWrap: 'wrap'}}>
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="outline">Outline</Button>
                <Button size="sm" variant="ghost">Ghost</Button>
              </Flex>
            </div>

            <div className={previewSection}>
              <p>Badges</p>
              <Flex gap="var(--haze-space-2)" style={{flexWrap: 'wrap'}}>
                <Badge variant="info">Info</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
              </Flex>
            </div>

            <div className={previewSection}>
              <p>Input</p>
              <input className={nativeInput} placeholder="Type something..." />
            </div>

            <div className={previewSection}>
              <p>Select</p>
              <HazeSelect size="sm">
                <Option value="1">Option 1</Option>
                <Option value="2">Option 2</Option>
              </HazeSelect>
            </div>

            <div className={previewSection}>
              <p>Controls</p>
              <Flex gap="var(--haze-space-3)" style={{alignItems: 'center'}}>
                <Checkbox label="Check" />
                <Switch />
              </Flex>
            </div>

            <div className={previewSection}>
              <p>Slider</p>
              <Slider />
            </div>

            <div className={previewSection}>
              <p>Card</p>
              <Card>
                <p style={{margin: 0, fontSize: 'var(--haze-text-sm)'}}>
                  A sample card with your custom tokens applied.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
