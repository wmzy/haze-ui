import type { ComponentPropsWithRef, ElementType, MouseEvent } from 'react';

import { useEffect, useState, useCallback } from 'react';
import { css } from '@linaria/core';

import { focusRingVisible } from '../../utils/focus-ring';
import { fab, shapes, variants, anchored } from '../FloatButton/float-button-styles';
import { useStrings } from '../LocaleProvider';

type BackToTopOwnProps = {
  /** Scroll offset that reveals the button, px. Defaults to 300. */
  threshold?: number;
  /**
   * Element-agnostic click: whatever element `as` rendered, the
   * consumer's handler fires first — the scroll-to-top wiring rides
   * after it.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

/**
 * Polymorphic like Button's `as`: the fixed-corner skin, the scroll
 * watching and the scroll-to-top click wiring always land on the
 * rendered element — `as='a' href='#top'` keeps link semantics (⌘/
 * middle-click, crawlers) while a click still scrolls. `type='button'`
 * is gated to the native-button shape.
 */
type BackToTopProps<T extends ElementType = 'button'> = BackToTopOwnProps & {
  /** Render element — 'button' (default), 'a', or any component that
   * forwards props and ref to a DOM element. */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof BackToTopOwnProps | 'as' | 'type'>;

/**
 * Icon-only deltas over the composed FloatButton skin (fab + circle +
 * solid + anchored + focusRingVisible) — the button face is FloatButton's,
 * this class only re-tunes it for an icon-only circle and re-binds the
 * reveal/exit channels. Anchoring goes through the shared anchored
 * class, so the corner flips to the inline-end (physical left) side
 * under RTL — the FloatButton anchor semantics this adoption takes on.
 *
 * Every arm compounds the data-slot selector on purpose: the dev server
 * injects css in import order while dist split-css appends shared
 * layers after the family's own modules, so a plain-class tie against
 * fab flips winners between environments (quiet-button-skin
 * discipline, Banner's closeBtnSize precedent).
 */
const iconOnly = css`
  &[data-slot='back-to-top'] {
    /* A circle, not a pill: no inline padding (fab's space-3 pads the
       description-bearing FAB and would stretch the circle past
       min-width), the border-box contract so --haze-float-button-size
       is the TOTAL diameter like the incumbent's fixed 2.5rem box, and
       the incumbent's lg regular glyph — fab's sm/medium typography is
       the text-FAB scale and would shrink and thicken the arrow. */
    box-sizing: border-box;
    padding-inline: 0;
    font-size: var(--haze-text-lg);
    font-weight: var(--haze-weight-normal);
    /* Only the reveal/exit channels animate: fab's own list
       (background/color/border-color/box-shadow) never applied to this
       skin before, and the shadow is pinned below, so the list is
       replaced rather than merged. */
    transition:
      opacity var(--haze-duration-normal),
      transform var(--haze-duration-normal),
      visibility var(--haze-duration-normal);
  }

  /* The hover lift is BackToTop's own (FloatButton hovers by elevation
     and ink instead); the resting shadow-lg is pinned back because the
     incumbent had no hover shadow change and fab's lg-to-xl arm would
     introduce one. The :not(:focus-visible) guard keeps the keyboard
     ring from being out-ranked by this arm's higher specificity. */
  &[data-slot='back-to-top']:hover:not(:focus-visible) {
    transform: translateY(-2px);
    box-shadow: var(--haze-shadow-lg);
  }
`;

const hidden = css`
  /* visibility, not just opacity/pointer-events: an invisible button
     must also leave the tab order and the a11y tree. It rides the
     transition above — discrete interpolation keeps it visible for
     any t in (0,1), so the fade-out finishes before the button
     disappears and the reveal flips immediately. */
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  /* 1rem (16px) equals space-4 numerically but is a motion distance,
     not spacing — kept a literal like the off-ladder -2px lift above. */
  transform: translateY(1rem);
`;

export default function BackToTop<T extends ElementType = 'button'>({
  threshold = 300,
  as,
  className,
  children = '↑',
  onClick,
  ...rest
}: BackToTopProps<T>) {
  const [visible, setVisible] = useState(false);
  const strings = useStrings('backToTop');

  const handleScroll = useCallback(() => {
    setVisible(window.scrollY > threshold);
  }, [threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const Tag = (as ?? 'button');
  // Only the native button shape carries type; anchors and custom
  // components keep their own element semantics.
  const isNativeButton = as === undefined || as === 'button';

  return (
    <Tag
      {...(isNativeButton ? { type: 'button' as const } : {})}
      data-slot='back-to-top'
      x-class={[fab, focusRingVisible, shapes.circle, variants.solid, anchored, iconOnly, !visible && hidden, className]}
      aria-label={strings.label}
      {...rest}
      onClick={(event: MouseEvent<HTMLElement>) => {
        // Element-agnostic event: whatever element `as` rendered, the
        // consumer's handler sees it, typed element-agnostic above.
        onClick?.(event);
        scrollToTop();
      }}
    >
      {children}
    </Tag>
  );
}

export type { BackToTopOwnProps, BackToTopProps };
