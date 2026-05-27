import type { ReactNode } from 'react';

import { css } from '@linaria/core';

type ApprovalCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  onApprove?: () => void;
  onDeny?: () => void;
  approveText?: string;
  denyText?: string;
  children?: ReactNode;
  className?: string;
};

const card = css`
  border: 1px solid var(--haze-color-warning, #eab308);
  border-radius: var(--haze-radius-md);
  overflow: hidden;
  font-family: var(--haze-font-sans);
  background: var(--haze-color-bg);
`;

const header = css`
  padding: var(--haze-space-3) var(--haze-space-4);
  background: var(--haze-color-warning-light, #fef9c3);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text);
`;

const body = css`
  padding: var(--haze-space-3) var(--haze-space-4);
`;

const desc = css`
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-muted);
  margin-bottom: var(--haze-space-3);
`;

const content = css`
  margin-bottom: var(--haze-space-3);
`;

const actions = css`
  display: flex;
  gap: var(--haze-space-2);
  padding: var(--haze-space-3) var(--haze-space-4);
  border-top: 1px solid var(--haze-color-border);
`;

const btn = css`
  flex: 1;
  padding: var(--haze-space-2) var(--haze-space-4);
  border-radius: var(--haze-radius-md);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  font-weight: var(--haze-weight-medium);
  cursor: pointer;
  transition: background 0.15s;
`;

const denyBtn = css`
  background: var(--haze-color-bg);
  border: 1px solid var(--haze-color-border);
  color: var(--haze-color-text);

  &:hover {
    background: var(--haze-color-muted);
  }
`;

const approveBtn = css`
  background: var(--haze-color-primary);
  border: 1px solid var(--haze-color-primary);
  color: var(--haze-color-bg);

  &:hover {
    opacity: 0.9;
  }
`;

export default function ApprovalCard({
  title = 'Approval Required',
  description,
  onApprove,
  onDeny,
  approveText = 'Approve',
  denyText = 'Deny',
  children,
  className,
}: ApprovalCardProps) {
  return (
    <div x-class={[card, className]}>
      <div x-class={[header]}>{title}</div>
      <div x-class={[body]}>
        {description && <div x-class={[desc]}>{description}</div>}
        {children && <div x-class={[content]}>{children}</div>}
      </div>
      <div x-class={[actions]}>
        <button x-class={[btn, denyBtn]} type="button" onClick={onDeny}>
          {denyText}
        </button>
        <button x-class={[btn, approveBtn]} type="button" onClick={onApprove}>
          {approveText}
        </button>
      </div>
    </div>
  );
}

export type { ApprovalCardProps };
