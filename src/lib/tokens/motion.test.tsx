/*
 * Motion token + preset contract. vitest runs with css:false, so like
 * tokens.test.ts the emitted declarations are asserted through
 * source-level regex checks on motion.ts (the css template text is not
 * observable at runtime), while the runtime surface — class-name strings
 * and the data-state/Presence wiring the presets are designed for — is
 * asserted through rendering (presence.test.tsx precedent).
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen, waitFor } from '@testing-library/react';

import { Presence } from '../utils/presence';

import { motion, motionPresets } from './motion';

const source = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), 'motion.ts'),
  'utf8'
);

// The motion class legitimately holds literal durations (it DEFINES the
// tokens); preset assertions scope to everything from the preset table on.
const presetsSource = source.slice(source.indexOf('const PRESET_OUT_STATE'));

// The one template every preset is generated from.
const skeleton = presetsSource.slice(
  presetsSource.indexOf('function presetCss'),
  presetsSource.indexOf('/** One class per preset')
);

// Rows of the preset table, in declaration order.
const tableRows = [
  ...presetsSource
    .slice(0, presetsSource.indexOf('} as const;'))
    .matchAll(/^ {2}(\w+): \[/gm),
].map((match) => match[1]);

// Each `key: css`${presetCss('key')}`` line of motionPresets as [key, argument].
const generated = [
  ...presetsSource.matchAll(/^ {2}(\w+): css`\$\{presetCss\('(\w+)'\)\}`,?$/gm),
].map((match) => [match[1], match[2]]);

// Mirrors kebabCase in motion.ts: the module's exports are tokens only.
const kebabCase = (name: string): string =>
  name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

describe('motion class', () => {
  it('is a non-empty class-name string', () => {
    expect(typeof motion).toBe('string');
    expect(motion.length).toBeGreaterThan(0);
  });
});

describe('motionPresets', () => {
  it('covers exactly the six documented presets', () => {
    expect(Object.keys(motionPresets).sort()).toEqual([
      'fade',
      'fadeScale',
      'slideDown',
      'slideLeft',
      'slideRight',
      'slideUp',
    ]);
  });

  it('is a non-empty, unique class-name string per preset', () => {
    const names = Object.values(motionPresets);
    for (const name of names) {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
    expect(new Set(names).size).toBe(names.length);
  });

  it('renders the preset class alongside data-state on a plain element', () => {
    const { container, unmount } = render(
      <div className={motionPresets.fadeScale} data-state='open'>
        Card
      </div>
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain(motionPresets.fadeScale);
    expect(el).toHaveAttribute('data-state', 'open');
    unmount();
  });
});

describe('motion.ts source (preset wiring)', () => {
  it('generates every preset from the one skeleton, under its own name', () => {
    // A table row without a css line is a preset that silently never
    // ships; a css line fed another preset's row swaps their keyframes.
    expect(tableRows).toEqual(Object.keys(motionPresets));
    expect(generated).toEqual(
      Object.keys(motionPresets).map((key) => [key, key])
    );
    // Enter starts and exit ends on the same out state.
    expect(skeleton.match(/\$\{out\}/g)).toHaveLength(2);
  });

  it('drives the skeleton off both data-state selectors', () => {
    // An enter rule and an exit rule, plus the two selectors repeated
    // inside the reduced-motion collapse.
    expect(skeleton.match(/\[data-state='open'\]/g)).toHaveLength(2);
    expect(skeleton.match(/\[data-state='closed'\]/g)).toHaveLength(2);
  });

  it('names every keyframe under the haze-motion- prefix, uniquely', () => {
    // One enter/exit pair per preset, keyed by the preset's kebab-cased
    // name: slideUp -> haze-motion-slide-up-in / haze-motion-slide-up-out.
    expect(
      skeleton.match(/@keyframes haze-motion-\$\{slug\}-(?:in|out) \{/g)
    ).toHaveLength(2);
    expect(source).toContain(
      'name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)'
    );
    const slugs = Object.keys(motionPresets).map(kebabCase);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('holds every exit with animation-fill-mode: forwards', () => {
    // Exit rules are the only place a fill mode is needed: the element
    // keeps its exited look until Presence unmounts it.
    expect(
      skeleton.match(/var\(--haze-ease(?:-in-out)?\) forwards/g)
    ).toHaveLength(1);
    expect(presetsSource.match(/\bforwards\b/g)).toHaveLength(1);
  });

  it('uses motion tokens for every duration and easing (no literals)', () => {
    // Any timing/easing literal in the table or the skeleton is a drift
    // away from the token scale; only the scale factor and keyframe
    // geometry may be literal. Enter reads normal, exit reads fast.
    expect(presetsSource).not.toMatch(/\b\d+(?:\.\d+)?m?s\b/);
    expect(presetsSource).not.toMatch(/cubic-bezier\(/);
    expect(skeleton.match(/var\(--haze-duration-(?:fast|normal|slow)\)/g)).toHaveLength(2);
    expect(skeleton).toContain(
      'animation: haze-motion-${slug}-in var(--haze-duration-normal)'
    );
    expect(skeleton).toContain(
      'animation: haze-motion-${slug}-out var(--haze-duration-fast)'
    );
    expect(skeleton.match(/var\(--haze-ease(?:-in-out)?\)/g)).toHaveLength(2);
  });

  it('embeds a self-sufficient reduced-motion collapse in the skeleton', () => {
    expect(
      skeleton.match(/@media \(prefers-reduced-motion: reduce\)/g)
    ).toHaveLength(1);
    expect(skeleton.match(/animation: none/g)).toHaveLength(1);
  });

  it('keeps the module free of hooks and DOM access (RSC-safe)', () => {
    expect(source).not.toMatch(/\buse[A-Z]\w*\(/);
    expect(source).not.toMatch(/\b(?:document|window)\./);
    expect(source).not.toMatch(/from 'react'/);
  });
});

describe('motionPresets + Presence', () => {
  it('flips data-state through Presence so presets drive enter then exit', async () => {
    const card = (
      <div className={motionPresets.slideUp} data-testid='card'>
        Animated
      </div>
    );
    const { rerender } = render(<Presence present>{card}</Presence>);

    // Presented frame: preset class applied, enter state injected.
    const el = screen.getByTestId('card');
    expect(el.className).toContain(motionPresets.slideUp);
    expect(el).toHaveAttribute('data-state', 'open');

    // Flip to absent: still mounted as closed (exit pending) — this is
    // the window in which the preset's exit keyframes run.
    rerender(<Presence present={false}>{card}</Presence>);
    expect(el).toHaveAttribute('data-state', 'closed');

    // jsdom reports no durations, so the settle completes without events
    // and the element unmounts (presence.test.tsx precedent).
    await waitFor(() =>
      expect(screen.queryByTestId('card')).not.toBeInTheDocument()
    );
  });
});
