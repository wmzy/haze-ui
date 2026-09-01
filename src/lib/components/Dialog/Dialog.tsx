import type { ReactNode } from 'react';
import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useEffect, useId, useRef } from 'react';
import { useControl } from 'react-use-control';

type DialogProps = {
  open?: Control<boolean> | boolean;
  onClose?: () => void;
  /**
   * 对话框标题：渲染为 h2 并以生成的 id 关联 dialog 的
   * aria-labelledby，屏幕阅读器打开时才能朗读标题（原生 dialog 的
   * 可访问名默认为空）。不传时不生成空关联。
   */
  title?: ReactNode;
  className?: string;
  children: ReactNode;
};

const overlay = css`
  border: none;
  border-radius: var(--haze-radius-xl);
  padding: var(--haze-space-6);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  box-shadow: var(--haze-shadow-xl);
  max-width: 480px;
  width: 100%;

  &::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      var(--haze-shadow-xl),
      0 0 0 3px var(--haze-color-focus-ring);
  }
`;

const titleText = css`
  margin: 0 0 var(--haze-space-4);
  font-size: var(--haze-text-lg);
  font-weight: var(--haze-weight-semibold);
`;

export default function Dialog({
  open: openControl,
  onClose,
  title,
  className,
  children,
}: DialogProps) {
  const [open, setOpen] = useControl(openControl, false);
  const ref = useRef<HTMLDialogElement>(null);
  // 打开前的焦点元素（打开者）。showModal 会把焦点移进 dialog，原生关闭
  // 后浏览器只回落到 body——键盘用户会“迷路”，所以这里记下并主动归还。
  const openerRef = useRef<HTMLElement | null>(null);
  // 与 FormItem 的 haze-field-${useId} 同一套生成模式，保证前缀可读且不冲突。
  const titleId = `haze-dialog-title-${useId()}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      // 必须在 showModal 转移焦点之前记录打开者。
      openerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={title !== undefined ? titleId : undefined}
      x-class={[overlay, className]}
      onClose={() => {
        setOpen(false);
        // 原生 close 事件是所有关闭路径（Esc/cancel、backdrop、close()）
        // 的公共出口，在这里归还焦点即可全覆盖。
        openerRef.current?.focus();
        openerRef.current = null;
        onClose?.();
      }}
      onClick={(e) => {
        if (e.target === ref.current) {
          setOpen(false);
          onClose?.();
        }
      }}
    >
      {title !== undefined && (
        <h2 id={titleId} x-class={[titleText]}>
          {title}
        </h2>
      )}
      {children}
    </dialog>
  );
}

export type { DialogProps };
