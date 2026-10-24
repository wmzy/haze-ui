import{i as e,t}from"./jsx-runtime-Cx0BB4qO.js";import{t as n}from"./react-IDFlRUvQ.js";import{n as r,r as i}from"./direction-CtASGayN.js";import{a,c as o,i as s,n as c,o as l,r as u,s as d,t as f}from"./zod-TAUBbf2A.js";import{n as p,t as m}from"./Input-Dqw4MDFl.js";import{t as h,u as g}from"./SelectCore-Br20ZPL9.js";import{t as _}from"./Badge-CDaL2Fd2.js";import{i as ee}from"./menuKeyboard-Cd6FrIYg.js";import{_ as v,t as te}from"./ConfirmDialog-_LWiCm5n.js";import{t as y}from"./Icon-sQy7Ydfy.js";import{n as ne,t as re}from"./useToast-IgtGm693.js";import{a as b,i as x,n as ie,r as S,t as C}from"./ThinkingIndicator-pD6xVd-b.js";import{a as w,b as ae,g as T,l as E,p as oe,r as D,t as se,y as ce}from"./schemas-D6OhYit9.js";import{t as le}from"./Segmented-B7Xluh5h.js";import{t as ue}from"./TagInput-Bz0J0_1n.js";import{t as O}from"./CodeBlock-BeN2YLiU.js";import{n as de,t as fe}from"./StreamingText-BQEVaYAm.js";import{n as pe,t as me}from"./StepTimeline-Cg2RXyTF.js";import{T as he,d as k,m as A}from"./index-D3UH0BOM.js";import{a as ge,n as j,o as _e,r as ve,s as M}from"./styles-DBn9Gwwz.js";import{t as ye}from"./createLucideIcon-CGqZvC7l.js";import{t as be}from"./trash-Cp_9dnM4.js";function xe(e,t){let n={};for(let r of Object.keys(e))n[r]=Se(e[r],t[r]);return n}function Se(e,t){return{...e,...t}}var Ce={name:`package-open`,size:24,node:[[`path`,{d:`M12 22v-9`,key:`x3hkom`}],[`path`,{d:`M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z`,key:`2ntwy6`}],[`path`,{d:`M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13`,key:`1pmm1c`}],[`path`,{d:`M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z`,key:`12ttoo`}]]};Ce.node;var we=ye(Ce),Te={name:`rocket`,size:24,node:[[`path`,{d:`M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5`,key:`qeys4`}],[`path`,{d:`M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09`,key:`u4xsad`}],[`path`,{d:`M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z`,key:`676m9`}],[`path`,{d:`M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05`,key:`92ym6u`}]]};Te.node;var Ee=ye(Te),De=`import type { ReactNode } from 'react';
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

// ─── Duck-typed \`useChat\` shapes ────────────────────────────────────────
//
// The \`ai\` / \`@ai-sdk/react\` packages are NOT dependencies here. These are
// the minimal structural types a real \`useChat\` return value satisfies:
// every field except \`type\` is \`unknown\` and narrowed at runtime, so parts
// from any SDK version — or hand-built fixtures like the mock in this
// recipe — slot in without imports. The senders are declared as methods
// with \`this: void\`: method parameters check bivariantly, so the SDK's
// narrower \`sendMessage(message: { text: string } | …)\` still assigns to
// the \`(message: unknown)\` slot below.

export type ChatStatusLike = 'submitted' | 'streaming' | 'ready' | 'error';

/** Structural slice of the AI SDK's \`UIMessagePart\` union. */
export type UIPartLike = {
  type: string;
  text?: unknown; // 'text' | 'reasoning'
  state?: unknown; // 'streaming' | 'done' (text / reasoning parts)
  toolCallId?: unknown; // 'tool-call' | 'tool-result' | \`tool-\${string}\`
  toolName?: unknown; // v4 'tool-call'
  args?: unknown; // v4 'tool-call'
  result?: unknown; // v4 'tool-result'
  isError?: unknown; // v4 'tool-result' convention
  input?: unknown; // v5 \`tool-\${string}\`
  output?: unknown; // v5 \`tool-\${string}\`
  states?: unknown; // v5 \`tool-\${string}\` — e.g. ['output-available']
  id?: unknown; // v5 data/tool part identifier — feeds consumer callbacks
  source?: unknown; // 'source' — { url, title, snippet? } (ag-ui shape)
  url?: unknown; // 'source-url' — ai-sdk v5 keeps url/title on the part
  title?: unknown; // 'source-url'
  duration?: unknown; // reasoning thinking time in ms (ag-ui top-level)
  providerMetadata?: unknown; // ai-sdk v5 — { [provider]: { duration?: number } }
  data?: unknown; // \`data-*\` parts — payload object (ai-sdk v5 custom data parts / ag-ui state)
};

/** Structural slice of the AI SDK's \`UIMessage\`. */
export type UIMessageLike = {
  id?: unknown;
  role?: unknown; // 'system' | 'user' | 'assistant'
  parts?: unknown; // UIPartLike[]
};

/** Structural slice of \`useChat\`'s return value the adapter consumes. */
export type UseChatLike = {
  messages?: unknown;
  status?: unknown;
  error?: unknown;
  // \`this: void\` keeps the methods detachable (lint) and the params
  // bivariant (typecheck), so the SDK's narrower sender signatures still
  // assign to these slots.
  sendMessage?(this: void, message: unknown): unknown; // v5 sender
  append?(this: void, message: unknown): unknown; // v4 sender
  stop?(this: void): void;
};

/**
 * Consumer callbacks for the rendered transcript. The adapter is a pure
 * map with no store — \`onQueueRemove\` is how a real app wires the
 * \`data-queue\` remove buttons back into its own state; without it the
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
 * (\`tool-getWeather\`) and tracks lifecycle in \`states\`; v4 splits a call
 * across \`tool-call\` (name + args) and \`tool-result\` (matched by
 * \`toolCallId\`) — the result is folded into the call's card, and an
 * unmatched call stays \`running\` until its result lands.
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
  // v5 \`tool-<name>\`
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
 * \`source\` / \`source-url\` part → citation badge data. ai-sdk v5's
 * \`source-url\` keeps \`url\`/\`title\` on the part itself; the nested
 * \`source\` object is the agentic/ag-ui convention this recipe's mock
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
  return ms < 1000 ? \`\${Math.round(ms)}ms\` : \`\${Math.round(ms / 100) / 10}s\`;
}

/** \`completed\` / \`in progress\` / \`in-progress\` → \`completed\` / \`in_progress\`. */
const normalizeStatus = (value: unknown): string =>
  asString(value).trim().toLowerCase().replace(/[\\s-]+/g, '_');

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
 * \`data-plan\` payload → Plan view (ag-ui's plan state / ai-sdk v5
 * custom data parts). \`data.state\` is the plan-level phase
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
      key: asString(step.id) || \`step-\${index}\`,
      label:
        asString(step.label) ||
        asString(step.title) ||
        asString(step.name) ||
        \`Step \${index + 1}\`,
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
 * \`data-queue\` payload → Queue view: \`data.items[]\` each own a status;
 * item ids feed the remove callback, positional fallbacks when absent.
 */
function queueView(part: UIPartLike): { items: QueueItemView[] } | null {
  const data = isObject(part.data) ? part.data : {};
  const items = asArray(data.items).filter(isObject);
  if (items.length === 0) return null;
  return {
    items: items.map((item, index) => ({
      id: asString(item.id) || \`item-\${index}\`,
      title:
        asString(item.title) ||
        asString(item.label) ||
        asString(item.name) ||
        \`Item \${index + 1}\`,
      description: asString(item.description) || undefined,
      status: QUEUE_STATUS[normalizeStatus(item.status)] ?? 'queued',
    })),
  };
}

// ─── Part rendering ────────────────────────────────────────────────────

const textBody = css\`
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-relaxed);
  white-space: pre-wrap;
\`;

const reasoningBody = css\`
  margin: 0;
  white-space: pre-wrap;
\`;

const citationStrip = css\`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--haze-space-1) var(--haze-space-2);
  margin-block-start: var(--haze-space-2);
\`;

type PartRender = {
  key: string;
  /** True while this message is the last one and the run is in flight. */
  live: boolean;
  /** Identity of this part for consumer callbacks (ai-sdk data part id). */
  partId: string;
  resultsByCallId: Map<string, UIPartLike>;
  callIds: Set<string>;
  /** Consumer remove hook for \`data-queue\` items, when provided. */
  onQueueRemove?: (partId: string, itemId: string) => void;
};

function renderPart(part: UIPartLike, opts: PartRender): ReactNode {
  const { key, live } = opts;

  // Text — \`StreamingText\` typewrites the part while it streams; note it
  // restarts its reveal whenever \`text\` grows, so it fits parts that
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
  // \`running\` while the part streams and \`done\` when it settles, with
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

  // Tools — every \`tool-*\` type maps to one ToolCallCard. Kept flat on
  // purpose: cards already render in part order, so wrapping each in a
  // collapsible StepTimeline row would add nesting without adding state.
  if (part.type.startsWith('tool-')) {
    const view = toolCardView(part, opts.resultsByCallId, opts.callIds);
    if (!view) return null;
    return <ToolCallCard key={key} {...view} />;
  }

  // Plan — \`data-plan\` carries an agentic execution plan: \`data.state\`
  // is the phase, \`data.steps[]\` each own a status that drives Plan's
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

  // Queue — \`data-queue\` carries outbox items being delivered. Removal
  // is the consumer's business (this map holds no state): pass
  // \`options.onQueueRemove\` to arm the remove buttons, otherwise they
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
                  removeLabel: \`Remove \${item.title}\`,
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
 * Pure mapping from a \`useChat\`-shaped object to nodes the agent
 * components render directly:
 *
 * - message         → \`ChatMessage\` bubble (role, user send status)
 * - text part       → plain block, or \`StreamingText\` while it streams
 * - reasoning part  → \`ThinkingIndicator\` while streaming with no text,
 *                     then a collapsible \`StepTimeline\` row (running →
 *                     done, thinking time when reported)
 * - tool part       → \`ToolCallCard\` (v5 \`states\`, v4 call/result folded)
 * - source part     → numbered \`InlineCitation\` strip under the body
 * - data-plan part  → \`Plan\` + \`Plan.Item\` tree (steps own statuses)
 * - data-queue part → \`Queue\` + \`Queue.Item\`; remove wires to
 *                     \`options.onQueueRemove\` when the consumer passes one
 * - status          → \`submitted\` appends waiting dots; \`error\` appends a
 *                     system bubble with the transport error
 *
 * \`options.onQueueRemove\` arms the \`data-queue\` remove buttons — the map
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
    const id = asString(message.id) || \`msg-\${index}\`;
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
      const key = \`\${id}-part-\${partIndex}\`;

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
        <div key={\`\${id}-citations\`} className={citationStrip}>
          {citations}
        </div>
      );
    }

    // The optimistic user message is in flight while \`submitted\`.
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
 * \`useHazeChat(useChat(…))\` — renders through {@link renderUIMessages}
 * and wires the sender pair to haze-ui's composer:
 *
 * - \`messages\` — ready-to-render nodes for \`ChatContainer\` (options,
 *   e.g. \`onQueueRemove\`, pass straight through)
 * - \`send\` — \`ChatInput\`'s \`onSend\`, routed to v5 \`sendMessage\` or v4
 *   \`append\` (empty input is ignored)
 * - \`busy\` — \`submitted | streaming\`, for disabling the composer
 * - \`stop\` — \`ChatInput\` + a Stop button while \`busy\`
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
`,Oe=`import type { IconProps, MenuDataItem } from '@/lib';

import { css } from '@linaria/core';
import { PackageOpen, Rocket, Trash2 } from 'lucide-react';
import { MdRocketLaunch } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';

import { Button, Empty, Icon, Menu, Result } from '@/lib';

/*
 * The live source behind the Recipes "Icon ecosystems" section — the docs
 * show this very file via ?raw, so demo and code never drift. haze-ui
 * ships no icon set on purpose: \`Icon\` is a thin sizing/coloring wrapper
 * and every icon slot also accepts a raw svg component. The icon libraries
 * are dependencies of your app, never of haze-ui (swap '@/lib' for
 * 'haze-ui' in your own code).
 */

// ─── Approach 2 — a type-safe icon set ─────────────────────────────────
// \`IconProps['icon']\` is exactly the slot type every haze-ui icon prop
// accepts; \`satisfies\` pins every entry to it, so a wrong import fails at
// compile time. Named imports are tree-shakeable — only the icons listed
// here reach the bundle.

// eslint-disable-next-line react-refresh/only-export-components -- the set is the recipe: this whole file is shown via ?raw, and the export lets the test assert the glyph mapping directly (TagGroup / Schedule 同款 suppression)
export const APP_ICONS = {
  deploy: Rocket,
  discard: Trash2,
  empty: PackageOpen,
} satisfies Record<string, NonNullable<IconProps['icon']>>;

export type AppIconName = keyof typeof APP_ICONS;

/**
 * The single place that knows about haze-ui sizing. Call sites stay
 * declarative and typo-proof: \`name\` autocompletes, a typo is a compile
 * error, and swapping an icon library later touches exactly one file.
 */
export function AppIcon({
  name,
  size = 'md',
}: {
  name: AppIconName;
  size?: IconProps['size'];
}) {
  const Glyph = APP_ICONS[name];
  return <Icon icon={Glyph} size={size} />;
}

// ─── The demo ──────────────────────────────────────────────────────────
// Everything below renders with real lucide / react-icons components:
// Button composes icons as children (the skin supplies the gap), Menu's
// data API takes an \`icon\` per item, Result and Empty expose \`icon\` /
// \`image\` slots that replace their default illustrations.

const demoColumn = css\`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-4);
  width: 100%;
\`;

const demoRow = css\`
  display: flex;
  align-items: center;
  gap: var(--haze-space-3);
  flex-wrap: wrap;
\`;

const demoMenuItems = [
  {
    type: 'item',
    label: 'Deploy revision',
    icon: <AppIcon name='deploy' size='sm' />,
    kbdLabel: '⇧D',
  },
  {
    type: 'item',
    label: 'Search docs',
    // react-icons stroke sets (fi, lu, tb…) slot in through children —
    // same stroke contract lucide has, so Icon keeps its fill:none mode.
    icon: (
      <Icon size='sm'>
        <FiSearch />
      </Icon>
    ),
    kbdLabel: '/',
  },
  { type: 'divider' },
  {
    type: 'item',
    label: 'Discard draft',
    icon: <AppIcon name='discard' size='sm' />,
    danger: true,
  },
] satisfies MenuDataItem[];

/** Lucide-only column: AppIcon everywhere, one sizing vocabulary. */
function SetDemo() {
  return (
    <div className={demoRow}>
      <Button variant='outline'>
        <AppIcon name='deploy' /> Deploy
      </Button>
      <Button variant='ghost' square aria-label='Discard draft'>
        <AppIcon name='discard' />
      </Button>
      <Menu
        trigger={
          <Button variant='outline'>
            <AppIcon name='deploy' /> Actions
          </Button>
        }
        items={demoMenuItems}
      />
    </div>
  );
}

/**
 * react-icons fill sets (md, fa, hi-solid…) must NOT go through \`Icon\`:
 * Icon's stroke mode forces \`fill: none\` on the svg, which blanks
 * fill-based glyphs (verified in Chromium — the svg computes
 * fill:none/stroke-width:0 and paints nothing). Fill icons render bare
 * instead: they size themselves at 1em and inherit currentColor, which is
 * exactly what Button's children layout wants.
 */
function FillSetDemo() {
  return (
    <div className={demoRow}>
      <Button variant='outline'>
        <MdRocketLaunch /> Material, bare
      </Button>
      <Button variant='outline'>
        <Icon size='sm'>
          <FiSearch />
        </Icon>
        Feather via children
      </Button>
    </div>
  );
}

/** Result replaces its status illustration through the \`icon\` slot. */
function ResultDemo() {
  return (
    <Result
      icon={<AppIcon name='deploy' size='lg' />}
      title='Deployment live'
      subTitle='v2.4.0 — built 42 seconds ago'
      extra={
        <Button size='sm' variant='outline'>
          Open app
        </Button>
      }
    />
  );
}

/** Empty calls the same slot \`image\` and composes an action under it. */
function EmptyDemo() {
  return (
    <Empty
      image={<AppIcon name='empty' size='lg' />}
      description='No deployments yet'
    >
      <Button size='sm' variant='outline'>
        Create one
      </Button>
    </Empty>
  );
}

/** Live demo for the Recipes page: every pattern above, side by side. */
export function IconEcosystemDemo() {
  return (
    <div className={demoColumn}>
      <SetDemo />
      <FillSetDemo />
      <ResultDemo />
      <EmptyDemo />
    </div>
  );
}
`,ke=`import type { HazeStrings } from '@/lib';

import { createStrings, defaultStrings } from '@/lib';

/**
 * Français — a derived pack. \`createStrings\` carries every section and
 * key we do not reword over from the English base, so the override
 * stays exactly as long as the copy it actually changes. \`{count}\`
 * placeholders survive translation and are expanded at runtime.
 *
 * Mount with \`locale="fr-FR"\`: no built-in pack matches the tag, so
 * the English base is selected and this pack layers on top of it —
 * here as a complete \`HazeStrings\`, which the \`strings\` prop accepts
 * (a full pack satisfies the partial override shape).
 */
export const frPack: HazeStrings = createStrings(defaultStrings, {
  chatInput: {
    placeholder: 'Écrire un message…',
    send: 'Envoyer',
  },
  empty: {
    description: 'Aucune donnée',
  },
  tagInput: {
    placeholder: 'Ajouter un tag',
  },
});

/**
 * العربية — the same keys in Arabic. Mounted with \`locale="ar-EG"\`,
 * the direction is derived as rtl from the tag (the \`ar\` primary
 * subtag), so no explicit \`direction\` prop is needed; setting the
 * document's \`dir\` remains the app's job, the provider never writes
 * it (see the RTL notes in the recipe).
 */
export const arPack: HazeStrings = createStrings(defaultStrings, {
  chatInput: {
    placeholder: 'اكتب رسالة…',
    send: 'إرسال',
  },
  empty: {
    description: 'لا توجد بيانات',
  },
  tagInput: {
    placeholder: 'أضف وسمًا',
    tagCount: '{count} وسوم',
    tagCountSingular: 'وسم واحد',
  },
});
`,Ae=`import type { SortingState } from '@tanstack/react-table';

import type { DataTableColumnDef, FieldValidator } from '@/lib';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { css } from '@linaria/core';
import { z } from 'zod';
import { useControl } from 'react-use-control';

import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Dialog,
  Form,
  FormItem,
  Input,
  InputCore,
  Option,
  useForm,
  SelectCore,
  ToastContainer,
  useToast,
  zodResolver,
} from '@/lib';

/*
 * The live source behind the Recipes "CRUD table" section — the docs
 * show this very file via ?raw, so demo and code never drift. Shape is
 * the classic CRUD screen: list + search + server pagination/sorting +
 * create/edit dialog form + delete confirm + toast feedback.
 */

// ─── The fake server ────────────────────────────────────────────────────
// Same contract a real backend offers: query(page, sorting, search) →
// { rows, pageCount } plus create/update/delete mutations. The demo
// shell adds a 300ms roundtrip delay so loading states are visible;
// swap the bodies for fetch() calls and nothing else changes.

type MemberRole = 'admin' | 'editor' | 'viewer';

type MemberRow = {
  id: number;
  name: string;
  email: string;
  role: MemberRole;
};

const CRUD_PAGE_SIZE = 6;

const SERVER_MEMBERS: MemberRow[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@haze.dev', role: 'admin' },
  { id: 2, name: 'Grace Hopper', email: 'grace@haze.dev', role: 'editor' },
  { id: 3, name: 'Alan Turing', email: 'alan@haze.dev', role: 'viewer' },
  { id: 4, name: 'Katherine Johnson', email: 'katherine@haze.dev', role: 'editor' },
  { id: 5, name: 'Edsger Dijkstra', email: 'edsger@haze.dev', role: 'viewer' },
  { id: 6, name: 'Barbara Liskov', email: 'barbara@haze.dev', role: 'admin' },
  { id: 7, name: 'Donald Knuth', email: 'donald@haze.dev', role: 'viewer' },
  { id: 8, name: 'Margaret Hamilton', email: 'margaret@haze.dev', role: 'editor' },
  { id: 9, name: 'Dennis Ritchie', email: 'dennis@haze.dev', role: 'viewer' },
  { id: 10, name: 'Radia Perlman', email: 'radia@haze.dev', role: 'editor' },
  { id: 11, name: 'Tim Berners-Lee', email: 'tim@haze.dev', role: 'viewer' },
  { id: 12, name: 'Anita Borg', email: 'anita@haze.dev', role: 'admin' },
  { id: 13, name: 'Linus Torvalds', email: 'linus@haze.dev', role: 'viewer' },
];

function nextMemberId() {
  return SERVER_MEMBERS.reduce((max, member) => Math.max(max, member.id), 0) + 1;
}

function createMember(values: MemberFormValues) {
  // Newest first — most real CRUD endpoints default to reverse-chronological
  // order, and it is what makes "go to page 1" after a create land the new
  // record on screen.
  SERVER_MEMBERS.unshift({ id: nextMemberId(), ...values, role: values.role as MemberRole });
}

function updateMember(id: number, values: MemberFormValues) {
  const index = SERVER_MEMBERS.findIndex((member) => member.id === id);
  if (index !== -1) {
    SERVER_MEMBERS[index] = {
      ...SERVER_MEMBERS[index]!,
      ...values,
      role: values.role as MemberRole,
    };
  }
}

function deleteMember(id: number) {
  const index = SERVER_MEMBERS.findIndex((member) => member.id === id);
  if (index !== -1) SERVER_MEMBERS.splice(index, 1);
}

function queryMembers(
  page: number,
  sorting: SortingState,
  search: string
): { rows: MemberRow[]; pageCount: number } {
  const q = search.trim().toLowerCase();
  const filtered = q
    ? SERVER_MEMBERS.filter(
        (member) =>
          member.name.toLowerCase().includes(q) ||
          member.email.toLowerCase().includes(q)
      )
    : SERVER_MEMBERS;
  const first = sorting[0];
  const sorted = first
    ? [...filtered].sort((a, b) => {
        // key narrows past 'id' in the else branch → plain string compare
        const key = first.id as keyof MemberRow;
        const cmp = key === 'id' ? a.id - b.id : a[key].localeCompare(b[key]);
        return first.desc ? -cmp : cmp;
      })
    : filtered;
  return {
    rows: sorted.slice((page - 1) * CRUD_PAGE_SIZE, page * CRUD_PAGE_SIZE),
    pageCount: Math.max(1, Math.ceil(filtered.length / CRUD_PAGE_SIZE)),
  };
}

// ─── Form: zod validators, one adapter per schema ──────────────────────

type MemberFormValues = { name: string; email: string; role: MemberRole | '' };

const validateName: FieldValidator<MemberFormValues, 'name'> = zodResolver(
  z.string().min(2, 'Name must be at least 2 characters')
);
const validateEmail: FieldValidator<MemberFormValues, 'email'> = zodResolver(
  z.email('Enter a valid email address')
);
const validateRole: FieldValidator<MemberFormValues, 'role'> = zodResolver(
  z.enum(['admin', 'editor', 'viewer'], { message: 'Pick a role' })
);

function roleBadge(role: MemberRole) {
  if (role === 'admin') return <Badge color='info'>{role}</Badge>;
  if (role === 'editor') return <Badge color='success'>{role}</Badge>;
  return <Badge>{role}</Badge>;
}

/**
 * One dialog form, fresh per open: the parent remounts it (key=session),
 * so \`initialValues\` alone loads the record being edited — no reset
 * plumbing. The \`input\` channel binds the cores declaratively; FormItem
 * wires id, aria attributes, onBlur/onChange and the value itself.
 */
function MemberForm({
  member,
  onCancel,
  onSubmit,
}: {
  member: MemberRow | null;
  onCancel: () => void;
  onSubmit: (values: MemberFormValues) => void;
}) {
  const form = useForm<MemberFormValues>({
    initialValues: member
      ? { name: member.name, email: member.email, role: member.role }
      : { name: '', email: '', role: '' },
  });

  return (
    <Form form={form} onValidSubmit={onSubmit}>
      <div className={formGrid}>
        <FormItem
          form={form}
          name='name'
          label='Name'
          validate={validateName}
          mode='onBlur'
          input={InputCore}
          placeholder='Ada Lovelace'
        />
        <FormItem
          form={form}
          name='email'
          label='Email'
          validate={validateEmail}
          mode='onBlur'
          input={InputCore}
          placeholder='ada@haze.dev'
        />
        <FormItem
          form={form}
          name='role'
          label='Role'
          validate={validateRole}
          mode='onBlur'
          input={SelectCore}
        >
          <Option value=''>Pick a role…</Option>
          <Option value='admin'>Admin</Option>
          <Option value='editor'>Editor</Option>
          <Option value='viewer'>Viewer</Option>
        </FormItem>
      </div>
      <div className={formFooter}>
        {/* haze Button renders type="button" — drive the form's submit
            flow explicitly, as the zod recipe does. */}
        <Button onClick={(e) => e.currentTarget.form?.requestSubmit()}>
          Save
        </Button>
        <Button variant='ghost' onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Form>
  );
}

// ─── The screen ─────────────────────────────────────────────────────────

export function MemberCrudDemo() {
  return (
    <ToastContainer>
      <MemberCrud />
    </ToastContainer>
  );
}

function MemberCrud() {
  const toast = useToast();

  // Search flows through a Control: a plain value would be an
  // uncontrolled *initial* value — later prop changes are ignored. The
  // Input's own writes update \`search\`; the native onChange below only
  // restarts the pagination.
  const [search, , searchCtrl] = useControl(undefined, '');

  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([]);
  // Bumped by every mutation — the refetch trigger for the current
  // (page, sorting, search).
  const [reloadKey, setReloadKey] = useState(0);

  // The last answer the server gave. While it lags the requested
  // (page, sorting, search, reloadKey) the table shows the loading
  // skeleton — derived, never stored.
  const [snapshot, setSnapshot] = useState(() => ({
    page: 1,
    sorting: [] as SortingState,
    search: '',
    reloadKey: 0,
    ...queryMembers(1, [], ''),
  }));
  const pending =
    snapshot.page !== page ||
    snapshot.sorting !== sorting ||
    snapshot.search !== search ||
    snapshot.reloadKey !== reloadKey;

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => {
      setSnapshot({
        page,
        sorting,
        search,
        reloadKey,
        ...queryMembers(page, sorting, search),
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [pending, page, sorting, search, reloadKey]);

  // Dialog state: open travels through a Control (same rule as search);
  // \`editing === null\` means create mode, and \`session\` remounts the
  // form on every open so initialValues reload the record.
  const [, setDialogOpen, dialogOpenCtrl] = useControl(undefined, false);
  const [editing, setEditing] = useState<MemberRow | null>(null);
  const [session, setSession] = useState(0);

  const [, setConfirmOpen, confirmOpenCtrl] = useControl(undefined, false);
  const [pendingDelete, setPendingDelete] = useState<MemberRow | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setSession((s) => s + 1);
    setDialogOpen(true);
  }, [setDialogOpen]);
  const openEdit = useCallback(
    (member: MemberRow) => {
      setEditing(member);
      setSession((s) => s + 1);
      setDialogOpen(true);
    },
    [setDialogOpen]
  );
  const closeDialog = useCallback(() => setDialogOpen(false), [setDialogOpen]);

  const askDelete = useCallback(
    (member: MemberRow) => {
      setPendingDelete(member);
      setConfirmOpen(true);
    },
    [setConfirmOpen]
  );
  const closeConfirm = useCallback(() => {
    setConfirmOpen(false);
    setPendingDelete(null);
  }, [setConfirmOpen]);

  const handleSubmit = (values: MemberFormValues) => {
    // onValidSubmit implies every validator passed — role is a MemberRole.
    if (editing) {
      updateMember(editing.id, values);
      toast(\`Updated \${values.name}\`, { variant: 'success' });
    } else {
      createMember(values);
      setPage(1); // newest-first server → the new record is on page 1
      toast(\`Created \${values.name}\`, { variant: 'success' });
    }
    setReloadKey((k) => k + 1);
    closeDialog();
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMember(pendingDelete.id);
    // The current page may have just emptied — clamp before refetching.
    const { pageCount } = queryMembers(page, sorting, search);
    if (page > pageCount) setPage(pageCount);
    setReloadKey((k) => k + 1);
    toast(\`Deleted \${pendingDelete.name}\`, { variant: 'success' });
    setPendingDelete(null);
  };

  const columns = useMemo<DataTableColumnDef<MemberRow>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => <strong>{info.getValue() as string}</strong>,
      },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: (info) => roleBadge(info.getValue() as MemberRole),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className={rowActions}>
            <Button size='sm' variant='ghost' onClick={() => openEdit(row.original)}>
              Edit
            </Button>
            <Button size='sm' variant='ghost' onClick={() => askDelete(row.original)}>
              Delete
            </Button>
          </div>
        ),
        meta: { sortable: false },
      },
    ],
    [openEdit, askDelete]
  );

  return (
    <div className={frame}>
      <div className={toolbar}>
        <Input
          className={searchInput}
          value={searchCtrl}
          placeholder='Search name or email…'
          aria-label='Search members'
          onChange={() => setPage(1)} // a new query restarts at page 1
        />
        <Button onClick={openCreate}>New member</Button>
      </div>
      <DataTable
        columns={columns}
        data={snapshot.rows}
        manual
        sortable
        loading={pending}
        pageSize={CRUD_PAGE_SIZE}
        pageCount={snapshot.pageCount}
        onPageChange={setPage}
        onSortChange={(next) => {
          setSorting(next);
          setPage(1);
        }}
        getRowId={(member) => String(member.id)}
      />
      <Dialog
        open={dialogOpenCtrl}
        onClose={closeDialog}
        title={editing ? 'Edit member' : 'New member'}
      >
        <MemberForm
          key={session}
          member={editing}
          onCancel={closeDialog}
          onSubmit={handleSubmit}
        />
      </Dialog>
      <ConfirmDialog
        open={confirmOpenCtrl}
        title='Delete member'
        confirmText='Delete'
        variant='danger'
        onConfirm={confirmDelete}
        onCancel={closeConfirm}
        onClose={closeConfirm}
      >
        Delete {pendingDelete?.name}? There is no undo.
      </ConfirmDialog>
    </div>
  );
}

// ─── Layout ─────────────────────────────────────────────────────────────

const frame = css\`
  max-width: 760px;
  margin: var(--haze-space-4) 0 var(--haze-space-6);
\`;

const toolbar = css\`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  margin-bottom: var(--haze-space-3);
\`;

const searchInput = css\`
  flex: 1;
  max-width: 280px;
\`;

const rowActions = css\`
  display: flex;
  justify-content: flex-end;
  gap: var(--haze-space-1);
\`;

const formGrid = css\`
  display: grid;
  gap: var(--haze-space-4);
\`;

const formFooter = css\`
  display: flex;
  justify-content: flex-end;
  gap: var(--haze-space-2);
  margin-top: var(--haze-space-4);
\`;
`,je=`import type {
  ChatStatusLike,
  UIPartLike,
  UIMessageLike,
  UseChatLike,
} from './ai-chat-adapter';

import { useCallback, useEffect, useRef, useState } from 'react';

// Network-free \`useChat\` stand-in for the recipe demo: same return shape
// (messages / status / error / sendMessage / append / stop), timer-driven.
// The demo renders it through the very adapter a real \`@ai-sdk/react\`
// \`useChat\` would use — the doc code and the running code are one.

let seq = 0;
const uid = (prefix: string): string => \`\${prefix}-\${++seq}\`;

/** Matches StreamingText's default reveal cadence (ms per char). */
const REVEAL_MS_PER_CHAR = 20;

const WELCOME: UIMessageLike = {
  id: 'welcome',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      state: 'done',
      text: 'Ask me about haze-ui — for example: "How does haze-ui ship per-component CSS?"',
    },
  ],
};

const CSS_REASONING =
  'The user asks about CSS delivery. haze-ui is a Linaria library — zero runtime — so styles are extracted at build time. The library build emits one CSS file per module, and a split script groups them into per-component subpaths plus an aggregate stylesheet. I should check the docs for the exact loading modes before answering.';

const CSS_ANSWER = \`haze-ui ships **two CSS loading modes**:

1. Per-component subpaths — \\\`import 'haze-ui/css/button'\\\` pulls only what you mount.
2. The aggregate — \\\`import 'haze-ui/styles.css'\\\` covers everything at once.

Both are plain build artifacts (Linaria extracts them at build time, no runtime CSS-in-JS), and a manifest maps every export to its CSS file so tooling never guesses.\`;

const GENERIC_REASONING = (question: string): string =>
  \`Parsing the request: "\${question}". No tool call needed — answer from the component catalog directly, and keep it short.\`;

const GENERIC_ANSWER = (question: string): string =>
  \`About "\${question}" — haze-ui's agent surface is a set of presentational components: ChatContainer owns scrolling, ChatMessage the bubbles, StreamingText the typewriter reveal, ToolCallCard tool input/output, ThinkingIndicator the waiting dots, and ChatInput the composer. Pair them with any runtime; this demo drives them through the same adapter you would use with a real one.\`;

const CSS_TOOL_INPUT = (question: string): { query: string } => ({ query: question });

const CSS_TOOL_OUTPUT = {
  files: ['css/loading-modes.md', 'css/manifest.json'],
  loadingModes: 2,
} as const;

// Agentic script fixtures — the part shapes the adapter maps onto
// Plan / Queue / InlineCitation, played by the CSS walkthrough below.

const CSS_PLAN_STEPS = [
  { id: 'plan-find-docs', label: 'Locate the CSS docs' },
  { id: 'plan-check-modes', label: 'Check both loading modes' },
  { id: 'plan-summarize', label: 'Summarize the manifest' },
] as const;

type PlanPhase = 'draft' | 'active' | 'done';
type PlanStepStatus = 'pending' | 'in_progress' | 'completed';

/** \`data-plan\` payload in the ag-ui plan shape — steps own their status. */
const planData = (state: PlanPhase, statuses: PlanStepStatus[]) => ({
  state,
  steps: CSS_PLAN_STEPS.map((step, i) => ({ ...step, status: statuses[i] ?? 'pending' })),
});
const planPart = (state: PlanPhase, statuses: PlanStepStatus[]): UIPartLike => ({
  type: 'data-plan',
  id: 'plan-css',
  data: planData(state, statuses),
});

/** \`data-queue\` payload — an outbox the run is delivering. */
const queueData = (
  emit: 'sending' | 'failed',
  cdn: 'sending' | 'queued'
) => ({
  items: [
    {
      id: 'q-emit',
      title: 'Emit loading-modes.md',
      description: emit === 'failed' ? '403 — docs storage quota exceeded' : undefined,
      status: emit,
    },
    { id: 'q-cdn', title: 'Refresh the CDN manifest', status: cdn },
  ],
});
const queuePart = (emit: 'sending' | 'failed', cdn: 'sending' | 'queued'): UIPartLike => ({
  type: 'data-queue',
  id: 'queue-css',
  data: queueData(emit, cdn),
});

const asParts = (value: unknown): UIPartLike[] =>
  Array.isArray(value) ? (value as UIPartLike[]) : [];

/** Immutable part-list operations the script below schedules. */
type Patch = (parts: UIPartLike[]) => UIPartLike[];
const pushPart = (part: UIPartLike): Patch => (parts) => [...parts, part];
const patchPart =
  (index: number, patch: Record<string, unknown>): Patch =>
  (parts) =>
    parts.map((p, i) => (i === index ? { ...p, ...patch } : p));

/**
 * A \`useChat\`-shaped mock: \`sendMessage\` appends the user turn, plays a
 * short scripted assistant reply (reasoning → plan → tool → text →
 * sources → queue, on the CSS walkthrough) with \`status\` walking
 * \`submitted → streaming → ready\`, and \`stop\` finalizes the run the way
 * the SDK does — open parts flip to \`done\`. Ask for an "error" to see
 * the failure path.
 */
export function useMockChat(): UseChatLike {
  const [messages, setMessages] = useState<UIMessageLike[]>([WELCOME]);
  const [status, setStatus] = useState<ChatStatusLike>('ready');
  const [error, setError] = useState<string | undefined>(undefined);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const statusRef = useRef<ChatStatusLike>('ready');
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const runReply = useCallback(
    (question: string) => {
      clearTimers();
      const assistantId = uid('assistant');
      const isCss = /css|style|stylesheet/i.test(question);
      const wantsError = /\\b(error|fail|crash)\\b/i.test(question);

      const at = (ms: number, patch: Patch) => {
        timers.current.push(
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, parts: patch(asParts(m.parts)) }
                  : m
              )
            );
          }, ms)
        );
      };

      // The assistant message exists before its first part lands — that
      // gap is exactly what the adapter's waiting-dots branch renders.
      setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', parts: [] }]);
      setStatus('streaming');

      if (wantsError) {
        timers.current.push(
          setTimeout(() => {
            setError('Mock transport error — simulated failure.');
            setStatus('error');
          }, 700)
        );
        return;
      }

      const answer = isCss ? CSS_ANSWER : GENERIC_ANSWER(question);
      const reasoning = isCss ? CSS_REASONING : GENERIC_REASONING(question);
      let nextIndex = 0; // parts are addressed by index — every push claims one
      let atMs = 0;
      /** Schedule a push and return the index the part will land at. */
      const push = (ms: number, part: UIPartLike): number => {
        const index = nextIndex;
        nextIndex += 1;
        at(ms, pushPart(part));
        return index;
      };

      const reasoningIndex = push(atMs, {
        type: 'reasoning',
        text: reasoning,
        state: 'streaming',
      });
      atMs += 900;
      at(atMs, patchPart(reasoningIndex, {
        state: 'done',
        // ai-sdk v5 shape: thinking time lands in providerMetadata (ms).
        providerMetadata: { anthropic: { duration: 1240 } },
      }));

      if (isCss) {
        // Plan: drafted, then executed step by step alongside the tool.
        atMs += 100;
        const planIndex = push(atMs, planPart('draft', ['pending', 'pending', 'pending']));
        atMs += 200;
        at(atMs, patchPart(planIndex, { data: planData('active', ['in_progress', 'pending', 'pending']) }));

        atMs += 300;
        const toolIndex = push(atMs, {
          type: 'tool-searchDocs',
          toolCallId: uid('call'),
          states: ['input-streaming'],
        });
        at(atMs + 350, patchPart(toolIndex, { states: ['input-available'], input: CSS_TOOL_INPUT(question) }));
        atMs += 1500;
        at(atMs, patchPart(toolIndex, {
          states: ['output-available'],
          input: CSS_TOOL_INPUT(question),
          output: CSS_TOOL_OUTPUT,
        }));

        atMs += 200;
        at(atMs, patchPart(planIndex, { data: planData('active', ['completed', 'in_progress', 'pending']) }));
        atMs += 600;
        at(atMs, patchPart(planIndex, { data: planData('active', ['completed', 'completed', 'in_progress']) }));
        atMs += 600;
        at(atMs, patchPart(planIndex, { data: planData('done', ['completed', 'completed', 'completed']) }));
        atMs += 100;
      } else {
        atMs += 200;
      }

      // Text arrives whole and streams via its \`state\` — the shape the
      // adapter maps to StreamingText's one-shot typewriter reveal.
      const textIndex = push(atMs, { type: 'text', text: answer, state: 'streaming' });
      const revealEnd = atMs + answer.length * REVEAL_MS_PER_CHAR + 500;
      at(revealEnd, patchPart(textIndex, { state: 'done' }));
      if (isCss) {
        // Two sources → the numbered citation strip.
        push(revealEnd + 60, {
          type: 'source',
          source: {
            sourceType: 'url',
            url: 'https://wmzy.github.io/haze-ui/',
            title: 'haze-ui docs — CSS loading modes',
            snippet:
              'Import per-component subpaths (haze-ui/css/button) or the aggregate styles.css; a manifest maps every export to its CSS file.',
          },
        });
        push(revealEnd + 120, {
          type: 'source',
          source: {
            sourceType: 'url',
            url: 'https://github.com/wmzy/haze-ui/blob/main/scripts/split-css.mjs',
            title: 'scripts/split-css.mjs',
            snippet:
              'Groups the per-module CSS output into per-component css/ subpaths plus the aggregate stylesheet.',
          },
        });
        // Delivery queue — the first item fails, the second stays queued.
        const queueIndex = push(revealEnd + 180, queuePart('sending', 'queued'));
        at(revealEnd + 980, patchPart(queueIndex, { data: queueData('failed', 'queued') }));
        timers.current.push(setTimeout(() => setStatus('ready'), revealEnd + 1080));
      } else {
        timers.current.push(setTimeout(() => setStatus('ready'), revealEnd));
      }
    },
    [clearTimers]
  );

  const sendMessage = useCallback(
    (message: unknown) => {
      const m = message as { text?: unknown; content?: unknown };
      const raw = typeof m.text === 'string' ? m.text : m.content;
      const trimmed = (typeof raw === 'string' ? raw : '').trim();
      if (!trimmed || statusRef.current === 'submitted' || statusRef.current === 'streaming') {
        return;
      }
      setError(undefined);
      setMessages((prev) => [
        ...prev,
        { id: uid('user'), role: 'user', parts: [{ type: 'text', text: trimmed }] },
      ]);
      setStatus('submitted');
      timers.current.push(setTimeout(() => runReply(trimmed), 600));
    },
    [runReply]
  );

  const append = useCallback((message: unknown) => sendMessage(message), [sendMessage]);

  const stop = useCallback(() => {
    clearTimers();
    if (statusRef.current !== 'streaming' && statusRef.current !== 'submitted') return;
    // Finalize like the SDK does on abort: open parts close, run ends.
    setMessages((prev) =>
      prev.map((m) => ({
        ...m,
        parts: asParts(m.parts).map((p) =>
          p.state === 'streaming' ? { ...p, state: 'done' } : p
        ),
      }))
    );
    setStatus('ready');
  }, [clearTimers]);

  return { messages, status, error, sendMessage, append, stop };
}
`,N=e(n(),1),P=t(),F=e=>typeof e==`string`?e:``,I=e=>Array.isArray(e)?e:[],L=e=>typeof e==`object`&&!!e;function R(e){if(e!=null&&typeof e!=`function`){if(typeof e==`string`)return e;if(typeof e==`number`||typeof e==`boolean`||typeof e==`bigint`||typeof e==`symbol`)return e.toString();try{return JSON.stringify(e,null,2)}catch{return`[unserializable]`}}}function Me(e,t,n){if(e.type===`tool-call`){let n=F(e.toolCallId),r=n?t.get(n):void 0;return{name:F(e.toolName)||`tool`,input:R(e.args),output:R(r?.result),status:r?r.isError===!0?`error`:`done`:`running`}}if(e.type===`tool-result`){let t=F(e.toolCallId);return t&&n.has(t)?null:{name:F(e.toolName)||`tool`,output:R(e.result),status:e.isError===!0?`error`:`done`}}let r=I(e.states).filter(e=>typeof e==`string`),i=r.includes(`output-error`)?`error`:r.includes(`output-available`)?`done`:r.length>0?`running`:`pending`;return{name:e.type.slice(5)||`tool`,input:R(e.input),output:R(e.output),status:i}}function Ne(e){if(e.type===`source-url`)return typeof e.url!=`string`||!e.url?null:{href:e.url,title:F(e.title)||e.url};if(e.type!==`source`||!L(e.source))return null;let t=e.source,n=typeof t.url==`string`?t.url:``;return n?{href:n,title:F(t.title)||n,snippet:F(t.snippet)||void 0}:null}function Pe(e){let t=L(e.providerMetadata)?e.providerMetadata:void 0,n=t?Object.values(t).find(e=>L(e)&&typeof e.duration==`number`&&e.duration>0):void 0,r=typeof e.duration==`number`&&e.duration>0?e.duration:n?.duration;if(!(typeof r!=`number`||!Number.isFinite(r)||r<=0))return r<1e3?`${Math.round(r)}ms`:`${Math.round(r/100)/10}s`}var Fe=e=>F(e).trim().toLowerCase().replace(/[\s-]+/g,`_`),Ie={pending:`pending`,queued:`pending`,planned:`pending`,not_started:`pending`,active:`active`,in_progress:`active`,running:`active`,started:`active`,done:`done`,completed:`done`,complete:`done`,succeeded:`done`,error:`error`,failed:`error`,skipped:`skipped`,cancelled:`skipped`,canceled:`skipped`};function Le(e){let t=L(e.data)?e.data:{},n=I(t.steps).filter(L);return n.length===0?null:{title:F(t.title)||`Plan`,items:n.map((e,t)=>({key:F(e.id)||`step-${t}`,label:F(e.label)||F(e.title)||F(e.name)||`Step ${t+1}`,description:F(e.description)||void 0,status:Ie[Fe(e.status)]??`pending`}))}}var Re={queued:`queued`,pending:`queued`,waiting:`queued`,planned:`queued`,sending:`sending`,active:`sending`,running:`sending`,in_progress:`sending`,failed:`failed`,error:`failed`};function ze(e){let t=I((L(e.data)?e.data:{}).items).filter(L);return t.length===0?null:{items:t.map((e,t)=>({id:F(e.id)||`item-${t}`,title:F(e.title)||F(e.label)||F(e.name)||`Item ${t+1}`,description:F(e.description)||void 0,status:Re[Fe(e.status)]??`queued`}))}}var Be=`haze-ai-chat-adapter__textBody`,Ve=`haze-ai-chat-adapter__reasoningBody`,He=`haze-ai-chat-adapter__citationStrip`;function Ue(e,t){let{key:n,live:r}=t;if(e.type===`text`){let t=F(e.text);return t?r&&e.state===`streaming`?(0,P.jsx)(fe,{text:t},n):(0,P.jsx)(`div`,{className:Be,children:t},n):null}if(e.type===`reasoning`){let t=F(e.text);return t?(0,P.jsx)(me,{children:(0,P.jsx)(pe,{label:`Thought process`,status:e.state===`streaming`?`running`:`done`,time:Pe(e),collapsible:!0,content:(0,P.jsx)(`p`,{className:Ve,children:t})})},n):r&&e.state===`streaming`?(0,P.jsx)(C,{},n):null}if(e.type.startsWith(`tool-`)){let r=Me(e,t.resultsByCallId,t.callIds);return r?(0,P.jsx)(ie,{...r},n):null}if(e.type===`data-plan`){let t=Le(e);return t?(0,P.jsx)(s,{title:t.title,children:t.items.map(e=>(0,P.jsx)(a,{label:e.label,description:e.description,status:e.status},e.key))},n):null}if(e.type===`data-queue`){let r=ze(e);if(!r)return null;let i=t.onQueueRemove;return(0,P.jsx)(c,{children:r.items.map(e=>(0,P.jsx)(u,{title:e.title,description:e.description,status:e.status,...i?{onRemove:()=>i(t.partId,e.id),removeLabel:`Remove ${e.title}`}:{}},e.id))},n)}return null}function We(e,t){let n=I(e.messages).filter(L),r=e.status,i=r===`submitted`||r===`streaming`,a=[];n.forEach((e,o)=>{let s=o===n.length-1,c=e.role===`user`||e.role===`system`?e.role:`assistant`,u=F(e.id)||`msg-${o}`,d=I(e.parts).filter(L),f=new Map,p=new Set;for(let e of d){let t=typeof e.toolCallId==`string`?e.toolCallId:``;t&&(e.type===`tool-result`?f.set(t,e):e.type===`tool-call`&&p.add(t))}let m=[],h=[];d.forEach((e,n)=>{let r=`${u}-part-${n}`,a=Ne(e);if(a){h.push((0,P.jsx)(l,{index:h.length+1,href:a.href,title:a.title,snippet:a.snippet},r));return}let o=Ue(e,{key:r,live:i&&s,partId:F(e.id)||r,resultsByCallId:f,callIds:p,onQueueRemove:t?.onQueueRemove});o!==null&&m.push(o)}),h.length>0&&m.push((0,P.jsx)(`div`,{className:He,children:h},`${u}-citations`));let g=c===`user`&&s&&r===`submitted`?`sending`:c===`user`?`sent`:void 0;a.push((0,P.jsx)(de,{role:c,status:g,children:m.length>0?m:(0,P.jsx)(C,{})},u))});let o=n[n.length-1];if(r===`submitted`&&o?.role!==`assistant`&&a.push((0,P.jsx)(C,{},`haze-waiting`)),r===`error`){let t=e.error,n=t instanceof Error?t.message:F(t)||`Something went wrong.`;a.push((0,P.jsx)(de,{role:`system`,children:n},`haze-error`))}return a}function Ge(e,t){let{messages:n,status:r,error:i}=e,a=t?.onQueueRemove,o=(0,N.useMemo)(()=>We({messages:n,status:r,error:i},{onQueueRemove:a}),[n,r,i,a]),{sendMessage:s,append:c,stop:l}=e,u=(0,N.useCallback)(e=>{let t=e.trim();t&&(s?s({text:t}):c?.({role:`user`,content:t}))},[s,c]),d=(0,N.useCallback)(()=>l?.(),[l]);return{messages:o,busy:r===`submitted`||r===`streaming`,error:r===`error`,send:u,stop:d}}var Ke=0,z=e=>`${e}-${++Ke}`,qe=20,Je={id:`welcome`,role:`assistant`,parts:[{type:`text`,state:`done`,text:`Ask me about haze-ui — for example: "How does haze-ui ship per-component CSS?"`}]},Ye=`The user asks about CSS delivery. haze-ui is a Linaria library — zero runtime — so styles are extracted at build time. The library build emits one CSS file per module, and a split script groups them into per-component subpaths plus an aggregate stylesheet. I should check the docs for the exact loading modes before answering.`,Xe=`haze-ui ships **two CSS loading modes**:

1. Per-component subpaths — \`import 'haze-ui/css/button'\` pulls only what you mount.
2. The aggregate — \`import 'haze-ui/styles.css'\` covers everything at once.

Both are plain build artifacts (Linaria extracts them at build time, no runtime CSS-in-JS), and a manifest maps every export to its CSS file so tooling never guesses.`,Ze=e=>`Parsing the request: "${e}". No tool call needed — answer from the component catalog directly, and keep it short.`,Qe=e=>`About "${e}" — haze-ui's agent surface is a set of presentational components: ChatContainer owns scrolling, ChatMessage the bubbles, StreamingText the typewriter reveal, ToolCallCard tool input/output, ThinkingIndicator the waiting dots, and ChatInput the composer. Pair them with any runtime; this demo drives them through the same adapter you would use with a real one.`,$e=e=>({query:e}),et={files:[`css/loading-modes.md`,`css/manifest.json`],loadingModes:2},tt=[{id:`plan-find-docs`,label:`Locate the CSS docs`},{id:`plan-check-modes`,label:`Check both loading modes`},{id:`plan-summarize`,label:`Summarize the manifest`}],B=(e,t)=>({state:e,steps:tt.map((e,n)=>({...e,status:t[n]??`pending`}))}),nt=(e,t)=>({type:`data-plan`,id:`plan-css`,data:B(e,t)}),rt=(e,t)=>({items:[{id:`q-emit`,title:`Emit loading-modes.md`,description:e===`failed`?`403 — docs storage quota exceeded`:void 0,status:e},{id:`q-cdn`,title:`Refresh the CDN manifest`,status:t}]}),it=(e,t)=>({type:`data-queue`,id:`queue-css`,data:rt(e,t)}),at=e=>Array.isArray(e)?e:[],ot=e=>t=>[...t,e],V=(e,t)=>n=>n.map((n,r)=>r===e?{...n,...t}:n);function st(){let[e,t]=(0,N.useState)([Je]),[n,r]=(0,N.useState)(`ready`),[i,a]=(0,N.useState)(void 0),o=(0,N.useRef)([]),s=(0,N.useRef)(`ready`);(0,N.useEffect)(()=>{s.current=n},[n]);let c=(0,N.useCallback)(()=>{o.current.forEach(clearTimeout),o.current=[]},[]);(0,N.useEffect)(()=>c,[c]);let l=(0,N.useCallback)(e=>{c();let n=z(`assistant`),i=/css|style|stylesheet/i.test(e),s=/\b(error|fail|crash)\b/i.test(e),l=(e,r)=>{o.current.push(setTimeout(()=>{t(e=>e.map(e=>e.id===n?{...e,parts:r(at(e.parts))}:e))},e))};if(t(e=>[...e,{id:n,role:`assistant`,parts:[]}]),r(`streaming`),s){o.current.push(setTimeout(()=>{a(`Mock transport error — simulated failure.`),r(`error`)},700));return}let u=i?Xe:Qe(e),d=i?Ye:Ze(e),f=0,p=0,m=(e,t)=>{let n=f;return f+=1,l(e,ot(t)),n},h=m(p,{type:`reasoning`,text:d,state:`streaming`});if(p+=900,l(p,V(h,{state:`done`,providerMetadata:{anthropic:{duration:1240}}})),i){p+=100;let t=m(p,nt(`draft`,[`pending`,`pending`,`pending`]));p+=200,l(p,V(t,{data:B(`active`,[`in_progress`,`pending`,`pending`])})),p+=300;let n=m(p,{type:`tool-searchDocs`,toolCallId:z(`call`),states:[`input-streaming`]});l(p+350,V(n,{states:[`input-available`],input:$e(e)})),p+=1500,l(p,V(n,{states:[`output-available`],input:$e(e),output:et})),p+=200,l(p,V(t,{data:B(`active`,[`completed`,`in_progress`,`pending`])})),p+=600,l(p,V(t,{data:B(`active`,[`completed`,`completed`,`in_progress`])})),p+=600,l(p,V(t,{data:B(`done`,[`completed`,`completed`,`completed`])})),p+=100}else p+=200;let g=m(p,{type:`text`,text:u,state:`streaming`}),_=p+u.length*qe+500;if(l(_,V(g,{state:`done`})),i){m(_+60,{type:`source`,source:{sourceType:`url`,url:`https://wmzy.github.io/haze-ui/`,title:`haze-ui docs — CSS loading modes`,snippet:`Import per-component subpaths (haze-ui/css/button) or the aggregate styles.css; a manifest maps every export to its CSS file.`}}),m(_+120,{type:`source`,source:{sourceType:`url`,url:`https://github.com/wmzy/haze-ui/blob/main/scripts/split-css.mjs`,title:`scripts/split-css.mjs`,snippet:`Groups the per-module CSS output into per-component css/ subpaths plus the aggregate stylesheet.`}});let e=m(_+180,it(`sending`,`queued`));l(_+980,V(e,{data:rt(`failed`,`queued`)})),o.current.push(setTimeout(()=>r(`ready`),_+1080))}else o.current.push(setTimeout(()=>r(`ready`),_))},[c]),u=(0,N.useCallback)(e=>{let n=e,i=typeof n.text==`string`?n.text:n.content,c=(typeof i==`string`?i:``).trim();c&&s.current!==`submitted`&&s.current!==`streaming`&&(a(void 0),t(e=>[...e,{id:z(`user`),role:`user`,parts:[{type:`text`,text:c}]}]),r(`submitted`),o.current.push(setTimeout(()=>l(c),600)))},[l]);return{messages:e,status:n,error:i,sendMessage:u,append:(0,N.useCallback)(e=>u(e),[u]),stop:(0,N.useCallback)(()=>{c(),(s.current===`streaming`||s.current===`submitted`)&&(t(e=>e.map(e=>({...e,parts:at(e.parts).map(e=>e.state===`streaming`?{...e,state:`done`}:e)}))),r(`ready`))},[c])}}var ct=xe(he,{chatInput:{placeholder:`Écrire un message…`,send:`Envoyer`},empty:{description:`Aucune donnée`},tagInput:{placeholder:`Ajouter un tag`}}),lt=xe(he,{chatInput:{placeholder:`اكتب رسالة…`,send:`إرسال`},empty:{description:`لا توجد بيانات`},tagInput:{placeholder:`أضف وسمًا`,tagCount:`{count} وسوم`,tagCountSingular:`وسم واحد`}}),ut={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},dt=N.createContext&&N.createContext(ut),ft=[`attr`,`size`,`title`];function pt(e,t){if(e==null)return{};var n,r,i=mt(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)===-1&&{}.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}function mt(e,t){if(e==null)return{};var n={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(t.indexOf(r)!==-1)continue;n[r]=e[r]}return n}function H(){return H=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},H.apply(null,arguments)}function ht(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function U(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?ht(Object(n),!0).forEach(function(t){gt(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):ht(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}function gt(e,t,n){return(t=_t(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function _t(e){var t=vt(e,`string`);return typeof t==`symbol`?t:t+``}function vt(e,t){if(typeof e!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(typeof r!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function yt(e){return e&&e.map((e,t)=>N.createElement(e.tag,U({key:t},e.attr),yt(e.child)))}function bt(e){return t=>N.createElement(xt,H({attr:U({},e.attr)},t),yt(e.child))}function xt(e){var t=t=>{var n=e.attr,r=e.size,i=e.title,a=pt(e,ft),o=r||t.size||`1em`,s;return t.className&&(s=t.className),e.className&&(s=(s?s+` `:``)+e.className),N.createElement(`svg`,H({stroke:`currentColor`,fill:`currentColor`,strokeWidth:`0`},t.attr,n,a,{className:s,style:U(U({color:e.color||t.color},t.style),e.style),height:o,width:o,xmlns:`http://www.w3.org/2000/svg`}),i&&N.createElement(`title`,null,i),e.children)};return dt===void 0?t(ut):N.createElement(dt.Consumer,null,e=>t(e))}function St(e){return bt({tag:`svg`,attr:{viewBox:`0 0 24 24`},child:[{tag:`path`,attr:{fill:`none`,d:`M0 0h24v24H0z`},child:[]},{tag:`path`,attr:{d:`M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.15-.68 1.81-.55zM11.17 17s3.74-1.55 5.89-3.7c5.4-5.4 4.5-9.62 4.21-10.57-.95-.3-5.17-1.19-10.57 4.21C8.55 9.09 7 12.83 7 12.83zm6.48-2.19c-2.29 2.04-5.58 3.44-5.89 3.57L13.31 22l4.05-4.05c.47-.47.68-1.15.55-1.81zM9 18c0 .83-.34 1.58-.88 2.12C6.94 21.3 2 22 2 22s.7-4.94 1.88-6.12A2.996 2.996 0 0 1 9 18m4-9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2`},child:[]}]})(e)}function Ct(e){return bt({tag:`svg`,attr:{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`},child:[{tag:`circle`,attr:{cx:`11`,cy:`11`,r:`8`},child:[]},{tag:`line`,attr:{x1:`21`,y1:`21`,x2:`16.65`,y2:`16.65`},child:[]}]})(e)}var wt={deploy:Ee,discard:be,empty:we};function W({name:e,size:t=`md`}){let n=wt[e];return(0,P.jsx)(y,{icon:n,size:t})}var Tt=`haze-icon-ecosystems__demoColumn`,Et=`haze-icon-ecosystems__demoRow`,Dt=[{type:`item`,label:`Deploy revision`,icon:(0,P.jsx)(W,{name:`deploy`,size:`sm`}),kbdLabel:`⇧D`},{type:`item`,label:`Search docs`,icon:(0,P.jsx)(y,{size:`sm`,children:(0,P.jsx)(Ct,{})}),kbdLabel:`/`},{type:`divider`},{type:`item`,label:`Discard draft`,icon:(0,P.jsx)(W,{name:`discard`,size:`sm`}),danger:!0}];function Ot(){return(0,P.jsxs)(`div`,{className:Et,children:[(0,P.jsxs)(A,{variant:`outline`,children:[(0,P.jsx)(W,{name:`deploy`}),` Deploy`]}),(0,P.jsx)(A,{variant:`ghost`,square:!0,"aria-label":`Discard draft`,children:(0,P.jsx)(W,{name:`discard`})}),(0,P.jsx)(v,{trigger:(0,P.jsxs)(A,{variant:`outline`,children:[(0,P.jsx)(W,{name:`deploy`}),` Actions`]}),items:Dt})]})}function kt(){return(0,P.jsxs)(`div`,{className:Et,children:[(0,P.jsxs)(A,{variant:`outline`,children:[(0,P.jsx)(St,{}),` Material, bare`]}),(0,P.jsxs)(A,{variant:`outline`,children:[(0,P.jsx)(y,{size:`sm`,children:(0,P.jsx)(Ct,{})}),`Feather via children`]})]})}function At(){return(0,P.jsx)(d,{icon:(0,P.jsx)(W,{name:`deploy`,size:`lg`}),title:`Deployment live`,subTitle:`v2.4.0 — built 42 seconds ago`,extra:(0,P.jsx)(A,{size:`sm`,variant:`outline`,children:`Open app`})})}function jt(){return(0,P.jsx)(b,{image:(0,P.jsx)(W,{name:`empty`,size:`lg`}),description:`No deployments yet`,children:(0,P.jsx)(A,{size:`sm`,variant:`outline`,children:`Create one`})})}function Mt(){return(0,P.jsxs)(`div`,{className:Tt,children:[(0,P.jsx)(Ot,{}),(0,P.jsx)(kt,{}),(0,P.jsx)(At,{}),(0,P.jsx)(jt,{})]})}var G=6,K=[{id:1,name:`Ada Lovelace`,email:`ada@haze.dev`,role:`admin`},{id:2,name:`Grace Hopper`,email:`grace@haze.dev`,role:`editor`},{id:3,name:`Alan Turing`,email:`alan@haze.dev`,role:`viewer`},{id:4,name:`Katherine Johnson`,email:`katherine@haze.dev`,role:`editor`},{id:5,name:`Edsger Dijkstra`,email:`edsger@haze.dev`,role:`viewer`},{id:6,name:`Barbara Liskov`,email:`barbara@haze.dev`,role:`admin`},{id:7,name:`Donald Knuth`,email:`donald@haze.dev`,role:`viewer`},{id:8,name:`Margaret Hamilton`,email:`margaret@haze.dev`,role:`editor`},{id:9,name:`Dennis Ritchie`,email:`dennis@haze.dev`,role:`viewer`},{id:10,name:`Radia Perlman`,email:`radia@haze.dev`,role:`editor`},{id:11,name:`Tim Berners-Lee`,email:`tim@haze.dev`,role:`viewer`},{id:12,name:`Anita Borg`,email:`anita@haze.dev`,role:`admin`},{id:13,name:`Linus Torvalds`,email:`linus@haze.dev`,role:`viewer`}];function Nt(){return K.reduce((e,t)=>Math.max(e,t.id),0)+1}function Pt(e){K.unshift({id:Nt(),...e,role:e.role})}function Ft(e,t){let n=K.findIndex(t=>t.id===e);n!==-1&&(K[n]={...K[n],...t,role:t.role})}function It(e){let t=K.findIndex(t=>t.id===e);t!==-1&&K.splice(t,1)}function q(e,t,n){let r=n.trim().toLowerCase(),i=r?K.filter(e=>e.name.toLowerCase().includes(r)||e.email.toLowerCase().includes(r)):K,a=t[0];return{rows:(a?[...i].sort((e,t)=>{let n=a.id,r=n===`id`?e.id-t.id:e[n].localeCompare(t[n]);return a.desc?-r:r}):i).slice((e-1)*G,e*G),pageCount:Math.max(1,Math.ceil(i.length/G))}}var Lt=f(w().min(2,`Name must be at least 2 characters`)),Rt=f(D(`Enter a valid email address`)),zt=f(se([`admin`,`editor`,`viewer`],{message:`Pick a role`}));function Bt(e){return e===`admin`?(0,P.jsx)(_,{color:`info`,children:e}):e===`editor`?(0,P.jsx)(_,{color:`success`,children:e}):(0,P.jsx)(_,{children:e})}function Vt({member:e,onCancel:t,onSubmit:n}){let r=T({initialValues:e?{name:e.name,email:e.email,role:e.role}:{name:``,email:``,role:``}});return(0,P.jsxs)(ce,{form:r,onValidSubmit:n,children:[(0,P.jsxs)(`div`,{className:Jt,children:[(0,P.jsx)(E,{form:r,name:`name`,label:`Name`,validate:Lt,mode:`onBlur`,input:p,placeholder:`Ada Lovelace`}),(0,P.jsx)(E,{form:r,name:`email`,label:`Email`,validate:Rt,mode:`onBlur`,input:p,placeholder:`ada@haze.dev`}),(0,P.jsxs)(E,{form:r,name:`role`,label:`Role`,validate:zt,mode:`onBlur`,input:h,children:[(0,P.jsx)(g,{value:``,children:`Pick a role…`}),(0,P.jsx)(g,{value:`admin`,children:`Admin`}),(0,P.jsx)(g,{value:`editor`,children:`Editor`}),(0,P.jsx)(g,{value:`viewer`,children:`Viewer`})]})]}),(0,P.jsxs)(`div`,{className:Yt,children:[(0,P.jsx)(A,{onClick:e=>e.currentTarget.form?.requestSubmit(),children:`Save`}),(0,P.jsx)(A,{variant:`ghost`,onClick:t,children:`Cancel`})]})]})}function Ht(){return(0,P.jsx)(ne,{children:(0,P.jsx)(Ut,{})})}function Ut(){let e=re(),[t,,n]=k(void 0,``),[r,i]=(0,N.useState)(1),[a,o]=(0,N.useState)([]),[s,c]=(0,N.useState)(0),[l,u]=(0,N.useState)(()=>({page:1,sorting:[],search:``,reloadKey:0,...q(1,[],``)})),d=l.page!==r||l.sorting!==a||l.search!==t||l.reloadKey!==s;(0,N.useEffect)(()=>{if(!d)return;let e=setTimeout(()=>{u({page:r,sorting:a,search:t,reloadKey:s,...q(r,a,t)})},300);return()=>clearTimeout(e)},[d,r,a,t,s]);let[,f,p]=k(void 0,!1),[h,g]=(0,N.useState)(null),[_,v]=(0,N.useState)(0),[,y,ne]=k(void 0,!1),[b,x]=(0,N.useState)(null),ie=(0,N.useCallback)(()=>{g(null),v(e=>e+1),f(!0)},[f]),S=(0,N.useCallback)(e=>{g(e),v(e=>e+1),f(!0)},[f]),C=(0,N.useCallback)(()=>f(!1),[f]),w=(0,N.useCallback)(e=>{x(e),y(!0)},[y]),T=(0,N.useCallback)(()=>{y(!1),x(null)},[y]),E=t=>{h?(Ft(h.id,t),e(`Updated ${t.name}`,{variant:`success`})):(Pt(t),i(1),e(`Created ${t.name}`,{variant:`success`})),c(e=>e+1),C()},oe=()=>{if(!b)return;It(b.id);let{pageCount:n}=q(r,a,t);r>n&&i(n),c(e=>e+1),e(`Deleted ${b.name}`,{variant:`success`}),x(null)},D=(0,N.useMemo)(()=>[{accessorKey:`name`,header:`Name`,cell:e=>(0,P.jsx)(`strong`,{children:e.getValue()})},{accessorKey:`email`,header:`Email`},{accessorKey:`role`,header:`Role`,cell:e=>Bt(e.getValue())},{id:`actions`,header:``,cell:({row:e})=>(0,P.jsxs)(`div`,{className:qt,children:[(0,P.jsx)(A,{size:`sm`,variant:`ghost`,onClick:()=>S(e.original),children:`Edit`}),(0,P.jsx)(A,{size:`sm`,variant:`ghost`,onClick:()=>w(e.original),children:`Delete`})]}),meta:{sortable:!1}}],[S,w]);return(0,P.jsxs)(`div`,{className:Wt,children:[(0,P.jsxs)(`div`,{className:Gt,children:[(0,P.jsx)(m,{className:Kt,value:n,placeholder:`Search name or email…`,"aria-label":`Search members`,onChange:()=>i(1)}),(0,P.jsx)(A,{onClick:ie,children:`New member`})]}),(0,P.jsx)(ae,{columns:D,data:l.rows,manual:!0,sortable:!0,loading:d,pageSize:G,pageCount:l.pageCount,onPageChange:i,onSortChange:e=>{o(e),i(1)},getRowId:e=>String(e.id)}),(0,P.jsx)(ee,{open:p,onClose:C,title:h?`Edit member`:`New member`,children:(0,P.jsx)(Vt,{member:h,onCancel:C,onSubmit:E},_)}),(0,P.jsxs)(te,{open:ne,title:`Delete member`,confirmText:`Delete`,variant:`danger`,onConfirm:oe,onCancel:T,onClose:T,children:[`Delete `,b?.name,`? There is no undo.`]})]})}var Wt=`haze-member-crud__frame`,Gt=`haze-member-crud__toolbar`,Kt=`haze-member-crud__searchInput`,qt=`haze-member-crud__rowActions`,Jt=`haze-member-crud__formGrid`,Yt=`haze-member-crud__formFooter`,J=Object.assign({"./ai-chat-adapter.tsx":De,"./icon-ecosystems.tsx":Oe,"./locale-packs.ts":ke,"./member-crud.tsx":Ae,"./mock-use-chat.ts":je}),Xt=J[`./locale-packs.ts`]??``,Zt=J[`./ai-chat-adapter.tsx`]??``,Qt=J[`./mock-use-chat.ts`]??``,$t=J[`./member-crud.tsx`]??``,en=J[`./icon-ecosystems.tsx`]??``,Y=`haze-index__paragraph`,X=`haze-index__inlineCode`,Z=`haze-index__hint`,Q=`haze-index__demoPanel`,tn=`haze-index__demoColumn`,nn=`haze-index__aiChatFrame`,rn=`haze-index__aiChatScroll`,an=`haze-index__aiChatComposer`,on=`haze-index__aiChatInput`,sn=`haze-index__aiChatHint`,$=`haze-index__codeMargin`,cn={username:``,password:``,email:``},ln=new Set([`admin`,`haze`,`root`]),un=w().min(1,`Username is required`).min(3,`Username must be at least 3 characters`),dn=w().min(8,`Password must be at least 8 characters`),fn=D(`Enter a valid email address`),pn=f(un),mn=f(dn),hn=f(fn);function gn(e,t,n){return new Promise(r=>{let i=setTimeout(()=>{r(ln.has(e.toLowerCase())?`"${e}" is already taken`:void 0)},600);t.addEventListener(`abort`,()=>{clearTimeout(i),n(),r(void 0)},{once:!0})})}function _n(){let e=T({initialValues:cn}),[t,n]=(0,N.useState)(null),[r,i]=(0,N.useState)({issued:0,cancelled:0});return(0,P.jsxs)(`div`,{children:[(0,P.jsxs)(ce,{form:e,onValidSubmit:e=>n(e),onInvalidSubmit:()=>n(null),children:[(0,P.jsx)(`div`,{className:j,children:(0,P.jsx)(E,{form:e,name:`username`,label:`Username`,validate:async(e,t)=>await pn(e,t)||(i(e=>({...e,issued:e.issued+1})),gn(e,t.signal,()=>i(e=>({...e,cancelled:e.cancelled+1})))),mode:`onChange`,validateDebounce:400,input:p,placeholder:`ada — try "admin", it is taken`})}),(0,P.jsx)(`div`,{className:j,children:(0,P.jsx)(E,{form:e,name:`password`,label:`Password`,validate:mn,mode:`onBlur`,input:p,type:`password`,placeholder:`At least 8 characters`})}),(0,P.jsx)(`div`,{className:j,children:(0,P.jsx)(E,{form:e,name:`email`,label:`Email`,validate:hn,mode:`onBlur`,children:({id:e,errorId:t,invalid:n,onBlur:r,value:i,onChange:a})=>(0,P.jsx)(p,{id:e,value:i,onChange:a,onBlur:r,placeholder:`ada@example.com`,"aria-invalid":n,"aria-describedby":n?t:void 0})})}),(0,P.jsxs)(`div`,{className:_e,children:[(0,P.jsx)(A,{onClick:e=>{e.currentTarget.form?.requestSubmit()},children:`Create account`}),(0,P.jsx)(A,{variant:`ghost`,onClick:()=>{oe(e,cn),n(null)},children:`Reset`})]})]}),(0,P.jsxs)(`p`,{className:Z,children:[`availability checks: `,r.issued,` issued · `,r.cancelled,` `,`cancelled — keep typing in Username and watch stale rounds drop.`]}),t?(0,P.jsx)(O,{language:`json`,children:JSON.stringify(t,null,2)}):null]})}var vn=[{value:`en-US`,label:`English`},{value:`fr-FR`,label:`Français`},{value:`zh-CN`,label:`中文`},{value:`ar-EG`,label:`العربية`}],yn={"fr-FR":ct,"ar-EG":lt};function bn(){return(0,P.jsxs)(`output`,{className:Z,children:[`useDirection(): `,i()]})}function xn(){let[e,,t]=k(void 0,`en-US`),[,,n]=k(void 0,[`ui`]);return(0,P.jsxs)(`div`,{children:[(0,P.jsx)(le,{options:[...vn],value:t}),(0,P.jsx)(o,{locale:e,strings:yn[e],children:(0,P.jsxs)(`div`,{dir:r(e)??`ltr`,className:tn,children:[(0,P.jsx)(ue,{value:n,"aria-label":`Tags`}),(0,P.jsx)(b,{}),(0,P.jsx)(bn,{})]})})]})}function Sn(){let{messages:e,busy:t,error:n,send:r,stop:i}=Ge(st());return(0,P.jsxs)(`div`,{className:nn,children:[(0,P.jsx)(x,{className:rn,children:e}),(0,P.jsx)(`div`,{className:an,children:(0,P.jsx)(S,{className:on,placeholder:`Ask about haze-ui — try “css”, or “error” to fail`,generating:t,onSend:r,onStop:i})}),n?(0,P.jsx)(`p`,{className:sn,children:`status: error — send another message to retry`}):null]})}function Cn(){return(0,P.jsxs)(`div`,{className:ge,children:[(0,P.jsx)(`h1`,{children:`Recipes`}),(0,P.jsx)(`p`,{className:ve,children:`Integration recipes for pairing haze-ui with the ecosystem. Each recipe is a live demo plus the exact code behind it — start typing in the form below and watch schema errors, async checks and cancellation all fire in real time, run the CRUD recipe's server-paginated table end to end (search, sort, create, edit, delete — toasts and all), switch languages in the locale recipe to see packs, partial overrides and RTL derivation at work, chat with the AI runtime recipe: a Vercel AI SDK useChat shape driving the agent components through one small adapter, or wire an icon ecosystem — the last recipe pairs lucide-react and react-icons with every icon slot haze-ui exposes.`}),(0,P.jsxs)(`div`,{className:M,children:[(0,P.jsx)(`h2`,{children:`zod × react-f0rm — schema-driven form validation`}),(0,P.jsxs)(`p`,{className:Y,children:[`haze-ui's `,(0,P.jsx)(`code`,{className:X,children:`FormItem`}),` takes any`,` `,(0,P.jsx)(`code`,{className:X,children:`FieldValidator`}),`:`,` `,(0,P.jsx)(`code`,{className:X,children:`(value, meta) => error | undefined`}),`, sync or async, where `,(0,P.jsx)(`code`,{className:X,children:`meta.signal`}),` `,`aborts as soon as the validation round is superseded. That shape is all an adapter needs: map `,(0,P.jsx)(`code`,{className:X,children:`zod`}),`'s`,` `,(0,P.jsx)(`code`,{className:X,children:`safeParseAsync`}),` result onto it and every schema you already have becomes form validation.`]}),(0,P.jsx)(`h3`,{children:`Live demo`}),(0,P.jsx)(`div`,{className:Q,children:(0,P.jsx)(_n,{})}),(0,P.jsx)(`h3`,{children:`The adapter ships with haze-ui`}),(0,P.jsxs)(`p`,{className:Y,children:[`This used to be a hand-written bridge; the resolver now lives in the library itself — import it from`,` `,(0,P.jsx)(`code`,{className:X,children:`haze-ui`}),` and every schema you already have becomes form validation:`]}),(0,P.jsx)(O,{language:`ts`,className:$,children:`import { zodResolver } from 'haze-ui';
const usernameSchema = z.string()
  .min(1, 'Username is required')
  .min(3, 'Username must be at least 3 characters');
const validateUsername = zodResolver(usernameSchema);`}),(0,P.jsx)(`p`,{className:Y,children:`Three details carry the contract:`}),(0,P.jsxs)(`ol`,{className:Y,children:[(0,P.jsxs)(`li`,{children:[(0,P.jsx)(`code`,{className:X,children:`safeParseAsync`}),` never throws on validation failures — `,(0,P.jsx)(`code`,{className:X,children:`success: false`}),` `,`carries `,(0,P.jsx)(`code`,{className:X,children:`error.issues`}),`, each mapped to a`,` `,(0,P.jsx)(`code`,{className:X,children:`FieldError`}),` with`,` `,(0,P.jsx)(`code`,{className:X,children:`type: issue.code`}),` and the message passed through (custom messages from`,` `,(0,P.jsx)(`code`,{className:X,children:`.min(3, '…')`}),` or zod's built-ins). FormItem displays the first error of the field.`]}),(0,P.jsxs)(`li`,{children:[`When a validation round is superseded,`,` `,(0,P.jsx)(`code`,{className:X,children:`meta.signal`}),` aborts and the resolver resolves `,(0,P.jsx)(`code`,{className:X,children:`undefined`}),` — the safe non-answer, because react-f0rm discards superseded rounds on its own side too.`]}),(0,P.jsxs)(`li`,{children:[`A passing parse resolves `,(0,P.jsx)(`code`,{className:X,children:`undefined`}),` `,`— the no-error value f0rm expects.`]})]}),(0,P.jsx)(`h3`,{children:`Wiring it into FormItem`}),(0,P.jsxs)(`p`,{className:Y,children:[`Schemas are stateless values, so build the adapters once at module scope and reuse them across fields. The`,` `,(0,P.jsx)(`code`,{className:X,children:`input`}),` channel binds a core component declaratively — FormItem wires id, aria attributes,`,` `,(0,P.jsx)(`code`,{className:X,children:`onBlur`}),`,`,` `,(0,P.jsx)(`code`,{className:X,children:`onChange`}),` and`,` `,(0,P.jsx)(`code`,{className:X,children:`value`}),` itself:`]}),(0,P.jsx)(O,{language:`tsx`,className:$,children:`const usernameSchema = z.string()
  .min(1, 'Username is required')
  .min(3, 'Username must be at least 3 characters');
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
const emailSchema = z.email('Enter a valid email address');
// one adapter per schema, reused by any number of fields
const validatePassword = zodResolver(passwordSchema);
<FormItem
  form={form}
  name='password'
  label='Password'
  validate={validatePassword}
  mode='onBlur'
  input={InputCore}        // FormItem wires id/aria/onBlur/onChange/value
  type='password'
  placeholder='At least 8 characters'
/>`}),(0,P.jsx)(`h3`,{children:`Async checks + AbortSignal cancellation`}),(0,P.jsxs)(`p`,{className:Y,children:[`react-f0rm aborts the previous round's signal the moment a newer validation kick runs — each debounced round owns its own`,` `,(0,P.jsx)(`code`,{className:X,children:`AbortController`}),`. Plain validators compose with `,(0,P.jsx)(`code`,{className:X,children:`await`}),`: run the zod shape first, then the network check, reading`,` `,(0,P.jsx)(`code`,{className:X,children:`meta.signal`}),` to cancel real work (here a `,(0,P.jsx)(`code`,{className:X,children:`setTimeout`}),` standing in for a fetch — wire it to`,` `,(0,P.jsxs)(`code`,{className:X,children:[`fetch(url, `,`{ signal }`,`)`]}),` the same way):`]}),(0,P.jsx)(O,{language:`tsx`,className:$,children:`const validateUsername: FieldValidator<SignupValues, 'username'> = async (
  value,
  meta
) => {
  const shapeError = await validateUsernameShape(value, meta);
  if (shapeError) return shapeError;          // shape errors never hit the network
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(
        TAKEN_USERNAMES.has(value.toLowerCase())
          ? \`"\${value}" is already taken\`
          : undefined
      );
    }, 600);
    meta.signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);                  // the round is dead — stop its work
        resolve(undefined);                   // and never answer it
      },
      { once: true }
    );
  });
};
<FormItem
  form={form}
  name='username'
  label='Username'
  validate={validateUsername}
  mode='onChange'
  validateDebounce={400}   // debounce < check duration → typing cancels stale checks
  input={InputCore}
/>`}),(0,P.jsxs)(`p`,{className:Y,children:[`Keep typing in the demo's Username field: each debounced round issues a check, and the next keystroke aborts the previous one — the issued/cancelled counters below the form count exactly that. Because superseded validators resolve`,` `,(0,P.jsx)(`code`,{className:X,children:`undefined`}),` instead of rejecting, cancelled checks stay invisible to both the form state and the console.`]})]}),(0,P.jsxs)(`div`,{className:M,children:[(0,P.jsx)(`h2`,{children:`CRUD table — FormItem × DataTable server mode × Toast`}),(0,P.jsxs)(`p`,{className:Y,children:[`The classic admin screen, assembled from the pieces the recipes above introduced: a`,` `,(0,P.jsx)(`code`,{className:X,children:`DataTable`}),` in`,` `,(0,P.jsx)(`code`,{className:X,children:`manual`}),` mode talking to a (fake) server — pagination and sorting are the server's job, the table just renders what arrives — plus a`,` `,(0,P.jsx)(`code`,{className:X,children:`FormItem`}),` dialog for create/edit, a `,(0,P.jsx)(`code`,{className:X,children:`ConfirmDialog`}),` `,`for delete, and `,(0,P.jsx)(`code`,{className:X,children:`useToast`}),` `,`feedback after every mutation. Everything below is live: search, click a sort header, page around, edit a member, delete one on the last page and watch the footer clamp.`]}),(0,P.jsx)(`h3`,{children:`Live demo`}),(0,P.jsx)(Ht,{}),(0,P.jsx)(`h3`,{children:`The server contract`}),(0,P.jsxs)(`p`,{className:Y,children:[(0,P.jsx)(`code`,{className:X,children:`manual`}),` hands pagination and sorting to the server: the table renders`,` `,(0,P.jsx)(`code`,{className:X,children:`data`}),` exactly as fetched — no local reordering, no page slicing — while sort-header clicks still toggle `,(0,P.jsx)(`code`,{className:X,children:`sorting`}),` (and`,` `,(0,P.jsx)(`code`,{className:X,children:`aria-sort`}),`) and the footer still tracks `,(0,P.jsx)(`code`,{className:X,children:`page`}),`. You observe both through the callbacks and refetch:`]}),(0,P.jsx)(O,{language:`tsx`,className:$,children:`const [page, setPage] = useState(1);
const [sorting, setSorting] = useState<SortingState>([]);
<DataTable
  columns={columns}
  data={snapshot.rows}          // the last server answer — render as received
  manual                        // server-side pagination + sorting
  sortable                      // headers still toggle sorting state
  loading={pending}             // snapshot lags the request → skeleton
  pageSize={6}
  pageCount={snapshot.pageCount} // the server owns the row total
  onPageChange={setPage}        // footer clicks → refetch
  onSortChange={(next) => {
    setSorting(next);
    setPage(1);                 // a new sort order restarts at page 1
  }}
  getRowId={(member) => String(member.id)}
/>`}),(0,P.jsxs)(`p`,{className:Y,children:[`The demo keeps the last answer in a`,` `,(0,P.jsx)(`code`,{className:X,children:`snapshot`}),` and derives`,` `,(0,P.jsx)(`code`,{className:X,children:`loading`}),` from “snapshot lags the request” — no synchronous state writes inside the fetch effect, so React 19 transitions and StrictMode both stay quiet. Mutations bump a `,(0,P.jsx)(`code`,{className:X,children:`reloadKey`}),` `,`that joins the request key, which is also how a create can force`,` `,(0,P.jsx)(`code`,{className:X,children:`setPage(1)`}),` while a delete only clamps the page when the last one emptied.`]}),(0,P.jsx)(`h3`,{children:`The dialog form`}),(0,P.jsxs)(`p`,{className:Y,children:[`One `,(0,P.jsx)(`code`,{className:X,children:`MemberForm`}),` serves create and edit: the parent remounts it with`,` `,(0,P.jsx)(`code`,{className:X,children:`key`}),` on every open, so`,` `,(0,P.jsx)(`code`,{className:X,children:`initialValues`}),` alone loads the record — no reset plumbing. The`,` `,(0,P.jsx)(`code`,{className:X,children:`input`}),` channel binds the cores (`,(0,P.jsx)(`code`,{className:X,children:`InputCore`}),`,`,` `,(0,P.jsx)(`code`,{className:X,children:`SelectCore`}),` +`,` `,(0,P.jsx)(`code`,{className:X,children:`Option`}),` children) and FormItem wires id, aria attributes,`,` `,(0,P.jsx)(`code`,{className:X,children:`onBlur`}),`,`,` `,(0,P.jsx)(`code`,{className:X,children:`onChange`}),` and the value itself; validation is the same`,` `,(0,P.jsx)(`code`,{className:X,children:`zodResolver`}),` per-field schema pattern from the recipe above. The dialog's`,` `,(0,P.jsx)(`code`,{className:X,children:`open`}),` travels through a`,` `,(0,P.jsx)(`code`,{className:X,children:`useControl`}),` Control — a plain boolean would be an uncontrolled`,` `,(0,P.jsx)(`em`,{children:`initial`}),` value and the dialog would never reopen.`]}),(0,P.jsx)(`h3`,{children:`The whole file`}),(0,P.jsxs)(`p`,{className:Y,children:[`This is the real source powering the demo — fake server, form, screen and layout, nothing elided. Swap the server bodies for`,` `,(0,P.jsx)(`code`,{className:X,children:`fetch()`}),` calls and it is a production CRUD screen:`]}),(0,P.jsx)(O,{language:`tsx`,className:$,children:$t})]}),(0,P.jsxs)(`div`,{className:M,children:[(0,P.jsx)(`h2`,{children:`Adding a locale — custom copy & RTL`}),(0,P.jsxs)(`p`,{className:Y,children:[`Every user-visible literal in haze-ui flows through`,` `,(0,P.jsx)(`code`,{className:X,children:`useStrings`}),`, so copy lives in one place per language:`,` `,(0,P.jsx)(`code`,{className:X,children:`HazeStrings`}),`, a section-per-component map derived from the English`,` `,(0,P.jsx)(`code`,{className:X,children:`defaultStrings`}),`. You can reword individual messages, mount whole packs, and contribute new languages back — the demo below switches between all three modes, including an RTL tag.`]}),(0,P.jsx)(`h3`,{children:`Live demo`}),(0,P.jsx)(`div`,{className:Q,children:(0,P.jsx)(xn,{})}),(0,P.jsxs)(`p`,{className:Z,children:[`Switch to العربية: the tag `,(0,P.jsx)(`code`,{className:X,children:`ar-EG`}),` `,`derives direction `,(0,P.jsx)(`code`,{className:X,children:`rtl`}),` (shown by the probe), and the Arabic copy renders mirrored because the demo — not the library — set `,(0,P.jsx)(`code`,{className:X,children:`dir`}),` on the column. Remove a tag in any language and watch the`,` `,(0,P.jsx)(`code`,{className:X,children:`{count}`}),` placeholder expand.`]}),(0,P.jsx)(`h3`,{children:`The packs`}),(0,P.jsxs)(`p`,{className:Y,children:[`The demo is powered by the real module below:`,` `,(0,P.jsx)(`code`,{className:X,children:`createStrings`}),` merges a partial override onto a base pack and returns a complete`,` `,(0,P.jsx)(`code`,{className:X,children:`HazeStrings`}),`, so a derived pack never forks the literals it does not touch. A full pack also satisfies the provider's partial`,` `,(0,P.jsx)(`code`,{className:X,children:`strings`}),` shape:`]}),(0,P.jsx)(O,{language:`ts`,className:$,children:Xt}),(0,P.jsx)(`h3`,{children:`Partial overrides without a pack`}),(0,P.jsxs)(`p`,{className:Y,children:[`For one-off rewording you do not need`,` `,(0,P.jsx)(`code`,{className:X,children:`createStrings`}),` at all — the`,` `,(0,P.jsx)(`code`,{className:X,children:`strings`}),` prop is already a deep partial (`,(0,P.jsx)(`code`,{className:X,children:`HazeStringsOverrides`}),`). Use `,(0,P.jsx)(`code`,{className:X,children:`createStrings`}),` when you need the resolved pack as a `,(0,P.jsx)(`em`,{children:`value`}),`: deriving`,` `,(0,P.jsx)(`code`,{className:X,children:`zhCN`}),` with your terminology, sharing one customized pack across providers, or handing it to non-React code:`]}),(0,P.jsx)(O,{language:`tsx`,className:$,children:`// one message, everything else keeps the pack copy
<LocaleProvider strings={{ pagination: { previous: '‹ Précédent' } }}>
  <Pagination total={40} />
</LocaleProvider>
// or derive a complete pack once at module scope and reuse it
const branded = createStrings(zhCN, {
  confirmDialog: { confirm: '好的', cancel: '先不了' },
});
<LocaleProvider locale="zh-CN" strings={branded}>…</LocaleProvider>`}),(0,P.jsx)(`h3`,{children:`Authoring a complete language pack`}),(0,P.jsxs)(`p`,{className:Y,children:[`A full pack is a plain `,(0,P.jsx)(`code`,{className:X,children:`const`}),` `,`annotated `,(0,P.jsx)(`code`,{className:X,children:`HazeStrings`}),` — the annotation is the contract: TypeScript fails the build the moment either side drifts (a missing key, an extra key, a renamed section). Start by copying`,` `,(0,P.jsx)(`code`,{className:X,children:`defaultStrings`}),` from`,` `,(0,P.jsx)(`code`,{className:X,children:`src/lib/components/LocaleProvider/locale.ts`}),` `,`as the translation baseline, and keep`,` `,(0,P.jsx)(`code`,{className:X,children:`{name}`}),` placeholders verbatim — they are expanded at runtime and unknown placeholders are left as-is, never blanked. This is exactly how the bundled`,` `,(0,P.jsx)(`code`,{className:X,children:`zhCN`}),` pack is written:`]}),(0,P.jsx)(O,{language:`ts`,className:$,children:`import type { HazeStrings } from 'haze-ui';
const frFR: HazeStrings = {
  alert: { close: 'Fermer' },
  approvalCard: { title: 'Approbation requise', approve: 'Approuver', deny: 'Refuser' },
  asyncSection: { loading: 'Chargement…', error: 'Une erreur est survenue', retry: 'Réessayer' },
  avatarGroup: { more: '+{count}' },          // placeholders survive translation verbatim
  // …every section of defaultStrings, 1:1 — the type enforces it
};
<LocaleProvider locale="fr-FR" strings={frFR}>…</LocaleProvider>`}),(0,P.jsx)(`h3`,{children:`RTL: declared direction vs derived direction`}),(0,P.jsxs)(`p`,{className:Y,children:[(0,P.jsx)(`code`,{className:X,children:`LocaleProvider`}),` accepts an explicit `,(0,P.jsx)(`code`,{className:X,children:`direction`}),` prop, and when nobody declares one it derives the direction from the locale: the primary subtag is matched against the RTL language list —`,` `,(0,P.jsx)(`code`,{className:X,children:`ar, he, fa, ur, ps, sd, ug, yi, dv, ckb, ku, iw`}),` `,`(the last is the legacy Hebrew tag; Latin-script Kurdish stays ltr — declare a direction explicitly then). The provider never writes a`,` `,(0,P.jsx)(`code`,{className:X,children:`dir`}),` attribute: setting the document's direction is the app's job. The library only consumes the value through two exported helpers:`]}),(0,P.jsx)(O,{language:`tsx`,className:$,children:`import { LocaleProvider, useDirection, localeDirection } from 'haze-ui';
// declared intent for render-time decisions (falls back to the document)
useDirection(); // 'rtl' under <LocaleProvider locale="ar-EG">
// pure helper: the direction a BCP 47 tag implies
localeDirection('ar-EG'); // 'rtl'
localeDirection('he-IL'); // 'rtl'
localeDirection('fr-FR'); // 'ltr'
// explicit beats derivation, and survives nested locale-only providers
<LocaleProvider locale="ar-EG" direction="ltr">…</LocaleProvider>`}),(0,P.jsxs)(`p`,{className:Y,children:[`For interaction-time code (arrow-key mirroring, JS-assisted placement) the library reads layout truth from the DOM via`,` `,(0,P.jsx)(`code`,{className:X,children:`getDirection(element)`}),` — the nearest `,(0,P.jsx)(`code`,{className:X,children:`[dir]`}),` ancestor — so mirrored behavior follows what the user actually sees, whatever the provider declared.`]}),(0,P.jsx)(`h3`,{children:`Contributing a pack upstream`}),(0,P.jsxs)(`p`,{className:Y,children:[`New languages are merged the same way`,` `,(0,P.jsx)(`code`,{className:X,children:`zhCN`}),` was: copy`,` `,(0,P.jsx)(`code`,{className:X,children:`defaultStrings`}),` as the baseline, translate it (keys 1:1, placeholders verbatim), and open a PR adding`,` `,(0,P.jsx)(`code`,{className:X,children:`src/lib/components/LocaleProvider/<tag>.ts`}),` `,`following the `,(0,P.jsx)(`code`,{className:X,children:`zh-cn.ts`}),` file layout. The maintainer-side step is registering the tag mapping in`,` `,(0,P.jsx)(`code`,{className:X,children:`useStrings'`}),` pack resolution, after which`,` `,(0,P.jsx)(`code`,{className:X,children:`locale="fr-FR"`}),` selects the pack automatically for every consumer — no`,` `,(0,P.jsx)(`code`,{className:X,children:`strings`}),` prop needed.`]})]}),(0,P.jsxs)(`div`,{className:M,children:[(0,P.jsx)(`h2`,{children:`AI runtime integration — Vercel AI SDK useChat × agent components`}),(0,P.jsxs)(`p`,{className:Y,children:[`haze-ui's agent surface is deliberately presentational:`,` `,(0,P.jsx)(`code`,{className:X,children:`ChatContainer`}),` owns scrolling,`,` `,(0,P.jsx)(`code`,{className:X,children:`ChatMessage`}),` the bubbles,`,` `,(0,P.jsx)(`code`,{className:X,children:`StreamingText`}),` the typewriter reveal, `,(0,P.jsx)(`code`,{className:X,children:`ToolCallCard`}),` tool input/output, `,(0,P.jsx)(`code`,{className:X,children:`ThinkingIndicator`}),` `,`the waiting dots, `,(0,P.jsx)(`code`,{className:X,children:`ChatInput`}),` the composer. The Vercel AI SDK's`,` `,(0,P.jsx)(`code`,{className:X,children:`useChat`}),` is the stateful half: it owns `,(0,P.jsx)(`code`,{className:X,children:`messages`}),` (a`,` `,(0,P.jsx)(`code`,{className:X,children:`UIMessage[]`}),` of typed`,` `,(0,P.jsx)(`code`,{className:X,children:`parts`}),`),`,` `,(0,P.jsx)(`code`,{className:X,children:`status`}),` (`,(0,P.jsx)(`code`,{className:X,children:`submitted | streaming | ready | error`}),`) and the `,(0,P.jsx)(`code`,{className:X,children:`sendMessage`}),`/`,(0,P.jsx)(`code`,{className:X,children:`stop`}),` pair. One small adapter bridges them — pure functions over duck-typed shapes, so the`,` `,(0,P.jsx)(`code`,{className:X,children:`ai`}),` package never enters your dependency tree through haze-ui.`]}),(0,P.jsx)(`h3`,{children:`Live demo`}),(0,P.jsxs)(`p`,{className:Y,children:[`The chat below runs the exact adapter shown further down, fed by a mock `,(0,P.jsx)(`code`,{className:X,children:`useChat`}),` — same return shape, timers instead of a transport. Ask about CSS to see reasoning → tool call → streamed answer → source link; ask for an error to see the failure path; hit Stop mid-run to see the finalize-on-abort behavior.`]}),(0,P.jsx)(Sn,{}),(0,P.jsx)(`h3`,{children:`The adapter`}),(0,P.jsxs)(`p`,{className:Y,children:[`The whole integration is two exports —`,` `,(0,P.jsx)(`code`,{className:X,children:`renderUIMessages`}),` (a pure`,` `,(0,P.jsx)(`code`,{className:X,children:`parts → ReactNode[]`}),` mapping, never throws on odd payloads) and`,` `,(0,P.jsx)(`code`,{className:X,children:`useHazeChat`}),` (the thin hook that memoizes it and wires the composer). This is the real source powering the demo — swap `,(0,P.jsx)(`code`,{className:X,children:`@/lib`}),` `,`for `,(0,P.jsx)(`code`,{className:X,children:`haze-ui`}),` in your app:`]}),(0,P.jsx)(O,{language:`tsx`,className:$,children:Zt}),(0,P.jsx)(`h3`,{children:`With a real useChat`}),(0,P.jsxs)(`p`,{className:Y,children:[`Drop the adapter next to your chat route and the wiring is four lines. Both SDK generations work: the hook prefers v5's`,` `,(0,P.jsxs)(`code`,{className:X,children:[`sendMessage(`,`{ text }`,`)`]}),` and falls back to v4's`,` `,(0,P.jsxs)(`code`,{className:X,children:[`append(`,`{ role, content }`,`)`]}),`:`]}),(0,P.jsx)(O,{language:`tsx`,className:$,children:`import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { ChatContainer, ChatInput } from 'haze-ui';
import { useHazeChat } from './ai-chat-adapter';
function SupportChat() {
  const chat = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });
  const { messages, busy, send, stop } = useHazeChat(chat);
  return (
    <div>
      <ChatContainer>{messages}</ChatContainer>
      <ChatInput generating={busy} onSend={send} onStop={stop} />
    </div>
  );
}`}),(0,P.jsx)(`h3`,{children:`Mapping rules`}),(0,P.jsx)(`p`,{className:Y,children:`The status → presentation contract the adapter implements:`}),(0,P.jsx)(O,{language:`text`,className:$,children:`UIMessage                    → ChatMessage bubble (role; user msg 'sending' while submitted)
  text part, done             → plain text block
  text part, streaming        → StreamingText typewriter + cursor
  reasoning part, streaming   → ThinkingIndicator dots
  reasoning part, done        → Disclosure transcript ("Thought process")
  tool-* part (v5 states)     → ToolCallCard: output-error→error, output-available→done,
                               input-*→running, no states→pending
  tool-call + tool-result (v4)→ one ToolCallCard, result folded in by toolCallId
  source part                 → external link
  empty assistant message     → ThinkingIndicator inside the bubble
status submitted             → waiting dots appended after the messages
status error                 → system ChatMessage with the transport error`}),(0,P.jsx)(`h3`,{children:`The mock (what the demo runs)`}),(0,P.jsxs)(`p`,{className:Y,children:[`The demo's streaming source — same shape a real`,` `,(0,P.jsx)(`code`,{className:X,children:`useChat`}),` returns, scripted with`,` `,(0,P.jsx)(`code`,{className:X,children:`setTimeout`}),`. Useful as a fixture for your own tests, too:`]}),(0,P.jsx)(O,{language:`ts`,className:$,children:Qt}),(0,P.jsx)(`h3`,{children:`Known limits`}),(0,P.jsxs)(`ul`,{className:Y,children:[(0,P.jsxs)(`li`,{children:[(0,P.jsx)(`strong`,{children:`Streaming text cadence.`}),` `,(0,P.jsx)(`code`,{className:X,children:`StreamingText`}),` reveals its whole `,(0,P.jsx)(`code`,{className:X,children:`text`}),` once and restarts the reveal whenever the prop `,(0,P.jsx)(`em`,{children:`grows`}),` — it fits parts that arrive whole (batched transports, the demo's mock) but not char-by-char deltas. If your transport grows text parts incrementally, render the plain block while`,` `,(0,P.jsx)(`code`,{className:X,children:`state === 'streaming'`}),` `,`instead (one-line change in`,` `,(0,P.jsx)(`code`,{className:X,children:`renderPart`}),`).`]}),(0,P.jsxs)(`li`,{children:[(0,P.jsx)(`strong`,{children:`Attachments, files, data parts.`}),` `,(0,P.jsx)(`code`,{className:X,children:`file`}),`/`,` `,(0,P.jsx)(`code`,{className:X,children:`data-*`}),` parts are skipped;`,(0,P.jsx)(`code`,{className:X,children:`ChatInput`}),` is text-only in this version. Extend `,(0,P.jsx)(`code`,{className:X,children:`renderPart`}),` `,`with your own branch when you need them.`]}),(0,P.jsxs)(`li`,{children:[(0,P.jsx)(`strong`,{children:`Branching, regeneration, voice.`}),` `,(0,P.jsx)(`code`,{className:X,children:`branchNumber`}),`,`,` `,(0,P.jsx)(`code`,{className:X,children:`regenerate`}),`, and speech parts are out of scope here; the adapter renders whichever branch the SDK exposes in `,(0,P.jsx)(`code`,{className:X,children:`messages`}),`.`]}),(0,P.jsxs)(`li`,{children:[(0,P.jsx)(`strong`,{children:`v4 string content.`}),` Messages that predate the parts API (`,(0,P.jsx)(`code`,{className:X,children:`content: string`}),`) render as empty bubbles — convert to parts, or map`,` `,(0,P.jsx)(`code`,{className:X,children:`content`}),` to a synthetic text part first.`]})]})]}),(0,P.jsxs)(`div`,{className:M,children:[(0,P.jsx)(`h2`,{children:`Icon ecosystems — lucide-react & react-icons × icon slots`}),(0,P.jsxs)(`p`,{className:Y,children:[`haze-ui ships no icon set on purpose:`,` `,(0,P.jsx)(`code`,{className:X,children:`Icon`}),` is a thin sizing and coloring wrapper, and every component that renders an icon also accepts a raw svg — so the icon library stays a dependency of your app, never of the UI kit. Two wiring styles cover both major ecosystems: pass icons straight into the slots, or generate a type-safe set once and keep every call site declarative.`]}),(0,P.jsx)(`h3`,{children:`Live demo`}),(0,P.jsx)(`div`,{className:Q,children:(0,P.jsx)(Mt,{})}),(0,P.jsx)(`h3`,{children:`lucide-react — named imports, straight into the slots`}),(0,P.jsxs)(`p`,{className:Y,children:[`lucide icons are stroke-based, which is exactly the contract the`,` `,(0,P.jsx)(`code`,{className:X,children:`icon`}),` prop is built for. Named imports are tree-shakeable — every import pulls one icon module and nothing more. Compose inside`,` `,(0,P.jsx)(`code`,{className:X,children:`Button`}),` children (the skin supplies the gap), pass one per`,` `,(0,P.jsx)(`code`,{className:X,children:`Menu`}),` data item, and replace the default illustrations of`,` `,(0,P.jsx)(`code`,{className:X,children:`Result`}),` (`,(0,P.jsx)(`code`,{className:X,children:`icon`}),`) and`,` `,(0,P.jsx)(`code`,{className:X,children:`Empty`}),` (`,(0,P.jsx)(`code`,{className:X,children:`image`}),`):`]}),(0,P.jsx)(O,{language:`tsx`,className:$,children:`import { PackageOpen, Rocket, Trash2 } from 'lucide-react';
import { Button, Empty, Icon, Menu, Result } from 'haze-ui';
<Button variant='outline'><Icon icon={Rocket} /> Deploy</Button>
<Button square aria-label='Discard draft'><Icon icon={Trash2} /></Button>
<Menu
  trigger={<Button variant='outline'>Actions</Button>}
  items={[
    { type: 'item', label: 'Deploy', icon: <Icon icon={Rocket} size='sm' /> },
    { type: 'item', label: 'Discard', icon: <Icon icon={Trash2} size='sm' />, danger: true },
  ]}
/>
<Result icon={<Icon icon={Rocket} size='lg' />} title='Deployment live' … />
<Empty image={<Icon icon={PackageOpen} size='lg' />} description='Nothing here yet' />`}),(0,P.jsx)(`h3`,{children:`react-icons — mind the fill/stroke split`}),(0,P.jsxs)(`p`,{className:Y,children:[`react-icons publishes many sets under one package. The`,` `,(0,P.jsx)(`em`,{children:`stroke`}),` sets (`,(0,P.jsx)(`code`,{className:X,children:`fi`}),`,`,` `,(0,P.jsx)(`code`,{className:X,children:`lu`}),`,`,` `,(0,P.jsx)(`code`,{className:X,children:`tb`}),`…) behave like lucide and slot in through `,(0,P.jsx)(`code`,{className:X,children:`children`}),`. The`,` `,(0,P.jsx)(`em`,{children:`fill`}),` sets (`,(0,P.jsx)(`code`,{className:X,children:`md`}),`,`,` `,(0,P.jsx)(`code`,{className:X,children:`fa`}),`,`,` `,(0,P.jsx)(`code`,{className:X,children:`hi`}),`…) must stay`,` `,(0,P.jsx)(`em`,{children:`bare`}),`: `,(0,P.jsx)(`code`,{className:X,children:`Icon`}),` assumes stroke glyphs and forces `,(0,P.jsx)(`code`,{className:X,children:`fill: none`}),` `,`on the svg, which blanks filled ones — every react-icons svg carries `,(0,P.jsx)(`code`,{className:X,children:`stroke=currentColor`}),`, so even the children detection trips it (verified in Chromium: the glyph computes fill:none / stroke-width:0 and paints nothing). Bare is not a compromise: react-icons sizes itself at`,` `,(0,P.jsx)(`code`,{className:X,children:`1em`}),` and inherits`,` `,(0,P.jsx)(`code`,{className:X,children:`currentColor`}),`, which is exactly what `,(0,P.jsx)(`code`,{className:X,children:`Button`}),` `,`children want.`]}),(0,P.jsx)(O,{language:`tsx`,className:$,children:`import { FiSearch } from 'react-icons/fi';    // stroke set
import { MdRocketLaunch } from 'react-icons/md'; // fill set
import { Button, Icon } from 'haze-ui';
// ✓ stroke set via children — Icon's fill:none mode is correct here
<Button variant='outline'>
  <Icon size='sm'><FiSearch /></Icon> Feather via children
</Button>
// ✓ fill set bare — 1em sizing, currentColor, Button supplies the gap
<Button variant='outline'><MdRocketLaunch /> Material, bare</Button>
// ✗ never route a fill set through Icon — the glyph disappears:
// <Icon icon={MdRocketLaunch} />
// <Icon><MdRocketLaunch /></Icon>`}),(0,P.jsx)(`h3`,{children:`A type-safe set for the whole app`}),(0,P.jsxs)(`p`,{className:Y,children:[`One `,(0,P.jsx)(`code`,{className:X,children:`satisfies`}),`-pinned record gives every product concept a name; a tiny wrapper is then the only place that knows about haze sizing. Names autocomplete, a typo is a compile error, and swapping icon libraries later touches exactly one file:`]}),(0,P.jsx)(O,{language:`tsx`,className:$,children:`import type { IconProps } from 'haze-ui';
import { PackageOpen, Rocket, Trash2 } from 'lucide-react';
import { Icon } from 'haze-ui';
const APP_ICONS = {
  deploy: Rocket,
  discard: Trash2,
  empty: PackageOpen,
} satisfies Record<string, NonNullable<IconProps['icon']>>;
type AppIconName = keyof typeof APP_ICONS;
function AppIcon({ name, size = 'md' }: { name: AppIconName; size?: IconProps['size'] }) {
  return <Icon icon={APP_ICONS[name]} size={size} />;
}
// call sites never see a lucide type:
<Button><AppIcon name='deploy' /> Deploy</Button>
<Empty image={<AppIcon name='empty' size='lg' />} description='Nothing here yet' />`}),(0,P.jsx)(`h3`,{children:`The whole file`}),(0,P.jsxs)(`p`,{className:Y,children:[`This is the real source powering the demo — icon sets, wrapper and every slot combination, nothing elided. Swap`,` `,(0,P.jsx)(`code`,{className:X,children:`@/lib`}),` for`,` `,(0,P.jsx)(`code`,{className:X,children:`haze-ui`}),` in your app:`]}),(0,P.jsx)(O,{language:`tsx`,className:$,children:en})]})]})}export{Cn as default};