import type { ReactNode, ComponentPropsWithoutRef  } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

import { useFocusScope } from '../../utils/focus-scope';
import { Presence } from '../../utils/presence';

type BottomSheetProps = {
  open?: ControlOrValue<boolean>;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

const overlay = css`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;

  /* Presence 注入的 data-state 驱动 backdrop 与内容各自的进退场 */
  &[data-state='open'] {
    animation: haze-sheet-backdrop-in var(--haze-duration-normal)
      var(--haze-ease);
  }

  &[data-state='closed'] {
    animation: haze-sheet-backdrop-out var(--haze-duration-fast)
      var(--haze-ease);
  }

  @keyframes haze-sheet-backdrop-in {
    from {
      opacity: 0;
    }
  }

  @keyframes haze-sheet-backdrop-out {
    to {
      opacity: 0;
    }
  }
`;

const sheet = css`
  background: var(--haze-color-bg);
  border-radius: var(--haze-radius-xl) var(--haze-radius-xl) 0 0;
  padding: var(--haze-space-4) var(--haze-space-6)
    calc(var(--haze-space-4) + env(safe-area-inset-bottom));
  max-width: 640px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text);
  box-shadow: var(--haze-shadow-xl);

  /* 退场时长须不大于 overlay 的退场（overlay 卸载即整树消失） */
  [data-state='open'] & {
    animation: haze-sheet-in var(--haze-duration-normal) var(--haze-ease);
  }

  [data-state='closed'] & {
    animation: haze-sheet-out var(--haze-duration-fast) var(--haze-ease);
  }

  @keyframes haze-sheet-in {
    from {
      transform: translateY(100%);
    }
  }

  @keyframes haze-sheet-out {
    to {
      transform: translateY(100%);
    }
  }
`;

const handle = css`
  width: 2rem;
  height: 0.25rem;
  background: var(--haze-color-border);
  border-radius: var(--haze-radius-full);
  margin: 0 auto var(--haze-space-4);
`;

export default function BottomSheet({
  open: openControl,
  onClose,
  children,
  className,
  ...rest
}: BottomSheetProps) {
  const [open, setOpen] = useControl(openControl, false);
  const setScope = useFocusScope({ enabled: open, trapped: true });

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Presence present={open}>
      <div
        x-class={[overlay, className]}
        onClick={() => {
          // 退场期间（已 setOpen(false)、Presence 尚未卸载）不再重复关闭
          if (open) handleClose();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open) handleClose();
        }}
      >
        <div
          ref={setScope}
          role="dialog"
          aria-modal="true"
          x-class={[sheet]}
          {...rest}
          onClick={(e) => e.stopPropagation()}
        >
          <div x-class={[handle]} />
          {children}
        </div>
      </div>
    </Presence>
  );
}

export type { BottomSheetProps };
