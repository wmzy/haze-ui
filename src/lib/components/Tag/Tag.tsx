import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';

import { base, colors, tagSizes, closeBtn, linkShape } from './tag-styles';

type TagOwnProps = {
  /** Semantic status color. */
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  closable?: boolean;
  onClose?: () => void;
  /**
   * Accessible label for the remove button. Inlined default keeps Tag
   * hook-free (RSC-safe: no useStrings); locale-aware callers pass
   * their own string.
   */
  removeLabel?: string;
  children: ReactNode;
};

/**
 * MUI-OverridableComponent-shaped polymorphism (Button's pattern): own
 * props first, then the target element's props minus the colliding keys.
 * The skin, `data-slot` and the remove button always land on/inside the
 * rendered element — the same "wiring wins" precedence as Button's `as`.
 * `ref` (and every native attribute) flows through to the rendered root.
 */
type TagProps<T extends ElementType = 'span'> = TagOwnProps & {
  /**
   * Render element. `'span'` (default) keeps the static tag; `'a'`
   * renders a clickable tag link — `href`, `target`, `rel` and the
   * rest of the anchor surface flow through, and the link shape resets
   * the UA underline so the tag looks identical to the `span` form.
   * Any component that forwards props to a DOM element works the same
   * way (e.g. a router Link).
   *
   * Don't combine an interactive `as` with `closable`: the remove
   * button would nest inside a link — invalid HTML and an SR/keyboard
   * trap.
   */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof TagOwnProps | 'as'>;

export default function Tag<T extends ElementType = 'span'>({
  color = 'default',
  size = 'md',
  closable = false,
  onClose,
  removeLabel = 'Remove',
  as,
  className,
  children,
  ...rest
}: TagProps<T>) {
  // Button's precedent names this `Tag`; here it would shadow the
  // component's own name, so the rendered root gets a neutral one.
  const Root = (as ?? 'span');
  return (
    <Root
      data-slot="tag"
      x-class={[base, colors[color], tagSizes[size], as !== undefined && linkShape, className]}
      {...rest}
    >
      {children}
      {closable && (
        <button
          data-slot="remove-button"
          type='button'
          className={closeBtn}
          aria-label={removeLabel}
          onClick={onClose}
        >
          ×
        </button>
      )}
    </Root>
  );
}

export type { TagOwnProps, TagProps };
