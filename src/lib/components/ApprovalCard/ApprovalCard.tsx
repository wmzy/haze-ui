import type { ReactNode } from 'react';

import { css } from '@linaria/core';

import { Button } from '../Button';
import { useStrings } from '../LocaleProvider';

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
  border: 1px solid var(--haze-color-warning);
  border-radius: var(--haze-radius-md);
  overflow: hidden;
  font-family: var(--haze-font-sans);
  background: var(--haze-color-bg);
`;

const header = css`
  padding: var(--haze-space-3) var(--haze-space-4);
  background: var(--haze-color-warning-subtle);
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

/** Local delta over Button's md skin: both actions stretch to share the
 * row's width equally (Button owns the rest of the chrome). */
const actionBtn = css`
  flex: 1;
`;

export default function ApprovalCard({
  title,
  description,
  onApprove,
  onDeny,
  approveText,
  denyText,
  children,
  className,
}: ApprovalCardProps) {
  const strings = useStrings('approvalCard');
  const titleLabel = title ?? strings.title;
  const approveLabel = approveText ?? strings.approve;
  const denyLabel = denyText ?? strings.deny;
  return (
    <div data-slot='approval-card' x-class={[card, className]}>
      <div data-slot='title' x-class={[header]}>{titleLabel}</div>
      <div data-slot='body' x-class={[body]}>
        {description && <div data-slot='description' x-class={[desc]}>{description}</div>}
        {children && <div data-slot='content' x-class={[content]}>{children}</div>}
      </div>
      <div data-slot='actions' x-class={[actions]}>
        <Button
          data-slot='deny-button'
          variant='outline'
          size='md'
          className={actionBtn}
          onClick={onDeny}
        >
          {denyLabel}
        </Button>
        <Button
          data-slot='approve-button'
          variant='solid'
          size='md'
          className={actionBtn}
          onClick={onApprove}
        >
          {approveLabel}
        </Button>
      </div>
    </div>
  );
}

export type { ApprovalCardProps };
