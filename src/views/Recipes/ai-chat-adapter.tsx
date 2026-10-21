import type { ReactNode } from 'react';
import type { PlanStatus, QueueStatus, ToolCallStatus } from '@/lib';

import { useCallback, useMemo } from 'react';
import { css } from '@linaria/core';

import {
  ChatMessage,
  InlineCitation,
  Plan,
  PlanItem,
  Queue,
  QueueItem,
  StepTimeline,
  StepTimelineItem,
  StreamingText,
  ThinkingIndicator,
  ToolCallCard,
} from '@/lib';

// ─── Duck-typed `useChat` shapes ────────────────────────────────────────
//
// The `ai` / `@ai-sdk/react` packages are NOT dependencies here. These are
// the minimal structural types a real `useChat` return value satisfies:
// every field except `type` is `unknown` and narrowed at runtime, so parts
// from any SDK version — or hand-built fixtures like the mock in this
// recipe — slot in without imports. The senders are declared as methods
// with `this: void`: method parameters check bivariantly, so the SDK's
// narrower `sendMessage(message: { text: string } | …)` still assigns to
// the `(message: unknown)` slot below.

export type ChatStatusLike = 'submitted' | 'streaming' | 'ready' | 'error';

/** Structural slice of the AI SDK's `UIMessagePart` union. */
export type UIPartLike = {
  type: string;
  text?: unknown; // 'text' | 'reasoning'
  state?: unknown; // 'streaming' | 'done' (text / reasoning parts)
  toolCallId?: unknown; // 'tool-call' | 'tool-result' | `tool-${string}`
  toolName?: unknown; // v4 'tool-call'
  args?: unknown; // v4 'tool-call'
  result?: unknown; // v4 'tool-result'
  isError?: unknown; // v4 'tool-result' convention
  input?: unknown; // v5 `tool-${string}`
  output?: unknown; // v5 `tool-${string}`
  states?: unknown; // v5 `tool-${string}` — e.g. ['output-available']
  id?: unknown; // v5 data/tool part identifier — feeds consumer callbacks
  source?: unknown; // 'source' — { url, title, snippet? } (ag-ui shape)
  url?: unknown; // 'source-url' — ai-sdk v5 keeps url/title on the part
  title?: unknown; // 'source-url'
  duration?: unknown; // reasoning thinking time in ms (ag-ui top-level)
  providerMetadata?: unknown; // ai-sdk v5 — { [provider]: { duration?: number } }
  data?: unknown; // `data-*` parts — payload object (ai-sdk v5 custom data parts / ag-ui state)
};

/** Structural slice of the AI SDK's `UIMessage`. */
export type UIMessageLike = {
  id?: unknown;
  role?: unknown; // 'system' | 'user' | 'assistant'
  parts?: unknown; // UIPartLike[]
};

/** Structural slice of `useChat`'s return value the adapter consumes. */
export type UseChatLike = {
  messages?: unknown;
  status?: unknown;
  error?: unknown;
  // `this: void` keeps the methods detachable (lint) and the params
  // bivariant (typecheck), so the SDK's narrower sender signatures still
  // assign to these slots.
  sendMessage?(this: void, message: unknown): unknown; // v5 sender
  append?(this: void, message: unknown): unknown; // v4 sender
  stop?(this: void): void;
};

/**
 * Consumer callbacks for the rendered transcript. The adapter is a pure
 * map with no store — `onQueueRemove` is how a real app wires the
 * `data-queue` remove buttons back into its own state; without it the
 * queue items render inert (the recipe demo's choice — document yours).
 */
export type RenderUIOptions = {
  /** Fires with the queue part's id and the removed item's id. */
  onQueueRemove?: (partId: string, itemId: string) => void;
};

// ─── Tolerance helpers ─────────────────────────────────────────────────

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

/**
 * JSON value → display text for ToolCallCard panels: strings pass through,
 * structures pretty-print, anything unserializable (circular objects)
 * degrades to a placeholder instead of throwing.
 */
function toDisplay(value: unknown): string | undefined {
  if (value === undefined || value === null || typeof value === 'function') {
    return undefined;
  }
  if (typeof value === 'string') return value;
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint' ||
    typeof value === 'symbol'
  ) {
    return value.toString();
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '[unserializable]';
  }
}

// ─── Tool parts → ToolCallCard view ────────────────────────────────────

type ToolCardView = {
  name: string;
  input?: string;
  output?: string;
  status: ToolCallStatus;
};

/**
 * One part → one card view. v5 embeds the tool name in the part type
 * (`tool-getWeather`) and tracks lifecycle in `states`; v4 splits a call
 * across `tool-call` (name + args) and `tool-result` (matched by
 * `toolCallId`) — the result is folded into the call's card, and an
 * unmatched call stays `running` until its result lands.
 */
function toolCardView(
  part: UIPartLike,
  resultsByCallId: Map<string, UIPartLike>,
  callIds: Set<string>
): ToolCardView | null {
  if (part.type === 'tool-call') {
    const callId = asString(part.toolCallId);
    const result = callId ? resultsByCallId.get(callId) : undefined;
    return {
      name: asString(part.toolName) || 'tool',
      input: toDisplay(part.args),
      output: toDisplay(result?.result),
      status: result ? (result.isError === true ? 'error' : 'done') : 'running',
    };
  }
  if (part.type === 'tool-result') {
    const callId = asString(part.toolCallId);
    // Its call renders the pair — skip the standalone card.
    if (callId && callIds.has(callId)) return null;
    return {
      name: asString(part.toolName) || 'tool',
      output: toDisplay(part.result),
      status: part.isError === true ? 'error' : 'done',
    };
  }
  // v5 `tool-<name>`
  const states = asArray(part.states).filter((s): s is string => typeof s === 'string');
  const status: ToolCallStatus = states.includes('output-error')
    ? 'error'
    : states.includes('output-available')
      ? 'done'
      : states.length > 0
        ? 'running'
        : 'pending';
  return {
    name: part.type.slice('tool-'.length) || 'tool',
    input: toDisplay(part.input),
    output: toDisplay(part.output),
    status,
  };
}

// ─── Agentic part views (sources / plans / queues) ────────────────────

type CitationView = { href: string; title: string; snippet?: string };

/**
 * `source` / `source-url` part → citation badge data. ai-sdk v5's
 * `source-url` keeps `url`/`title` on the part itself; the nested
 * `source` object is the agentic/ag-ui convention this recipe's mock
 * uses. Parts without a usable URL are skipped — nothing to cite.
 */
function citationView(part: UIPartLike): CitationView | null {
  if (part.type === 'source-url') {
    if (typeof part.url !== 'string' || !part.url) return null;
    return { href: part.url, title: asString(part.title) || part.url };
  }
  if (part.type !== 'source' || !isObject(part.source)) return null;
  const source = part.source;
  const url = typeof source.url === 'string' ? source.url : '';
  if (!url) return null;
  return {
    href: url,
    title: asString(source.title) || url,
    snippet: asString(source.snippet) || undefined,
  };
}

/** Reasoning thinking time → compact StepTimeline label, if reported. */
function reasoningTime(part: UIPartLike): string | undefined {
  const metadata = isObject(part.providerMetadata) ? part.providerMetadata : undefined;
  const nested = metadata
    ? Object.values(metadata).find(
        (value): value is Record<string, unknown> =>
          isObject(value) && typeof value.duration === 'number' && value.duration > 0
      )
    : undefined;
  const ms: unknown =
    typeof part.duration === 'number' && part.duration > 0
      ? part.duration
      : nested?.duration;
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) return undefined;
  return ms < 1000 ? `${Math.round(ms)}ms` : `${Math.round(ms / 100) / 10}s`;
}

/** `completed` / `in progress` / `in-progress` → `completed` / `in_progress`. */
const normalizeStatus = (value: unknown): string =>
  asString(value).trim().toLowerCase().replace(/[\s-]+/g, '_');

type PlanItemView = { key: string; label: string; description?: string; status: PlanStatus };

/** Status vocabularies agentic runtimes emit → Plan's statuses. */
const PLAN_STATUS: Record<string, PlanStatus> = {
  pending: 'pending',
  queued: 'pending',
  planned: 'pending',
  not_started: 'pending',
  active: 'active',
  in_progress: 'active',
  running: 'active',
  started: 'active',
  done: 'done',
  completed: 'done',
  complete: 'done',
  succeeded: 'done',
  error: 'error',
  failed: 'error',
  skipped: 'skipped',
  cancelled: 'skipped',
  canceled: 'skipped',
};

/**
 * `data-plan` payload → Plan view (ag-ui's plan state / ai-sdk v5
 * custom data parts). `data.state` is the plan-level phase
 * (draft/active/done); each step's own status drives its rendered item,
 * and a step without a label-ish string gets a positional fallback.
 */
function planView(part: UIPartLike): { title: string; items: PlanItemView[] } | null {
  const data = isObject(part.data) ? part.data : {};
  const steps = asArray(data.steps).filter(isObject);
  if (steps.length === 0) return null;
  return {
    title: asString(data.title) || 'Plan',
    items: steps.map((step, index) => ({
      key: asString(step.id) || `step-${index}`,
      label:
        asString(step.label) ||
        asString(step.title) ||
        asString(step.name) ||
        `Step ${index + 1}`,
      description: asString(step.description) || undefined,
      status: PLAN_STATUS[normalizeStatus(step.status)] ?? 'pending',
    })),
  };
}

type QueueItemView = { id: string; title: string; description?: string; status: QueueStatus };

/** Status vocabularies agentic runtimes emit → Queue's statuses. */
const QUEUE_STATUS: Record<string, QueueStatus> = {
  queued: 'queued',
  pending: 'queued',
  waiting: 'queued',
  planned: 'queued',
  sending: 'sending',
  active: 'sending',
  running: 'sending',
  in_progress: 'sending',
  failed: 'failed',
  error: 'failed',
};

/**
 * `data-queue` payload → Queue view: `data.items[]` each own a status;
 * item ids feed the remove callback, positional fallbacks when absent.
 */
function queueView(part: UIPartLike): { items: QueueItemView[] } | null {
  const data = isObject(part.data) ? part.data : {};
  const items = asArray(data.items).filter(isObject);
  if (items.length === 0) return null;
  return {
    items: items.map((item, index) => ({
      id: asString(item.id) || `item-${index}`,
      title:
        asString(item.title) ||
        asString(item.label) ||
        asString(item.name) ||
        `Item ${index + 1}`,
      description: asString(item.description) || undefined,
      status: QUEUE_STATUS[normalizeStatus(item.status)] ?? 'queued',
    })),
  };
}

// ─── Part rendering ────────────────────────────────────────────────────

const textBody = css`
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-relaxed);
  white-space: pre-wrap;
`;

const reasoningBody = css`
  margin: 0;
  white-space: pre-wrap;
`;

const citationStrip = css`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--haze-space-1) var(--haze-space-2);
  margin-block-start: var(--haze-space-2);
`;

type PartRender = {
  key: string;
  /** True while this message is the last one and the run is in flight. */
  live: boolean;
  /** Identity of this part for consumer callbacks (ai-sdk data part id). */
  partId: string;
  resultsByCallId: Map<string, UIPartLike>;
  callIds: Set<string>;
  /** Consumer remove hook for `data-queue` items, when provided. */
  onQueueRemove?: (partId: string, itemId: string) => void;
};

function renderPart(part: UIPartLike, opts: PartRender): ReactNode {
  const { key, live } = opts;

  // Text — `StreamingText` typewrites the part while it streams; note it
  // restarts its reveal whenever `text` grows, so it fits parts that
  // arrive whole (batched transports / final flushes). For char-by-char
  // streams render the plain block instead — see the recipe's limits.
  if (part.type === 'text') {
    const text = asString(part.text);
    if (!text) return null;
    return live && part.state === 'streaming' ? (
      <StreamingText key={key} text={text} />
    ) : (
      <div key={key} className={textBody}>
        {text}
      </div>
    );
  }

  // Reasoning — dots while the model thinks with nothing to show yet;
  // once text exists the transcript is a collapsible StepTimeline row,
  // `running` while the part streams and `done` when it settles, with
  // the thinking time the transport reported (if any).
  if (part.type === 'reasoning') {
    const text = asString(part.text);
    if (!text) {
      return live && part.state === 'streaming' ? <ThinkingIndicator key={key} /> : null;
    }
    return (
      <StepTimeline key={key}>
        <StepTimelineItem
          label='Thought process'
          status={part.state === 'streaming' ? 'running' : 'done'}
          time={reasoningTime(part)}
          collapsible
          content={<p className={reasoningBody}>{text}</p>}
        />
      </StepTimeline>
    );
  }

  // Tools — every `tool-*` type maps to one ToolCallCard. Kept flat on
  // purpose: cards already render in part order, so wrapping each in a
  // collapsible StepTimeline row would add nesting without adding state.
  if (part.type.startsWith('tool-')) {
    const view = toolCardView(part, opts.resultsByCallId, opts.callIds);
    if (!view) return null;
    return <ToolCallCard key={key} {...view} />;
  }

  // Plan — `data-plan` carries an agentic execution plan: `data.state`
  // is the phase, `data.steps[]` each own a status that drives Plan's
  // computed progress summary.
  if (part.type === 'data-plan') {
    const view = planView(part);
    if (!view) return null;
    return (
      <Plan key={key} title={view.title}>
        {view.items.map((item) => (
          <PlanItem
            key={item.key}
            label={item.label}
            description={item.description}
            status={item.status}
          />
        ))}
      </Plan>
    );
  }

  // Queue — `data-queue` carries outbox items being delivered. Removal
  // is the consumer's business (this map holds no state): pass
  // `options.onQueueRemove` to arm the remove buttons, otherwise they
  // render inert.
  if (part.type === 'data-queue') {
    const view = queueView(part);
    if (!view) return null;
    const onQueueRemove = opts.onQueueRemove;
    return (
      <Queue key={key}>
        {view.items.map((item) => (
          <QueueItem
            key={item.id}
            title={item.title}
            description={item.description}
            status={item.status}
            {...(onQueueRemove
              ? {
                  onRemove: () => onQueueRemove(opts.partId, item.id),
                  removeLabel: `Remove ${item.title}`,
                }
              : {})}
          />
        ))}
      </Queue>
    );
  }

  // Sources are collected in renderUIMessages (numbering spans the
  // message); unknown part types (step-start, other data-*, file, …)
  // are skipped.
  return null;
}

// ─── messages → ReactNode[] ────────────────────────────────────────────

/**
 * Pure mapping from a `useChat`-shaped object to nodes the agent
 * components render directly:
 *
 * - message         → `ChatMessage` bubble (role, user send status)
 * - text part       → plain block, or `StreamingText` while it streams
 * - reasoning part  → `ThinkingIndicator` while streaming with no text,
 *                     then a collapsible `StepTimeline` row (running →
 *                     done, thinking time when reported)
 * - tool part       → `ToolCallCard` (v5 `states`, v4 call/result folded)
 * - source part     → numbered `InlineCitation` strip under the body
 * - data-plan part  → `Plan` + `Plan.Item` tree (steps own statuses)
 * - data-queue part → `Queue` + `Queue.Item`; remove wires to
 *                     `options.onQueueRemove` when the consumer passes one
 * - status          → `submitted` appends waiting dots; `error` appends a
 *                     system bubble with the transport error
 *
 * `options.onQueueRemove` arms the `data-queue` remove buttons — the map
 * holds no state, so without it the queue renders inert.
 *
 * Never throws: non-array/foreign entries and unknown part types are
 * skipped, so a partial or future-shaped payload degrades, not crashes.
 */
export function renderUIMessages(chat: UseChatLike, options?: RenderUIOptions): ReactNode[] {
  const messages = asArray(chat.messages).filter(isObject) as UIMessageLike[];
  const status = chat.status;
  const live = status === 'submitted' || status === 'streaming';
  const nodes: ReactNode[] = [];

  messages.forEach((message, index) => {
    const isLast = index === messages.length - 1;
    const role = message.role === 'user' || message.role === 'system' ? message.role : 'assistant';
    const id = asString(message.id) || `msg-${index}`;
    const parts = asArray(message.parts).filter(isObject) as UIPartLike[];

    // v4 tool results, matched back onto their calls by toolCallId.
    const resultsByCallId = new Map<string, UIPartLike>();
    const callIds = new Set<string>();
    for (const part of parts) {
      const callId = typeof part.toolCallId === 'string' ? part.toolCallId : '';
      if (!callId) continue;
      if (part.type === 'tool-result') resultsByCallId.set(callId, part);
      else if (part.type === 'tool-call') callIds.add(callId);
    }

    const body: ReactNode[] = [];
    const citations: ReactNode[] = [];
    parts.forEach((part, partIndex) => {
      const key = `${id}-part-${partIndex}`;

      // Sources are collected across the whole message and rendered as
      // one numbered citation strip under the body — the index follows
      // the order the parts arrived in.
      const citation = citationView(part);
      if (citation) {
        citations.push(
          <InlineCitation
            key={key}
            index={citations.length + 1}
            href={citation.href}
            title={citation.title}
            snippet={citation.snippet}
          />
        );
        return;
      }

      const node = renderPart(part, {
        key,
        live: live && isLast,
        partId: asString(part.id) || key,
        resultsByCallId,
        callIds,
        onQueueRemove: options?.onQueueRemove,
      });
      if (node !== null) body.push(node);
    });

    if (citations.length > 0) {
      body.push(
        <div key={`${id}-citations`} className={citationStrip}>
          {citations}
        </div>
      );
    }

    // The optimistic user message is in flight while `submitted`.
    const userStatus =
      role === 'user' && isLast && status === 'submitted'
        ? ('sending' as const)
        : role === 'user'
          ? ('sent' as const)
          : undefined;

    nodes.push(
      <ChatMessage key={id} role={role} status={userStatus}>
        {body.length > 0 ? body : <ThinkingIndicator />}
      </ChatMessage>
    );
  });

  // Waiting for the first assistant token before the message even exists.
  const last = messages[messages.length - 1];
  if (status === 'submitted' && last?.role !== 'assistant') {
    nodes.push(<ThinkingIndicator key='haze-waiting' />);
  }

  // Transport failure → one system-line bubble.
  if (status === 'error') {
    const error = chat.error;
    const message =
      error instanceof Error ? error.message : asString(error) || 'Something went wrong.';
    nodes.push(
      <ChatMessage key='haze-error' role='system'>
        {message}
      </ChatMessage>
    );
  }

  return nodes;
}

// ─── The hook ──────────────────────────────────────────────────────────

/**
 * `useHazeChat(useChat(…))` — renders through {@link renderUIMessages}
 * and wires the sender pair to haze-ui's composer:
 *
 * - `messages` — ready-to-render nodes for `ChatContainer` (options,
 *   e.g. `onQueueRemove`, pass straight through)
 * - `send` — `ChatInput`'s `onSend`, routed to v5 `sendMessage` or v4
 *   `append` (empty input is ignored)
 * - `busy` — `submitted | streaming`, for disabling the composer
 * - `stop` — `ChatInput` + a Stop button while `busy`
 */
export function useHazeChat(
  chat: UseChatLike,
  options?: RenderUIOptions
): {
  messages: ReactNode[];
  busy: boolean;
  error: boolean;
  send: (text: string) => void;
  stop: () => void;
} {
  const { messages, status, error } = chat;
  const onQueueRemove = options?.onQueueRemove;
  const rendered = useMemo(
    () => renderUIMessages({ messages, status, error }, { onQueueRemove }),
    [messages, status, error, onQueueRemove]
  );

  const { sendMessage, append, stop: stopChat } = chat;
  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (sendMessage) sendMessage({ text: trimmed });
      else append?.({ role: 'user', content: trimmed });
    },
    [sendMessage, append]
  );

  const stop = useCallback(() => stopChat?.(), [stopChat]);

  return {
    messages: rendered,
    busy: status === 'submitted' || status === 'streaming',
    error: status === 'error',
    send,
    stop,
  };
}
