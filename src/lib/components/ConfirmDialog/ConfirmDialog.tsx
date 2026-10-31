import type { ReactNode, ComponentPropsWithoutRef } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';
import { css } from '@linaria/core';
import { useId } from 'react';

import Button from '../Button/Button';
import { useStrings } from '../LocaleProvider';

import { dangerRemapTokens } from '../../utils/danger-remap';
import { dialogBackdrop, dialogPanelMotion } from '../../utils/dialog-skin';
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
 * lane behind Dialog's component tokens — declaration-for-declaration
 * Dialog's `panelDeltas` (`--haze-dialog-padding`/`--haze-dialog-width`),
 * so theming Dialog themes ConfirmDialog's sheet identically. Border,
 * radius, elevation, typography and the forced-colors arm come from the
 * surface — the hand-rolled sheet this replaces carried no
 * forced-colors border at all. The enter/exit animations and the
 * `::backdrop` scrim are the shared dialog-skin companions
 * (`dialogPanelMotion`/`dialogBackdrop`), driven by the native-dialog
 * shell's data-state on the panel itself; the showModal top layer
 * replaces the old self-drawn mask div's z-index tier.
 */
const sheet = css`
  padding: var(--haze-dialog-padding, var(--haze-space-6));
  max-width: var(--haze-dialog-width, 480px);
  width: 100%;
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
 * onto the danger family on the confirm button itself (the shared
 * utils/danger-remap class Popconfirm's `okVariant='danger'` also
 * wears).
 */

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
      x-class={[panelSurface, sheet, dialogPanelMotion, dialogBackdrop, className]}
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
          className={variant === 'danger' ? dangerRemapTokens : undefined}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}

export type { ConfirmDialogProps };
