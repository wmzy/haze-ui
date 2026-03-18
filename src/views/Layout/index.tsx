import { css } from '@linaria/core';
import { Link, PrefetchLink, View } from '@native-router/react';

import {
  lightTheme,
  spacing,
  typography,
  Flex,
  List,
  ListItem,
  Disclosure,
} from '@/lib';

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
  'button',
  'input',
  'select',
  'checkbox',
  'switch',
  'badge',
  'dialog',
  'tooltip',
  'popover',
  'card',
  'radio',
  'textarea',
  'slider',
  'tabs',
  'accordion',
  'alert',
  'avatar',
  'tag',
  'skeleton',
  'icon',
  'image',
  'flex',
  'breadcrumb',
  'disclosure',
  'menu',
  'numberinput',
  'fileinput',
  'toast',
  'list',
  'combobox',
  'table',
  'carousel',
  'datepicker',
] as const;

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Layout() {
  return (
    <Flex
      className={css`
        height: 100vh;
      `}
      x-class={[lightTheme, spacing, typography]}
    >
      <aside className={sidebar}>
        <PrefetchLink className={brand} to='/'>
          Haze UI
        </PrefetchLink>
        <nav className={navArea}>
          <List variant='none'>
            <ListItem>
              <Link className={navLink} to='/'>
                Home
              </Link>
            </ListItem>
            <ListItem>
              <Disclosure
                open={true}
                summary='Components'
                className={disclosureNav}
              >
                <List variant='none'>
                  <ListItem>
                    <Link className={navLink} to='/components'>
                      Overview
                    </Link>
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
              <Link className={navLink} to='/about'>
                About
              </Link>
            </ListItem>
          </List>
        </nav>
      </aside>
      <main className={mainContent}>
        <View />
      </main>
    </Flex>
  );
}
