import { useControl } from 'react-use-control';

import { css } from '@linaria/core';

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from '@/lib/components/NavigationMenu';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, row, codeBlock } from '../styles';

import { CssVarsSection } from './shared';

// ─── mega panel scaffolding ─────────────────────────────────────

const columns = css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--haze-space-6);
`;

const columnTitle = css`
  margin: 0 0 var(--haze-space-2);
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const menuLink = css`
  display: block;
  padding: var(--haze-space-1) var(--haze-space-2);
  margin-inline-start: calc(var(--haze-space-2) * -1);
  border-radius: var(--haze-radius-sm);
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
  text-decoration: none;

  &:hover {
    color: var(--haze-color-primary);
    background: var(--haze-color-bg-subtle);
  }

  &:focus-visible {
    outline: 2px solid var(--haze-color-focus-ring);
    outline-offset: 1px;
  }
`;

const featured = css`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-2);
  padding: var(--haze-space-4);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-primary-subtle);
`;

const featuredTitle = css`
  margin: 0;
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-semibold);
`;

const featuredBody = css`
  margin: 0;
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
`;

/** One labeled column of links — the link-list half of a mega panel. */
function LinkColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className={columnTitle}>{title}</h3>
      {links.map((link) => (
        <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className={menuLink}>
          {link}
        </a>
      ))}
    </div>
  );
}

// ─── NavigationMenu ─────────────────────────────────────────────
export default function NavigationMenuDemo() {
  const [active, setActive] = useControl<string | null>(undefined, 'components');

  return (
    <>
      <h1>NavigationMenu</h1>
      <p className={intro}>
        A hover mega-menu navigation bar: triggers open large content
        panels (link columns, card grids — any ReactNode) after a short
        intent dwell, panels stay through a pointer grace, and the whole
        active item is controllable through{' '}
        <code>activeValue</code>.
      </p>

      <div className={section}>
        <h2>Mega menu</h2>
        <div className={row}>
          <NavigationMenu aria-label='Product'>
            <NavigationMenuList>
              <NavigationMenuItem value='docs'>
                <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className={columns}>
                    <LinkColumn
                      title='Getting started'
                      links={['Installation', 'Theming', 'Dark mode', 'Tokens']}
                    />
                    <LinkColumn
                      title='Guides'
                      links={['Controlled state', 'ClassNames slots', 'Styling', 'FAQ']}
                    />
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem value='components'>
                <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className={columns}>
                    <LinkColumn
                      title='Layout'
                      links={['Grid', 'Flex', 'Container', 'Masonry']}
                    />
                    <div className={featured}>
                      <h3 className={featuredTitle}>Workbench layout</h3>
                      <p className={featuredBody}>
                        The IDE-style application frame with resizable
                        regions — the newest layout family.
                      </p>
                      <a href='#workbench' className={menuLink}>
                        Open the Workbench docs →
                      </a>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem value='blog'>
                <NavigationMenuTrigger>Blog</NavigationMenuTrigger>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <p className={row}>
          Hover (or focus) <strong>Docs</strong> or{' '}
          <strong>Components</strong> — the first panel waits out a
          100ms intent dwell, then moving between triggers switches
          instantly. Moving away closes after a 300ms grace; moving into
          the panel cancels the close. <strong>Blog</strong> is a plain
          item: no panel, no disclosure attributes.
        </p>
      </div>

      <div className={section}>
        <h2>Controlled activeValue</h2>
        <div className={row}>
          <NavigationMenu
            aria-label='Controlled product'
            activeValue={active}
            onActiveValueChange={setActive}
          >
            <NavigationMenuList>
              <NavigationMenuItem value='docs'>
                <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
                <NavigationMenuContent>Docs panel</NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem value='components'>
                <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                <NavigationMenuContent>Components panel</NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className={row}>
          <code>activeValue</code> is currently{' '}
          <code>{String(active)}</code> —
          <button onClick={() => setActive('docs')}>open docs</button>{' '}
          <button onClick={() => setActive('components')}>
            open components
          </button>{' '}
          <button onClick={() => setActive(null)}>close</button>
        </div>
        <pre className={codeBlock}>{`const [active, setActive] = useControl(undefined, 'components');

<NavigationMenu activeValue={active} onActiveValueChange={setActive}>
  …
</NavigationMenu>`}</pre>
      </div>

      <div className={section}>
        <h2>Plain links</h2>
        <div className={row}>
          <NavigationMenu aria-label='Plain'>
            <NavigationMenuList>
              <NavigationMenuItem value='home'>
                <NavigationMenuTrigger>Home</NavigationMenuTrigger>
              </NavigationMenuItem>
              <NavigationMenuItem value='pricing'>
                <NavigationMenuTrigger>Pricing</NavigationMenuTrigger>
              </NavigationMenuItem>
              <NavigationMenuItem value='changelog'>
                <NavigationMenuTrigger>Changelog</NavigationMenuTrigger>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <p className={row}>
          Items without a <code>NavigationMenuContent</code> render as
          plain buttons — no <code>aria-expanded</code>, no{' '}
          <code>aria-controls</code> — wire them to routing through the
          trigger&apos;s native props.
        </p>
      </div>

      <div className={section}>
        <h2>stretchToTrigger</h2>
        <div className={row}>
          <NavigationMenu aria-label='Stretched' stretchToTrigger>
            <NavigationMenuList>
              <NavigationMenuItem value='docs'>
                <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <LinkColumn
                    title='Getting started'
                    links={['Installation', 'Theming', 'Dark mode']}
                  />
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem value='components'>
                <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <LinkColumn
                    title='Layout'
                    links={['Grid', 'Flex', 'Container']}
                  />
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <p className={row}>
          <code>stretchToTrigger</code> pins each panel&apos;s width to
          its trigger&apos;s — dropdown-like menus instead of
          content-sized mega panels.
        </p>
      </div>

      <div className={section}>
        <h2>NavigationMenu Props</h2>
        <PropsTable of='NavigationMenuProps' />
        <h2>NavigationMenuItem Props</h2>
        <PropsTable of='NavigationMenuItemProps' />
        <h2>NavigationMenuTrigger Props</h2>
        <PropsTable of='NavigationMenuTriggerProps' />
        <h2>NavigationMenuContent Props</h2>
        <PropsTable of='NavigationMenuContentProps' />
        <h2>NavigationMenuList Props</h2>
        <PropsTable of='NavigationMenuListProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              WAI-ARIA <strong>disclosure navigation menu</strong>{' '}
              pattern: a <code>&lt;nav&gt;</code> landmark wrapping a{' '}
              <code>role=&quot;list&quot;</code> strip of items
            </li>
            <li>
              Triggers are real buttons —{' '}
              <strong>aria-expanded</strong> +{' '}
              <strong>aria-controls</strong> wiring only on items that
              carry a panel; panels are{' '}
              <strong>aria-labelledby</strong> their trigger
            </li>
            <li>
              Every trigger is its own Tab stop (no roving tabindex —
              disclosures, not tab panels); <strong>←/→</strong> move
              focus between triggers (RTL-aware),{' '}
              <strong>Home/End</strong> jump to the ends
            </li>
            <li>
              <strong>Enter/Space</strong> toggles,{' '}
              <strong>Escape</strong> closes; a panel closing under
              keyboard focus returns focus to its trigger
            </li>
            <li>
              Panels stay open while keyboard focus rests inside them —
              incidental pointer movement never closes a panel being
              read
            </li>
            <li>
              Focus opens follow the same intent dwell as hover; give
              the <code>&lt;nav&gt;</code> an <code>aria-label</code> so
              the landmark is named
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='navigation-menu' />
    </>
  );
}
