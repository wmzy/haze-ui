import type { ReactNode, ComponentPropsWithoutRef } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';
import { css } from '@linaria/core';
import { useId } from 'react';

import Button from '../Button/Button';
import { useStrings } from '../LocaleProvider';

import { panelSurface } from '../../utils/panel-skin';
import { useNativeDialogShell } from '../../utils/native-dialog';

type ConfirmDialogProps = {
  open?: ControlOrValue<boolean>;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  title?: ReactNode;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  className?: string;
} & Omit<
  ComponentPropsWithoutRef<'dialog'>,
  'children' | 'title' | 'open' | 'onClose' | 'onCancel'
>;

/**
 * Sheet deltas on the shared panel surface (utils/panel-skin): the modal
 * lane (space-6 padding, 480px max, full width up to it) plus the
 * enter/exit animations, driven by the native-dialog shell's data-state
 * on the panel itself (the `open` attribute guard keeps a closed panel
 * from animating once `close()` lands). Border, radius, elevation,
 * typography and the forced-colors arm come from the surface — the
 * hand-rolled sheet this replaces carried no forced-colors border at all.
 *
 * The scrim the old self-drawn mask div painted is the native
 * `::backdrop` now: same token, same fades, and the showModal top layer
 * replaces the z-index tier.
 */
const sheet = css`
  padding: var(--haze-space-6);
  max-width: 480px;
  width: 100%;

  &[open][data-state='open'] {
    animation: haze-confirm-in var(--haze-duration-normal) var(--haze-ease);
  }

  &[open][data-state='closed'] {
    animation: haze-confirm-out var(--haze-duration-fast) var(--haze-ease);
  }

  &::backdrop {
    background: var(--haze-color-scrim);
  }

  &[open][data-state='open']::backdrop {
    animation: haze-confirm-backdrop-in var(--haze-duration-normal)
      var(--haze-ease);
  }

  &[open][data-state='closed']::backdrop {
    animation: haze-confirm-backdrop-out var(--haze-duration-fast)
      var(--haze-ease);
  }

  @keyframes haze-confirm-in {
    from {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  @keyframes haze-confirm-out {
    to {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  @keyframes haze-confirm-backdrop-in {
    from {
      opacity: 0;
    }
  }

  @keyframes haze-confirm-backdrop-out {
    to {
      opacity: 0;
    }
  }
`;

const header = css`
  margin-bottom: var(--haze-space-4);
  font-size: var(--haze-text-lg);
  font-weight: var(--haze-weight-semibold);
`;

const body = css`
  margin-bottom: var(--haze-space-6);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-muted);
  line-height: var(--haze-leading-relaxed);
`;

const footer = css`
  display: flex;
  justify-content: flex-end;
  gap: var(--haze-space-3);
`;

/**
 * `variant='danger'`: remaps the solid Button skin's primary tokens
 * onto the danger family on the confirm button itself (Popconfirm's
 * `okDangerTokens` pattern — custom-property remapping sidesteps any
 * specificity fight with Button's variant classes; hover/active derive
 * at the theme element, so all three states are remapped explicitly).
 */
const confirmDangerTokens = css`
  --haze-color-primary: var(--haze-color-danger);
  --haze-color-primary-hover: var(--haze-color-danger-hover);
  --haze-color-primary-active: var(--haze-color-danger-active);
`;

export default function ConfirmDialog({
  open: openControl,
  onClose,
  onConfirm,
  onCancel,
  title,
  children,
  confirmText,
  cancelText,
  variant = 'default',
  className,
  ...rest
}: ConfirmDialogProps) {
  const [open, setOpen] = useControl(openControl, false);
  const strings = useStrings('confirmDialog');
  const confirmLabel = confirmText ?? strings.confirm;
  const cancelLabel = cancelText ?? strings.cancel;
  // 面板生命周期（showModal、退场动画→close、Esc/背景点击关闭三件套、
  // 焦点域与归还）与 Dialog/Drawer 共用同一原语；ConfirmDialog 不暴露
  // viewTransition/keepMounted/handle——两参固定关闭，公开 API 不变。
  const {setDialogRef, dialogProps} = useNativeDialogShell({
    open,
    setOpen,
    viewTransition: false,
    onClose,
    keepMounted: false,
  });
  // 标题作为 dialog 的可访问名（aria-dialog-name），与 Dialog 同一模式
  const titleId = `haze-confirm-title-${useId()}`;

  // onClose 不在这里直接调：所有出口（按钮/Esc/背景点击）只写状态，
  // 退场动画落地 el.close() 触发的原生 close 事件是唯一 onClose 出口
  // （每个关闭路径恰好回调一次）。
  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  const handleConfirm = () => {
    onConfirm?.();
    setOpen(false);
  };

  return (
    <dialog
      ref={setDialogRef}
      data-slot='content'
      {...dialogProps}
      aria-labelledby={title !== undefined ? titleId : undefined}
      x-class={[panelSurface, sheet, className]}
      {...rest}
    >
      {title && (
        <div id={titleId} data-slot='title' x-class={[header]}>
          {title}
        </div>
      )}
      <div data-slot='description' x-class={[body]}>{children}</div>
      <div data-slot='footer' x-class={[footer]}>
        <Button
          data-slot='cancel-button'
          variant='outline'
          size='md'
          onClick={handleCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          data-slot='confirm-button'
          variant='solid'
          size='md'
          className={variant === 'danger' ? confirmDangerTokens : undefined}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}

export type { ConfirmDialogProps };
