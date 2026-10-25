import type { ComponentPropsWithRef, ElementType, MouseEvent } from 'react';

import { useEffect, useState, useCallback } from 'react';
import { css } from '@linaria/core';

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

const button = css`
  position: fixed;
  bottom: calc(var(--haze-space-6) + env(safe-area-inset-bottom));
  /* physical: pinned to the physical bottom-end screen corner — a FAB
     carries no reading-direction semantics, and the safe-area env has no
     logical counterpart. */
  right: calc(var(--haze-space-6) + env(safe-area-inset-right));
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-primary);
  color: var(--haze-color-bg);
  border: none;
  cursor: pointer;
  box-shadow: var(--haze-shadow-lg);
  font-size: var(--haze-text-lg);
  transition: opacity var(--haze-duration-normal), transform var(--haze-duration-normal);

  &:hover {
    transform: translateY(-2px);
  }
`;

const hidden = css`
  opacity: 0;
  pointer-events: none;
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
      x-class={[button, !visible && hidden, className]}
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
