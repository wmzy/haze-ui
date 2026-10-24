import type {
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  Ref,
} from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { FloatingPlacement } from '../../utils/floating';

import { css } from '@linaria/core';
import { useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import { FloatingPanel, useFloating } from '../../utils/floating';
import { useFocusScope } from '../../utils/focus-scope';
import { mergeRefs } from '../../utils/refs';
import Button from '../Button/Button';
import { useStrings } from '../LocaleProvider';

/**
 * Imperative handle exposed through the React 19 `ref` prop (the
 * floating-overlay family contract — Popover, DropdownMenu, Dialog,
 * Drawer, BottomSheet). `open`/`close` are state writes going through
 * the same `useFloating` path as the trigger's own clicks; `open`
 * respects `disabled` exactly like the trigger.
 */
type PopconfirmHandle = {
  /** Show the confirmation panel (a no-op while `disabled`). */
  open: () => void;
  /** Close the panel through the animated exit path. */
  close: () => void;
  /** Focus the trigger element. */
  focusTrigger: () => void;
};

/** Logical placements the panel supports (the floating engine's set minus `point`, which is ContextMenu's pointer mode). */
type PopconfirmPlacement = Exclude<FloatingPlacement, 'point'>;

type PopconfirmProps = {
  /** Panel heading — the confirmation question itself. */
  title?: ReactNode;
  /** Secondary explanation under the title. */
  description?: ReactNode;
  /** OK button label; defaults to the `confirmDialog.confirm` locale key. */
  okText?: string;
  /** Cancel button label; defaults to the `confirmDialog.cancel` locale key. */
  cancelText?: string;
  /** OK button tone. `danger` remaps the solid Button skin onto the danger token family. */
  okVariant?: 'primary' | 'danger';
  /** Decorative glyph rendered beside the title. */
  icon?: ReactNode;
  /**
   * Sent when the action is confirmed. A returned promise puts the OK
   * button into its busy phase (Button `loading`); the panel closes
   * once the promise resolves and stays open (busy lifted) if it
   * rejects — the antd contract: only a resolved async handler closes.
   */
  onConfirm?: () => void | Promise<unknown>;
  /** Sent when the action is cancelled; the same async contract as `onConfirm`, busy on the cancel button. */
  onCancel?: () => void | Promise<unknown>;
  /** Panel placement relative to the trigger (logical, inline-relative). */
  placement?: PopconfirmPlacement;
  /** Whether the panel is open (controlled or uncontrolled). */
  open?: ControlOrValue<boolean>;
  /** Inert trigger: no pointer or keyboard open while set. */
  disabled?: boolean;
  /** Consumer class for the floating panel. */
  className?: string;
  /** The trigger content. */
  children: ReactNode;
  /** Imperative handle (`open`/`close`/`focusTrigger`) — the overlay family's React 19 command-object ref. */
  ref?: Ref<PopconfirmHandle>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'title' | 'className'>;

const container = css`
  position: relative;
  display: inline-flex;
`;

/** Disabled trigger skin — the arm only matches while `aria-disabled` is set. */
const triggerDisabled = css`
  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

/** Visual skin applied on every rendering tier of the panel. */
const panelVisuals = css`
  /* min/max-width pairs with padding + border: border-box keeps both
   * bounds covering the padding too (panel-family box-sizing
   * contract). */
  box-sizing: border-box;
  padding: var(--haze-space-4);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  box-shadow: var(--haze-shadow-lg);
  min-width: 220px;
  max-width: 320px;

  /* Forced-colors: the UA keeps the author border visible by forcing
     its color to CanvasText — restated so the panel stays separated
     from the Canvas behind it deterministically. */
  @media (forced-colors: active) {
    border-color: CanvasText;
  }
`;

const body = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-2);
`;

const iconSlot = css`
  display: inline-flex;
  flex-shrink: 0;
  line-height: var(--haze-leading-normal);
`;

const textColumn = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
  min-width: 0;
`;

const titleStyle = css`
  font-weight: var(--haze-weight-semibold);
  line-height: var(--haze-leading-normal);
  color: var(--haze-color-text);
`;

const descriptionStyle = css`
  color: var(--haze-color-text-muted);
  line-height: var(--haze-leading-normal);
`;

const actions = css`
  display: flex;
  justify-content: flex-end;
  gap: var(--haze-space-2);
  margin-top: var(--haze-space-4);
`;

/**
 * `okVariant='danger'`: remaps the solid skin's primary tokens onto the
 * danger family on the OK button itself. Custom-property remapping (not
 * a background override) sidesteps any specificity fight with Button's
 * variant classes — the skin's own declarations simply resolve against
 * the danger tokens at this element. All three states are remapped
 * explicitly: hover/active derive at the theme element, so re-deriving
 * them from an overridden `--haze-color-primary` here would not work.
 */
const okDangerTokens = css`
  --haze-color-primary: var(--haze-color-danger);
  --haze-color-primary-hover: var(--haze-color-danger-hover);
  --haze-color-primary-active: var(--haze-color-danger-active);
`;

/** Thenable check for the async handler contract (plain objects with a `then`, not just `Promise` instances). */
function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PromiseLike<unknown>).then === 'function'
  );
}

export default function Popconfirm({
  title,
  description,
  okText,
  cancelText,
  okVariant = 'primary',
  icon,
  onConfirm,
  onCancel,
  placement = 'top',
  open: openControl,
  disabled = false,
  className,
  children,
  ref,
  ...rest
}: PopconfirmProps) {
  const [open, setOpen] = useControl(openControl, false);
  // Busy phase of the async action contract: which action button is
  // awaiting its handler. Purely internal UI state, never a prop.
  const [pending, setPending] = useState<'ok' | 'cancel' | null>(null);
  const strings = useStrings('confirmDialog');
  const okLabel = okText ?? strings.confirm;
  const cancelLabel = cancelText ?? strings.cancel;
  const id = useId();
  const titleId = `haze-popconfirm-title-${id}`;
  const descriptionId = `haze-popconfirm-description-${id}`;

  const triggerRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const floating = useFloating({
    open,
    setOpen,
    triggerRef,
    panelRef,
    animated: true,
  });

  // Focus return: records the element focused at open (the trigger in
  // every real flow) and hands focus back on close, unless the user has
  // deliberately focused elsewhere (light-dismiss click). autoFocus is
  // disabled — the panel itself is focused below, gated on the panel
  // actually being shown.
  const setScope = useFocusScope({ enabled: open, autoFocus: false });

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        if (!disabled) setOpen(true);
      },
      close: () => {
        setOpen(false);
      },
      focusTrigger: () => {
        triggerRef.current?.focus();
      },
    }),
    [setOpen, disabled]
  );

  // One shared exit for both actions: fire the handler, then close —
  // immediately for a sync handler, after the returned promise resolves
  // for an async one (with the pressed button busy in between). A
  // rejected promise lifts the busy phase but keeps the panel open for
  // a retry; the rejection itself is deliberately swallowed here (the
  // consumer's handler already knows it failed).
  const runAction = (which: 'ok' | 'cancel') => {
    if (pending === which) return;
    const result = (which === 'ok' ? onConfirm : onCancel)?.();
    if (!isThenable(result)) {
      setOpen(false);
      return;
    }
    setPending(which);
    void result.then(
      () => {
        setPending(null);
        setOpen(false);
      },
      () => {
        setPending(null);
      }
    );
  };

  // Move focus into the panel whenever it is actually shown, so
  // Enter/Escape work from the moment it opens and no close path can
  // strand focus (a native popover is display:none until showPopover()
  // runs — an ungated focus call is silently dropped, hence the
  // `floating.shown` gate). The panel container is the target: Enter
  // confirms and Escape cancels at the panel level, while Tab reaches
  // the action buttons, which keep their native key activation.
  useEffect(() => {
    if (!open || !floating.shown) return;
    panelRef.current?.focus();
  }, [open, floating.shown, panelRef]);

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      // Cancel is the panel's Escape contract. preventDefault keeps the
      // native tier's close-request away (a browser-side close would
      // skip onCancel); stopPropagation keeps the fallback tier's
      // document-level Escape close away for the same reason.
      event.preventDefault();
      event.stopPropagation();
      runAction('cancel');
      return;
    }
    if (event.key === 'Enter' && event.target === event.currentTarget) {
      // Enter confirms when the panel itself holds focus. On a focused
      // action button the native activation fires instead (target
      // differs), so the handler stays out of the way.
      event.preventDefault();
      runAction('ok');
    }
  };

  return (
    <span data-slot='popconfirm' className={container}>
      <span
        ref={triggerRef}
        data-slot='trigger'
        x-class={[triggerDisabled]}
        // aria-expanded requires an interactive role; a bare span is
        // role=generic, which ARIA 1.2 does not allow it on (same
        // reasoning as Popover's trigger).
        role='button'
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        aria-haspopup='dialog'
        aria-expanded={open}
        aria-controls={id}
        style={floating.triggerStyle}
        onPointerDown={disabled ? undefined : floating.onTriggerPointerDown}
        onClick={disabled ? undefined : floating.onTriggerClick}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === 'Enter' || event.key === ' ') {
            // The trigger is a span, not a button: Enter/Space have no
            // native activation, so the button contract is completed
            // here. preventDefault on Space keeps the page from
            // scrolling.
            event.preventDefault();
            floating.onTriggerClick();
            return;
          }
          if (event.key === 'Escape' && open) {
            // Focus may sit on the trigger while the panel is open
            // (Shift+Tab); Escape cancels from there too, on the same
            // path as the panel's own handler.
            event.preventDefault();
            event.stopPropagation();
            runAction('cancel');
          }
        }}
      >
        {children}
      </span>
      {/* {...rest} first, wiring after: consumer attributes ride along on
       * the panel, but the component's own contract (id, role, aria
       * wiring, keyboard model) always wins — the same precedence as
       * FormItem's `as`. */}
      <FloatingPanel
        ref={mergeRefs(panelRef, setScope)}
        behavior={floating}
        placement={placement}
        visualClass={panelVisuals}
        className={className}
        {...rest}
        id={id}
        role='dialog'
        tabIndex={-1}
        aria-labelledby={title !== undefined ? titleId : undefined}
        aria-describedby={description !== undefined ? descriptionId : undefined}
        onKeyDown={handlePanelKeyDown}
      >
        <div data-slot='body' x-class={[body]}>
          {icon !== undefined && (
            <span data-slot='icon' x-class={[iconSlot]}>
              {icon}
            </span>
          )}
          {(title !== undefined || description !== undefined) && (
            <div data-slot='text' x-class={[textColumn]}>
              {title !== undefined && (
                <div id={titleId} data-slot='title' x-class={[titleStyle]}>
                  {title}
                </div>
              )}
              {description !== undefined && (
                <div
                  id={descriptionId}
                  data-slot='description'
                  x-class={[descriptionStyle]}
                >
                  {description}
                </div>
              )}
            </div>
          )}
        </div>
        <div data-slot='actions' x-class={[actions]}>
          <Button
            data-slot='cancel'
            variant='outline'
            size='sm'
            loading={pending === 'cancel'}
            onClick={() => runAction('cancel')}
          >
            {cancelLabel}
          </Button>
          <Button
            data-slot='ok'
            variant='solid'
            size='sm'
            className={okVariant === 'danger' ? okDangerTokens : undefined}
            loading={pending === 'ok'}
            onClick={() => runAction('ok')}
          >
            {okLabel}
          </Button>
        </div>
      </FloatingPanel>
    </span>
  );
}

export type { PopconfirmProps, PopconfirmHandle, PopconfirmPlacement };
