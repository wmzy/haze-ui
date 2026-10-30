import type { ReactNode } from 'react';

import type { AgenticStatus, AgenticStatusTone } from '../../utils/agentic-status';

import { css } from '@linaria/core';

import { useStrings } from '../LocaleProvider';
import { agenticStatusLabel, agenticStatusTone } from '../../utils/agentic-status';
import { statusSolidColors } from '../../utils/status-solid-skin';
import { disclosureMonoBody } from '../../utils/timeline-skin';

type ToolCallStatus = AgenticStatus;

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
  background: var(--haze-color-bg-muted);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
`;

const statusIcon = css`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--haze-radius-full);
  flex-shrink: 0;
`;

/* Flat header discs — this family's own marker geometry (borderless,
   half the ring size), filled through the shared solid status axis
   (utils/status-solid-skin): each agentic tone picks its arm below,
   the muted tone riding the `default` arm. No pulse animation:
   `pulse` keyframes were never defined, so the declaration never ran
   — the running state stays a solid primary disc. */
const toneKey: Record<AgenticStatusTone, keyof typeof statusSolidColors> = {
  muted: 'default',
  primary: 'primary',
  success: 'success',
  danger: 'danger',
};

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

/* Mono payload body: the shared disclosureMonoBody skin plus this
   card's explicit text tone (Trace's TraceDetails inherits instead). */
const content = css`
  color: var(--haze-color-text);
`;

/* Status label pinned to the header's trailing edge in the muted tone. */
const statusLabel = css`
  margin-inline-start: auto;
  color: var(--haze-color-text-muted);
`;

export default function ToolCallCard({
  name,
  input,
  output,
  status = 'pending',
  className,
}: ToolCallCardProps) {
  const strings = useStrings('toolCallCard');

  return (
    <div data-slot='tool-call-card' x-class={[card, className]}>
      <div data-slot='header' x-class={[header]}>
        <span
          data-slot='indicator'
          x-class={[statusIcon, statusSolidColors[toneKey[agenticStatusTone[status]]]]}
        />
        <span data-slot='tool-name'>{name}</span>
        <span data-slot='status' x-class={[statusLabel]}>
          {agenticStatusLabel(status, strings)}
        </span>
      </div>
      {(input || output) && (
        <div data-slot='body' x-class={[body]}>
          {input && (
            <div data-slot='params' x-class={[section]}>
              <div data-slot='label' x-class={[sectionLabel]}>{strings.inputLabel}</div>
              <div data-slot='content' x-class={[disclosureMonoBody, content]}>{input}</div>
            </div>
          )}
          {output && (
            <div data-slot='result' x-class={[section]}>
              <div data-slot='label' x-class={[sectionLabel]}>{strings.outputLabel}</div>
              <div data-slot='content' x-class={[disclosureMonoBody, content]}>{output}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { ToolCallCardProps, ToolCallStatus };
