import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react';
import type { TabsVariant } from './TabsContext';

import { css } from '@linaria/core';

import { useStrings } from '../LocaleProvider';

import { useTabsContext } from './TabsContext';

/** Document-tab status flavors — each maps to a dot color (see `TabStatusDot`). */
type TabStatus = 'dirty' | 'error' | 'syncing';

type TabProps = {
  value: string;
  /**
   * Inline-start icon slot, decorative (`aria-hidden`) — pair it with a
   * text label so the meaning survives screen readers.
   */
  icon?: ReactNode;
  /**
   * Document-tab status indicator: a small dot after the label —
   * `dirty` renders neutral (text-secondary), `error` danger,
   * `syncing` primary. The dot itself is color-only decoration; the
   * SR-visible status word appended to the tab's accessible name comes
   * from `statusLabel` (or its per-status default).
   */
  status?: TabStatus;
  /**
   * Overrides the status word appended to the accessible name when
   * `status` is set — the i18n hook for SR users (the dot alone cannot
   * carry meaning). Defaults come from the `tabs` locale pack
   * (Unsaved changes / Error / Syncing).
   */
  statusLabel?: ReactNode;
  /**
   * Inert tab: not clickable, excluded from the strip's roving
   * keyboard model (the `disabled` attribute on the plain button, plus
   * `aria-disabled` on the closable div form), and skipped by the ⋯
   * overflow menu's radios. Purely visual on the tab itself — why a
   * tab is disabled stays the consumer's story to tell.
   */
  disabled?: boolean;
  /**
   * Renders the × close affordance. Purely notifying: activating it
   * calls `onClose` and nothing else — removing the tab from the
   * (controlled) tabs array and picking the next active tab are the
   * consumer's job. If the active tab is closed and the consumer does
   * not remove it, the selection stays put on the still-rendered tab.
   *
   * Keyboard: the × is a real button, but not a tab stop — the strip
   * keeps its single roving stop per the tabs pattern, and closing by
   * keyboard rides the Delete key on the focused tab (APG deletable
   * tabs).
   */
  closable?: boolean;
  /** Overrides the × button's aria-label (i18n hook). */
  closeLabel?: string;
  /**
   * Called when the user requests a close — × click, or Delete on the
   * focused tab. The × click is stopped before it can reach the strip,
   * so closing never selects the tab.
   */
  onClose?: (
    event: ReactMouseEvent<HTMLSpanElement> | ReactKeyboardEvent<HTMLDivElement>
  ) => void;
  className?: string;
  children: ReactNode;
};

const base = css`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-2) var(--haze-space-4);
  /* Anchors the closable tab's absolutely-positioned ×. */
  position: relative;
  border: none;
  background: transparent;
  color: var(--haze-color-text-muted);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  cursor: pointer;
  transition:
    color var(--haze-duration-fast),
    border-color var(--haze-duration-fast),
    background-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);

  /* Chrome-style strip sizing: tabs size to their content and
   * COMPRESS when the strip runs short (flex-shrink) instead of
   * scrolling — down to a minimum that keeps icon plus a word.
   * The active tab raises that floor so the selected tab stays
   * comfortably wide while its siblings compress. max-width
   * keeps one tab from hogging the strip; overflow hidden
   * contains a compressed label inside its box (the ellipsis
   * itself rides on the consumer's label span).
   *
   * border-box is load-bearing here: the min-width floors
   * (120/64px) must bound the BOX, or a content-box tab's
   * floor becomes min + padding and the tab overflows a
   * wrapper compressed below that — overlapping its neighbor. */
  flex: 0 1 auto;
  min-width: calc(var(--haze-space-8) * 2);
  max-width: calc(var(--haze-space-16) * 4);
  overflow: hidden;
  white-space: nowrap;

  &:hover {
    color: var(--haze-color-text);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  /* Forced-colors: the UA forces the transparent inactive underline to
     CanvasText (transparent borders do not survive), so every tab
     gains an underline that merges with the strip line — acceptable
     noise, but it also means selection can no longer ride the
     underline. The box-shadow focus ring is dropped by the UA — an
     inset Highlight outline replaces it (the strip scrolls, an outer
     outline would clip). */
  @media (forced-colors: active) {
    &:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }
  }
`;

/** The selected tab's raised compression floor — every variant: roughly
 * 1.5× the sibling minimum, so the active tab keeps a readable label
 * while the strip squeezes everything else first. */
const activeFloor = css`
  min-width: calc(var(--haze-space-10) * 3);
`;

/* ─── line (default): the classic underline strip ─────────────────── */

/** Line chrome: the transparent 2px underline slot (the selection
 * fills it) overlapping the strip's separator by its own 1px — the
 * active underline reads as piercing the rule. */
const lineTab = css`
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
`;

const lineTabActive = css`
  color: var(--haze-color-primary);
  border-bottom-color: var(--haze-color-primary);

  /* Forced-colors: the primary underline and text flatten onto
     CanvasText — the selected tab would be indistinguishable.
     The Windows-native selection renders instead: a Highlight
     chip with HighlightText content. */
  @media (forced-colors: active) {
    background: Highlight;
    color: HighlightText;
    border-bottom-color: Highlight;
  }
`;

/* ─── card: flat antd-style cards ─────────────────────────────────── */

/** Card chrome: a transparent full border reserves the selected card's
 * stroke (border-box — activating never reflows the row), rounded top
 * corners where the card would meet the panel below. */
const cardTab = css`
  border: 1px solid transparent;
  border-radius: var(--haze-radius-md) var(--haze-radius-md) var(--haze-radius-none) var(--haze-radius-none);

  &:hover {
    background: var(--haze-color-bg-subtle);
  }

  /* Forced-colors: a transparent border does not survive — an inset
     1px CanvasText outline bounds each card (keyboard focus still
     upgrades to the base class's Highlight ring). */
  @media (forced-colors: active) {
    outline: 1px solid CanvasText;
    outline-offset: -1px;
  }
`;

/** The raised flat card: the selection signal is the tab's own surface
 * + stroke, not an underline (the strip carries no separator in this
 * variant). */
const cardTabActive = css`
  background: var(--haze-color-bg);
  border-color: var(--haze-color-border);
  color: var(--haze-color-text);

  /* Forced-colors: the bg-surface selection flattens to Canvas — the
     Windows-native Highlight chip renders instead. */
  @media (forced-colors: active) {
    background: Highlight;
    color: HighlightText;
    border-color: Highlight;
  }
`;

/* ─── pill: the Segmented-style capsule ───────────────────────────── */

/** Pill chrome: fully rounded tabs riding in the strip's muted trough
 * (TabList's pill skin paints the trough). */
const pillTab = css`
  border-radius: var(--haze-radius-full);

  /* Forced-colors: an unselected pill is a transparent no-border
     button — an inset 1px CanvasText outline bounds it inside the
     trough (the Segmented button precedent). */
  @media (forced-colors: active) {
    outline: 1px solid CanvasText;
    outline-offset: -1px;
  }
`;

/** The lifted capsule — mirrors SegmentedCore's active segment: onto
 * the bg surface with the small elevation shadow. */
const pillTabActive = css`
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  box-shadow: var(--haze-shadow-sm);

  /* Forced-colors: the white-on-muted selection flattens with the
     shadow dropped — the Windows-native Highlight chip renders
     instead. */
  @media (forced-colors: active) {
    background: Highlight;
    color: HighlightText;
  }
`;

/** Per-variant skin pair — `idle` rides every tab of the variant,
 * `active` only the selected one (after the shared `activeFloor`). */
const tabVariants: Record<TabsVariant, { idle: string; active: string }> = {
  line: { idle: lineTab, active: lineTabActive },
  card: { idle: cardTab, active: cardTabActive },
  pill: { idle: pillTab, active: pillTabActive },
};

/** Disabled tabs stay visible but inert: pointer and keyboard
 * selection is blocked (the click handler and the roving model both
 * skip them) and the hover tint is pinned to the resting color. The
 * compound selectors outrank every variant's `:hover` regardless of
 * stylesheet emission order. */
const disabledClass = css`
  cursor: not-allowed;

  &[disabled],
  &[aria-disabled='true'] {
    color: var(--haze-color-text-muted);
  }

  &:hover:disabled,
  &:hover[aria-disabled='true'] {
    color: var(--haze-color-text-muted);
  }
`;

const iconSlot = css`
  display: inline-flex;
  align-items: center;
  flex: none;

  /* A bare svg without intrinsic dimensions collapses to 0×0 inside
     flex — sized to the tab's text like the Menu icon slot. */
  & svg {
    width: 1em;
    height: 1em;
  }
`;

const statusDot = css`
  display: inline-block;
  flex: none;
  width: var(--haze-space-2);
  height: var(--haze-space-2);
  border-radius: var(--haze-radius-full);
`;

const statusDotVariants = {
  dirty: css`
    background: var(--haze-color-text-secondary);
  `,
  error: css`
    background: var(--haze-color-danger);
  `,
  syncing: css`
    background: var(--haze-color-primary);
  `,
} as const;

const srOnly = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
`;

/**
 * The label side of a closable tab. The × must be a real control for
 * pointers, but focusable: a button cannot nest inside the tab
 * `<button>` (invalid HTML, unannounced by SR), an × button beside it
 * would break the tablist's tab-only ownership (axe
 * aria-required-children), and a focusable × inside the tab trips
 * axe's nested-interactive rule. So the closable tab promotes to a
 * div[role="tab"] and keeps every inner control UNFOCUSABLE — the
 * strip's single roving stop stays the tab itself, the × is a
 * non-focusable role="button" span for pointers/AT virtual cursor, and
 * closing by keyboard rides the Delete key (APG deletable tabs).
 */
const labelContent = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-2);
  /* Compression priority: the label yields first. Without
   * min-width: 0 the nowrap text's intrinsic width pins
   * this flex item and the tab's overflow:hidden clips
   * the right edge instead — hiding the × (and on a
   * closable tab the × must never hide). */
  min-width: 0;
  overflow: hidden;
`;

const closeGlyph = css`
  box-sizing: border-box;
  /* Out of the flex flow, pinned to the tab's right edge:
   * compression squeezes the label (and, at the floor, the
   * icon) but the × keeps its full 24px — it is the one
   * control a squeezed tab must never lose. The closable
   * tab's right padding (closablePad) reserves room for it
   * so it never overlaps the label. */
  position: absolute;
  top: 50%;
  inset-inline-end: var(--haze-space-4);
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: var(--haze-space-6);
  height: var(--haze-space-6);
  border-radius: var(--haze-radius-sm);
  color: var(--haze-color-text-muted);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-lg);
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: var(--haze-color-bg-muted);
    color: var(--haze-color-text);
  }
`;

/**
 * Right-padding reserve for a closable tab: the × rides
 * outside the flex flow (see closeGlyph), so the tab's box
 * must keep room for it even when the label and icon have
 * compressed to nothing. At the 64px sibling floor the
 * reserve consumes the whole content box — that is the
 * intended end state: a squeezed tab shows its × and
 * nothing else, Chrome-style.
 */
const closablePad = css`
  padding-inline-end: calc(
    var(--haze-space-4) + var(--haze-space-6) + var(--haze-space-2)
  );
`;

/** Status word keys — resolved per status from the `tabs` locale pack. */
const STATUS_STRING_KEYS: Record<TabStatus, 'statusDirty' | 'statusError' | 'statusSyncing'> = {
  dirty: 'statusDirty',
  error: 'statusError',
  syncing: 'statusSyncing',
};

/**
 * The decorative status dot shared by `Tab` and the TabList overflow
 * menu. Color-only by design (`aria-hidden`) — the SR-visible meaning
 * rides the tab's accessible name via `statusLabel`.
 */
export function TabStatusDot({ status }: { status: TabStatus }) {
  return (
    <span
      data-slot='tab-status-dot'
      aria-hidden='true'
      x-class={[statusDot, statusDotVariants[status]]}
    />
  );
}

export default function Tab({
  value,
  icon,
  status,
  statusLabel,
  closable = false,
  closeLabel,
  onClose,
  disabled = false,
  className,
  children,
}: TabProps) {
  const { value: current, setValue, variant, classNames } = useTabsContext();
  const strings = useStrings('tabs');
  const isActive = current === value;
  const skin = tabVariants[variant];

  const handleClose = (event: ReactMouseEvent<HTMLSpanElement>) => {
    // Notify only: the click must never select the tab. Stopping
    // propagation keeps the tab's own click handler (and anything
    // above the strip) out of the close gesture.
    event.stopPropagation();
    onClose?.(event);
  };

  const select = () => {
    if (!disabled) setValue(value);
  };

  const content = (
    <>
      {icon !== undefined && (
        <span data-slot='icon' aria-hidden='true' x-class={iconSlot}>
          {icon}
        </span>
      )}
      {children}
      {status !== undefined && (
        <>
          <TabStatusDot status={status} />
          {/* Appended (never aria-label, which would replace the text
              name) so screen readers hear "label + status". */}
          <span x-class={srOnly}>
            {statusLabel ?? strings[STATUS_STRING_KEYS[status]]}
          </span>
        </>
      )}
    </>
  );

  // Plain tabs stay native buttons — the long-standing shape. Closable
  // tabs promote the tab to a div[role="tab"] (rationale on
  // `labelContent` above): keyboard activation for the tab itself is
  // translated below, selection follows focus through TabList's
  // arrows, and Delete is the ×'s keyboard equivalent.
  if (!closable) {
    return (
      <button
        type='button'
        data-slot='tab'
        data-variant={variant}
        role='tab'
        aria-selected={isActive}
        aria-controls={`tabpanel-${value}`}
        // Roving tabindex (WAI-ARIA tabs): the active tab is the tab stop,
        // arrow keys in TabList move it — Tab itself stays out of the
        // page tab order.
        tabIndex={isActive ? 0 : -1}
        data-haze-tab-value={value}
        disabled={disabled}
        x-class={[
          base,
          skin.idle,
          isActive && activeFloor,
          isActive && skin.active,
          disabled && disabledClass,
          className,
          classNames?.tab,
        ]}
        onClick={select}
      >
        {content}
      </button>
    );
  }

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setValue(value);
      return;
    }
    // APG deletable tabs: Delete on the focused tab is the keyboard
    // equivalent of the × (which is not a tab stop).
    if (event.key === 'Delete') {
      event.preventDefault();
      onClose?.(event);
    }
  };

  return (
    <div
      data-slot='tab'
      data-variant={variant}
      role='tab'
      aria-selected={isActive}
      aria-disabled={disabled || undefined}
      aria-controls={`tabpanel-${value}`}
      tabIndex={isActive ? 0 : -1}
      data-haze-tab-value={value}
      x-class={[
        base,
        skin.idle,
        isActive && activeFloor,
        isActive && skin.active,
        disabled && disabledClass,
        closablePad,
        className,
        classNames?.tab,
      ]}
      onKeyDown={handleTabKeyDown}
      // The × stops its own propagation, so everything else on the tab
      // (label, chrome padding) selects.
      onClick={select}
    >
      <span data-slot='tab-label' x-class={labelContent}>
        {content}
      </span>
      <span
        role='button'
        data-slot='tab-close'
        aria-label={closeLabel ?? strings.close}
        x-class={closeGlyph}
        onClick={handleClose}
      >
        <span aria-hidden='true'>×</span>
      </span>
    </div>
  );
}

export type { TabProps, TabStatus };
