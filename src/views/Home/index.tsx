import { css } from '@linaria/core';
import { Link } from '@native-router/react';

import { lightTheme, spacing, typography, Button, Flex, Badge } from '@/lib';

const hero = css`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--haze-space-8);
  background: var(--haze-color-bg);
`;

const title = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-4xl);
  font-weight: var(--haze-weight-bold);
  color: var(--haze-color-text);
  margin: 0 0 var(--haze-space-3);
`;

const subtitle = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-lg);
  color: var(--haze-color-text-secondary);
  margin: 0 0 var(--haze-space-6);
  max-width: 480px;
  line-height: var(--haze-leading-normal);
`;

const linkReset = css`
  text-decoration: none;
`;

export default function Home() {
  return (
    <div x-class={[lightTheme, spacing, typography, hero]}>
      <Badge variant='info'>v0.1.0</Badge>
      <h1 className={title}>Haze UI</h1>
      <p className={subtitle}>
        A lightweight React component library built with Linaria and design
        tokens.
      </p>
      <Flex gap='var(--haze-space-3)'>
        <Link className={linkReset} to='/components'>
          <Button size='lg'>Browse Components</Button>
        </Link>
        <Link className={linkReset} to='/getting-started'>
          <Button variant='outline' size='lg'>
            Get Started
          </Button>
        </Link>
      </Flex>
    </div>
  );
}
