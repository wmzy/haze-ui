import {css} from '@linaria/core';
import {Link, PrefetchLink, View} from '@native-router/react';

import * as NavigationMenu from '@/components/NavigationMenu';

export default function Layout() {
  return (
    <section
      className={css`
        display: flex;
        height: 100vh;
      `}
    >
      <aside
        x-class={css`
          height: 100%;
          border-right: 1px dashed;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding: 0 24px;

          > :first-child {
            flex: none;
            height: 4rem;
          }

          > nav {
            flex: 1;
            overflow-y: auto;
          }

          > nav > ul {
            list-style: none;
            gap: 16px;
          }
        `}
      >
        <PrefetchLink
          x-class={css`
            color: #5cb85c;
          `}
          to='/'
        >
          Ripple UI
        </PrefetchLink>
        <nav>
          <NavigationMenu.Main>
            <NavigationMenu.Item>
              <Link to='/'>Home</Link>
            </NavigationMenu.Item>
            <NavigationMenu.Group title='Components'>
              <NavigationMenu.Item>
                <Link to='/components'>Overview</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/button'>Button</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/input'>Input</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/select'>Select</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/checkbox'>Checkbox</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/switch'>Switch</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/badge'>Badge</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/dialog'>Dialog</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/tooltip'>Tooltip</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/popover'>Popover</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/card'>Card</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/radio'>Radio</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/textarea'>Textarea</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/slider'>Slider</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/tabs'>Tabs</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/accordion'>Accordion</Link>
              </NavigationMenu.Item>
              <NavigationMenu.Item>
                <Link to='/components/alert'>Alert</Link>
              </NavigationMenu.Item>
            </NavigationMenu.Group>
            <li>
              <Link to='/help'>Help</Link>
            </li>
            <li>
              <Link to='/about'>About</Link>
            </li>
          </NavigationMenu.Main>
        </nav>
      </aside>
      <main>
        <View />
      </main>
    </section>
  );
}

export const globals = css`
  :global() {
    body {
      margin: 0;
    }
  }
`;
