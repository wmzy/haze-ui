import {css} from '@linaria/core';
import {Link, PrefetchLink, View} from '@native-router/react';

import {
  lightTheme,
  darkTheme,
  spacing,
  typography,
  Flex,
  List,
  ListItem,
  Disclosure,
  Button,
  Select,
  Option,
} from '@/lib';
import {useTheme} from '@/contexts/theme';

const rootLayout = css`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const header = css`
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--haze-space-3);
  padding: 0 var(--haze-space-4);
  border-bottom: 1px solid var(--haze-color-border);
  background: var(--haze-color-bg-subtle);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
`;

const themeLabel = css`
  color: var(--haze-color-text-secondary);
  font-size: var(--haze-text-xs);
`;

const body = css`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const sidebar = css`
  width: 240px;
  flex-shrink: 0;
  height: 100%;
  border-right: 1px solid var(--haze-color-border);
  display: flex;
  flex-direction: column;
  background: var(--haze-color-bg);
`;

const brand = css`
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 var(--haze-space-4);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-lg);
  font-weight: var(--haze-weight-bold);
  color: var(--haze-color-primary);
  text-decoration: none;
  flex-shrink: 0;
  border-bottom: 1px solid var(--haze-color-border);
`;

const navArea = css`
  flex: 1;
  overflow-y: auto;
  padding: var(--haze-space-2) 0;
`;

const navLink = css`
  display: block;
  padding: var(--haze-space-1) var(--haze-space-4);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
  text-decoration: none;
  transition:
    color 0.15s,
    background 0.15s;

  &:hover {
    color: var(--haze-color-text);
    background: var(--haze-color-bg-subtle);
  }
`;

const disclosureNav = css`
  border: none;
  border-radius: 0;

  & > summary {
    padding: var(--haze-space-1) var(--haze-space-4);
    font-size: var(--haze-text-sm);
    color: var(--haze-color-text-secondary);
  }

  & > div {
    padding: 0;
    border-top: none;
  }
`;

const mainContent = css`
  flex: 1;
  overflow-y: auto;
  background: var(--haze-color-bg);
`;

const COMPONENTS = [
  'button', 'input', 'select', 'checkbox', 'switch', 'badge',
  'dialog', 'tooltip', 'popover', 'card', 'radio', 'textarea',
  'slider', 'tabs', 'accordion', 'alert', 'avatar', 'tag',
  'skeleton', 'icon', 'image', 'flex', 'breadcrumb', 'disclosure',
  'menu', 'numberinput', 'fileinput', 'toast', 'list', 'combobox',
  'table', 'carousel', 'datepicker',
] as const;

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Layout() {
  const {
    baseTheme,
    resolvedMode,
    setBaseTheme,
    customThemes,
    activeCustomThemeId,
    setActiveTheme,
    activeCustomThemeStyle,
  } = useTheme();

  const themeClass = resolvedMode === 'dark' ? darkTheme : lightTheme;

  return (
    <div
      className={rootLayout}
      x-class={[themeClass, spacing, typography]}
      style={activeCustomThemeStyle}
    >
      <header className={header}>
        <span className={themeLabel}>Theme</span>
        <Flex gap="var(--haze-space-1)">
          <Button
            size="sm"
            variant={baseTheme === 'light' ? 'solid' : 'ghost'}
            onClick={() => setBaseTheme('light')}
          >
            Light
          </Button>
          <Button
            size="sm"
            variant={baseTheme === 'dark' ? 'solid' : 'ghost'}
            onClick={() => setBaseTheme('dark')}
          >
            Dark
          </Button>
          <Button
            size="sm"
            variant={baseTheme === 'auto' ? 'solid' : 'ghost'}
            onClick={() => setBaseTheme('auto')}
          >
            Auto
          </Button>
        </Flex>
        {customThemes.length > 0 && (
          <Select
            size="sm"
            value={activeCustomThemeId ?? ''}
            onChange={(e) => setActiveTheme(e.target.value || null)}
          >
            <Option value="">No custom theme</Option>
            {customThemes.map((t) => (
              <Option key={t.id} value={t.id}>{t.name}</Option>
            ))}
          </Select>
        )}
        <Link className={navLink} to="/theme-editor">
          Theme Editor
        </Link>
      </header>
      <div className={body}>
        <aside className={sidebar}>
          <PrefetchLink className={brand} to="/">
            Haze UI
          </PrefetchLink>
          <nav className={navArea}>
            <List variant="none">
              <ListItem>
                <Link className={navLink} to="/">Home</Link>
              </ListItem>
              <ListItem>
                <Link className={navLink} to="/getting-started">
                  Getting Started
                </Link>
              </ListItem>
              <ListItem>
                <Disclosure open={true} summary="Components" className={disclosureNav}>
                  <List variant="none">
                    <ListItem>
                      <Link className={navLink} to="/components">Overview</Link>
                    </ListItem>
                    {COMPONENTS.map((name) => (
                      <ListItem key={name}>
                        <Link className={navLink} to={`/components/${name}`}>
                          {capitalize(name)}
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                </Disclosure>
              </ListItem>
              <ListItem>
                <Link className={navLink} to="/theme-editor">
                  Theme Editor
                </Link>
              </ListItem>
              <ListItem>
                <Link className={navLink} to="/about">About</Link>
              </ListItem>
            </List>
          </nav>
        </aside>
        <main className={mainContent}>
          <View />
        </main>
      </div>
    </div>
  );
}
