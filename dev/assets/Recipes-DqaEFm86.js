import{i as e,t}from"./jsx-runtime-Cx0BB4qO.js";import{t as n}from"./react-IDFlRUvQ.js";import{i as r,r as i}from"./direction-DL8lj15_.js";import{a,i as o,n as s,o as c,r as l,s as u,t as d}from"./Queue-DkotMtOE.js";import{n as f,t as p}from"./Input-4WCbRCSa.js";import{S as m,t as h}from"./SelectCore-B2u02f6-.js";import{t as g}from"./Badge-BYO1LU39.js";import{S as _}from"./menu-skins-DPZmBdcR.js";import{t as ee,v as te}from"./ConfirmDialog-TNR1pW6w.js";import{t as v}from"./createLucideIcon-CGqZvC7l.js";import{t as y}from"./trash-Cp_9dnM4.js";import{t as b}from"./Icon-C5-K56eM.js";import{n as x,t as ne}from"./useToast-DNfHBrQH.js";import{i as S,n as re,t as C}from"./ChatInput-sRFy23yo.js";import{t as w}from"./ChatMessage-Cs7G6ZDs.js";import{n as T,t as E}from"./ThinkingIndicator-DvZR9JDh.js";import{t as ie}from"./Segmented-Br1B1aHN.js";import{t as ae}from"./TagInput-DF-tbIwU.js";import{t as D}from"./CodeBlock-BeN2YLiU.js";import{_ as oe,a as O,b as se,c as k,m as ce,o as A,r as le,t as ue,y as de}from"./schemas-FQJIw6S2.js";import{t as fe}from"./StreamingText-PmN119X1.js";import{n as pe,t as me}from"./StepTimeline-DV397aLv.js";import{F as he,v as j,x as M}from"./index-B73pEch-.js";import{a as ge,n as N,o as _e,r as ve,s as P}from"./styles-DBn9Gwwz.js";function ye(e,t){let n={};for(let r of Object.keys(e))n[r]=be(e[r],t[r]);return n}function be(e,t){return{...e,...t}}var xe={name:`package-open`,size:24,node:[[`path`,{d:`M12 22v-9`,key:`x3hkom`}],[`path`,{d:`M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z`,key:`2ntwy6`}],[`path`,{d:`M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13`,key:`1pmm1c`}],[`path`,{d:`M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z`,key:`12ttoo`}]]};xe.node;var Se=v(xe),Ce={name:`rocket`,size:24,node:[[`path`,{d:`M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5`,key:`qeys4`}],[`path`,{d:`M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09`,key:`u4xsad`}],[`path`,{d:`M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z`,key:`676m9`}],[`path`,{d:`M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05`,key:`92ym6u`}]]};Ce.node;var we=v(Ce),Te=`import type { ReactNode } from 'react';
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
`,Ee=`import type { IconProps, MenuDataItem } from '@/lib';

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
`,De=`import type { HazeStrings } from '@/lib';

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
`,Oe=`import type { SortingState } from '@tanstack/react-table';

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
`,ke=`import type {
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
`,F=e(n(),1),I=t(),L=e=>typeof e==`string`?e:``,R=e=>Array.isArray(e)?e:[],z=e=>typeof e==`object`&&!!e;function B(e){if(e!=null&&typeof e!=`function`){if(typeof e==`string`)return e;if(typeof e==`number`||typeof e==`boolean`||typeof e==`bigint`||typeof e==`symbol`)return e.toString();try{return JSON.stringify(e,null,2)}catch{return`[unserializable]`}}}function Ae(e,t,n){if(e.type===`tool-call`){let n=L(e.toolCallId),r=n?t.get(n):void 0;return{name:L(e.toolName)||`tool`,input:B(e.args),output:B(r?.result),status:r?r.isError===!0?`error`:`done`:`running`}}if(e.type===`tool-result`){let t=L(e.toolCallId);return t&&n.has(t)?null:{name:L(e.toolName)||`tool`,output:B(e.result),status:e.isError===!0?`error`:`done`}}let r=R(e.states).filter(e=>typeof e==`string`),i=r.includes(`output-error`)?`error`:r.includes(`output-available`)?`done`:r.length>0?`running`:`pending`;return{name:e.type.slice(5)||`tool`,input:B(e.input),output:B(e.output),status:i}}function je(e){if(e.type===`source-url`)return typeof e.url!=`string`||!e.url?null:{href:e.url,title:L(e.title)||e.url};if(e.type!==`source`||!z(e.source))return null;let t=e.source,n=typeof t.url==`string`?t.url:``;return n?{href:n,title:L(t.title)||n,snippet:L(t.snippet)||void 0}:null}function Me(e){let t=z(e.providerMetadata)?e.providerMetadata:void 0,n=t?Object.values(t).find(e=>z(e)&&typeof e.duration==`number`&&e.duration>0):void 0,r=typeof e.duration==`number`&&e.duration>0?e.duration:n?.duration;if(!(typeof r!=`number`||!Number.isFinite(r)||r<=0))return r<1e3?`${Math.round(r)}ms`:`${Math.round(r/100)/10}s`}var Ne=e=>L(e).trim().toLowerCase().replace(/[\s-]+/g,`_`),Pe={pending:`pending`,queued:`pending`,planned:`pending`,not_started:`pending`,active:`active`,in_progress:`active`,running:`active`,started:`active`,done:`done`,completed:`done`,complete:`done`,succeeded:`done`,error:`error`,failed:`error`,skipped:`skipped`,cancelled:`skipped`,canceled:`skipped`};function Fe(e){let t=z(e.data)?e.data:{},n=R(t.steps).filter(z);return n.length===0?null:{title:L(t.title)||`Plan`,items:n.map((e,t)=>({key:L(e.id)||`step-${t}`,label:L(e.label)||L(e.title)||L(e.name)||`Step ${t+1}`,description:L(e.description)||void 0,status:Pe[Ne(e.status)]??`pending`}))}}var Ie={queued:`queued`,pending:`queued`,waiting:`queued`,planned:`queued`,sending:`sending`,active:`sending`,running:`sending`,in_progress:`sending`,failed:`failed`,error:`failed`};function Le(e){let t=R((z(e.data)?e.data:{}).items).filter(z);return t.length===0?null:{items:t.map((e,t)=>({id:L(e.id)||`item-${t}`,title:L(e.title)||L(e.label)||L(e.name)||`Item ${t+1}`,description:L(e.description)||void 0,status:Ie[Ne(e.status)]??`queued`}))}}var Re=`haze-ai-chat-adapter__textBody`,ze=`haze-ai-chat-adapter__reasoningBody`,Be=`haze-ai-chat-adapter__citationStrip`;function Ve(e,t){let{key:n,live:r}=t;if(e.type===`text`){let t=L(e.text);return t?r&&e.state===`streaming`?(0,I.jsx)(fe,{text:t},n):(0,I.jsx)(`div`,{className:Re,children:t},n):null}if(e.type===`reasoning`){let t=L(e.text);return t?(0,I.jsx)(me,{children:(0,I.jsx)(pe,{label:`Thought process`,status:e.state===`streaming`?`running`:`done`,time:Me(e),collapsible:!0,content:(0,I.jsx)(`p`,{className:ze,children:t})})},n):r&&e.state===`streaming`?(0,I.jsx)(E,{},n):null}if(e.type.startsWith(`tool-`)){let r=Ae(e,t.resultsByCallId,t.callIds);return r?(0,I.jsx)(T,{...r},n):null}if(e.type===`data-plan`){let t=Fe(e);return t?(0,I.jsx)(l,{title:t.title,children:t.items.map(e=>(0,I.jsx)(o,{label:e.label,description:e.description,status:e.status},e.key))},n):null}if(e.type===`data-queue`){let r=Le(e);if(!r)return null;let i=t.onQueueRemove;return(0,I.jsx)(d,{children:r.items.map(e=>(0,I.jsx)(s,{title:e.title,description:e.description,status:e.status,...i?{onRemove:()=>i(t.partId,e.id),removeLabel:`Remove ${e.title}`}:{}},e.id))},n)}return null}function He(e,t){let n=R(e.messages).filter(z),r=e.status,i=r===`submitted`||r===`streaming`,o=[];n.forEach((e,s)=>{let c=s===n.length-1,l=e.role===`user`||e.role===`system`?e.role:`assistant`,u=L(e.id)||`msg-${s}`,d=R(e.parts).filter(z),f=new Map,p=new Set;for(let e of d){let t=typeof e.toolCallId==`string`?e.toolCallId:``;t&&(e.type===`tool-result`?f.set(t,e):e.type===`tool-call`&&p.add(t))}let m=[],h=[];d.forEach((e,n)=>{let r=`${u}-part-${n}`,o=je(e);if(o){h.push((0,I.jsx)(a,{index:h.length+1,href:o.href,title:o.title,snippet:o.snippet},r));return}let s=Ve(e,{key:r,live:i&&c,partId:L(e.id)||r,resultsByCallId:f,callIds:p,onQueueRemove:t?.onQueueRemove});s!==null&&m.push(s)}),h.length>0&&m.push((0,I.jsx)(`div`,{className:Be,children:h},`${u}-citations`));let g=l===`user`&&c&&r===`submitted`?`sending`:l===`user`?`sent`:void 0;o.push((0,I.jsx)(w,{role:l,status:g,children:m.length>0?m:(0,I.jsx)(E,{})},u))});let s=n[n.length-1];if(r===`submitted`&&s?.role!==`assistant`&&o.push((0,I.jsx)(E,{},`haze-waiting`)),r===`error`){let t=e.error,n=t instanceof Error?t.message:L(t)||`Something went wrong.`;o.push((0,I.jsx)(w,{role:`system`,children:n},`haze-error`))}return o}function Ue(e,t){let{messages:n,status:r,error:i}=e,a=t?.onQueueRemove,o=(0,F.useMemo)(()=>He({messages:n,status:r,error:i},{onQueueRemove:a}),[n,r,i,a]),{sendMessage:s,append:c,stop:l}=e,u=(0,F.useCallback)(e=>{let t=e.trim();t&&(s?s({text:t}):c?.({role:`user`,content:t}))},[s,c]),d=(0,F.useCallback)(()=>l?.(),[l]);return{messages:o,busy:r===`submitted`||r===`streaming`,error:r===`error`,send:u,stop:d}}var We=0,V=e=>`${e}-${++We}`,Ge=20,Ke={id:`welcome`,role:`assistant`,parts:[{type:`text`,state:`done`,text:`Ask me about haze-ui — for example: "How does haze-ui ship per-component CSS?"`}]},qe=`The user asks about CSS delivery. haze-ui is a Linaria library — zero runtime — so styles are extracted at build time. The library build emits one CSS file per module, and a split script groups them into per-component subpaths plus an aggregate stylesheet. I should check the docs for the exact loading modes before answering.`,Je=`haze-ui ships **two CSS loading modes**:

1. Per-component subpaths — \`import 'haze-ui/css/button'\` pulls only what you mount.
2. The aggregate — \`import 'haze-ui/styles.css'\` covers everything at once.

Both are plain build artifacts (Linaria extracts them at build time, no runtime CSS-in-JS), and a manifest maps every export to its CSS file so tooling never guesses.`,Ye=e=>`Parsing the request: "${e}". No tool call needed — answer from the component catalog directly, and keep it short.`,Xe=e=>`About "${e}" — haze-ui's agent surface is a set of presentational components: ChatContainer owns scrolling, ChatMessage the bubbles, StreamingText the typewriter reveal, ToolCallCard tool input/output, ThinkingIndicator the waiting dots, and ChatInput the composer. Pair them with any runtime; this demo drives them through the same adapter you would use with a real one.`,Ze=e=>({query:e}),Qe={files:[`css/loading-modes.md`,`css/manifest.json`],loadingModes:2},$e=[{id:`plan-find-docs`,label:`Locate the CSS docs`},{id:`plan-check-modes`,label:`Check both loading modes`},{id:`plan-summarize`,label:`Summarize the manifest`}],H=(e,t)=>({state:e,steps:$e.map((e,n)=>({...e,status:t[n]??`pending`}))}),et=(e,t)=>({type:`data-plan`,id:`plan-css`,data:H(e,t)}),tt=(e,t)=>({items:[{id:`q-emit`,title:`Emit loading-modes.md`,description:e===`failed`?`403 — docs storage quota exceeded`:void 0,status:e},{id:`q-cdn`,title:`Refresh the CDN manifest`,status:t}]}),nt=(e,t)=>({type:`data-queue`,id:`queue-css`,data:tt(e,t)}),rt=e=>Array.isArray(e)?e:[],it=e=>t=>[...t,e],U=(e,t)=>n=>n.map((n,r)=>r===e?{...n,...t}:n);function at(){let[e,t]=(0,F.useState)([Ke]),[n,r]=(0,F.useState)(`ready`),[i,a]=(0,F.useState)(void 0),o=(0,F.useRef)([]),s=(0,F.useRef)(`ready`);(0,F.useEffect)(()=>{s.current=n},[n]);let c=(0,F.useCallback)(()=>{o.current.forEach(clearTimeout),o.current=[]},[]);(0,F.useEffect)(()=>c,[c]);let l=(0,F.useCallback)(e=>{c();let n=V(`assistant`),i=/css|style|stylesheet/i.test(e),s=/\b(error|fail|crash)\b/i.test(e),l=(e,r)=>{o.current.push(setTimeout(()=>{t(e=>e.map(e=>e.id===n?{...e,parts:r(rt(e.parts))}:e))},e))};if(t(e=>[...e,{id:n,role:`assistant`,parts:[]}]),r(`streaming`),s){o.current.push(setTimeout(()=>{a(`Mock transport error — simulated failure.`),r(`error`)},700));return}let u=i?Je:Xe(e),d=i?qe:Ye(e),f=0,p=0,m=(e,t)=>{let n=f;return f+=1,l(e,it(t)),n},h=m(p,{type:`reasoning`,text:d,state:`streaming`});if(p+=900,l(p,U(h,{state:`done`,providerMetadata:{anthropic:{duration:1240}}})),i){p+=100;let t=m(p,et(`draft`,[`pending`,`pending`,`pending`]));p+=200,l(p,U(t,{data:H(`active`,[`in_progress`,`pending`,`pending`])})),p+=300;let n=m(p,{type:`tool-searchDocs`,toolCallId:V(`call`),states:[`input-streaming`]});l(p+350,U(n,{states:[`input-available`],input:Ze(e)})),p+=1500,l(p,U(n,{states:[`output-available`],input:Ze(e),output:Qe})),p+=200,l(p,U(t,{data:H(`active`,[`completed`,`in_progress`,`pending`])})),p+=600,l(p,U(t,{data:H(`active`,[`completed`,`completed`,`in_progress`])})),p+=600,l(p,U(t,{data:H(`done`,[`completed`,`completed`,`completed`])})),p+=100}else p+=200;let g=m(p,{type:`text`,text:u,state:`streaming`}),_=p+u.length*Ge+500;if(l(_,U(g,{state:`done`})),i){m(_+60,{type:`source`,source:{sourceType:`url`,url:`https://wmzy.github.io/haze-ui/`,title:`haze-ui docs — CSS loading modes`,snippet:`Import per-component subpaths (haze-ui/css/button) or the aggregate styles.css; a manifest maps every export to its CSS file.`}}),m(_+120,{type:`source`,source:{sourceType:`url`,url:`https://github.com/wmzy/haze-ui/blob/main/scripts/split-css.mjs`,title:`scripts/split-css.mjs`,snippet:`Groups the per-module CSS output into per-component css/ subpaths plus the aggregate stylesheet.`}});let e=m(_+180,nt(`sending`,`queued`));l(_+980,U(e,{data:tt(`failed`,`queued`)})),o.current.push(setTimeout(()=>r(`ready`),_+1080))}else o.current.push(setTimeout(()=>r(`ready`),_))},[c]),u=(0,F.useCallback)(e=>{let n=e,i=typeof n.text==`string`?n.text:n.content,c=(typeof i==`string`?i:``).trim();c&&s.current!==`submitted`&&s.current!==`streaming`&&(a(void 0),t(e=>[...e,{id:V(`user`),role:`user`,parts:[{type:`text`,text:c}]}]),r(`submitted`),o.current.push(setTimeout(()=>l(c),600)))},[l]);return{messages:e,status:n,error:i,sendMessage:u,append:(0,F.useCallback)(e=>u(e),[u]),stop:(0,F.useCallback)(()=>{c(),(s.current===`streaming`||s.current===`submitted`)&&(t(e=>e.map(e=>({...e,parts:rt(e.parts).map(e=>e.state===`streaming`?{...e,state:`done`}:e)}))),r(`ready`))},[c])}}var ot=ye(he,{chatInput:{placeholder:`Écrire un message…`,send:`Envoyer`},empty:{description:`Aucune donnée`},tagInput:{placeholder:`Ajouter un tag`}}),st=ye(he,{chatInput:{placeholder:`اكتب رسالة…`,send:`إرسال`},empty:{description:`لا توجد بيانات`},tagInput:{placeholder:`أضف وسمًا`,tagCount:`{count} وسوم`,tagCountSingular:`وسم واحد`}}),ct={color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0},lt=F.createContext&&F.createContext(ct),ut=[`attr`,`size`,`title`];function dt(e,t){if(e==null)return{};var n,r,i=ft(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)===-1&&{}.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}function ft(e,t){if(e==null)return{};var n={};for(var r in e)if({}.hasOwnProperty.call(e,r)){if(t.indexOf(r)!==-1)continue;n[r]=e[r]}return n}function W(){return W=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},W.apply(null,arguments)}function pt(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),n.push.apply(n,r)}return n}function G(e){for(var t=1;t<arguments.length;t++){var n=arguments[t]==null?{}:arguments[t];t%2?pt(Object(n),!0).forEach(function(t){mt(e,t,n[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):pt(Object(n)).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))})}return e}function mt(e,t,n){return(t=ht(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function ht(e){var t=gt(e,`string`);return typeof t==`symbol`?t:t+``}function gt(e,t){if(typeof e!=`object`||!e)return e;var n=e[Symbol.toPrimitive];if(n!==void 0){var r=n.call(e,t||`default`);if(typeof r!=`object`)return r;throw TypeError(`@@toPrimitive must return a primitive value.`)}return(t===`string`?String:Number)(e)}function _t(e){return e&&e.map((e,t)=>F.createElement(e.tag,G({key:t},e.attr),_t(e.child)))}function vt(e){return t=>F.createElement(yt,W({attr:G({},e.attr)},t),_t(e.child))}function yt(e){var t=t=>{var n=e.attr,r=e.size,i=e.title,a=dt(e,ut),o=r||t.size||`1em`,s;return t.className&&(s=t.className),e.className&&(s=(s?s+` `:``)+e.className),F.createElement(`svg`,W({stroke:`currentColor`,fill:`currentColor`,strokeWidth:`0`},t.attr,n,a,{className:s,style:G(G({color:e.color||t.color},t.style),e.style),height:o,width:o,xmlns:`http://www.w3.org/2000/svg`}),i&&F.createElement(`title`,null,i),e.children)};return lt===void 0?t(ct):F.createElement(lt.Consumer,null,e=>t(e))}function bt(e){return vt({tag:`svg`,attr:{viewBox:`0 0 24 24`},child:[{tag:`path`,attr:{fill:`none`,d:`M0 0h24v24H0z`},child:[]},{tag:`path`,attr:{d:`M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.15-.68 1.81-.55zM11.17 17s3.74-1.55 5.89-3.7c5.4-5.4 4.5-9.62 4.21-10.57-.95-.3-5.17-1.19-10.57 4.21C8.55 9.09 7 12.83 7 12.83zm6.48-2.19c-2.29 2.04-5.58 3.44-5.89 3.57L13.31 22l4.05-4.05c.47-.47.68-1.15.55-1.81zM9 18c0 .83-.34 1.58-.88 2.12C6.94 21.3 2 22 2 22s.7-4.94 1.88-6.12A2.996 2.996 0 0 1 9 18m4-9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2`},child:[]}]})(e)}function xt(e){return vt({tag:`svg`,attr:{viewBox:`0 0 24 24`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`},child:[{tag:`circle`,attr:{cx:`11`,cy:`11`,r:`8`},child:[]},{tag:`line`,attr:{x1:`21`,y1:`21`,x2:`16.65`,y2:`16.65`},child:[]}]})(e)}var St={deploy:we,discard:y,empty:Se};function K({name:e,size:t=`md`}){let n=St[e];return(0,I.jsx)(b,{icon:n,size:t})}var Ct=`haze-icon-ecosystems__demoColumn`,wt=`haze-icon-ecosystems__demoRow`,Tt=[{type:`item`,label:`Deploy revision`,icon:(0,I.jsx)(K,{name:`deploy`,size:`sm`}),kbdLabel:`⇧D`},{type:`item`,label:`Search docs`,icon:(0,I.jsx)(b,{size:`sm`,children:(0,I.jsx)(xt,{})}),kbdLabel:`/`},{type:`divider`},{type:`item`,label:`Discard draft`,icon:(0,I.jsx)(K,{name:`discard`,size:`sm`}),danger:!0}];function Et(){return(0,I.jsxs)(`div`,{className:wt,children:[(0,I.jsxs)(M,{variant:`outline`,children:[(0,I.jsx)(K,{name:`deploy`}),` Deploy`]}),(0,I.jsx)(M,{variant:`ghost`,square:!0,"aria-label":`Discard draft`,children:(0,I.jsx)(K,{name:`discard`})}),(0,I.jsx)(te,{trigger:(0,I.jsxs)(M,{variant:`outline`,children:[(0,I.jsx)(K,{name:`deploy`}),` Actions`]}),items:Tt})]})}function Dt(){return(0,I.jsxs)(`div`,{className:wt,children:[(0,I.jsxs)(M,{variant:`outline`,children:[(0,I.jsx)(bt,{}),` Material, bare`]}),(0,I.jsxs)(M,{variant:`outline`,children:[(0,I.jsx)(b,{size:`sm`,children:(0,I.jsx)(xt,{})}),`Feather via children`]})]})}function Ot(){return(0,I.jsx)(c,{icon:(0,I.jsx)(K,{name:`deploy`,size:`lg`}),title:`Deployment live`,subTitle:`v2.4.0 — built 42 seconds ago`,extra:(0,I.jsx)(M,{size:`sm`,variant:`outline`,children:`Open app`})})}function kt(){return(0,I.jsx)(S,{image:(0,I.jsx)(K,{name:`empty`,size:`lg`}),description:`No deployments yet`,children:(0,I.jsx)(M,{size:`sm`,variant:`outline`,children:`Create one`})})}function At(){return(0,I.jsxs)(`div`,{className:Ct,children:[(0,I.jsx)(Et,{}),(0,I.jsx)(Dt,{}),(0,I.jsx)(Ot,{}),(0,I.jsx)(kt,{})]})}var q=6,J=[{id:1,name:`Ada Lovelace`,email:`ada@haze.dev`,role:`admin`},{id:2,name:`Grace Hopper`,email:`grace@haze.dev`,role:`editor`},{id:3,name:`Alan Turing`,email:`alan@haze.dev`,role:`viewer`},{id:4,name:`Katherine Johnson`,email:`katherine@haze.dev`,role:`editor`},{id:5,name:`Edsger Dijkstra`,email:`edsger@haze.dev`,role:`viewer`},{id:6,name:`Barbara Liskov`,email:`barbara@haze.dev`,role:`admin`},{id:7,name:`Donald Knuth`,email:`donald@haze.dev`,role:`viewer`},{id:8,name:`Margaret Hamilton`,email:`margaret@haze.dev`,role:`editor`},{id:9,name:`Dennis Ritchie`,email:`dennis@haze.dev`,role:`viewer`},{id:10,name:`Radia Perlman`,email:`radia@haze.dev`,role:`editor`},{id:11,name:`Tim Berners-Lee`,email:`tim@haze.dev`,role:`viewer`},{id:12,name:`Anita Borg`,email:`anita@haze.dev`,role:`admin`},{id:13,name:`Linus Torvalds`,email:`linus@haze.dev`,role:`viewer`}];function jt(){return J.reduce((e,t)=>Math.max(e,t.id),0)+1}function Mt(e){J.unshift({id:jt(),...e,role:e.role})}function Nt(e,t){let n=J.findIndex(t=>t.id===e);n!==-1&&(J[n]={...J[n],...t,role:t.role})}function Pt(e){let t=J.findIndex(t=>t.id===e);t!==-1&&J.splice(t,1)}function Y(e,t,n){let r=n.trim().toLowerCase(),i=r?J.filter(e=>e.name.toLowerCase().includes(r)||e.email.toLowerCase().includes(r)):J,a=t[0];return{rows:(a?[...i].sort((e,t)=>{let n=a.id,r=n===`id`?e.id-t.id:e[n].localeCompare(t[n]);return a.desc?-r:r}):i).slice((e-1)*q,e*q),pageCount:Math.max(1,Math.ceil(i.length/q))}}var Ft=A(O().min(2,`Name must be at least 2 characters`)),It=A(le(`Enter a valid email address`)),Lt=A(ue([`admin`,`editor`,`viewer`],{message:`Pick a role`}));function Rt(e){return e===`admin`?(0,I.jsx)(g,{color:`info`,children:e}):e===`editor`?(0,I.jsx)(g,{color:`success`,children:e}):(0,I.jsx)(g,{children:e})}function zt({member:e,onCancel:t,onSubmit:n}){let r=oe({initialValues:e?{name:e.name,email:e.email,role:e.role}:{name:``,email:``,role:``}});return(0,I.jsxs)(de,{form:r,onValidSubmit:n,children:[(0,I.jsxs)(`div`,{className:Kt,children:[(0,I.jsx)(k,{form:r,name:`name`,label:`Name`,validate:Ft,mode:`onBlur`,input:f,placeholder:`Ada Lovelace`}),(0,I.jsx)(k,{form:r,name:`email`,label:`Email`,validate:It,mode:`onBlur`,input:f,placeholder:`ada@haze.dev`}),(0,I.jsxs)(k,{form:r,name:`role`,label:`Role`,validate:Lt,mode:`onBlur`,input:h,children:[(0,I.jsx)(m,{value:``,children:`Pick a role…`}),(0,I.jsx)(m,{value:`admin`,children:`Admin`}),(0,I.jsx)(m,{value:`editor`,children:`Editor`}),(0,I.jsx)(m,{value:`viewer`,children:`Viewer`})]})]}),(0,I.jsxs)(`div`,{className:qt,children:[(0,I.jsx)(M,{onClick:e=>e.currentTarget.form?.requestSubmit(),children:`Save`}),(0,I.jsx)(M,{variant:`ghost`,onClick:t,children:`Cancel`})]})]})}function Bt(){return(0,I.jsx)(x,{children:(0,I.jsx)(Vt,{})})}function Vt(){let e=ne(),[t,,n]=j(void 0,``),[r,i]=(0,F.useState)(1),[a,o]=(0,F.useState)([]),[s,c]=(0,F.useState)(0),[l,u]=(0,F.useState)(()=>({page:1,sorting:[],search:``,reloadKey:0,...Y(1,[],``)})),d=l.page!==r||l.sorting!==a||l.search!==t||l.reloadKey!==s;(0,F.useEffect)(()=>{if(!d)return;let e=setTimeout(()=>{u({page:r,sorting:a,search:t,reloadKey:s,...Y(r,a,t)})},300);return()=>clearTimeout(e)},[d,r,a,t,s]);let[,f,m]=j(void 0,!1),[h,g]=(0,F.useState)(null),[te,v]=(0,F.useState)(0),[,y,b]=j(void 0,!1),[x,S]=(0,F.useState)(null),re=(0,F.useCallback)(()=>{g(null),v(e=>e+1),f(!0)},[f]),C=(0,F.useCallback)(e=>{g(e),v(e=>e+1),f(!0)},[f]),w=(0,F.useCallback)(()=>f(!1),[f]),T=(0,F.useCallback)(e=>{S(e),y(!0)},[y]),E=(0,F.useCallback)(()=>{y(!1),S(null)},[y]),ie=t=>{h?(Nt(h.id,t),e(`Updated ${t.name}`,{variant:`success`})):(Mt(t),i(1),e(`Created ${t.name}`,{variant:`success`})),c(e=>e+1),w()},ae=()=>{if(!x)return;Pt(x.id);let{pageCount:n}=Y(r,a,t);r>n&&i(n),c(e=>e+1),e(`Deleted ${x.name}`,{variant:`success`}),S(null)},D=(0,F.useMemo)(()=>[{accessorKey:`name`,header:`Name`,cell:e=>(0,I.jsx)(`strong`,{children:e.getValue()})},{accessorKey:`email`,header:`Email`},{accessorKey:`role`,header:`Role`,cell:e=>Rt(e.getValue())},{id:`actions`,header:``,cell:({row:e})=>(0,I.jsxs)(`div`,{className:Gt,children:[(0,I.jsx)(M,{size:`sm`,variant:`ghost`,onClick:()=>C(e.original),children:`Edit`}),(0,I.jsx)(M,{size:`sm`,variant:`ghost`,onClick:()=>T(e.original),children:`Delete`})]}),meta:{sortable:!1}}],[C,T]);return(0,I.jsxs)(`div`,{className:Ht,children:[(0,I.jsxs)(`div`,{className:Ut,children:[(0,I.jsx)(p,{className:Wt,value:n,placeholder:`Search name or email…`,"aria-label":`Search members`,onChange:()=>i(1)}),(0,I.jsx)(M,{onClick:re,children:`New member`})]}),(0,I.jsx)(se,{columns:D,data:l.rows,manual:!0,sortable:!0,loading:d,pageSize:q,pageCount:l.pageCount,onPageChange:i,onSortChange:e=>{o(e),i(1)},getRowId:e=>String(e.id)}),(0,I.jsx)(_,{open:m,onClose:w,title:h?`Edit member`:`New member`,children:(0,I.jsx)(zt,{member:h,onCancel:w,onSubmit:ie},te)}),(0,I.jsxs)(ee,{open:b,title:`Delete member`,confirmText:`Delete`,variant:`danger`,onConfirm:ae,onCancel:E,onClose:E,children:[`Delete `,x?.name,`? There is no undo.`]})]})}var Ht=`haze-member-crud__frame`,Ut=`haze-member-crud__toolbar`,Wt=`haze-member-crud__searchInput`,Gt=`haze-member-crud__rowActions`,Kt=`haze-member-crud__formGrid`,qt=`haze-member-crud__formFooter`,X=Object.assign({"./ai-chat-adapter.tsx":Te,"./icon-ecosystems.tsx":Ee,"./locale-packs.ts":De,"./member-crud.tsx":Oe,"./mock-use-chat.ts":ke}),Jt=X[`./locale-packs.ts`]??``,Yt=X[`./ai-chat-adapter.tsx`]??``,Xt=X[`./mock-use-chat.ts`]??``,Zt=X[`./member-crud.tsx`]??``,Qt=X[`./icon-ecosystems.tsx`]??``,Z=`haze-index__paragraph`,Q=`haze-index__inlineCode`,$t=`haze-index__hint`,en=`haze-index__demoPanel`,tn=`haze-index__demoColumn`,nn=`haze-index__aiChatFrame`,rn=`haze-index__aiChatScroll`,an=`haze-index__aiChatComposer`,on=`haze-index__aiChatInput`,sn=`haze-index__aiChatHint`,$=`haze-index__codeMargin`,cn={username:``,password:``,email:``},ln=new Set([`admin`,`haze`,`root`]),un=O().min(1,`Username is required`).min(3,`Username must be at least 3 characters`),dn=O().min(8,`Password must be at least 8 characters`),fn=le(`Enter a valid email address`),pn=A(un),mn=A(dn),hn=A(fn);function gn(e,t,n){return new Promise(r=>{let i=setTimeout(()=>{r(ln.has(e.toLowerCase())?`"${e}" is already taken`:void 0)},600);t.addEventListener(`abort`,()=>{clearTimeout(i),n(),r(void 0)},{once:!0})})}function _n(){let e=oe({initialValues:cn}),[t,n]=(0,F.useState)(null),[r,i]=(0,F.useState)({issued:0,cancelled:0});return(0,I.jsxs)(`div`,{children:[(0,I.jsxs)(de,{form:e,onValidSubmit:e=>n(e),onInvalidSubmit:()=>n(null),children:[(0,I.jsx)(`div`,{className:N,children:(0,I.jsx)(k,{form:e,name:`username`,label:`Username`,validate:async(e,t)=>await pn(e,t)||(i(e=>({...e,issued:e.issued+1})),gn(e,t.signal,()=>i(e=>({...e,cancelled:e.cancelled+1})))),mode:`onChange`,validateDebounce:400,input:f,placeholder:`ada — try "admin", it is taken`})}),(0,I.jsx)(`div`,{className:N,children:(0,I.jsx)(k,{form:e,name:`password`,label:`Password`,validate:mn,mode:`onBlur`,input:f,type:`password`,placeholder:`At least 8 characters`})}),(0,I.jsx)(`div`,{className:N,children:(0,I.jsx)(k,{form:e,name:`email`,label:`Email`,validate:hn,mode:`onBlur`,children:({id:e,errorId:t,invalid:n,onBlur:r,value:i,onChange:a})=>(0,I.jsx)(f,{id:e,value:i,onChange:a,onBlur:r,placeholder:`ada@example.com`,"aria-invalid":n,"aria-describedby":n?t:void 0})})}),(0,I.jsxs)(`div`,{className:_e,children:[(0,I.jsx)(M,{onClick:e=>{e.currentTarget.form?.requestSubmit()},children:`Create account`}),(0,I.jsx)(M,{variant:`ghost`,onClick:()=>{ce(e,cn),n(null)},children:`Reset`})]})]}),(0,I.jsxs)(`p`,{className:$t,children:[`availability checks: `,r.issued,` issued · `,r.cancelled,` `,`cancelled — keep typing in Username and watch stale rounds drop.`]}),t?(0,I.jsx)(D,{language:`json`,children:JSON.stringify(t,null,2)}):null]})}var vn=[{value:`en-US`,label:`English`},{value:`fr-FR`,label:`Français`},{value:`zh-CN`,label:`中文`},{value:`ar-EG`,label:`العربية`}],yn={"fr-FR":ot,"ar-EG":st};function bn(){return(0,I.jsxs)(`output`,{className:$t,children:[`useDirection(): `,r()]})}function xn(){let[e,,t]=j(void 0,`en-US`),[,,n]=j(void 0,[`ui`]);return(0,I.jsxs)(`div`,{children:[(0,I.jsx)(ie,{options:[...vn],value:t}),(0,I.jsx)(u,{locale:e,strings:yn[e],children:(0,I.jsxs)(`div`,{dir:i(e)??`ltr`,className:tn,children:[(0,I.jsx)(ae,{value:n,"aria-label":`Tags`}),(0,I.jsx)(S,{}),(0,I.jsx)(bn,{})]})})]})}function Sn(){let{messages:e,busy:t,error:n,send:r,stop:i}=Ue(at());return(0,I.jsxs)(`div`,{className:nn,children:[(0,I.jsx)(re,{className:rn,children:e}),(0,I.jsx)(`div`,{className:an,children:(0,I.jsx)(C,{className:on,placeholder:`Ask about haze-ui — try “css”, or “error” to fail`,generating:t,onSend:r,onStop:i})}),n?(0,I.jsx)(`p`,{className:sn,children:`status: error — send another message to retry`}):null]})}function Cn(){return(0,I.jsxs)(`div`,{className:ge,children:[(0,I.jsx)(`h1`,{children:`Recipes`}),(0,I.jsx)(`p`,{className:ve,children:`Integration recipes for pairing haze-ui with the ecosystem. Each recipe is a live demo plus the exact code behind it — start typing in the form below and watch schema errors, async checks and cancellation all fire in real time, run the CRUD recipe's server-paginated table end to end (search, sort, create, edit, delete — toasts and all), switch languages in the locale recipe to see packs, partial overrides and RTL derivation at work, chat with the AI runtime recipe: a Vercel AI SDK useChat shape driving the agent components through one small adapter, or wire an icon ecosystem — the last recipe pairs lucide-react and react-icons with every icon slot haze-ui exposes.`}),(0,I.jsxs)(`div`,{className:P,children:[(0,I.jsx)(`h2`,{children:`zod × react-f0rm — schema-driven form validation`}),(0,I.jsxs)(`p`,{className:Z,children:[`haze-ui's `,(0,I.jsx)(`code`,{className:Q,children:`FormItem`}),` takes any`,` `,(0,I.jsx)(`code`,{className:Q,children:`FieldValidator`}),`:`,` `,(0,I.jsx)(`code`,{className:Q,children:`(value, meta) => error | undefined`}),`, sync or async, where `,(0,I.jsx)(`code`,{className:Q,children:`meta.signal`}),` `,`aborts as soon as the validation round is superseded. That shape is all an adapter needs: map `,(0,I.jsx)(`code`,{className:Q,children:`zod`}),`'s`,` `,(0,I.jsx)(`code`,{className:Q,children:`safeParseAsync`}),` result onto it and every schema you already have becomes form validation.`]}),(0,I.jsx)(`h3`,{children:`Live demo`}),(0,I.jsx)(`div`,{className:en,children:(0,I.jsx)(_n,{})}),(0,I.jsx)(`h3`,{children:`The adapter ships with haze-ui`}),(0,I.jsxs)(`p`,{className:Z,children:[`This used to be a hand-written bridge; the resolver now lives in the library itself — import it from`,` `,(0,I.jsx)(`code`,{className:Q,children:`haze-ui`}),` and every schema you already have becomes form validation:`]}),(0,I.jsx)(D,{language:`ts`,className:$,children:`import { zodResolver } from 'haze-ui';
const usernameSchema = z.string()
  .min(1, 'Username is required')
  .min(3, 'Username must be at least 3 characters');
const validateUsername = zodResolver(usernameSchema);`}),(0,I.jsx)(`p`,{className:Z,children:`Three details carry the contract:`}),(0,I.jsxs)(`ol`,{className:Z,children:[(0,I.jsxs)(`li`,{children:[(0,I.jsx)(`code`,{className:Q,children:`safeParseAsync`}),` never throws on validation failures — `,(0,I.jsx)(`code`,{className:Q,children:`success: false`}),` `,`carries `,(0,I.jsx)(`code`,{className:Q,children:`error.issues`}),`, each mapped to a`,` `,(0,I.jsx)(`code`,{className:Q,children:`FieldError`}),` with`,` `,(0,I.jsx)(`code`,{className:Q,children:`type: issue.code`}),` and the message passed through (custom messages from`,` `,(0,I.jsx)(`code`,{className:Q,children:`.min(3, '…')`}),` or zod's built-ins). FormItem displays the first error of the field.`]}),(0,I.jsxs)(`li`,{children:[`When a validation round is superseded,`,` `,(0,I.jsx)(`code`,{className:Q,children:`meta.signal`}),` aborts and the resolver resolves `,(0,I.jsx)(`code`,{className:Q,children:`undefined`}),` — the safe non-answer, because react-f0rm discards superseded rounds on its own side too.`]}),(0,I.jsxs)(`li`,{children:[`A passing parse resolves `,(0,I.jsx)(`code`,{className:Q,children:`undefined`}),` `,`— the no-error value f0rm expects.`]})]}),(0,I.jsx)(`h3`,{children:`Wiring it into FormItem`}),(0,I.jsxs)(`p`,{className:Z,children:[`Schemas are stateless values, so build the adapters once at module scope and reuse them across fields. The`,` `,(0,I.jsx)(`code`,{className:Q,children:`input`}),` channel binds a core component declaratively — FormItem wires id, aria attributes,`,` `,(0,I.jsx)(`code`,{className:Q,children:`onBlur`}),`,`,` `,(0,I.jsx)(`code`,{className:Q,children:`onChange`}),` and`,` `,(0,I.jsx)(`code`,{className:Q,children:`value`}),` itself:`]}),(0,I.jsx)(D,{language:`tsx`,className:$,children:`const usernameSchema = z.string()
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
/>`}),(0,I.jsx)(`h3`,{children:`Async checks + AbortSignal cancellation`}),(0,I.jsxs)(`p`,{className:Z,children:[`react-f0rm aborts the previous round's signal the moment a newer validation kick runs — each debounced round owns its own`,` `,(0,I.jsx)(`code`,{className:Q,children:`AbortController`}),`. Plain validators compose with `,(0,I.jsx)(`code`,{className:Q,children:`await`}),`: run the zod shape first, then the network check, reading`,` `,(0,I.jsx)(`code`,{className:Q,children:`meta.signal`}),` to cancel real work (here a `,(0,I.jsx)(`code`,{className:Q,children:`setTimeout`}),` standing in for a fetch — wire it to`,` `,(0,I.jsxs)(`code`,{className:Q,children:[`fetch(url, `,`{ signal }`,`)`]}),` the same way):`]}),(0,I.jsx)(D,{language:`tsx`,className:$,children:`const validateUsername: FieldValidator<SignupValues, 'username'> = async (
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
/>`}),(0,I.jsxs)(`p`,{className:Z,children:[`Keep typing in the demo's Username field: each debounced round issues a check, and the next keystroke aborts the previous one — the issued/cancelled counters below the form count exactly that. Because superseded validators resolve`,` `,(0,I.jsx)(`code`,{className:Q,children:`undefined`}),` instead of rejecting, cancelled checks stay invisible to both the form state and the console.`]})]}),(0,I.jsxs)(`div`,{className:P,children:[(0,I.jsx)(`h2`,{children:`CRUD table — FormItem × DataTable server mode × Toast`}),(0,I.jsxs)(`p`,{className:Z,children:[`The classic admin screen, assembled from the pieces the recipes above introduced: a`,` `,(0,I.jsx)(`code`,{className:Q,children:`DataTable`}),` in`,` `,(0,I.jsx)(`code`,{className:Q,children:`manual`}),` mode talking to a (fake) server — pagination and sorting are the server's job, the table just renders what arrives — plus a`,` `,(0,I.jsx)(`code`,{className:Q,children:`FormItem`}),` dialog for create/edit, a `,(0,I.jsx)(`code`,{className:Q,children:`ConfirmDialog`}),` `,`for delete, and `,(0,I.jsx)(`code`,{className:Q,children:`useToast`}),` `,`feedback after every mutation. Everything below is live: search, click a sort header, page around, edit a member, delete one on the last page and watch the footer clamp.`]}),(0,I.jsx)(`h3`,{children:`Live demo`}),(0,I.jsx)(Bt,{}),(0,I.jsx)(`h3`,{children:`The server contract`}),(0,I.jsxs)(`p`,{className:Z,children:[(0,I.jsx)(`code`,{className:Q,children:`manual`}),` hands pagination and sorting to the server: the table renders`,` `,(0,I.jsx)(`code`,{className:Q,children:`data`}),` exactly as fetched — no local reordering, no page slicing — while sort-header clicks still toggle `,(0,I.jsx)(`code`,{className:Q,children:`sorting`}),` (and`,` `,(0,I.jsx)(`code`,{className:Q,children:`aria-sort`}),`) and the footer still tracks `,(0,I.jsx)(`code`,{className:Q,children:`page`}),`. You observe both through the callbacks and refetch:`]}),(0,I.jsx)(D,{language:`tsx`,className:$,children:`const [page, setPage] = useState(1);
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
/>`}),(0,I.jsxs)(`p`,{className:Z,children:[`The demo keeps the last answer in a`,` `,(0,I.jsx)(`code`,{className:Q,children:`snapshot`}),` and derives`,` `,(0,I.jsx)(`code`,{className:Q,children:`loading`}),` from “snapshot lags the request” — no synchronous state writes inside the fetch effect, so React 19 transitions and StrictMode both stay quiet. Mutations bump a `,(0,I.jsx)(`code`,{className:Q,children:`reloadKey`}),` `,`that joins the request key, which is also how a create can force`,` `,(0,I.jsx)(`code`,{className:Q,children:`setPage(1)`}),` while a delete only clamps the page when the last one emptied.`]}),(0,I.jsx)(`h3`,{children:`The dialog form`}),(0,I.jsxs)(`p`,{className:Z,children:[`One `,(0,I.jsx)(`code`,{className:Q,children:`MemberForm`}),` serves create and edit: the parent remounts it with`,` `,(0,I.jsx)(`code`,{className:Q,children:`key`}),` on every open, so`,` `,(0,I.jsx)(`code`,{className:Q,children:`initialValues`}),` alone loads the record — no reset plumbing. The`,` `,(0,I.jsx)(`code`,{className:Q,children:`input`}),` channel binds the cores (`,(0,I.jsx)(`code`,{className:Q,children:`InputCore`}),`,`,` `,(0,I.jsx)(`code`,{className:Q,children:`SelectCore`}),` +`,` `,(0,I.jsx)(`code`,{className:Q,children:`Option`}),` children) and FormItem wires id, aria attributes,`,` `,(0,I.jsx)(`code`,{className:Q,children:`onBlur`}),`,`,` `,(0,I.jsx)(`code`,{className:Q,children:`onChange`}),` and the value itself; validation is the same`,` `,(0,I.jsx)(`code`,{className:Q,children:`zodResolver`}),` per-field schema pattern from the recipe above. The dialog's`,` `,(0,I.jsx)(`code`,{className:Q,children:`open`}),` travels through a`,` `,(0,I.jsx)(`code`,{className:Q,children:`useControl`}),` Control — a plain boolean would be an uncontrolled`,` `,(0,I.jsx)(`em`,{children:`initial`}),` value and the dialog would never reopen.`]}),(0,I.jsx)(`h3`,{children:`The whole file`}),(0,I.jsxs)(`p`,{className:Z,children:[`This is the real source powering the demo — fake server, form, screen and layout, nothing elided. Swap the server bodies for`,` `,(0,I.jsx)(`code`,{className:Q,children:`fetch()`}),` calls and it is a production CRUD screen:`]}),(0,I.jsx)(D,{language:`tsx`,className:$,children:Zt})]}),(0,I.jsxs)(`div`,{className:P,children:[(0,I.jsx)(`h2`,{children:`Adding a locale — custom copy & RTL`}),(0,I.jsxs)(`p`,{className:Z,children:[`Every user-visible literal in haze-ui flows through`,` `,(0,I.jsx)(`code`,{className:Q,children:`useStrings`}),`, so copy lives in one place per language:`,` `,(0,I.jsx)(`code`,{className:Q,children:`HazeStrings`}),`, a section-per-component map derived from the English`,` `,(0,I.jsx)(`code`,{className:Q,children:`defaultStrings`}),`. You can reword individual messages, mount whole packs, and contribute new languages back — the demo below switches between all three modes, including an RTL tag.`]}),(0,I.jsx)(`h3`,{children:`Live demo`}),(0,I.jsx)(`div`,{className:en,children:(0,I.jsx)(xn,{})}),(0,I.jsxs)(`p`,{className:$t,children:[`Switch to العربية: the tag `,(0,I.jsx)(`code`,{className:Q,children:`ar-EG`}),` `,`derives direction `,(0,I.jsx)(`code`,{className:Q,children:`rtl`}),` (shown by the probe), and the Arabic copy renders mirrored because the demo — not the library — set `,(0,I.jsx)(`code`,{className:Q,children:`dir`}),` on the column. Remove a tag in any language and watch the`,` `,(0,I.jsx)(`code`,{className:Q,children:`{count}`}),` placeholder expand.`]}),(0,I.jsx)(`h3`,{children:`The packs`}),(0,I.jsxs)(`p`,{className:Z,children:[`The demo is powered by the real module below:`,` `,(0,I.jsx)(`code`,{className:Q,children:`createStrings`}),` merges a partial override onto a base pack and returns a complete`,` `,(0,I.jsx)(`code`,{className:Q,children:`HazeStrings`}),`, so a derived pack never forks the literals it does not touch. A full pack also satisfies the provider's partial`,` `,(0,I.jsx)(`code`,{className:Q,children:`strings`}),` shape:`]}),(0,I.jsx)(D,{language:`ts`,className:$,children:Jt}),(0,I.jsx)(`h3`,{children:`Partial overrides without a pack`}),(0,I.jsxs)(`p`,{className:Z,children:[`For one-off rewording you do not need`,` `,(0,I.jsx)(`code`,{className:Q,children:`createStrings`}),` at all — the`,` `,(0,I.jsx)(`code`,{className:Q,children:`strings`}),` prop is already a deep partial (`,(0,I.jsx)(`code`,{className:Q,children:`HazeStringsOverrides`}),`). Use `,(0,I.jsx)(`code`,{className:Q,children:`createStrings`}),` when you need the resolved pack as a `,(0,I.jsx)(`em`,{children:`value`}),`: deriving`,` `,(0,I.jsx)(`code`,{className:Q,children:`zhCN`}),` with your terminology, sharing one customized pack across providers, or handing it to non-React code:`]}),(0,I.jsx)(D,{language:`tsx`,className:$,children:`// one message, everything else keeps the pack copy
<LocaleProvider strings={{ pagination: { previous: '‹ Précédent' } }}>
  <Pagination total={40} />
</LocaleProvider>
// or derive a complete pack once at module scope and reuse it
const branded = createStrings(zhCN, {
  confirmDialog: { confirm: '好的', cancel: '先不了' },
});
<LocaleProvider locale="zh-CN" strings={branded}>…</LocaleProvider>`}),(0,I.jsx)(`h3`,{children:`Authoring a complete language pack`}),(0,I.jsxs)(`p`,{className:Z,children:[`A full pack is a plain `,(0,I.jsx)(`code`,{className:Q,children:`const`}),` `,`annotated `,(0,I.jsx)(`code`,{className:Q,children:`HazeStrings`}),` — the annotation is the contract: TypeScript fails the build the moment either side drifts (a missing key, an extra key, a renamed section). Start by copying`,` `,(0,I.jsx)(`code`,{className:Q,children:`defaultStrings`}),` from`,` `,(0,I.jsx)(`code`,{className:Q,children:`src/lib/components/LocaleProvider/locale.ts`}),` `,`as the translation baseline, and keep`,` `,(0,I.jsx)(`code`,{className:Q,children:`{name}`}),` placeholders verbatim — they are expanded at runtime and unknown placeholders are left as-is, never blanked. This is exactly how the bundled`,` `,(0,I.jsx)(`code`,{className:Q,children:`zhCN`}),` pack is written:`]}),(0,I.jsx)(D,{language:`ts`,className:$,children:`import type { HazeStrings } from 'haze-ui';
const frFR: HazeStrings = {
  alert: { close: 'Fermer' },
  approvalCard: { title: 'Approbation requise', approve: 'Approuver', deny: 'Refuser' },
  asyncSection: { loading: 'Chargement…', error: 'Une erreur est survenue', retry: 'Réessayer' },
  avatarGroup: { more: '+{count}' },          // placeholders survive translation verbatim
  // …every section of defaultStrings, 1:1 — the type enforces it
};
<LocaleProvider locale="fr-FR" strings={frFR}>…</LocaleProvider>`}),(0,I.jsx)(`h3`,{children:`RTL: declared direction vs derived direction`}),(0,I.jsxs)(`p`,{className:Z,children:[(0,I.jsx)(`code`,{className:Q,children:`LocaleProvider`}),` accepts an explicit `,(0,I.jsx)(`code`,{className:Q,children:`direction`}),` prop, and when nobody declares one it derives the direction from the locale: the primary subtag is matched against the RTL language list —`,` `,(0,I.jsx)(`code`,{className:Q,children:`ar, he, fa, ur, ps, sd, ug, yi, dv, ckb, ku, iw`}),` `,`(the last is the legacy Hebrew tag; Latin-script Kurdish stays ltr — declare a direction explicitly then). The provider never writes a`,` `,(0,I.jsx)(`code`,{className:Q,children:`dir`}),` attribute: setting the document's direction is the app's job. The library only consumes the value through two exported helpers:`]}),(0,I.jsx)(D,{language:`tsx`,className:$,children:`import { LocaleProvider, useDirection, localeDirection } from 'haze-ui';
// declared intent for render-time decisions (falls back to the document)
useDirection(); // 'rtl' under <LocaleProvider locale="ar-EG">
// pure helper: the direction a BCP 47 tag implies
localeDirection('ar-EG'); // 'rtl'
localeDirection('he-IL'); // 'rtl'
localeDirection('fr-FR'); // 'ltr'
// explicit beats derivation, and survives nested locale-only providers
<LocaleProvider locale="ar-EG" direction="ltr">…</LocaleProvider>`}),(0,I.jsxs)(`p`,{className:Z,children:[`For interaction-time code (arrow-key mirroring, JS-assisted placement) the library reads layout truth from the DOM via`,` `,(0,I.jsx)(`code`,{className:Q,children:`getDirection(element)`}),` — the nearest `,(0,I.jsx)(`code`,{className:Q,children:`[dir]`}),` ancestor — so mirrored behavior follows what the user actually sees, whatever the provider declared.`]}),(0,I.jsx)(`h3`,{children:`Contributing a pack upstream`}),(0,I.jsxs)(`p`,{className:Z,children:[`New languages are merged the same way`,` `,(0,I.jsx)(`code`,{className:Q,children:`zhCN`}),` was: copy`,` `,(0,I.jsx)(`code`,{className:Q,children:`defaultStrings`}),` as the baseline, translate it (keys 1:1, placeholders verbatim), and open a PR adding`,` `,(0,I.jsx)(`code`,{className:Q,children:`src/lib/components/LocaleProvider/<tag>.ts`}),` `,`following the `,(0,I.jsx)(`code`,{className:Q,children:`zh-cn.ts`}),` file layout. The maintainer-side step is registering the tag mapping in`,` `,(0,I.jsx)(`code`,{className:Q,children:`useStrings'`}),` pack resolution, after which`,` `,(0,I.jsx)(`code`,{className:Q,children:`locale="fr-FR"`}),` selects the pack automatically for every consumer — no`,` `,(0,I.jsx)(`code`,{className:Q,children:`strings`}),` prop needed.`]})]}),(0,I.jsxs)(`div`,{className:P,children:[(0,I.jsx)(`h2`,{children:`AI runtime integration — Vercel AI SDK useChat × agent components`}),(0,I.jsxs)(`p`,{className:Z,children:[`haze-ui's agent surface is deliberately presentational:`,` `,(0,I.jsx)(`code`,{className:Q,children:`ChatContainer`}),` owns scrolling,`,` `,(0,I.jsx)(`code`,{className:Q,children:`ChatMessage`}),` the bubbles,`,` `,(0,I.jsx)(`code`,{className:Q,children:`StreamingText`}),` the typewriter reveal, `,(0,I.jsx)(`code`,{className:Q,children:`ToolCallCard`}),` tool input/output, `,(0,I.jsx)(`code`,{className:Q,children:`ThinkingIndicator`}),` `,`the waiting dots, `,(0,I.jsx)(`code`,{className:Q,children:`ChatInput`}),` the composer. The Vercel AI SDK's`,` `,(0,I.jsx)(`code`,{className:Q,children:`useChat`}),` is the stateful half: it owns `,(0,I.jsx)(`code`,{className:Q,children:`messages`}),` (a`,` `,(0,I.jsx)(`code`,{className:Q,children:`UIMessage[]`}),` of typed`,` `,(0,I.jsx)(`code`,{className:Q,children:`parts`}),`),`,` `,(0,I.jsx)(`code`,{className:Q,children:`status`}),` (`,(0,I.jsx)(`code`,{className:Q,children:`submitted | streaming | ready | error`}),`) and the `,(0,I.jsx)(`code`,{className:Q,children:`sendMessage`}),`/`,(0,I.jsx)(`code`,{className:Q,children:`stop`}),` pair. One small adapter bridges them — pure functions over duck-typed shapes, so the`,` `,(0,I.jsx)(`code`,{className:Q,children:`ai`}),` package never enters your dependency tree through haze-ui.`]}),(0,I.jsx)(`h3`,{children:`Live demo`}),(0,I.jsxs)(`p`,{className:Z,children:[`The chat below runs the exact adapter shown further down, fed by a mock `,(0,I.jsx)(`code`,{className:Q,children:`useChat`}),` — same return shape, timers instead of a transport. Ask about CSS to see reasoning → tool call → streamed answer → source link; ask for an error to see the failure path; hit Stop mid-run to see the finalize-on-abort behavior.`]}),(0,I.jsx)(Sn,{}),(0,I.jsx)(`h3`,{children:`The adapter`}),(0,I.jsxs)(`p`,{className:Z,children:[`The whole integration is two exports —`,` `,(0,I.jsx)(`code`,{className:Q,children:`renderUIMessages`}),` (a pure`,` `,(0,I.jsx)(`code`,{className:Q,children:`parts → ReactNode[]`}),` mapping, never throws on odd payloads) and`,` `,(0,I.jsx)(`code`,{className:Q,children:`useHazeChat`}),` (the thin hook that memoizes it and wires the composer). This is the real source powering the demo — swap `,(0,I.jsx)(`code`,{className:Q,children:`@/lib`}),` `,`for `,(0,I.jsx)(`code`,{className:Q,children:`haze-ui`}),` in your app:`]}),(0,I.jsx)(D,{language:`tsx`,className:$,children:Yt}),(0,I.jsx)(`h3`,{children:`With a real useChat`}),(0,I.jsxs)(`p`,{className:Z,children:[`Drop the adapter next to your chat route and the wiring is four lines. Both SDK generations work: the hook prefers v5's`,` `,(0,I.jsxs)(`code`,{className:Q,children:[`sendMessage(`,`{ text }`,`)`]}),` and falls back to v4's`,` `,(0,I.jsxs)(`code`,{className:Q,children:[`append(`,`{ role, content }`,`)`]}),`:`]}),(0,I.jsx)(D,{language:`tsx`,className:$,children:`import { useChat } from '@ai-sdk/react';
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
}`}),(0,I.jsx)(`h3`,{children:`Mapping rules`}),(0,I.jsx)(`p`,{className:Z,children:`The status → presentation contract the adapter implements:`}),(0,I.jsx)(D,{language:`text`,className:$,children:`UIMessage                    → ChatMessage bubble (role; user msg 'sending' while submitted)
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
status error                 → system ChatMessage with the transport error`}),(0,I.jsx)(`h3`,{children:`The mock (what the demo runs)`}),(0,I.jsxs)(`p`,{className:Z,children:[`The demo's streaming source — same shape a real`,` `,(0,I.jsx)(`code`,{className:Q,children:`useChat`}),` returns, scripted with`,` `,(0,I.jsx)(`code`,{className:Q,children:`setTimeout`}),`. Useful as a fixture for your own tests, too:`]}),(0,I.jsx)(D,{language:`ts`,className:$,children:Xt}),(0,I.jsx)(`h3`,{children:`Known limits`}),(0,I.jsxs)(`ul`,{className:Z,children:[(0,I.jsxs)(`li`,{children:[(0,I.jsx)(`strong`,{children:`Streaming text cadence.`}),` `,(0,I.jsx)(`code`,{className:Q,children:`StreamingText`}),` reveals its whole `,(0,I.jsx)(`code`,{className:Q,children:`text`}),` once and restarts the reveal whenever the prop `,(0,I.jsx)(`em`,{children:`grows`}),` — it fits parts that arrive whole (batched transports, the demo's mock) but not char-by-char deltas. If your transport grows text parts incrementally, render the plain block while`,` `,(0,I.jsx)(`code`,{className:Q,children:`state === 'streaming'`}),` `,`instead (one-line change in`,` `,(0,I.jsx)(`code`,{className:Q,children:`renderPart`}),`).`]}),(0,I.jsxs)(`li`,{children:[(0,I.jsx)(`strong`,{children:`Attachments, files, data parts.`}),` `,(0,I.jsx)(`code`,{className:Q,children:`file`}),`/`,` `,(0,I.jsx)(`code`,{className:Q,children:`data-*`}),` parts are skipped;`,(0,I.jsx)(`code`,{className:Q,children:`ChatInput`}),` is text-only in this version. Extend `,(0,I.jsx)(`code`,{className:Q,children:`renderPart`}),` `,`with your own branch when you need them.`]}),(0,I.jsxs)(`li`,{children:[(0,I.jsx)(`strong`,{children:`Branching, regeneration, voice.`}),` `,(0,I.jsx)(`code`,{className:Q,children:`branchNumber`}),`,`,` `,(0,I.jsx)(`code`,{className:Q,children:`regenerate`}),`, and speech parts are out of scope here; the adapter renders whichever branch the SDK exposes in `,(0,I.jsx)(`code`,{className:Q,children:`messages`}),`.`]}),(0,I.jsxs)(`li`,{children:[(0,I.jsx)(`strong`,{children:`v4 string content.`}),` Messages that predate the parts API (`,(0,I.jsx)(`code`,{className:Q,children:`content: string`}),`) render as empty bubbles — convert to parts, or map`,` `,(0,I.jsx)(`code`,{className:Q,children:`content`}),` to a synthetic text part first.`]})]})]}),(0,I.jsxs)(`div`,{className:P,children:[(0,I.jsx)(`h2`,{children:`Icon ecosystems — lucide-react & react-icons × icon slots`}),(0,I.jsxs)(`p`,{className:Z,children:[`haze-ui ships no icon set on purpose:`,` `,(0,I.jsx)(`code`,{className:Q,children:`Icon`}),` is a thin sizing and coloring wrapper, and every component that renders an icon also accepts a raw svg — so the icon library stays a dependency of your app, never of the UI kit. Two wiring styles cover both major ecosystems: pass icons straight into the slots, or generate a type-safe set once and keep every call site declarative.`]}),(0,I.jsx)(`h3`,{children:`Live demo`}),(0,I.jsx)(`div`,{className:en,children:(0,I.jsx)(At,{})}),(0,I.jsx)(`h3`,{children:`lucide-react — named imports, straight into the slots`}),(0,I.jsxs)(`p`,{className:Z,children:[`lucide icons are stroke-based, which is exactly the contract the`,` `,(0,I.jsx)(`code`,{className:Q,children:`icon`}),` prop is built for. Named imports are tree-shakeable — every import pulls one icon module and nothing more. Compose inside`,` `,(0,I.jsx)(`code`,{className:Q,children:`Button`}),` children (the skin supplies the gap), pass one per`,` `,(0,I.jsx)(`code`,{className:Q,children:`Menu`}),` data item, and replace the default illustrations of`,` `,(0,I.jsx)(`code`,{className:Q,children:`Result`}),` (`,(0,I.jsx)(`code`,{className:Q,children:`icon`}),`) and`,` `,(0,I.jsx)(`code`,{className:Q,children:`Empty`}),` (`,(0,I.jsx)(`code`,{className:Q,children:`image`}),`):`]}),(0,I.jsx)(D,{language:`tsx`,className:$,children:`import { PackageOpen, Rocket, Trash2 } from 'lucide-react';
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
<Empty image={<Icon icon={PackageOpen} size='lg' />} description='Nothing here yet' />`}),(0,I.jsx)(`h3`,{children:`react-icons — mind the fill/stroke split`}),(0,I.jsxs)(`p`,{className:Z,children:[`react-icons publishes many sets under one package. The`,` `,(0,I.jsx)(`em`,{children:`stroke`}),` sets (`,(0,I.jsx)(`code`,{className:Q,children:`fi`}),`,`,` `,(0,I.jsx)(`code`,{className:Q,children:`lu`}),`,`,` `,(0,I.jsx)(`code`,{className:Q,children:`tb`}),`…) behave like lucide and slot in through `,(0,I.jsx)(`code`,{className:Q,children:`children`}),`. The`,` `,(0,I.jsx)(`em`,{children:`fill`}),` sets (`,(0,I.jsx)(`code`,{className:Q,children:`md`}),`,`,` `,(0,I.jsx)(`code`,{className:Q,children:`fa`}),`,`,` `,(0,I.jsx)(`code`,{className:Q,children:`hi`}),`…) must stay`,` `,(0,I.jsx)(`em`,{children:`bare`}),`: `,(0,I.jsx)(`code`,{className:Q,children:`Icon`}),` assumes stroke glyphs and forces `,(0,I.jsx)(`code`,{className:Q,children:`fill: none`}),` `,`on the svg, which blanks filled ones — every react-icons svg carries `,(0,I.jsx)(`code`,{className:Q,children:`stroke=currentColor`}),`, so even the children detection trips it (verified in Chromium: the glyph computes fill:none / stroke-width:0 and paints nothing). Bare is not a compromise: react-icons sizes itself at`,` `,(0,I.jsx)(`code`,{className:Q,children:`1em`}),` and inherits`,` `,(0,I.jsx)(`code`,{className:Q,children:`currentColor`}),`, which is exactly what `,(0,I.jsx)(`code`,{className:Q,children:`Button`}),` `,`children want.`]}),(0,I.jsx)(D,{language:`tsx`,className:$,children:`import { FiSearch } from 'react-icons/fi';    // stroke set
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
// <Icon><MdRocketLaunch /></Icon>`}),(0,I.jsx)(`h3`,{children:`A type-safe set for the whole app`}),(0,I.jsxs)(`p`,{className:Z,children:[`One `,(0,I.jsx)(`code`,{className:Q,children:`satisfies`}),`-pinned record gives every product concept a name; a tiny wrapper is then the only place that knows about haze sizing. Names autocomplete, a typo is a compile error, and swapping icon libraries later touches exactly one file:`]}),(0,I.jsx)(D,{language:`tsx`,className:$,children:`import type { IconProps } from 'haze-ui';
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
<Empty image={<AppIcon name='empty' size='lg' />} description='Nothing here yet' />`}),(0,I.jsx)(`h3`,{children:`The whole file`}),(0,I.jsxs)(`p`,{className:Z,children:[`This is the real source powering the demo — icon sets, wrapper and every slot combination, nothing elided. Swap`,` `,(0,I.jsx)(`code`,{className:Q,children:`@/lib`}),` for`,` `,(0,I.jsx)(`code`,{className:Q,children:`haze-ui`}),` in your app:`]}),(0,I.jsx)(D,{language:`tsx`,className:$,children:Qt})]})]})}export{Cn as default};