import { css } from '@linaria/core';

export const motion = css`
  --haze-duration-fast: 120ms;
  --haze-duration-normal: 200ms;
  --haze-duration-slow: 300ms;
  --haze-ease: cubic-bezier(0.2, 0, 0, 1);
  --haze-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Users who opt out of motion get every duration collapsed to zero, so
     all token-driven transitions and enter/exit animations complete
     within a single frame. Easing is left untouched — it is irrelevant
     once the duration is 0ms. Custom properties inherit, so overriding
     them on the theme class covers every descendant, and the media query
     re-evaluates live when the OS preference changes. */
  @media (prefers-reduced-motion: reduce) {
    --haze-duration-fast: 0ms;
    --haze-duration-normal: 0ms;
    --haze-duration-slow: 0ms;
  }
`;

/*
 * Named enter/exit animation presets driven by `data-state`.
 *
 * Put one preset class on the element whose appearance you animate. While
 * the element carries data-state='open' the enter keyframes run; when the
 * attribute flips to 'closed' the exit keyframes run with
 * animation-fill-mode: forwards, so the element holds its exited look for
 * the frames between "closed" and the real unmount. The attribute is what
 * Presence (haze-ui/headless) injects while deferring the unmount until
 * whenExitSettles sees the exit finish — class plus Presence is the whole
 * pattern, no JS touches the animation.
 *
 * Conventions:
 * - Slide names describe the ENTER travel direction (slide-up rises into
 *   place, arriving from just below); the exit reverses the travel — the
 *   element leaves toward the side it arrived from. Slides fade as they
 *   travel: a pure translate reads as sliding glass over content.
 * - Durations and easings come from the motion tokens above: normal
 *   (200ms) on enter, fast (120ms) on exit — exits read snappier at the
 *   same perceived responsiveness. Distances use spacing tokens, so a
 *   density-compacted subtree slides shorter too.
 * - Every preset embeds its own prefers-reduced-motion collapse
 *   (animation: none), self-sufficient without the motion class on any
 *   ancestor; when the class is also present both paths agree (no
 *   animation at collapsed durations).
 * - Keyframe names land in the global CSS namespace once emitted, hence
 *   the haze-motion- prefix; each preset owns a unique enter/exit pair so
 *   two classes can never fight over a shared name (last-emitted
 *   definition would silently win).
 * - One preset per element: animation is a single property, two preset
 *   classes cannot merge their keyframes.
 * - Keep transform-bearing presets (fade-scale, the slides) off
 *   JS-positioned floating panels: getBoundingClientRect includes
 *   transforms, so an animating panel poisons its own placement math.
 *   Floating panels fade only (see floatingAnimated in utils/floating).
 *
 * Every preset shares one skeleton (presetCss below) and differs only in
 * its row of PRESET_OUT_STATE. The css calls are still spelled out per
 * preset rather than built in a loop: Linaria resolves a css template
 * statically and rejects one that depends on a loop variable, and it
 * names the class after the object key owning the css call
 * (fade -> haze-motion__fade).
 */
/**
 * Per preset, the declarations for the element while it is fully out: the
 * `from` block of the enter keyframes and the `to` block of the exit
 * keyframes, since a preset leaves toward the side it arrived from. The
 * row key is the preset name as exposed on motionPresets.
 */
const PRESET_OUT_STATE = {
  /** Opacity only — the safe default, also the one floating panels use. */
  fade: ['opacity: 0'],
  /** Fade plus a subtle settle from 97% scale — cards, dialogs, images. */
  fadeScale: ['opacity: 0', 'transform: scale(0.97)'],
  /** Rises into place from just below; sinks back down on exit. */
  slideUp: ['opacity: 0', 'transform: translateY(var(--haze-space-4))'],
  /** Descends into place from just above; rises back up on exit. */
  slideDown: [
    'opacity: 0',
    'transform: translateY(calc(-1 * var(--haze-space-4)))',
  ],
  /** Slides in leftward, arriving from just right; exits back right. */
  slideLeft: ['opacity: 0', 'transform: translateX(var(--haze-space-4))'],
  /** Slides in rightward, arriving from just left; exits back left. */
  slideRight: [
    'opacity: 0',
    'transform: translateX(calc(-1 * var(--haze-space-4)))',
  ],
} as const;

/** Kebab-cases a preset name for its keyframe pair: slideUp -> slide-up. */
function kebabCase(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/**
 * One preset's template: enter on data-state='open', exit on 'closed',
 * the reduced-motion collapse and the preset's own keyframe pair. Pure,
 * and evaluated only by Linaria while it extracts the module — the css
 * calls that pass it a preset sit at module top level in motionPresets.
 */
function presetCss(name: keyof typeof PRESET_OUT_STATE): string {
  const slug = kebabCase(name);
  // One declaration per line, indented to the keyframe body.
  const out = `${PRESET_OUT_STATE[name].join(';\n        ')};`;
  return `
    &[data-state='open'] {
      animation: haze-motion-${slug}-in var(--haze-duration-normal)
        var(--haze-ease);
    }

    &[data-state='closed'] {
      animation: haze-motion-${slug}-out var(--haze-duration-fast)
        var(--haze-ease) forwards;
    }

    @media (prefers-reduced-motion: reduce) {
      &[data-state='open'],
      &[data-state='closed'] {
        animation: none;
      }
    }

    @keyframes haze-motion-${slug}-in {
      from {
        ${out}
      }
    }

    @keyframes haze-motion-${slug}-out {
      to {
        ${out}
      }
    }
  `;
}

/** One class per preset, applied to the element Presence tags. */
export const motionPresets = {
  fade: css`${presetCss('fade')}`,
  fadeScale: css`${presetCss('fadeScale')}`,
  slideUp: css`${presetCss('slideUp')}`,
  slideDown: css`${presetCss('slideDown')}`,
  slideLeft: css`${presetCss('slideLeft')}`,
  slideRight: css`${presetCss('slideRight')}`,
} as const;

/** Preset names accepted wherever a motion preset can be chosen. */
export type MotionPreset = keyof typeof motionPresets;
