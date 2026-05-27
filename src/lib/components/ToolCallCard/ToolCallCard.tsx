import type { ReactNode } from 'react';

import { css } from '@linaria/core';

type ToolCallStatus = 'pending' | 'running' | 'done' | 'error';

type ToolCallCardProps = {
  name: string;
  input?: ReactNode;
  output?: ReactNode;
  status?: ToolCallStatus;
  className?: string;
};

const card = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  overflow: hidden;
`;

const header = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-2) var(--haze-space-3);
  background: var(--haze-color-muted);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
`;

const statusIcon = css`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--haze-radius-full);
  flex-shrink: 0;
`;

const statusPending = css`background: var(--haze-color-text-muted);`;
const statusRunning = css`background: var(--haze-color-primary); animation: pulse 1.5s infinite;`;
const statusDone = css`background: var(--haze-color-success, #16a34a);`;
const statusError = css`background: var(--haze-color-danger, #dc2626);`;

const body = css`
  padding: var(--haze-space-3);
`;

const section = css`
  margin-bottom: var(--haze-space-2);
`;

const sectionLabel = css`
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  margin-bottom: var(--haze-space-1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const content = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--haze-color-text);
`;

const statusClassMap: Record<ToolCallStatus, string> = {
  pending: statusPending,
  running: statusRunning,
  done: statusDone,
  error: statusError,
};

const statusLabelMap: Record<ToolCallStatus, string> = {
  pending: 'Pending',
  running: 'Running...',
  done: 'Done',
  error: 'Error',
};

export default function ToolCallCard({
  name,
  input,
  output,
  status = 'pending',
  className,
}: ToolCallCardProps) {
  return (
    <div x-class={[card, className]}>
      <div x-class={[header]}>
        <span x-class={[statusIcon, statusClassMap[status]]} />
        <span>{name}</span>
        <span style={{ marginLeft: 'auto', color: 'var(--haze-color-text-muted)' }}>
          {statusLabelMap[status]}
        </span>
      </div>
      {(input || output) && (
        <div x-class={[body]}>
          {input && (
            <div x-class={[section]}>
              <div x-class={[sectionLabel]}>Input</div>
              <div x-class={[content]}>{input}</div>
            </div>
          )}
          {output && (
            <div x-class={[section]}>
              <div x-class={[sectionLabel]}>Output</div>
              <div x-class={[content]}>{output}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { ToolCallCardProps, ToolCallStatus };
