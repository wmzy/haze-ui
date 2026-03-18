import {css} from '@linaria/core';
import {Link} from '@native-router/react';

import {lightTheme, spacing, typography, Button, Flex, Badge} from '@/lib';

const hero = css`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--pbl-space-8);
  background: var(--pbl-color-bg);
`;

const title = css`
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-4xl);
  font-weight: var(--pbl-weight-bold);
  color: var(--pbl-color-text);
  margin: 0 0 var(--pbl-space-3);
`;

const subtitle = css`
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-lg);
  color: var(--pbl-color-text-secondary);
  margin: 0 0 var(--pbl-space-6);
  max-width: 480px;
  line-height: var(--pbl-leading-normal);
`;

const linkReset = css`
  text-decoration: none;
`;

export default function Home() {
  return (
    <div x-class={[lightTheme, spacing, typography, hero]}>
      <Badge variant="info">v0.1.0</Badge>
      <h1 className={title}>Haze UI</h1>
      <p className={subtitle}>
        A lightweight React component library built with Linaria and design tokens.
      </p>
      <Flex gap="var(--pbl-space-3)">
        <Link className={linkReset} to='/components'>
          <Button size="lg">Browse Components</Button>
        </Link>
        <Link className={linkReset} to='/getting-started'>
          <Button variant="outline" size="lg">Get Started</Button>
        </Link>
      </Flex>
    </div>
  );
}
