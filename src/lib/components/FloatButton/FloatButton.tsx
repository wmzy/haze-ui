import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ElementType,
  MouseEvent,
  ReactNode,
} from 'react';

import { fab, shapes, variants, anchored, iconBox, descBox } from './float-button-styles';
import { PlusGlyph } from './float-button-glyphs';
import { useFloatButtonGroup } from './float-button-context';

/**
 * A floating action button pinned to the inline-end / block-end screen
 * corner — the "primary action" affordance material design popularized.
 * General-purpose: any global action (create, chat, share…). For the
 * specific "scroll back up" action keep `BackToTop`, which owns its own
 * scroll-watching logic.
 *
 * Pass `href` to render a real anchor (navigation keeps ⌘/middle-click
 * and crawlability — the ButtonLink rationale); without it a
 * `<button type='button'>` is rendered and the rest of the native
 * attributes spread through.
 *
 * `variant` follows Button's `solid | outline | ghost` semantics over
 * the same color tokens; only the elevation (FAB shadow) is
 * FloatButton-specific. The default icon is a plus glyph — `icon`
 * replaces it (give a custom `svg` explicit width/height, or wrap it in
 * `Icon`).
 *
 * Standalone use fixes the button to the corner via logical insets
 * (RTL-safe; `--haze-float-button-offset` re-themes the gap). Inside a
 * `FloatButtonGroup` the button drops its own anchor and joins the
 * group's expandable menu.
 *
 * An icon-only FloatButton has no accessible name — pass `aria-label`
 * (it spreads through like any native attribute) or a `description`.
 */
type FloatButtonOwnProps = {
  /** Icon slot; defaults to a plus glyph. Purely decorative (hidden
   * from AT) — the accessible name comes from `description` or
   * `aria-label`. */
  icon?: ReactNode;
  /** Text beside the icon (pill-shaped button); doubles as the
   * accessible name. */
  description?: ReactNode;
  shape?: 'circle' | 'square';
  /** Button-aligned color variant over the same tokens. */
  variant?: 'solid' | 'outline' | 'ghost';
  /** Render an anchor navigating to this URL instead of a button. */
  href?: string;
  /**
   * Element-agnostic click: whatever element `as` rendered, the
   * consumer's handler fires first — the group's close-menu wiring
   * rides after it.
   */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

/**
 * Polymorphic like Button's `as`: the FAB skin, the group wiring and
 * the fixed anchor always land on the rendered element. `as` wins over
 * the href duality's element choice (`as='a'` plus `href`, or a router
 * Link component); without `as`, `href` alone still renders an anchor —
 * the long-standing shape. `type='button'` is gated to the
 * native-button shape, so anchors never carry it.
 */
type FloatButtonProps<T extends ElementType = 'button'> = FloatButtonOwnProps & {
  /** Render element — overrides the href duality's button/anchor
   * choice; any component that forwards props and ref to a DOM element
   * works (a router Link is the canonical case). */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof FloatButtonOwnProps | 'as' | 'type'> &
  // The href duality keeps the anchor surface (target/rel/download…)
  // first-class on the default shape too — the same acceptance the
  // pre-`as` intersection gave anchors without spelling `as='a'`.
  Omit<ComponentPropsWithoutRef<'a'>, keyof FloatButtonOwnProps | 'children' | 'type' | 'onClick' | 'className'>;

export default function FloatButton<T extends ElementType = 'button'>({
  icon,
  description,
  shape = 'circle',
  variant = 'solid',
  href,
  as,
  className,
  onClick,
  ...rest
}: FloatButtonProps<T>) {
  const group = useFloatButtonGroup();

  // as wins over the href duality; href alone keeps the anchor shape.
  const Tag = (as ?? (href != null ? 'a' : 'button'));
  const isNativeButton = as !== undefined ? as === 'button' : href == null;

  // AntD behavior: activating a menu item dismisses the menu. The
  // group's own trigger is not a FloatButton, so this only fires for
  // menu children.
  const content = (
    <>
      <span data-slot='icon' x-class={[iconBox]} aria-hidden='true'>
        {icon ?? <PlusGlyph />}
      </span>
      {description != null && <span data-slot='description' x-class={[descBox]}>{description}</span>}
    </>
  );

  const classes = [fab, shapes[shape], variants[variant], !group && anchored, className];

  return (
    <Tag
      {...(isNativeButton ? { type: 'button' as const } : {})}
      href={href}
      data-slot='float-button'
      x-class={classes}
      {...rest}
      onClick={(event: MouseEvent<HTMLElement>) => {
        // Element-agnostic event: whatever element `as` rendered, the
        // consumer's handler sees it, typed element-agnostic above.
        onClick?.(event);
        group?.closeMenu();
      }}
    >
      {content}
    </Tag>
  );
}

export type { FloatButtonOwnProps, FloatButtonProps };
