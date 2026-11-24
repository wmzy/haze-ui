import type { CSSProperties } from 'react';

import { css } from '@linaria/core';

import { Button, ButtonLink, Icon } from '@/lib';
import { buttonVariants, buttonSizes } from '@/lib/components/Button';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  noteStyle,
  PropsSection,
  StrokeSvg,
} from './shared';

// Component-level tokens: set --haze-button-* on any ancestor to retheme
// the buttons inside (sizes that aren't overridden keep their fallbacks).
const tokenScope = {
  '--haze-button-height-md': '3rem',
  '--haze-button-font-size-md': 'var(--haze-text-base)',
  '--haze-button-radius': '999px',
} as CSSProperties;

// Composition demo: wear the exported skin pieces on a custom element.
const brandedCompose = css`
  border-color: var(--haze-color-primary);
  color: var(--haze-color-primary);
  background: var(--haze-color-primary-subtle);

  &:hover {
    background: color-mix(in srgb, var(--haze-color-primary) 15%, transparent);
  }
`;

// ─── Button ────────────────────────────────────────────────────
export default function ButtonDemo() {
  return (
    <DemoPage
      title='Button'
      description='Trigger actions with configurable style and size.'
    >
      <DemoSection title='Variants'>
        <div className={row}>
          <Button variant='solid'>Solid</Button>
          <Button variant='outline'>Outline</Button>
          <Button variant='ghost'>Ghost</Button>
        </div>
      </DemoSection>

      <DemoSection title='Sizes'>
        <div className={row}>
          <Button size='sm'>Small</Button>
          <Button size='md'>Medium</Button>
          <Button size='lg'>Large</Button>
        </div>
      </DemoSection>

      <DemoSection title='Component-level tokens'>
        <p style={noteStyle}>
          Buttons read <code>--haze-button-*</code> custom properties with
          global-token fallbacks, so an ancestor can retheme just the
          buttons it wraps: this container sets{' '}
          <code>--haze-button-height-md</code>,{' '}
          <code>--haze-button-font-size-md</code> and{' '}
          <code>--haze-button-radius</code> — medium buttons inside grow
          and go pill-shaped, while the small one keeps its height (only
          the size-less radius reaches it). Set them on{' '}
          <code>:root</code> instead to retheme every button at once.
        </p>
        <div className={row} style={tokenScope}>
          <Button size='md'>Scoped Medium</Button>
          <Button size='md' variant='outline'>
            Scoped Outline
          </Button>
          <Button size='sm' variant='ghost'>
            Small (height untouched)
          </Button>
        </div>
      </DemoSection>

      <DemoSection title='Square (Icon Button)'>
        <p style={noteStyle}>
          Use <code>square</code> for icon-only buttons with equal padding on
          all sides.
        </p>
        <div className={row}>
          <Button size='sm' square variant='solid'>
            <Icon size='sm'>
              <StrokeSvg />
            </Icon>
          </Button>
          <Button size='md' square variant='solid'>
            <Icon size='sm'>
              <StrokeSvg />
            </Icon>
          </Button>
          <Button size='lg' square variant='solid'>
            <Icon size='md'>
              <StrokeSvg />
            </Icon>
          </Button>
          <Button size='sm' square variant='outline'>
            <Icon size='sm'>
              <StrokeSvg />
            </Icon>
          </Button>
          <Button size='sm' square variant='ghost'>
            <Icon size='sm'>
              <StrokeSvg />
            </Icon>
          </Button>
        </div>
      </DemoSection>

      <DemoSection title='Disabled'>
        <div className={row}>
          <Button disabled>Disabled Solid</Button>
          <Button variant='outline' disabled>
            Disabled Outline
          </Button>
          <Button variant='ghost' disabled>
            Disabled Ghost
          </Button>
        </div>
      </DemoSection>

      <DemoSection title='ButtonLink — a real anchor with the Button skin'>
        <p style={noteStyle}>
          Navigation that must look like a button: <code>ButtonLink</code>{' '}
          renders a native <code>&lt;a&gt;</code> (href, ⌘/middle-click,
          crawlers) wearing the same variants/sizes. Anchors have no{' '}
          <code>disabled</code> attribute — report the state with{' '}
          <code>aria-disabled</code> plus <code>tabIndex=&#123;-1&#125;</code>.
        </p>
        <div className={row}>
          <ButtonLink href='#button'>Link Solid</ButtonLink>
          <ButtonLink href='#button' variant='outline'>
            Link Outline
          </ButtonLink>
          <ButtonLink href='#button' variant='ghost'>
            Link Ghost
          </ButtonLink>
          <ButtonLink href='#button' variant='outline' aria-disabled tabIndex={-1}>
            Link Disabled
          </ButtonLink>
        </div>
      </DemoSection>

      <DemoSection title='Composing with buttonVariants / buttonSizes'>
        <p style={noteStyle}>
          The exported <code>buttonVariants</code> /{' '}
          <code>buttonSizes</code> maps carry the exact skin classes{' '}
          <code>Button</code> wears (shadcn <code>buttonVariants</code>{' '}
          precedent) — spread them onto any custom element to match the
          design system without rendering a <code>&lt;button&gt;</code>.
          This anchor composes the <code>outline</code> variant with the{' '}
          <code>md</code> size and one custom class on top.
        </p>
        <div className={row}>
          <a
            href='#button'
            className={`${buttonVariants.outline} ${buttonSizes.md} ${brandedCompose}`}
          >
            Composed anchor
          </a>
          <a
            href='#button'
            className={`${buttonVariants.ghost} ${buttonSizes.sm}`}
          >
            Ghost skin, sm
          </a>
        </div>
      </DemoSection>

      <PropsSection of='ButtonProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Renders as native <strong>&lt;button&gt;</strong> with{' '}
            <strong>type=&quot;button&quot;</strong>
          </li>
          <li>
            Supports <strong>Tab</strong> focus and <strong>Enter</strong>/
            <strong>Space</strong> activation
          </li>
          <li>
            Disabled state uses <strong>disabled</strong> attribute, removing
            from tab order
          </li>
          <li>
            Focus ring via <strong>:focus-visible</strong>
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='button' />
    </DemoPage>
  );
}
