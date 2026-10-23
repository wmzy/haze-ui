import { useEffect, useMemo, useRef, useState } from 'react';
import { css } from '@linaria/core';

import {
  Button,
  Flex,
  Input,
  autoTheme,
  darkTheme,
} from '@/lib';
import { createBrandTheme } from '@/lib/tokens';
import { useDarkMode } from '@/lib/hooks';
import { page } from '@/views/ComponentDetail/styles';
import { GuideDocView, useGuideDoc } from '@/views/Guides/guide-content';

/*
 * Dark mode guide. Prose, code samples and the persistence table live in
 * ./guide-content (en source + zh translation); the three live demos stay
 * here and are injected via slots, receiving their island copy and hint
 * strings from doc.ui. Demo chrome (mode buttons, mono status readouts,
 * component fixtures) stays English on purpose — it mirrors literal API
 * values ('light' | 'dark' | 'system') like every other demo on the site.
 */

const islandRow = css`
  display: flex;
  gap: var(--haze-space-4);
  flex-wrap: wrap;
  margin: var(--haze-space-4) 0 var(--haze-space-6);
`;

const island = css`
  flex: 1;
  min-width: 220px;
  max-width: 320px;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-3);
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
`;

const scopedDemo = css`
  max-width: 420px;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-4);
  margin: var(--haze-space-4) 0 var(--haze-space-2);
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-3);
  font-family: var(--haze-font-sans);
  transition: background var(--haze-duration-normal) var(--haze-ease);
`;

const demoStatus = css`
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
  font-family: var(--haze-font-mono);
`;

/** Two static theme islands — the page stays light, one subtree flips. */
function ThemeIslandsDemo({
  lightTitle,
  lightText,
  darkTitle,
  darkText,
}: {
  lightTitle: string;
  lightText: string;
  darkTitle: string;
  darkText: string;
}) {
  return (
    <div className={islandRow}>
      <div className={island}>
        <strong>{lightTitle}</strong>
        {lightText}
        <Button size='sm'>Button</Button>
        <Input size='sm' placeholder='Input' aria-label='Light island input' />
      </div>
      <div x-class={[island, darkTheme]}>
        <strong>{darkTitle}</strong>
        {darkText}
        <Button size='sm'>Button</Button>
        <Input size='sm' placeholder='Input' aria-label='Dark island input' />
      </div>
    </div>
  );
}

/**
 * Zero-JS autoTheme island: the container carries autoTheme alone — the
 * complete light set plus the dark set re-declared inside a
 * prefers-color-scheme media block. No hook, no state: whatever the OS
 * appearance is right now, that is what resolves.
 */
function AutoThemeDemo({title, text}: {title: string; text: string}) {
  return (
    <div className={islandRow}>
      <div x-class={[island, autoTheme]}>
        <strong>{title}</strong>
        {text}
        <Button size='sm'>Button</Button>
        <Input size='sm' placeholder='Input' aria-label='Auto island input' />
      </div>
    </div>
  );
}

/**
 * Scoped useDarkMode: the hook owns a container instead of the document,
 * persists under its own key (so the demo never fights this site's own
 * theme header), and starts in 'system' mode.
 */
function ScopedDarkModeDemo() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark, mode, setMode] = useDarkMode({
    target: ref,
    storageKey: 'haze-docs-dark-mode-demo',
    defaultMode: 'system',
  });

  return (
    <div ref={ref} className={scopedDemo}>
      <Flex gap='var(--haze-space-1)' wrap>
        <Button
          size='sm'
          variant={mode === 'light' ? 'solid' : 'ghost'}
          onClick={() => setMode('light')}
        >
          Light
        </Button>
        <Button
          size='sm'
          variant={mode === 'dark' ? 'solid' : 'ghost'}
          onClick={() => setMode('dark')}
        >
          Dark
        </Button>
        <Button
          size='sm'
          variant={mode === 'system' ? 'solid' : 'ghost'}
          onClick={() => setMode('system')}
        >
          System
        </Button>
      </Flex>
      {/* Functional update: flips the current resolution and always
          leaves 'system' — same as setMode(isDark ? 'light' : 'dark'). */}
      <Button size='sm' variant='outline' onClick={() => setIsDark((prev) => !prev)}>
        Toggle (functional update)
      </Button>
      <div className={demoStatus}>
        mode: {mode} · resolved: {isDark ? 'dark' : 'light'}
      </div>
    </div>
  );
}

/**
 * Runtime brand theme: createBrandTheme builds the full token set from a
 * seed hex at runtime; the demo injects the blocks as plain CSS classes and
 * renders the same island pair under them. Primary/info/focus-ring follow
 * the seed; neutrals and success/warning/danger stay on the default scales.
 */
function RuntimeBrandDemo({
  validHint,
  invalidHint,
  lightText,
  darkText,
}: {
  validHint: string;
  invalidHint: string;
  lightText: string;
  darkText: string;
}) {
  const [draft, setDraft] = useState('#7c3aed');
  const seed = draft.trim();
  const valid = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(seed);
  const theme = useMemo(() => (valid ? createBrandTheme({name: 'demo', light: seed}) : null), [valid, seed]);

  useEffect(() => {
    if (theme === null) return;
    const style = document.createElement('style');
    style.setAttribute('data-haze-demo-brand', '');
    style.textContent = `.demo-brand-light {\n${theme.light}\n}\n\n.demo-brand-dark {\n${theme.dark}\n}`;
    document.head.append(style);
    return () => {
      style.remove();
    };
  }, [theme]);

  return (
    <div>
      <Flex gap='var(--haze-space-2)' wrap align='center' style={{marginBottom: 'var(--haze-space-3)'}}>
        <Input
          size='sm'
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-label='Brand seed hex'
          style={{width: 130, fontFamily: 'var(--haze-font-mono)'}}
        />
        <span className={demoStatus}>
          {valid ? validHint : invalidHint}
        </span>
      </Flex>
      <div className={islandRow}>
        <div className='demo-brand-light'>
          <div x-class={island}>
            <strong>demo-brand-light</strong>
            {lightText}
            <Button size='sm'>Button</Button>
            <Input size='sm' placeholder='Focus shows the brand ring' aria-label='Runtime brand light input' />
          </div>
        </div>
        <div className='demo-brand-dark'>
          <div x-class={island}>
            <strong>demo-brand-dark</strong>
            {darkText}
            <Button size='sm'>Button</Button>
            <Input size='sm' placeholder='Focus shows the brand ring' aria-label='Runtime brand dark input' />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DarkModeGuide() {
  const doc = useGuideDoc('darkMode');

  const {
    islandLightTitle = '',
    islandLightText = '',
    islandDarkTitle = '',
    islandDarkText = '',
    autoIslandTitle = '',
    autoIslandText = '',
    runtimeIslandLightText = '',
    runtimeIslandDarkText = '',
    runtimeValidHint = '',
    runtimeInvalidHint = '',
  } = doc.ui ?? {};

  return (
    <div className={page}>
      <h1>{doc.title}</h1>
      <GuideDocView
        doc={doc}
        slots={{
          'theme-islands': (
            <ThemeIslandsDemo
              lightTitle={islandLightTitle}
              lightText={islandLightText}
              darkTitle={islandDarkTitle}
              darkText={islandDarkText}
            />
          ),
          'auto-theme': (
            <AutoThemeDemo title={autoIslandTitle} text={autoIslandText} />
          ),
          'runtime-brand': (
            <RuntimeBrandDemo
              validHint={runtimeValidHint}
              invalidHint={runtimeInvalidHint}
              lightText={runtimeIslandLightText}
              darkText={runtimeIslandDarkText}
            />
          ),
          'scoped-demo': <ScopedDarkModeDemo />,
        }}
      />
    </div>
  );
}
