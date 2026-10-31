import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useId, useRef } from 'react';
import { useControl } from 'react-use-control';

import { Bell } from '../../icons';
import { classnames } from '../../utils/classnames';
import { FloatingPanel } from '../../utils/floating';
import { useMenuPanel } from '../../utils/menu-panel';
import { panelSurface, popoverPanelHidden } from '../../utils/panel-skin';
import { quietIconButton } from '../../utils/quiet-button-skin';
import { statusSubtleColors } from '../../utils/status-skin';
import { Badge } from '../Badge';
import { mergeClassNames, useConfigDefaults } from '../ConfigProvider/useConfigDefaults';
import { Icon } from '../Icon';
import { useStrings } from '../LocaleProvider';
import { formatString } from '../LocaleProvider/locale';

/**
 * Persistent notification center: a bell trigger with an unread-count
 * badge opening a floating panel that lists notifications — the durable
 * counterpart to Toast's transient stack (AntD `notification` /
 * Mantine `notifications` shape, declarative data instead of an
 * imperative `open()` API: the `items` prop is the source of truth and
 * `onMarkAllRead` / `onClearAll` hand the mutations back to the app).
 *
 * Panel positioning, light-dismiss and Escape ride the shared floating
 * engine (`utils/floating.tsx`); keyboard navigation reuses the Menu
 * system (`utils/menuKeyboard`) — arrows / Home / End / typeahead walk
 * the rows and the footer actions as one roving list, Escape / Tab
 * close and return focus to the trigger. No z-index is declared here:
 * every tier the panel can render on already resolves through the
 * `tokens/z-index.ts` ladder inside the floating path classes.
 */

/** Semantic status of a notification — tints the kind icon. */
type NotificationCenterSeverity = 'info' | 'success' | 'warning' | 'danger';

/** Origin of a notification (the AI-workbench differentiation): picks
 *  the leading glyph through the shared `Icon` wrapper. */
type NotificationCenterKind = 'task' | 'agent' | 'system';

/** One notification entry of the data-driven `items` prop. */
type NotificationCenterItem = {
  /** Stable identity (React key). */
  key: string;
  /** Primary line. */
  title: ReactNode;
  /** Secondary line under the title. */
  description?: ReactNode;
  /** Muted trailing line/label (already formatted — "2m ago"). */
  timestamp?: ReactNode;
  /** Status tint of the kind icon (built-in `'info'`). */
  severity?: NotificationCenterSeverity;
  /** Leading glyph (built-in `'system'`). */
  kind?: NotificationCenterKind;
  /** Read state — unread entries carry the dot accent and feed the
   *  trigger's badge count (built-in unread, like a fresh feed). */
  read?: boolean;
};

/**
 * Semantic slot classes (AntD v6 `classNames` shape), mirroring the
 * data-slot names: consumer classes append at the end of each part's
 * class list. A ConfigProvider `NotificationCenter.classNames` section
 * merges under the prop, per key.
 */
type NotificationCenterClassNames = {
  /** The wrapper `<span>` (`data-slot='notification-center'`). */
  root?: string;
  /** The bell `<button>` (`data-slot='trigger'`). */
  trigger?: string;
  /** The count badge wrapper (`data-slot='badge'`). */
  badge?: string;
  /** The floating panel (`data-slot='content'`). */
  panel?: string;
  /** The panel heading row (`data-slot='header'`). */
  header?: string;
  /** The heading itself (`data-slot='title'`). */
  title?: string;
  /** The list (`data-slot='list'`). */
  list?: string;
  /** Every notification row (`data-slot='notification-item'`). */
  item?: string;
  /** The kind/severity icon wrap (`data-slot='item-icon'`). */
  itemIcon?: string;
  /** A row's title/description column (`data-slot='item-body'`). */
  itemBody?: string;
  /** A row title (`data-slot='item-title'`). */
  itemTitle?: string;
  /** A row description (`data-slot='item-description'`). */
  itemDescription?: string;
  /** A row timestamp (`data-slot='item-timestamp'`). */
  itemTimestamp?: string;
  /** The unread dot (`data-slot='unread-dot'`). */
  unreadDot?: string;
  /** The footer action row (`data-slot='actions'`). */
  actions?: string;
  /** The mark-all-read button (`data-slot='mark-all-read'`). */
  markAllRead?: string;
  /** The clear-all button (`data-slot='clear-all'`). */
  clearAll?: string;
  /** The empty state (`data-slot='empty'`). */
  empty?: string;
};

type NotificationCenterProps = {
  /** The notification feed — declarative source of truth. */
  items?: NotificationCenterItem[];
  /** Panel visibility — controlled or uncontrolled, default closed. */
  open?: ControlOrValue<boolean>;
  /**
   * Badge count ceiling: higher unread counts render as `{max}+`
   * (built-in `99`; `0` keeps the badge rendered with a bare count).
   */
  maxBadgeCount?: number;
  /** Fires when the footer's mark-all-read is activated. */
  onMarkAllRead?: () => void;
  /** Fires when the footer's clear-all is activated. */
  onClearAll?: () => void;
  /**
   * Slot classes (see {@link NotificationCenterClassNames}); merged
   * over any ConfigProvider `NotificationCenter.classNames` section,
   * per key.
   */
  classNames?: NotificationCenterClassNames;
  className?: string;
  /** Forwarded to the root wrapper `<span>`. */
  ref?: Ref<HTMLSpanElement>;
} & Omit<ComponentPropsWithoutRef<'span'>, 'className' | 'children'>;

const container = css`
  position: relative;
  display: inline-flex;
`;

/* Bell trigger: the shared quietIconButton chrome (utils/quiet-button-skin)
 * plus the local seat geometry — the badge wrapper anchors to this relative
 * box. Ring and ink converge on the skin: the old 2px offset outline and the
 * text-secondary ink give way to the shared 3px box-shadow ring and the
 * muted→text shift (deliberate unification across the quiet buttons). The
 * forced-colors Highlight-outline fallback stays local (the skin ships none)
 * and doubles :focus-visible so it outspecifies the skin's outline:none
 * instead of trusting cross-module source order. */
const triggerBtn = css`
  position: relative;
  padding: var(--haze-space-2);
  border-radius: var(--haze-radius-md);

  @media (forced-colors: active) {
    &:focus-visible:focus-visible {
      outline: 2px solid Highlight;
      box-shadow: none;
    }
  }
`;

/** Corner seat for the count badge — logical insets so RTL mirrors. */
const badgeWrap = css`
  position: absolute;
  inset-block-start: 0;
  inset-inline-end: 0;
  pointer-events: none;
`;

/* Call-site deltas on the shared panel surface (utils/panel-skin): the
 * column lane the header/list/footer stack along, plus the width bounds
 * and padding step — the surface's border-box sizing keeps both bounds
 * covering the padding too. Zero property overlap with the surface: the
 * union reproduces the former local panelVisuals declaration-identical
 * (open-state rendering unchanged). */
const panelDeltas = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
  width: 360px;
  max-width: calc(100vw - var(--haze-space-4) * 2);
  padding: var(--haze-space-2);
`;

const panelHeader = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-1) var(--haze-space-2) var(--haze-space-2);
`;

const panelTitle = css`
  margin: 0;
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-semibold);
  line-height: var(--haze-leading-tight);
  color: var(--haze-color-text);
`;

const notificationList = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 60vh;
  overflow-y: auto;
`;

const notificationItem = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-2);
  padding: var(--haze-space-2);
  border-radius: var(--haze-radius-md);
  background: transparent;

  &:focus-visible {
    outline: none;
    background: var(--haze-color-bg-muted);
    box-shadow: 0 0 0 2px var(--haze-color-focus-ring);
  }

  @media (forced-colors: active) {
    &:focus-visible {
      outline: 2px solid Highlight;
      box-shadow: none;
    }
  }
`;

/** Unread rows carry a subtle wash besides the dot accent. */
const itemUnread = css`
  background: var(--haze-color-primary-subtle);

  &:focus-visible {
    background: var(--haze-color-primary-subtle);
  }
`;

const unreadDot = css`
  flex-shrink: 0;
  width: var(--haze-space-2);
  height: var(--haze-space-2);
  margin-block-start: var(--haze-space-1);
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-primary);
`;

const itemIconWrap = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: var(--haze-space-6);
  height: var(--haze-space-6);
  border-radius: var(--haze-radius-md);
`;

/* Severity tint of the kind icon — Alert's subtle/status pairing, picked
 * from the shared status skin (utils/status-skin.ts). */
const severityColors = {
  info: statusSubtleColors.info,
  success: statusSubtleColors.success,
  warning: statusSubtleColors.warning,
  danger: statusSubtleColors.danger,
} as const;

const itemBody = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
  flex: 1;
  min-width: 0;
`;

const itemTitle = css`
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-tight);
`;

const itemDescription = css`
  color: var(--haze-color-text-secondary);
  line-height: var(--haze-leading-normal);
`;

const itemTimestamp = css`
  flex-shrink: 0;
  margin-block-start: var(--haze-space-1);
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
`;

const panelActions = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--haze-space-2);
  padding: var(--haze-space-2) var(--haze-space-1) var(--haze-space-1);
  border-top: 1px solid var(--haze-color-border);
`;

/* Footer actions: the shared quietIconButton chrome plus the compact
 * text-button metrics. The skin's hover arm is :not(:disabled)-guarded,
 * so a disabled action keeps the resting muted ink with no local
 * re-mute patch — only the not-allowed cursor stays local. Ring
 * convergence as on the trigger: 2px offset outline → the shared 3px
 * box-shadow ring; the forced-colors Highlight fallback stays local with
 * the doubled-pseudo specificity. */
const actionBtn = css`
  appearance: none;
  padding: var(--haze-space-1) var(--haze-space-2);
  border-radius: var(--haze-radius-sm);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);

  &:disabled {
    cursor: not-allowed;
  }

  @media (forced-colors: active) {
    &:focus-visible:focus-visible {
      outline: 2px solid Highlight;
      box-shadow: none;
    }
  }
`;

const emptyState = css`
  padding: var(--haze-space-8) var(--haze-space-4);
  text-align: center;
  color: var(--haze-color-text-muted);
`;

/** `task` kind — checklist square. */
function TaskGlyph() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <rect x='3' y='4' width='7' height='7' rx='1' />
      <path d='m5 7.5 1.5 1.5L9.5 5.5' />
      <path d='M13 6h8' />
      <path d='M13 12h8' />
      <path d='M13 18h8' />
      <path d='M3.5 13.5 5 15' />
      <path d='M7.5 12.5 5 15l-1.5 4' />
    </svg>
  );
}

/** `agent` kind — bot face with antenna. */
function AgentGlyph() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <rect x='5' y='9' width='14' height='11' rx='2' />
      <path d='M12 9V5' />
      <circle cx='12' cy='3.5' r='1.5' />
      <path d='M9 14v1.5' />
      <path d='M15 14v1.5' />
    </svg>
  );
}

/** `system` kind — cpu/core. */
function SystemGlyph() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <rect x='6' y='6' width='12' height='12' rx='2' />
      <rect x='10' y='10' width='4' height='4' rx='1' />
      <path d='M12 2v4' />
      <path d='M12 18v4' />
      <path d='M2 12h4' />
      <path d='M18 12h4' />
    </svg>
  );
}

const kindGlyphs = {
  task: <TaskGlyph />,
  agent: <AgentGlyph />,
  system: <SystemGlyph />,
} as const;

/**
 * The roving list the Menu keyboard layer walks: notification rows plus
 * the footer actions, in DOM order — rows first (the auto-focus target),
 * actions after (End reaches them), disabled actions skipped.
 */
const PANEL_ITEM_SELECTOR =
  ":where([data-slot='notification-item'], [data-slot='mark-all-read'], [data-slot='clear-all']):not([disabled])";

export default function NotificationCenter({
  items = [],
  open: openControl,
  maxBadgeCount = 99,
  onMarkAllRead,
  onClearAll,
  classNames,
  className,
  ref,
  ...rest
}: NotificationCenterProps) {
  const [open, setOpen] = useControl(openControl, false);
  const strings = useStrings('notificationCenter');
  // ConfigProvider `NotificationCenter.classNames` merges under the
  // prop, per key — an explicit slot on the component wins.
  const config = useConfigDefaults('NotificationCenter');
  const resolvedClassNames = mergeClassNames(config, classNames);

  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Panel wiring (floating + roving tabindex + menu keyboard + focus
  // scope) rides the shared hook — the declaration-order race contract
  // lives there (utils/menu-panel).
  const { floating, handleKeyDown: handlePanelKeyDown, setPanelRef } = useMenuPanel({
    open,
    setOpen,
    triggerRef,
    selector: PANEL_ITEM_SELECTOR,
  });

  const unreadCount = items.reduce(
    (count, item) => (item.read ? count : count + 1),
    0
  );
  const triggerLabel =
    unreadCount > 0
      ? formatString(strings.triggerLabelUnread, { count: unreadCount })
      : strings.triggerLabel;
  const badgeLabel =
    unreadCount > maxBadgeCount ? `${maxBadgeCount}+` : String(unreadCount);

  return (
    <span
      ref={ref}
      data-slot='notification-center'
      x-class={[container, resolvedClassNames?.root]}
      {...rest}
    >
      <button
        ref={triggerRef}
        type='button'
        data-slot='trigger'
        x-class={[quietIconButton, triggerBtn, resolvedClassNames?.trigger]}
        style={floating.triggerStyle}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={id}
        aria-label={triggerLabel}
        onPointerDown={floating.onTriggerPointerDown}
        onClick={floating.onTriggerClick}
      >
        <Icon icon={Bell} size='md' />
        {unreadCount > 0 && (
          <span data-slot='badge' x-class={[badgeWrap, resolvedClassNames?.badge]}>
            <Badge color='danger' size='sm'>
              {badgeLabel}
            </Badge>
          </span>
        )}
      </button>
      <FloatingPanel
        ref={setPanelRef}
        behavior={floating}
        placement='bottom-end'
        id={id}
        role='dialog'
        aria-label={strings.panelTitle}
        visualClass={`${panelSurface} ${popoverPanelHidden}`}
        className={classnames(panelDeltas, resolvedClassNames?.panel, className)}
        onKeyDown={handlePanelKeyDown}
      >
        <div data-slot='header' x-class={[panelHeader, resolvedClassNames?.header]}>
          <h2 data-slot='title' x-class={[panelTitle, resolvedClassNames?.title]}>
            {strings.panelTitle}
          </h2>
        </div>
        {items.length > 0 ? (
          <ul
            data-slot='list'
            x-class={[notificationList, resolvedClassNames?.list]}
          >
            {items.map((item) => {
              const severity = item.severity ?? 'info';
              const kind = item.kind ?? 'system';
              const unread = item.read !== true;
              return (
                <li
                  key={item.key}
                  data-slot='notification-item'
                  data-severity={severity}
                  data-kind={kind}
                  x-class={[
                    notificationItem,
                    unread && itemUnread,
                    resolvedClassNames?.item,
                  ]}
                >
                  {unread && (
                    <span
                      data-slot='unread-dot'
                      role='img'
                      aria-label={strings.unreadLabel}
                      x-class={[unreadDot, resolvedClassNames?.unreadDot]}
                    />
                  )}
                  <span
                    data-slot='item-icon'
                    x-class={[
                      itemIconWrap,
                      severityColors[severity],
                      resolvedClassNames?.itemIcon,
                    ]}
                  >
                    <Icon size='sm'>{kindGlyphs[kind]}</Icon>
                  </span>
                  <span data-slot='item-body' x-class={[itemBody, resolvedClassNames?.itemBody]}>
                    <span
                      data-slot='item-title'
                      x-class={[itemTitle, resolvedClassNames?.itemTitle]}
                    >
                      {item.title}
                    </span>
                    {item.description !== undefined && (
                      <span
                        data-slot='item-description'
                        x-class={[
                          itemDescription,
                          resolvedClassNames?.itemDescription,
                        ]}
                      >
                        {item.description}
                      </span>
                    )}
                    {item.timestamp !== undefined && (
                      <span
                        data-slot='item-timestamp'
                        x-class={[
                          itemTimestamp,
                          resolvedClassNames?.itemTimestamp,
                        ]}
                      >
                        {item.timestamp}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div data-slot='empty' x-class={[emptyState, resolvedClassNames?.empty]}>
            {strings.empty}
          </div>
        )}
        <div
          data-slot='actions'
          x-class={[panelActions, resolvedClassNames?.actions]}
        >
          <button
            type='button'
            data-slot='mark-all-read'
            tabIndex={-1}
            x-class={[quietIconButton, actionBtn, resolvedClassNames?.markAllRead]}
            disabled={unreadCount === 0}
            onClick={onMarkAllRead}
          >
            {strings.markAllRead}
          </button>
          <button
            type='button'
            data-slot='clear-all'
            tabIndex={-1}
            x-class={[quietIconButton, actionBtn, resolvedClassNames?.clearAll]}
            disabled={items.length === 0}
            onClick={onClearAll}
          >
            {strings.clearAll}
          </button>
        </div>
      </FloatingPanel>
    </span>
  );
}

export type {
  NotificationCenterClassNames,
  NotificationCenterItem,
  NotificationCenterKind,
  NotificationCenterProps,
  NotificationCenterSeverity,
};
