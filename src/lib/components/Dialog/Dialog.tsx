import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useCallback, useEffect, useId, useRef } from 'react';
import { useControl } from 'react-use-control';

import { useFocusScope } from '../../utils/focus-scope';
import { whenExitSettles } from '../../utils/presence';

type DialogProps = {
  open?: ControlOrValue<boolean>;
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

  &[open][data-state='open'] {
    animation: haze-dialog-in var(--haze-duration-normal) var(--haze-ease);
  }

  &[open][data-state='closed'] {
    animation: haze-dialog-out var(--haze-duration-fast) var(--haze-ease);
  }

  &::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  &[open][data-state='open']::backdrop {
    animation: haze-dialog-backdrop-in var(--haze-duration-normal)
      var(--haze-ease);
  }

  &[open][data-state='closed']::backdrop {
    animation: haze-dialog-backdrop-out var(--haze-duration-fast)
      var(--haze-ease);
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      var(--haze-shadow-xl),
      0 0 0 3px var(--haze-color-focus-ring);
  }

  @keyframes haze-dialog-in {
    from {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  @keyframes haze-dialog-out {
    to {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  @keyframes haze-dialog-backdrop-in {
    from {
      opacity: 0;
    }
  }

  @keyframes haze-dialog-backdrop-out {
    to {
      opacity: 0;
    }
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
  const ref = useRef<HTMLDialogElement | null>(null);
  // 声明在 showModal effect 之前：scope 激活时先记录 opener（此时的
  // activeElement 还没被 showModal 转进 dialog），关闭时由 scope 归还。
  // 原生 modal 已锁定 Tab，无需 trapped。
  const setScope = useFocusScope({ enabled: open, trapped: false });
  // 与 FormItem 的 haze-field-${useId} 同一套生成模式，保证前缀可读且不冲突。
  const titleId = `haze-dialog-title-${useId()}`;

  const setDialogRef = useCallback(
    (node: HTMLDialogElement | null) => {
      ref.current = node;
      setScope(node);
    },
    [setScope]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      // 退场动画（data-state=closed 驱动 CSS animation）结束后再真正
      // close()，原生 close 事件（onClose 回调链路）保持由 close 触发。
      // jsdom 无 CSS 时长 → whenExitSettles 跨 2 个 rAF 立即完成。
      const settle = whenExitSettles(el);
      const finish = () => {
        // settle 期间被重新打开时 data-state 已翻回 open，本退场流作废
        if (el.getAttribute('data-state') === 'closed') el.close();
      };
      if (settle) void settle.then(finish);
      else finish();
    }
  }, [open]);

  return (
    <dialog
      ref={setDialogRef}
      data-state={open ? 'open' : 'closed'}
      aria-labelledby={title !== undefined ? titleId : undefined}
      x-class={[overlay, className]}
      onClose={() => {
        setOpen(false);
        onClose?.();
      }}
      onCancel={(e) => {
        // 原生 Esc/backdrop 的关闭请求会绕过退场动画立即关闭 dialog：
        // 阻止默认行为，统一改走 React 状态 → 退场动画 → el.close()。
        e.preventDefault();
        setOpen(false);
      }}
      onClick={(e) => {
        if (e.target === ref.current) {
          // 只改状态：effect 里的 el.close() 会触发原生 close 事件，
          // onClose 在那个公共出口统一发生。这里再调一次 onClose?.()
          // 会双触发（backdrop 路径命中两次回调）。
          setOpen(false);
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
