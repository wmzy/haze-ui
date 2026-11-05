import type {
  ComponentPropsWithoutRef,
  Dispatch,
  MouseEvent,
  ReactNode,
  Ref,
  SetStateAction,
} from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { createContext, useContext, useId } from 'react';
import { useControl } from 'react-use-control';

import { useStrings } from '../LocaleProvider';
import { Tooltip } from '../Tooltip';
import { focusRingVisible } from '../../utils/focus-ring';
import {
  handlePlaceholderHrefNavigate,
  resolveNavAriaCurrent,
  resolveNavCurrent,
} from '../../utils/nav-link';
import { navItemActive, navItemBase, navItemIcon } from '../../utils/nav-item-skin';
import { quietIconButton } from '../../utils/quiet-button-skin';

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  /** id of the inner nav landmark — the toggle's aria-controls target. */
  navId: string;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

function useSidebarContext() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('Sidebar compound components must be used within <Sidebar>');
  return ctx;
}

// ---------------------------------------------------------------------------
// Sidebar (root)
// ---------------------------------------------------------------------------

type SidebarProps = {
  /** Collapsed state: a plain boolean for controlled usage, a Control for uncontrolled, or omitted. */
  collapsed?: ControlOrValue<boolean>;
  /** Initial collapsed state in uncontrolled mode. */
  defaultCollapsed?: boolean;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'aside'>, 'children'>;

const sidebar = css`
  display: flex;
  flex-direction: column;
  /* Two-step width, token-ized: consumers theme the rail by overriding
   * these custom properties on the root (or a theme class). The sized
   * box is border-box so the inline-end boundary stays inside the
   * declared width (panel-family box-sizing contract). */
  box-sizing: border-box;
  width: var(--haze-sidebar-width, 16rem);
  height: 100%;
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  border-inline-end: 1px solid var(--haze-color-border);
  font-family: var(--haze-font-sans);
  overflow: hidden;
  transition: width var(--haze-duration-normal) var(--haze-ease);

  &[data-state='collapsed'] {
    width: var(--haze-sidebar-width-collapsed, 3.5rem);
  }
`;

const nav = css`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-4);
  padding: var(--haze-space-3);
  overflow-y: auto;
  overflow-x: hidden;
`;

export default function Sidebar({
  collapsed: collapsedControl,
  defaultCollapsed = false,
  className,
  children,
  ...rest
}: SidebarProps) {
  const [collapsed, setCollapsed] = useControl(collapsedControl, defaultCollapsed);
  const navId = useId();

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, navId }}>
      <aside
        data-slot="sidebar"
        x-class={[sidebar, className]}
        data-state={collapsed ? 'collapsed' : 'expanded'}
        {...rest}
      >
        <nav data-slot="viewport" id={navId} x-class={nav}>
          {children}
        </nav>
      </aside>
    </SidebarContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// SidebarGroup
// ---------------------------------------------------------------------------

type SidebarGroupProps = {
  /** Muted group heading, hidden entirely while collapsed. */
  title?: ReactNode;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'title'>;

const group = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
`;

const groupTitle = css`
  padding: var(--haze-space-2);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export function SidebarGroup({ title, className, children, ...rest }: SidebarGroupProps) {
  const { collapsed } = useSidebarContext();

  return (
    <div data-slot="group" x-class={[group, className]} {...rest}>
      {title && !collapsed && <div data-slot="group-label" x-class={groupTitle}>{title}</div>}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SidebarItem
// ---------------------------------------------------------------------------

type SidebarItemProps = {
  /** Leading icon; rendered inside a fixed-size, aria-hidden slot. */
  icon?: ReactNode;
  /**
   * Explicit active state. Falls back to `aria-current="page"` when
   * omitted, letting routers drive highlighting through the aria attribute.
   */
  active?: boolean;
  children: ReactNode;
  /**
   * Native click handler: receives the underlying mouse event. Whether to
   * call `event.preventDefault()` is up to the caller, except for
   * placeholder hrefs where SidebarItem keeps button semantics.
   */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
  /** Ref to the underlying anchor (React 19 ref-as-prop). */
  ref?: Ref<HTMLAnchorElement>;
} & Omit<ComponentPropsWithoutRef<'a'>, 'children' | 'onClick' | 'className'>;

/* Sizing/typography delta on the shared navItemBase chrome
 * (utils/nav-item-skin.ts). The sidebar row is a block-level flex row
 * growing from the inline-start edge, so navItemBase's centered
 * inline-flex is suppressed through a raised-specificity arm (the
 * anchor already carries data-slot='item') — never through source
 * order, which disagrees between dev injection and dist split-css. */
const item = css`
  gap: var(--haze-space-3);
  min-width: 0;
  padding: var(--haze-space-2);
  border-radius: var(--haze-radius-md);
  font-size: var(--haze-text-sm);
  text-decoration: none;
  white-space: nowrap;

  &[data-slot='item'] {
    display: flex;
    justify-content: flex-start;
  }

  /* The keyboard ring composes utils/focus-ring's focusRingVisible
   * (adds the forced-colors Highlight arm the local copy never had). */

  /* Icon mode: the Tooltip wrapper span blockifies into a row flex item;
   * fill it and center the icon instead of stacking icon + hidden label. */
  [data-state='collapsed'] & {
    flex: 1;
    justify-content: center;
    padding-inline: 0;
  }
`;

/* Active delta on the shared navItemActive arm (utils/nav-item-skin.ts):
 * the sidebar marks the current view with the primary family — primary
 * text pinned through hover over a primary-subtle wash — plus the local
 * resting chrome (medium weight, subtle wash). The resting background
 * rides the raised-specificity arm to clear navItemBase's plain
 * background: transparent without relying on source order. */
const itemActive = css`
  --haze-nav-item-active-color: var(--haze-color-primary);
  --haze-nav-item-active-hover-bg: var(--haze-color-primary-subtle);
  font-weight: var(--haze-weight-medium);

  &[data-slot='item'] {
    background: var(--haze-color-primary-subtle);
  }
`;

/* Row-flex seat on the shared navItemIcon slot: the sidebar's icon must
 * not shrink under a long label (flex items default to shrink). */
const itemIconShrink = css`
  flex-shrink: 0;
`;

const itemLabel = css`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;

  /* Collapsed: visually hidden but kept in the accessibility tree so the
   * anchor never loses its accessible name — the Tooltip covers sighted
   * pointer/keyboard users, the clipped span covers screen readers. The
   * clip recipe is direction-agnostic (RTL-safe). */
  [data-state='collapsed'] & {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    border: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;

export function SidebarItem({
  icon,
  active,
  href = '#',
  onClick,
  className,
  children,
  'aria-current': ariaCurrent,
  ref,
  ...rest
}: SidebarItemProps) {
  const { collapsed } = useSidebarContext();
  const isActive = resolveNavCurrent(active, ariaCurrent);

  const anchor = (
    <a
      ref={ref}
      data-slot="item"
      x-class={[
        navItemBase,
        item,
        focusRingVisible,
        isActive && navItemActive,
        isActive && itemActive,
        className,
      ]}
      href={href}
      aria-current={resolveNavAriaCurrent(isActive, ariaCurrent)}
      onClick={handlePlaceholderHrefNavigate(href, onClick)}
      {...rest}
    >
      {icon && (
        <span data-slot="icon" x-class={[navItemIcon, itemIconShrink]} aria-hidden="true">
          {icon}
        </span>
      )}
      <span data-slot="label" x-class={itemLabel}>{children}</span>
    </a>
  );

  if (!collapsed) return anchor;

  /* Physical placement follows the repo floating convention (RTL apps
   * mirror the rail and would pass the mirrored side themselves when
   * composing Tooltip directly). */
  return (
    <Tooltip content={children} position="right">
      {anchor}
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// SidebarFooter
// ---------------------------------------------------------------------------

type SidebarFooterProps = {
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

const footer = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
  padding: var(--haze-space-3);
  border-block-start: 1px solid var(--haze-color-border);
`;

export function SidebarFooter({ className, children, ...rest }: SidebarFooterProps) {
  return (
    <div data-slot="footer" x-class={[footer, className]} {...rest}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SidebarToggle
// ---------------------------------------------------------------------------

type SidebarToggleProps = {
  /** Native click handler, invoked after the built-in collapse flip. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'button'>, 'type' | 'onClick' | 'className'>;

/* Collapse toggle: the shared quietIconButton chrome (utils/quiet-button-skin)
 * plus the rail's square seat — align-self/width/height are local layout
 * geometry, radius is the local delta. The transition timing converges on
 * the skin's plain ease (was var(--haze-ease)). */
const toggle = css`
  align-self: flex-end;
  width: var(--haze-space-8);
  height: var(--haze-space-8);
  border-radius: var(--haze-radius-md);
`;

const toggleIcon = css`
  width: 16px;
  height: 16px;
  transition: transform var(--haze-duration-fast) var(--haze-ease);

  [data-state='collapsed'] & {
    transform: rotate(180deg);
  }
`;

const ChevronTowardsStart = () => (
  <svg
    data-slot="icon"
    x-class={toggleIcon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export function SidebarToggle({ onClick, className, ...rest }: SidebarToggleProps) {
  const { collapsed, setCollapsed, navId } = useSidebarContext();
  const strings = useStrings('sidebar');

  return (
    <button
      type="button"
      data-slot="toggle-button"
      x-class={[quietIconButton, toggle, className]}
      aria-label={collapsed ? strings.expand : strings.collapse}
      aria-expanded={!collapsed}
      aria-controls={navId}
      onClick={(event) => {
        setCollapsed((prev) => !prev);
        onClick?.(event);
      }}
      {...rest}
    >
      <ChevronTowardsStart />
    </button>
  );
}

export type {
  SidebarProps,
  SidebarGroupProps,
  SidebarItemProps,
  SidebarFooterProps,
  SidebarToggleProps,
};
