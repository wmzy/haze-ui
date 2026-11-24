/* eslint-disable react-refresh/only-export-components --
   demo-app shared module: css snippets, style objects and helpers sit beside
   demo-only components; fast-refresh purity is irrelevant for the docs site
   (see utils/floating.tsx precedent) */
import type { CSSProperties, ReactNode } from 'react';

import { css } from '@linaria/core';

import { COMPONENT_TOKENS } from '@/lib';

import A11yNote from '../A11yNote';

import PropsTable from '../PropsTable';

import TokensTable from '../TokensTable';

import { intro, section } from '../styles';

export const noop = () => {
  /* demo placeholder */
};

// ─── Demo page template ─────────────────────────────────────────
//
// Every component page has the same skeleton — an <h1>, a one-paragraph
// intro, then a run of <h2> sections — so demos compose it from these parts
// instead of repeating the markup. Each part renders exactly the h1 /
// p.intro / div.section > h2 it replaces.

type DemoPageProps = {
  /** Component name; the page `<h1>`. */
  title: string;
  /** Intro paragraph under the title: plain text, or a fragment when it needs inline `<code>`. */
  description: ReactNode;
  /** The sections that follow the intro. */
  children: ReactNode;
};

/** Page chrome of one component demo: `<h1>`, intro paragraph, then the sections. */
export function DemoPage({ title, description, children }: DemoPageProps) {
  return (
    <>
      <h1>{title}</h1>
      <p className={intro}>{description}</p>
      {children}
    </>
  );
}

type DemoSectionProps = {
  /** Section heading. The two boilerplate headings have their own wrappers below. */
  title: string;
  children: ReactNode;
};

/** One section block: `div.section > h2 + content`. */
export function DemoSection({ title, children }: DemoSectionProps) {
  return (
    <div className={section}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

/** The standard single-table Props section. */
export function PropsSection({ of }: { of: string }) {
  return (
    <DemoSection title='Props'>
      <PropsTable of={of} />
    </DemoSection>
  );
}

/** The standard Accessibility section: the note box under an `Accessibility` heading. */
export function AccessibilitySection({ children }: { children: ReactNode }) {
  return (
    <DemoSection title='Accessibility'>
      <A11yNote>{children}</A11yNote>
    </DemoSection>
  );
}

export function CssVarsSection({ component }: { component: string }) {
  const tokens = COMPONENT_TOKENS[component];
  if (!tokens?.length) return null;
  return (
    <DemoSection title='CSS Variables'>
      <TokensTable tokens={tokens} />
    </DemoSection>
  );
}

// ─── Shared style objects ───────────────────────────────────────
//
// Inline `style={{ … }}` literals that recur across demos. They stay plain
// objects (not Linaria classes) so a demo renders the same `style` attribute
// as it did before the literal was hoisted.

/** Small secondary text — the base of the note styles below. */
export const hintStyle: CSSProperties = {
  fontSize: 'var(--haze-text-sm)',
  color: 'var(--haze-color-text-secondary)',
};

/** The standard note paragraph under a demo: hint text with breathing room below. */
export const noteStyle: CSSProperties = { ...hintStyle, margin: '0 0 var(--haze-space-3)' };

/** A note paragraph inside a container that supplies its own spacing (cards, tours). */
export const flushNoteStyle: CSSProperties = { ...hintStyle, margin: 0 };

/** A note paragraph that sits below the control it describes. */
export const offsetNoteStyle: CSSProperties = { ...hintStyle, marginTop: 'var(--haze-space-2)' };

/** Tiny muted label under an icon or glyph. */
export const captionStyle: CSSProperties = {
  fontSize: 'var(--haze-text-xs)',
  color: 'var(--haze-color-text-muted)',
};

/** Drops the default paragraph margins inside tight layouts. */
export const flushStyle: CSSProperties = { margin: 0 };

// Width caps: keep a single control from stretching across the whole demo column.
export const maxWidth320: CSSProperties = { maxWidth: 320 };
export const maxWidth360: CSSProperties = { maxWidth: 360 };
export const maxWidth400: CSSProperties = { maxWidth: 400 };
export const maxWidth420: CSSProperties = { maxWidth: 420 };
export const maxWidth480: CSSProperties = { maxWidth: 480 };
export const maxWidth640: CSSProperties = { maxWidth: 640 };

/** A vertical stack of meters or progress bars at the default demo width. */
export const meterGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--haze-space-3)',
  maxWidth: 400,
};

// ─── Shared SVG helpers ─────────────────────────────────────────
export function StrokeSvg() {
  return (
    <svg viewBox='0 0 24 24'>
      <path
        d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
      />
    </svg>
  );
}

export const dataTableMeta = css`
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
`;

export const dataTableNote = css`
  max-width: 75ch;
  color: var(--haze-color-text-secondary);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-normal);

  code {
    font-family: var(--haze-font-mono);
    font-size: var(--haze-text-xs);
  }
`;

export const feedToolbar = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-3);
  flex-wrap: wrap;
  margin-bottom: var(--haze-space-3);
`;

export const feedMeta = css`
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
`;
