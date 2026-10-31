import{i as e,t}from"./jsx-runtime-Cx0BB4qO.js";import{n}from"./classnames-DwgxuFP5.js";import{n as r,r as i}from"./direction-dynqR8mp.js";import{a,i as o,n as s,o as c,r as l,s as u,t as d}from"./zod-ms1HF9Rx.js";import{n as f,t as p}from"./Input-Dpr4jdqA.js";import{t as m,u as h}from"./SelectCore-W0pQa4o5.js";import{t as g}from"./Badge-cOLEPnOI.js";import{i as _}from"./menuKeyboard-sb_W4stC.js";import{t as ee}from"./ConfirmDialog-C1KFk4AV.js";import{n as te,t as ne}from"./useToast-ilxbt3_y.js";import{a as v,i as y,n as b,r as x,t as S}from"./ThinkingIndicator-BLYYmyeh.js";import{a as C,b as re,g as w,l as T,p as E,r as D,t as O,y as k}from"./schemas-Y5OZKfVY.js";import{t as A}from"./Segmented-D3jKaRvy.js";import{t as ie}from"./TagInput-wesZiK8Z.js";import{t as j}from"./CodeBlock-C2ywdVcy.js";import{n as ae,t as oe}from"./StreamingText-CCM6XZ5o.js";import{n as se,t as ce}from"./StepTimeline-C4Nt0RXw.js";import{T as le,d as M,m as N}from"./index-C6JxAK1w.js";import{a as ue,n as P,o as de,r as fe,s as F}from"./styles-DBn9Gwwz.js";function pe(e,t){let n={};for(let r of Object.keys(e))n[r]=me(e[r],t[r]);return n}function me(e,t){return{...e,...t}}var he=`import type { ReactNode } from 'react';
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
`,ge=`import type { HazeStrings } from '@/lib';

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
`,_e=`import type { SortingState } from '@tanstack/react-table';

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
`,ve=`import type {
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
`,I=e(n(),1),L=t(),R=e=>typeof e==`string`?e:``,z=e=>Array.isArray(e)?e:[],B=e=>typeof e==`object`&&!!e;function V(e){if(e!=null&&typeof e!=`function`){if(typeof e==`string`)return e;if(typeof e==`number`||typeof e==`boolean`||typeof e==`bigint`||typeof e==`symbol`)return e.toString();try{return JSON.stringify(e,null,2)}catch{return`[unserializable]`}}}function ye(e,t,n){if(e.type===`tool-call`){let n=R(e.toolCallId),r=n?t.get(n):void 0;return{name:R(e.toolName)||`tool`,input:V(e.args),output:V(r?.result),status:r?r.isError===!0?`error`:`done`:`running`}}if(e.type===`tool-result`){let t=R(e.toolCallId);return t&&n.has(t)?null:{name:R(e.toolName)||`tool`,output:V(e.result),status:e.isError===!0?`error`:`done`}}let r=z(e.states).filter(e=>typeof e==`string`),i=r.includes(`output-error`)?`error`:r.includes(`output-available`)?`done`:r.length>0?`running`:`pending`;return{name:e.type.slice(5)||`tool`,input:V(e.input),output:V(e.output),status:i}}function be(e){if(e.type===`source-url`)return typeof e.url!=`string`||!e.url?null:{href:e.url,title:R(e.title)||e.url};if(e.type!==`source`||!B(e.source))return null;let t=e.source,n=typeof t.url==`string`?t.url:``;return n?{href:n,title:R(t.title)||n,snippet:R(t.snippet)||void 0}:null}function xe(e){let t=B(e.providerMetadata)?e.providerMetadata:void 0,n=t?Object.values(t).find(e=>B(e)&&typeof e.duration==`number`&&e.duration>0):void 0,r=typeof e.duration==`number`&&e.duration>0?e.duration:n?.duration;if(!(typeof r!=`number`||!Number.isFinite(r)||r<=0))return r<1e3?`${Math.round(r)}ms`:`${Math.round(r/100)/10}s`}var Se=e=>R(e).trim().toLowerCase().replace(/[\s-]+/g,`_`),Ce={pending:`pending`,queued:`pending`,planned:`pending`,not_started:`pending`,active:`active`,in_progress:`active`,running:`active`,started:`active`,done:`done`,completed:`done`,complete:`done`,succeeded:`done`,error:`error`,failed:`error`,skipped:`skipped`,cancelled:`skipped`,canceled:`skipped`};function we(e){let t=B(e.data)?e.data:{},n=z(t.steps).filter(B);return n.length===0?null:{title:R(t.title)||`Plan`,items:n.map((e,t)=>({key:R(e.id)||`step-${t}`,label:R(e.label)||R(e.title)||R(e.name)||`Step ${t+1}`,description:R(e.description)||void 0,status:Ce[Se(e.status)]??`pending`}))}}var Te={queued:`queued`,pending:`queued`,waiting:`queued`,planned:`queued`,sending:`sending`,active:`sending`,running:`sending`,in_progress:`sending`,failed:`failed`,error:`failed`};function Ee(e){let t=z((B(e.data)?e.data:{}).items).filter(B);return t.length===0?null:{items:t.map((e,t)=>({id:R(e.id)||`item-${t}`,title:R(e.title)||R(e.label)||R(e.name)||`Item ${t+1}`,description:R(e.description)||void 0,status:Te[Se(e.status)]??`queued`}))}}var De=`haze-ai-chat-adapter__textBody`,Oe=`haze-ai-chat-adapter__reasoningBody`,ke=`haze-ai-chat-adapter__citationStrip`;function Ae(e,t){let{key:n,live:r}=t;if(e.type===`text`){let t=R(e.text);return t?r&&e.state===`streaming`?(0,L.jsx)(oe,{text:t},n):(0,L.jsx)(`div`,{className:De,children:t},n):null}if(e.type===`reasoning`){let t=R(e.text);return t?(0,L.jsx)(ce,{children:(0,L.jsx)(se,{label:`Thought process`,status:e.state===`streaming`?`running`:`done`,time:xe(e),collapsible:!0,content:(0,L.jsx)(`p`,{className:Oe,children:t})})},n):r&&e.state===`streaming`?(0,L.jsx)(S,{},n):null}if(e.type.startsWith(`tool-`)){let r=ye(e,t.resultsByCallId,t.callIds);return r?(0,L.jsx)(b,{...r},n):null}if(e.type===`data-plan`){let t=we(e);return t?(0,L.jsx)(o,{title:t.title,children:t.items.map(e=>(0,L.jsx)(a,{label:e.label,description:e.description,status:e.status},e.key))},n):null}if(e.type===`data-queue`){let r=Ee(e);if(!r)return null;let i=t.onQueueRemove;return(0,L.jsx)(s,{children:r.items.map(e=>(0,L.jsx)(l,{title:e.title,description:e.description,status:e.status,...i?{onRemove:()=>i(t.partId,e.id),removeLabel:`Remove ${e.title}`}:{}},e.id))},n)}return null}function je(e,t){let n=z(e.messages).filter(B),r=e.status,i=r===`submitted`||r===`streaming`,a=[];n.forEach((e,o)=>{let s=o===n.length-1,l=e.role===`user`||e.role===`system`?e.role:`assistant`,u=R(e.id)||`msg-${o}`,d=z(e.parts).filter(B),f=new Map,p=new Set;for(let e of d){let t=typeof e.toolCallId==`string`?e.toolCallId:``;t&&(e.type===`tool-result`?f.set(t,e):e.type===`tool-call`&&p.add(t))}let m=[],h=[];d.forEach((e,n)=>{let r=`${u}-part-${n}`,a=be(e);if(a){h.push((0,L.jsx)(c,{index:h.length+1,href:a.href,title:a.title,snippet:a.snippet},r));return}let o=Ae(e,{key:r,live:i&&s,partId:R(e.id)||r,resultsByCallId:f,callIds:p,onQueueRemove:t?.onQueueRemove});o!==null&&m.push(o)}),h.length>0&&m.push((0,L.jsx)(`div`,{className:ke,children:h},`${u}-citations`));let g=l===`user`&&s&&r===`submitted`?`sending`:l===`user`?`sent`:void 0;a.push((0,L.jsx)(ae,{role:l,status:g,children:m.length>0?m:(0,L.jsx)(S,{})},u))});let o=n[n.length-1];if(r===`submitted`&&o?.role!==`assistant`&&a.push((0,L.jsx)(S,{},`haze-waiting`)),r===`error`){let t=e.error,n=t instanceof Error?t.message:R(t)||`Something went wrong.`;a.push((0,L.jsx)(ae,{role:`system`,children:n},`haze-error`))}return a}function Me(e,t){let{messages:n,status:r,error:i}=e,a=t?.onQueueRemove,o=(0,I.useMemo)(()=>je({messages:n,status:r,error:i},{onQueueRemove:a}),[n,r,i,a]),{sendMessage:s,append:c,stop:l}=e,u=(0,I.useCallback)(e=>{let t=e.trim();t&&(s?s({text:t}):c?.({role:`user`,content:t}))},[s,c]),d=(0,I.useCallback)(()=>l?.(),[l]);return{messages:o,busy:r===`submitted`||r===`streaming`,error:r===`error`,send:u,stop:d}}var Ne=0,H=e=>`${e}-${++Ne}`,Pe=20,Fe={id:`welcome`,role:`assistant`,parts:[{type:`text`,state:`done`,text:`Ask me about haze-ui — for example: "How does haze-ui ship per-component CSS?"`}]},Ie=`The user asks about CSS delivery. haze-ui is a Linaria library — zero runtime — so styles are extracted at build time. The library build emits one CSS file per module, and a split script groups them into per-component subpaths plus an aggregate stylesheet. I should check the docs for the exact loading modes before answering.`,Le=`haze-ui ships **two CSS loading modes**:

1. Per-component subpaths — \`import 'haze-ui/css/button'\` pulls only what you mount.
2. The aggregate — \`import 'haze-ui/styles.css'\` covers everything at once.

Both are plain build artifacts (Linaria extracts them at build time, no runtime CSS-in-JS), and a manifest maps every export to its CSS file so tooling never guesses.`,Re=e=>`Parsing the request: "${e}". No tool call needed — answer from the component catalog directly, and keep it short.`,ze=e=>`About "${e}" — haze-ui's agent surface is a set of presentational components: ChatContainer owns scrolling, ChatMessage the bubbles, StreamingText the typewriter reveal, ToolCallCard tool input/output, ThinkingIndicator the waiting dots, and ChatInput the composer. Pair them with any runtime; this demo drives them through the same adapter you would use with a real one.`,Be=e=>({query:e}),Ve={files:[`css/loading-modes.md`,`css/manifest.json`],loadingModes:2},He=[{id:`plan-find-docs`,label:`Locate the CSS docs`},{id:`plan-check-modes`,label:`Check both loading modes`},{id:`plan-summarize`,label:`Summarize the manifest`}],U=(e,t)=>({state:e,steps:He.map((e,n)=>({...e,status:t[n]??`pending`}))}),Ue=(e,t)=>({type:`data-plan`,id:`plan-css`,data:U(e,t)}),W=(e,t)=>({items:[{id:`q-emit`,title:`Emit loading-modes.md`,description:e===`failed`?`403 — docs storage quota exceeded`:void 0,status:e},{id:`q-cdn`,title:`Refresh the CDN manifest`,status:t}]}),We=(e,t)=>({type:`data-queue`,id:`queue-css`,data:W(e,t)}),Ge=e=>Array.isArray(e)?e:[],Ke=e=>t=>[...t,e],G=(e,t)=>n=>n.map((n,r)=>r===e?{...n,...t}:n);function qe(){let[e,t]=(0,I.useState)([Fe]),[n,r]=(0,I.useState)(`ready`),[i,a]=(0,I.useState)(void 0),o=(0,I.useRef)([]),s=(0,I.useRef)(`ready`);(0,I.useEffect)(()=>{s.current=n},[n]);let c=(0,I.useCallback)(()=>{o.current.forEach(clearTimeout),o.current=[]},[]);(0,I.useEffect)(()=>c,[c]);let l=(0,I.useCallback)(e=>{c();let n=H(`assistant`),i=/css|style|stylesheet/i.test(e),s=/\b(error|fail|crash)\b/i.test(e),l=(e,r)=>{o.current.push(setTimeout(()=>{t(e=>e.map(e=>e.id===n?{...e,parts:r(Ge(e.parts))}:e))},e))};if(t(e=>[...e,{id:n,role:`assistant`,parts:[]}]),r(`streaming`),s){o.current.push(setTimeout(()=>{a(`Mock transport error — simulated failure.`),r(`error`)},700));return}let u=i?Le:ze(e),d=i?Ie:Re(e),f=0,p=0,m=(e,t)=>{let n=f;return f+=1,l(e,Ke(t)),n},h=m(p,{type:`reasoning`,text:d,state:`streaming`});if(p+=900,l(p,G(h,{state:`done`,providerMetadata:{anthropic:{duration:1240}}})),i){p+=100;let t=m(p,Ue(`draft`,[`pending`,`pending`,`pending`]));p+=200,l(p,G(t,{data:U(`active`,[`in_progress`,`pending`,`pending`])})),p+=300;let n=m(p,{type:`tool-searchDocs`,toolCallId:H(`call`),states:[`input-streaming`]});l(p+350,G(n,{states:[`input-available`],input:Be(e)})),p+=1500,l(p,G(n,{states:[`output-available`],input:Be(e),output:Ve})),p+=200,l(p,G(t,{data:U(`active`,[`completed`,`in_progress`,`pending`])})),p+=600,l(p,G(t,{data:U(`active`,[`completed`,`completed`,`in_progress`])})),p+=600,l(p,G(t,{data:U(`done`,[`completed`,`completed`,`completed`])})),p+=100}else p+=200;let g=m(p,{type:`text`,text:u,state:`streaming`}),_=p+u.length*Pe+500;if(l(_,G(g,{state:`done`})),i){m(_+60,{type:`source`,source:{sourceType:`url`,url:`https://wmzy.github.io/haze-ui/`,title:`haze-ui docs — CSS loading modes`,snippet:`Import per-component subpaths (haze-ui/css/button) or the aggregate styles.css; a manifest maps every export to its CSS file.`}}),m(_+120,{type:`source`,source:{sourceType:`url`,url:`https://github.com/wmzy/haze-ui/blob/main/scripts/split-css.mjs`,title:`scripts/split-css.mjs`,snippet:`Groups the per-module CSS output into per-component css/ subpaths plus the aggregate stylesheet.`}});let e=m(_+180,We(`sending`,`queued`));l(_+980,G(e,{data:W(`failed`,`queued`)})),o.current.push(setTimeout(()=>r(`ready`),_+1080))}else o.current.push(setTimeout(()=>r(`ready`),_))},[c]),u=(0,I.useCallback)(e=>{let n=e,i=typeof n.text==`string`?n.text:n.content,c=(typeof i==`string`?i:``).trim();c&&s.current!==`submitted`&&s.current!==`streaming`&&(a(void 0),t(e=>[...e,{id:H(`user`),role:`user`,parts:[{type:`text`,text:c}]}]),r(`submitted`),o.current.push(setTimeout(()=>l(c),600)))},[l]);return{messages:e,status:n,error:i,sendMessage:u,append:(0,I.useCallback)(e=>u(e),[u]),stop:(0,I.useCallback)(()=>{c(),(s.current===`streaming`||s.current===`submitted`)&&(t(e=>e.map(e=>({...e,parts:Ge(e.parts).map(e=>e.state===`streaming`?{...e,state:`done`}:e)}))),r(`ready`))},[c])}}var Je=pe(le,{chatInput:{placeholder:`Écrire un message…`,send:`Envoyer`},empty:{description:`Aucune donnée`},tagInput:{placeholder:`Ajouter un tag`}}),Ye=pe(le,{chatInput:{placeholder:`اكتب رسالة…`,send:`إرسال`},empty:{description:`لا توجد بيانات`},tagInput:{placeholder:`أضف وسمًا`,tagCount:`{count} وسوم`,tagCountSingular:`وسم واحد`}}),K=6,q=[{id:1,name:`Ada Lovelace`,email:`ada@haze.dev`,role:`admin`},{id:2,name:`Grace Hopper`,email:`grace@haze.dev`,role:`editor`},{id:3,name:`Alan Turing`,email:`alan@haze.dev`,role:`viewer`},{id:4,name:`Katherine Johnson`,email:`katherine@haze.dev`,role:`editor`},{id:5,name:`Edsger Dijkstra`,email:`edsger@haze.dev`,role:`viewer`},{id:6,name:`Barbara Liskov`,email:`barbara@haze.dev`,role:`admin`},{id:7,name:`Donald Knuth`,email:`donald@haze.dev`,role:`viewer`},{id:8,name:`Margaret Hamilton`,email:`margaret@haze.dev`,role:`editor`},{id:9,name:`Dennis Ritchie`,email:`dennis@haze.dev`,role:`viewer`},{id:10,name:`Radia Perlman`,email:`radia@haze.dev`,role:`editor`},{id:11,name:`Tim Berners-Lee`,email:`tim@haze.dev`,role:`viewer`},{id:12,name:`Anita Borg`,email:`anita@haze.dev`,role:`admin`},{id:13,name:`Linus Torvalds`,email:`linus@haze.dev`,role:`viewer`}];function Xe(){return q.reduce((e,t)=>Math.max(e,t.id),0)+1}function Ze(e){q.unshift({id:Xe(),...e,role:e.role})}function Qe(e,t){let n=q.findIndex(t=>t.id===e);n!==-1&&(q[n]={...q[n],...t,role:t.role})}function $e(e){let t=q.findIndex(t=>t.id===e);t!==-1&&q.splice(t,1)}function J(e,t,n){let r=n.trim().toLowerCase(),i=r?q.filter(e=>e.name.toLowerCase().includes(r)||e.email.toLowerCase().includes(r)):q,a=t[0];return{rows:(a?[...i].sort((e,t)=>{let n=a.id,r=n===`id`?e.id-t.id:e[n].localeCompare(t[n]);return a.desc?-r:r}):i).slice((e-1)*K,e*K),pageCount:Math.max(1,Math.ceil(i.length/K))}}var et=d(C().min(2,`Name must be at least 2 characters`)),tt=d(D(`Enter a valid email address`)),nt=d(O([`admin`,`editor`,`viewer`],{message:`Pick a role`}));function rt(e){return e===`admin`?(0,L.jsx)(g,{color:`info`,children:e}):e===`editor`?(0,L.jsx)(g,{color:`success`,children:e}):(0,L.jsx)(g,{children:e})}function it({member:e,onCancel:t,onSubmit:n}){let r=w({initialValues:e?{name:e.name,email:e.email,role:e.role}:{name:``,email:``,role:``}});return(0,L.jsxs)(k,{form:r,onValidSubmit:n,children:[(0,L.jsxs)(`div`,{className:dt,children:[(0,L.jsx)(T,{form:r,name:`name`,label:`Name`,validate:et,mode:`onBlur`,input:f,placeholder:`Ada Lovelace`}),(0,L.jsx)(T,{form:r,name:`email`,label:`Email`,validate:tt,mode:`onBlur`,input:f,placeholder:`ada@haze.dev`}),(0,L.jsxs)(T,{form:r,name:`role`,label:`Role`,validate:nt,mode:`onBlur`,input:m,children:[(0,L.jsx)(h,{value:``,children:`Pick a role…`}),(0,L.jsx)(h,{value:`admin`,children:`Admin`}),(0,L.jsx)(h,{value:`editor`,children:`Editor`}),(0,L.jsx)(h,{value:`viewer`,children:`Viewer`})]})]}),(0,L.jsxs)(`div`,{className:ft,children:[(0,L.jsx)(N,{onClick:e=>e.currentTarget.form?.requestSubmit(),children:`Save`}),(0,L.jsx)(N,{variant:`ghost`,onClick:t,children:`Cancel`})]})]})}function at(){return(0,L.jsx)(te,{children:(0,L.jsx)(ot,{})})}function ot(){let e=ne(),[t,,n]=M(void 0,``),[r,i]=(0,I.useState)(1),[a,o]=(0,I.useState)([]),[s,c]=(0,I.useState)(0),[l,u]=(0,I.useState)(()=>({page:1,sorting:[],search:``,reloadKey:0,...J(1,[],``)})),d=l.page!==r||l.sorting!==a||l.search!==t||l.reloadKey!==s;(0,I.useEffect)(()=>{if(!d)return;let e=setTimeout(()=>{u({page:r,sorting:a,search:t,reloadKey:s,...J(r,a,t)})},300);return()=>clearTimeout(e)},[d,r,a,t,s]);let[,f,m]=M(void 0,!1),[h,g]=(0,I.useState)(null),[te,v]=(0,I.useState)(0),[,y,b]=M(void 0,!1),[x,S]=(0,I.useState)(null),C=(0,I.useCallback)(()=>{g(null),v(e=>e+1),f(!0)},[f]),w=(0,I.useCallback)(e=>{g(e),v(e=>e+1),f(!0)},[f]),T=(0,I.useCallback)(()=>f(!1),[f]),E=(0,I.useCallback)(e=>{S(e),y(!0)},[y]),D=(0,I.useCallback)(()=>{y(!1),S(null)},[y]),O=t=>{h?(Qe(h.id,t),e(`Updated ${t.name}`,{variant:`success`})):(Ze(t),i(1),e(`Created ${t.name}`,{variant:`success`})),c(e=>e+1),T()},k=()=>{if(!x)return;$e(x.id);let{pageCount:n}=J(r,a,t);r>n&&i(n),c(e=>e+1),e(`Deleted ${x.name}`,{variant:`success`}),S(null)},A=(0,I.useMemo)(()=>[{accessorKey:`name`,header:`Name`,cell:e=>(0,L.jsx)(`strong`,{children:e.getValue()})},{accessorKey:`email`,header:`Email`},{accessorKey:`role`,header:`Role`,cell:e=>rt(e.getValue())},{id:`actions`,header:``,cell:({row:e})=>(0,L.jsxs)(`div`,{className:ut,children:[(0,L.jsx)(N,{size:`sm`,variant:`ghost`,onClick:()=>w(e.original),children:`Edit`}),(0,L.jsx)(N,{size:`sm`,variant:`ghost`,onClick:()=>E(e.original),children:`Delete`})]}),meta:{sortable:!1}}],[w,E]);return(0,L.jsxs)(`div`,{className:st,children:[(0,L.jsxs)(`div`,{className:ct,children:[(0,L.jsx)(p,{className:lt,value:n,placeholder:`Search name or email…`,"aria-label":`Search members`,onChange:()=>i(1)}),(0,L.jsx)(N,{onClick:C,children:`New member`})]}),(0,L.jsx)(re,{columns:A,data:l.rows,manual:!0,sortable:!0,loading:d,pageSize:K,pageCount:l.pageCount,onPageChange:i,onSortChange:e=>{o(e),i(1)},getRowId:e=>String(e.id)}),(0,L.jsx)(_,{open:m,onClose:T,title:h?`Edit member`:`New member`,children:(0,L.jsx)(it,{member:h,onCancel:T,onSubmit:O},te)}),(0,L.jsxs)(ee,{open:b,title:`Delete member`,confirmText:`Delete`,variant:`danger`,onConfirm:k,onCancel:D,onClose:D,children:[`Delete `,x?.name,`? There is no undo.`]})]})}var st=`haze-member-crud__frame`,ct=`haze-member-crud__toolbar`,lt=`haze-member-crud__searchInput`,ut=`haze-member-crud__rowActions`,dt=`haze-member-crud__formGrid`,ft=`haze-member-crud__formFooter`,Y=Object.assign({"./ai-chat-adapter.tsx":he,"./locale-packs.ts":ge,"./member-crud.tsx":_e,"./mock-use-chat.ts":ve}),pt=Y[`./locale-packs.ts`]??``,mt=Y[`./ai-chat-adapter.tsx`]??``,ht=Y[`./mock-use-chat.ts`]??``,gt=Y[`./member-crud.tsx`]??``,X=`haze-index__paragraph`,Z=`haze-index__inlineCode`,Q=`haze-index__hint`,_t=`haze-index__demoPanel`,vt=`haze-index__demoColumn`,yt=`haze-index__aiChatFrame`,bt=`haze-index__aiChatScroll`,xt=`haze-index__aiChatComposer`,St=`haze-index__aiChatInput`,Ct=`haze-index__aiChatHint`,$=`haze-index__codeMargin`,wt={username:``,password:``,email:``},Tt=new Set([`admin`,`haze`,`root`]),Et=C().min(1,`Username is required`).min(3,`Username must be at least 3 characters`),Dt=C().min(8,`Password must be at least 8 characters`),Ot=D(`Enter a valid email address`),kt=d(Et),At=d(Dt),jt=d(Ot);function Mt(e,t,n){return new Promise(r=>{let i=setTimeout(()=>{r(Tt.has(e.toLowerCase())?`"${e}" is already taken`:void 0)},600);t.addEventListener(`abort`,()=>{clearTimeout(i),n(),r(void 0)},{once:!0})})}function Nt(){let e=w({initialValues:wt}),[t,n]=(0,I.useState)(null),[r,i]=(0,I.useState)({issued:0,cancelled:0});return(0,L.jsxs)(`div`,{children:[(0,L.jsxs)(k,{form:e,onValidSubmit:e=>n(e),onInvalidSubmit:()=>n(null),children:[(0,L.jsx)(`div`,{className:P,children:(0,L.jsx)(T,{form:e,name:`username`,label:`Username`,validate:async(e,t)=>await kt(e,t)||(i(e=>({...e,issued:e.issued+1})),Mt(e,t.signal,()=>i(e=>({...e,cancelled:e.cancelled+1})))),mode:`onChange`,validateDebounce:400,input:f,placeholder:`ada — try "admin", it is taken`})}),(0,L.jsx)(`div`,{className:P,children:(0,L.jsx)(T,{form:e,name:`password`,label:`Password`,validate:At,mode:`onBlur`,input:f,type:`password`,placeholder:`At least 8 characters`})}),(0,L.jsx)(`div`,{className:P,children:(0,L.jsx)(T,{form:e,name:`email`,label:`Email`,validate:jt,mode:`onBlur`,children:({id:e,errorId:t,invalid:n,onBlur:r,value:i,onChange:a})=>(0,L.jsx)(f,{id:e,value:i,onChange:a,onBlur:r,placeholder:`ada@example.com`,"aria-invalid":n,"aria-describedby":n?t:void 0})})}),(0,L.jsxs)(`div`,{className:de,children:[(0,L.jsx)(N,{onClick:e=>{e.currentTarget.form?.requestSubmit()},children:`Create account`}),(0,L.jsx)(N,{variant:`ghost`,onClick:()=>{E(e,wt),n(null)},children:`Reset`})]})]}),(0,L.jsxs)(`p`,{className:Q,children:[`availability checks: `,r.issued,` issued · `,r.cancelled,` `,`cancelled — keep typing in Username and watch stale rounds drop.`]}),t?(0,L.jsx)(j,{language:`json`,children:JSON.stringify(t,null,2)}):null]})}var Pt=[{value:`en-US`,label:`English`},{value:`fr-FR`,label:`Français`},{value:`zh-CN`,label:`中文`},{value:`ar-EG`,label:`العربية`}],Ft={"fr-FR":Je,"ar-EG":Ye};function It(){return(0,L.jsxs)(`output`,{className:Q,children:[`useDirection(): `,i()]})}function Lt(){let[e,,t]=M(void 0,`en-US`),[,,n]=M(void 0,[`ui`]);return(0,L.jsxs)(`div`,{children:[(0,L.jsx)(A,{options:[...Pt],value:t}),(0,L.jsx)(u,{locale:e,strings:Ft[e],children:(0,L.jsxs)(`div`,{dir:r(e)??`ltr`,className:vt,children:[(0,L.jsx)(ie,{value:n,"aria-label":`Tags`}),(0,L.jsx)(v,{}),(0,L.jsx)(It,{})]})})]})}function Rt(){let{messages:e,busy:t,error:n,send:r,stop:i}=Me(qe());return(0,L.jsxs)(`div`,{className:yt,children:[(0,L.jsx)(y,{className:bt,children:e}),(0,L.jsx)(`div`,{className:xt,children:(0,L.jsx)(x,{className:St,placeholder:`Ask about haze-ui — try “css”, or “error” to fail`,generating:t,onSend:r,onStop:i})}),n?(0,L.jsx)(`p`,{className:Ct,children:`status: error — send another message to retry`}):null]})}function zt(){return(0,L.jsxs)(`div`,{className:ue,children:[(0,L.jsx)(`h1`,{children:`Recipes`}),(0,L.jsx)(`p`,{className:fe,children:`Integration recipes for pairing haze-ui with the ecosystem. Each recipe is a live demo plus the exact code behind it — start typing in the form below and watch schema errors, async checks and cancellation all fire in real time, run the CRUD recipe's server-paginated table end to end (search, sort, create, edit, delete — toasts and all), switch languages in the locale recipe to see packs, partial overrides and RTL derivation at work, or chat with the AI runtime recipe: a Vercel AI SDK useChat shape driving the agent components through one small adapter.`}),(0,L.jsxs)(`div`,{className:F,children:[(0,L.jsx)(`h2`,{children:`zod × react-f0rm — schema-driven form validation`}),(0,L.jsxs)(`p`,{className:X,children:[`haze-ui's `,(0,L.jsx)(`code`,{className:Z,children:`FormItem`}),` takes any`,` `,(0,L.jsx)(`code`,{className:Z,children:`FieldValidator`}),`:`,` `,(0,L.jsx)(`code`,{className:Z,children:`(value, meta) => error | undefined`}),`, sync or async, where `,(0,L.jsx)(`code`,{className:Z,children:`meta.signal`}),` `,`aborts as soon as the validation round is superseded. That shape is all an adapter needs: map `,(0,L.jsx)(`code`,{className:Z,children:`zod`}),`'s`,` `,(0,L.jsx)(`code`,{className:Z,children:`safeParseAsync`}),` result onto it and every schema you already have becomes form validation.`]}),(0,L.jsx)(`h3`,{children:`Live demo`}),(0,L.jsx)(`div`,{className:_t,children:(0,L.jsx)(Nt,{})}),(0,L.jsx)(`h3`,{children:`The adapter ships with haze-ui`}),(0,L.jsxs)(`p`,{className:X,children:[`This used to be a hand-written bridge; the resolver now lives in the library itself — import it from`,` `,(0,L.jsx)(`code`,{className:Z,children:`haze-ui`}),` and every schema you already have becomes form validation:`]}),(0,L.jsx)(j,{language:`ts`,className:$,children:`import { zodResolver } from 'haze-ui';
const usernameSchema = z.string()
  .min(1, 'Username is required')
  .min(3, 'Username must be at least 3 characters');
const validateUsername = zodResolver(usernameSchema);`}),(0,L.jsx)(`p`,{className:X,children:`Three details carry the contract:`}),(0,L.jsxs)(`ol`,{className:X,children:[(0,L.jsxs)(`li`,{children:[(0,L.jsx)(`code`,{className:Z,children:`safeParseAsync`}),` never throws on validation failures — `,(0,L.jsx)(`code`,{className:Z,children:`success: false`}),` `,`carries `,(0,L.jsx)(`code`,{className:Z,children:`error.issues`}),`, each mapped to a`,` `,(0,L.jsx)(`code`,{className:Z,children:`FieldError`}),` with`,` `,(0,L.jsx)(`code`,{className:Z,children:`type: issue.code`}),` and the message passed through (custom messages from`,` `,(0,L.jsx)(`code`,{className:Z,children:`.min(3, '…')`}),` or zod's built-ins). FormItem displays the first error of the field.`]}),(0,L.jsxs)(`li`,{children:[`When a validation round is superseded,`,` `,(0,L.jsx)(`code`,{className:Z,children:`meta.signal`}),` aborts and the resolver resolves `,(0,L.jsx)(`code`,{className:Z,children:`undefined`}),` — the safe non-answer, because react-f0rm discards superseded rounds on its own side too.`]}),(0,L.jsxs)(`li`,{children:[`A passing parse resolves `,(0,L.jsx)(`code`,{className:Z,children:`undefined`}),` `,`— the no-error value f0rm expects.`]})]}),(0,L.jsx)(`h3`,{children:`Wiring it into FormItem`}),(0,L.jsxs)(`p`,{className:X,children:[`Schemas are stateless values, so build the adapters once at module scope and reuse them across fields. The`,` `,(0,L.jsx)(`code`,{className:Z,children:`input`}),` channel binds a core component declaratively — FormItem wires id, aria attributes,`,` `,(0,L.jsx)(`code`,{className:Z,children:`onBlur`}),`,`,` `,(0,L.jsx)(`code`,{className:Z,children:`onChange`}),` and`,` `,(0,L.jsx)(`code`,{className:Z,children:`value`}),` itself:`]}),(0,L.jsx)(j,{language:`tsx`,className:$,children:`const usernameSchema = z.string()
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
/>`}),(0,L.jsx)(`h3`,{children:`Async checks + AbortSignal cancellation`}),(0,L.jsxs)(`p`,{className:X,children:[`react-f0rm aborts the previous round's signal the moment a newer validation kick runs — each debounced round owns its own`,` `,(0,L.jsx)(`code`,{className:Z,children:`AbortController`}),`. Plain validators compose with `,(0,L.jsx)(`code`,{className:Z,children:`await`}),`: run the zod shape first, then the network check, reading`,` `,(0,L.jsx)(`code`,{className:Z,children:`meta.signal`}),` to cancel real work (here a `,(0,L.jsx)(`code`,{className:Z,children:`setTimeout`}),` standing in for a fetch — wire it to`,` `,(0,L.jsxs)(`code`,{className:Z,children:[`fetch(url, `,`{ signal }`,`)`]}),` the same way):`]}),(0,L.jsx)(j,{language:`tsx`,className:$,children:`const validateUsername: FieldValidator<SignupValues, 'username'> = async (
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
/>`}),(0,L.jsxs)(`p`,{className:X,children:[`Keep typing in the demo's Username field: each debounced round issues a check, and the next keystroke aborts the previous one — the issued/cancelled counters below the form count exactly that. Because superseded validators resolve`,` `,(0,L.jsx)(`code`,{className:Z,children:`undefined`}),` instead of rejecting, cancelled checks stay invisible to both the form state and the console.`]})]}),(0,L.jsxs)(`div`,{className:F,children:[(0,L.jsx)(`h2`,{children:`CRUD table — FormItem × DataTable server mode × Toast`}),(0,L.jsxs)(`p`,{className:X,children:[`The classic admin screen, assembled from the pieces the recipes above introduced: a`,` `,(0,L.jsx)(`code`,{className:Z,children:`DataTable`}),` in`,` `,(0,L.jsx)(`code`,{className:Z,children:`manual`}),` mode talking to a (fake) server — pagination and sorting are the server's job, the table just renders what arrives — plus a`,` `,(0,L.jsx)(`code`,{className:Z,children:`FormItem`}),` dialog for create/edit, a `,(0,L.jsx)(`code`,{className:Z,children:`ConfirmDialog`}),` `,`for delete, and `,(0,L.jsx)(`code`,{className:Z,children:`useToast`}),` `,`feedback after every mutation. Everything below is live: search, click a sort header, page around, edit a member, delete one on the last page and watch the footer clamp.`]}),(0,L.jsx)(`h3`,{children:`Live demo`}),(0,L.jsx)(at,{}),(0,L.jsx)(`h3`,{children:`The server contract`}),(0,L.jsxs)(`p`,{className:X,children:[(0,L.jsx)(`code`,{className:Z,children:`manual`}),` hands pagination and sorting to the server: the table renders`,` `,(0,L.jsx)(`code`,{className:Z,children:`data`}),` exactly as fetched — no local reordering, no page slicing — while sort-header clicks still toggle `,(0,L.jsx)(`code`,{className:Z,children:`sorting`}),` (and`,` `,(0,L.jsx)(`code`,{className:Z,children:`aria-sort`}),`) and the footer still tracks `,(0,L.jsx)(`code`,{className:Z,children:`page`}),`. You observe both through the callbacks and refetch:`]}),(0,L.jsx)(j,{language:`tsx`,className:$,children:`const [page, setPage] = useState(1);
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
/>`}),(0,L.jsxs)(`p`,{className:X,children:[`The demo keeps the last answer in a`,` `,(0,L.jsx)(`code`,{className:Z,children:`snapshot`}),` and derives`,` `,(0,L.jsx)(`code`,{className:Z,children:`loading`}),` from “snapshot lags the request” — no synchronous state writes inside the fetch effect, so React 19 transitions and StrictMode both stay quiet. Mutations bump a `,(0,L.jsx)(`code`,{className:Z,children:`reloadKey`}),` `,`that joins the request key, which is also how a create can force`,` `,(0,L.jsx)(`code`,{className:Z,children:`setPage(1)`}),` while a delete only clamps the page when the last one emptied.`]}),(0,L.jsx)(`h3`,{children:`The dialog form`}),(0,L.jsxs)(`p`,{className:X,children:[`One `,(0,L.jsx)(`code`,{className:Z,children:`MemberForm`}),` serves create and edit: the parent remounts it with`,` `,(0,L.jsx)(`code`,{className:Z,children:`key`}),` on every open, so`,` `,(0,L.jsx)(`code`,{className:Z,children:`initialValues`}),` alone loads the record — no reset plumbing. The`,` `,(0,L.jsx)(`code`,{className:Z,children:`input`}),` channel binds the cores (`,(0,L.jsx)(`code`,{className:Z,children:`InputCore`}),`,`,` `,(0,L.jsx)(`code`,{className:Z,children:`SelectCore`}),` +`,` `,(0,L.jsx)(`code`,{className:Z,children:`Option`}),` children) and FormItem wires id, aria attributes,`,` `,(0,L.jsx)(`code`,{className:Z,children:`onBlur`}),`,`,` `,(0,L.jsx)(`code`,{className:Z,children:`onChange`}),` and the value itself; validation is the same`,` `,(0,L.jsx)(`code`,{className:Z,children:`zodResolver`}),` per-field schema pattern from the recipe above. The dialog's`,` `,(0,L.jsx)(`code`,{className:Z,children:`open`}),` travels through a`,` `,(0,L.jsx)(`code`,{className:Z,children:`useControl`}),` Control — a plain boolean would be an uncontrolled`,` `,(0,L.jsx)(`em`,{children:`initial`}),` value and the dialog would never reopen.`]}),(0,L.jsx)(`h3`,{children:`The whole file`}),(0,L.jsxs)(`p`,{className:X,children:[`This is the real source powering the demo — fake server, form, screen and layout, nothing elided. Swap the server bodies for`,` `,(0,L.jsx)(`code`,{className:Z,children:`fetch()`}),` calls and it is a production CRUD screen:`]}),(0,L.jsx)(j,{language:`tsx`,className:$,children:gt})]}),(0,L.jsxs)(`div`,{className:F,children:[(0,L.jsx)(`h2`,{children:`Adding a locale — custom copy & RTL`}),(0,L.jsxs)(`p`,{className:X,children:[`Every user-visible literal in haze-ui flows through`,` `,(0,L.jsx)(`code`,{className:Z,children:`useStrings`}),`, so copy lives in one place per language:`,` `,(0,L.jsx)(`code`,{className:Z,children:`HazeStrings`}),`, a section-per-component map derived from the English`,` `,(0,L.jsx)(`code`,{className:Z,children:`defaultStrings`}),`. You can reword individual messages, mount whole packs, and contribute new languages back — the demo below switches between all three modes, including an RTL tag.`]}),(0,L.jsx)(`h3`,{children:`Live demo`}),(0,L.jsx)(`div`,{className:_t,children:(0,L.jsx)(Lt,{})}),(0,L.jsxs)(`p`,{className:Q,children:[`Switch to العربية: the tag `,(0,L.jsx)(`code`,{className:Z,children:`ar-EG`}),` `,`derives direction `,(0,L.jsx)(`code`,{className:Z,children:`rtl`}),` (shown by the probe), and the Arabic copy renders mirrored because the demo — not the library — set `,(0,L.jsx)(`code`,{className:Z,children:`dir`}),` on the column. Remove a tag in any language and watch the`,` `,(0,L.jsx)(`code`,{className:Z,children:`{count}`}),` placeholder expand.`]}),(0,L.jsx)(`h3`,{children:`The packs`}),(0,L.jsxs)(`p`,{className:X,children:[`The demo is powered by the real module below:`,` `,(0,L.jsx)(`code`,{className:Z,children:`createStrings`}),` merges a partial override onto a base pack and returns a complete`,` `,(0,L.jsx)(`code`,{className:Z,children:`HazeStrings`}),`, so a derived pack never forks the literals it does not touch. A full pack also satisfies the provider's partial`,` `,(0,L.jsx)(`code`,{className:Z,children:`strings`}),` shape:`]}),(0,L.jsx)(j,{language:`ts`,className:$,children:pt}),(0,L.jsx)(`h3`,{children:`Partial overrides without a pack`}),(0,L.jsxs)(`p`,{className:X,children:[`For one-off rewording you do not need`,` `,(0,L.jsx)(`code`,{className:Z,children:`createStrings`}),` at all — the`,` `,(0,L.jsx)(`code`,{className:Z,children:`strings`}),` prop is already a deep partial (`,(0,L.jsx)(`code`,{className:Z,children:`HazeStringsOverrides`}),`). Use `,(0,L.jsx)(`code`,{className:Z,children:`createStrings`}),` when you need the resolved pack as a `,(0,L.jsx)(`em`,{children:`value`}),`: deriving`,` `,(0,L.jsx)(`code`,{className:Z,children:`zhCN`}),` with your terminology, sharing one customized pack across providers, or handing it to non-React code:`]}),(0,L.jsx)(j,{language:`tsx`,className:$,children:`// one message, everything else keeps the pack copy
<LocaleProvider strings={{ pagination: { previous: '‹ Précédent' } }}>
  <Pagination total={40} />
</LocaleProvider>
// or derive a complete pack once at module scope and reuse it
const branded = createStrings(zhCN, {
  confirmDialog: { confirm: '好的', cancel: '先不了' },
});
<LocaleProvider locale="zh-CN" strings={branded}>…</LocaleProvider>`}),(0,L.jsx)(`h3`,{children:`Authoring a complete language pack`}),(0,L.jsxs)(`p`,{className:X,children:[`A full pack is a plain `,(0,L.jsx)(`code`,{className:Z,children:`const`}),` `,`annotated `,(0,L.jsx)(`code`,{className:Z,children:`HazeStrings`}),` — the annotation is the contract: TypeScript fails the build the moment either side drifts (a missing key, an extra key, a renamed section). Start by copying`,` `,(0,L.jsx)(`code`,{className:Z,children:`defaultStrings`}),` from`,` `,(0,L.jsx)(`code`,{className:Z,children:`src/lib/components/LocaleProvider/locale.ts`}),` `,`as the translation baseline, and keep`,` `,(0,L.jsx)(`code`,{className:Z,children:`{name}`}),` placeholders verbatim — they are expanded at runtime and unknown placeholders are left as-is, never blanked. This is exactly how the bundled`,` `,(0,L.jsx)(`code`,{className:Z,children:`zhCN`}),` pack is written:`]}),(0,L.jsx)(j,{language:`ts`,className:$,children:`import type { HazeStrings } from 'haze-ui';
const frFR: HazeStrings = {
  alert: { close: 'Fermer' },
  approvalCard: { title: 'Approbation requise', approve: 'Approuver', deny: 'Refuser' },
  asyncSection: { loading: 'Chargement…', error: 'Une erreur est survenue', retry: 'Réessayer' },
  avatarGroup: { more: '+{count}' },          // placeholders survive translation verbatim
  // …every section of defaultStrings, 1:1 — the type enforces it
};
<LocaleProvider locale="fr-FR" strings={frFR}>…</LocaleProvider>`}),(0,L.jsx)(`h3`,{children:`RTL: declared direction vs derived direction`}),(0,L.jsxs)(`p`,{className:X,children:[(0,L.jsx)(`code`,{className:Z,children:`LocaleProvider`}),` accepts an explicit `,(0,L.jsx)(`code`,{className:Z,children:`direction`}),` prop, and when nobody declares one it derives the direction from the locale: the primary subtag is matched against the RTL language list —`,` `,(0,L.jsx)(`code`,{className:Z,children:`ar, he, fa, ur, ps, sd, ug, yi, dv, ckb, ku, iw`}),` `,`(the last is the legacy Hebrew tag; Latin-script Kurdish stays ltr — declare a direction explicitly then). The provider never writes a`,` `,(0,L.jsx)(`code`,{className:Z,children:`dir`}),` attribute: setting the document's direction is the app's job. The library only consumes the value through two exported helpers:`]}),(0,L.jsx)(j,{language:`tsx`,className:$,children:`import { LocaleProvider, useDirection, localeDirection } from 'haze-ui';
// declared intent for render-time decisions (falls back to the document)
useDirection(); // 'rtl' under <LocaleProvider locale="ar-EG">
// pure helper: the direction a BCP 47 tag implies
localeDirection('ar-EG'); // 'rtl'
localeDirection('he-IL'); // 'rtl'
localeDirection('fr-FR'); // 'ltr'
// explicit beats derivation, and survives nested locale-only providers
<LocaleProvider locale="ar-EG" direction="ltr">…</LocaleProvider>`}),(0,L.jsxs)(`p`,{className:X,children:[`For interaction-time code (arrow-key mirroring, JS-assisted placement) the library reads layout truth from the DOM via`,` `,(0,L.jsx)(`code`,{className:Z,children:`getDirection(element)`}),` — the nearest `,(0,L.jsx)(`code`,{className:Z,children:`[dir]`}),` ancestor — so mirrored behavior follows what the user actually sees, whatever the provider declared.`]}),(0,L.jsx)(`h3`,{children:`Contributing a pack upstream`}),(0,L.jsxs)(`p`,{className:X,children:[`New languages are merged the same way`,` `,(0,L.jsx)(`code`,{className:Z,children:`zhCN`}),` was: copy`,` `,(0,L.jsx)(`code`,{className:Z,children:`defaultStrings`}),` as the baseline, translate it (keys 1:1, placeholders verbatim), and open a PR adding`,` `,(0,L.jsx)(`code`,{className:Z,children:`src/lib/components/LocaleProvider/<tag>.ts`}),` `,`following the `,(0,L.jsx)(`code`,{className:Z,children:`zh-cn.ts`}),` file layout. The maintainer-side step is registering the tag mapping in`,` `,(0,L.jsx)(`code`,{className:Z,children:`useStrings'`}),` pack resolution, after which`,` `,(0,L.jsx)(`code`,{className:Z,children:`locale="fr-FR"`}),` selects the pack automatically for every consumer — no`,` `,(0,L.jsx)(`code`,{className:Z,children:`strings`}),` prop needed.`]})]}),(0,L.jsxs)(`div`,{className:F,children:[(0,L.jsx)(`h2`,{children:`AI runtime integration — Vercel AI SDK useChat × agent components`}),(0,L.jsxs)(`p`,{className:X,children:[`haze-ui's agent surface is deliberately presentational:`,` `,(0,L.jsx)(`code`,{className:Z,children:`ChatContainer`}),` owns scrolling,`,` `,(0,L.jsx)(`code`,{className:Z,children:`ChatMessage`}),` the bubbles,`,` `,(0,L.jsx)(`code`,{className:Z,children:`StreamingText`}),` the typewriter reveal, `,(0,L.jsx)(`code`,{className:Z,children:`ToolCallCard`}),` tool input/output, `,(0,L.jsx)(`code`,{className:Z,children:`ThinkingIndicator`}),` `,`the waiting dots, `,(0,L.jsx)(`code`,{className:Z,children:`ChatInput`}),` the composer. The Vercel AI SDK's`,` `,(0,L.jsx)(`code`,{className:Z,children:`useChat`}),` is the stateful half: it owns `,(0,L.jsx)(`code`,{className:Z,children:`messages`}),` (a`,` `,(0,L.jsx)(`code`,{className:Z,children:`UIMessage[]`}),` of typed`,` `,(0,L.jsx)(`code`,{className:Z,children:`parts`}),`),`,` `,(0,L.jsx)(`code`,{className:Z,children:`status`}),` (`,(0,L.jsx)(`code`,{className:Z,children:`submitted | streaming | ready | error`}),`) and the `,(0,L.jsx)(`code`,{className:Z,children:`sendMessage`}),`/`,(0,L.jsx)(`code`,{className:Z,children:`stop`}),` pair. One small adapter bridges them — pure functions over duck-typed shapes, so the`,` `,(0,L.jsx)(`code`,{className:Z,children:`ai`}),` package never enters your dependency tree through haze-ui.`]}),(0,L.jsx)(`h3`,{children:`Live demo`}),(0,L.jsxs)(`p`,{className:X,children:[`The chat below runs the exact adapter shown further down, fed by a mock `,(0,L.jsx)(`code`,{className:Z,children:`useChat`}),` — same return shape, timers instead of a transport. Ask about CSS to see reasoning → tool call → streamed answer → source link; ask for an error to see the failure path; hit Stop mid-run to see the finalize-on-abort behavior.`]}),(0,L.jsx)(Rt,{}),(0,L.jsx)(`h3`,{children:`The adapter`}),(0,L.jsxs)(`p`,{className:X,children:[`The whole integration is two exports —`,` `,(0,L.jsx)(`code`,{className:Z,children:`renderUIMessages`}),` (a pure`,` `,(0,L.jsx)(`code`,{className:Z,children:`parts → ReactNode[]`}),` mapping, never throws on odd payloads) and`,` `,(0,L.jsx)(`code`,{className:Z,children:`useHazeChat`}),` (the thin hook that memoizes it and wires the composer). This is the real source powering the demo — swap `,(0,L.jsx)(`code`,{className:Z,children:`@/lib`}),` `,`for `,(0,L.jsx)(`code`,{className:Z,children:`haze-ui`}),` in your app:`]}),(0,L.jsx)(j,{language:`tsx`,className:$,children:mt}),(0,L.jsx)(`h3`,{children:`With a real useChat`}),(0,L.jsxs)(`p`,{className:X,children:[`Drop the adapter next to your chat route and the wiring is four lines. Both SDK generations work: the hook prefers v5's`,` `,(0,L.jsxs)(`code`,{className:Z,children:[`sendMessage(`,`{ text }`,`)`]}),` and falls back to v4's`,` `,(0,L.jsxs)(`code`,{className:Z,children:[`append(`,`{ role, content }`,`)`]}),`:`]}),(0,L.jsx)(j,{language:`tsx`,className:$,children:`import { useChat } from '@ai-sdk/react';
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
}`}),(0,L.jsx)(`h3`,{children:`Mapping rules`}),(0,L.jsx)(`p`,{className:X,children:`The status → presentation contract the adapter implements:`}),(0,L.jsx)(j,{language:`text`,className:$,children:`UIMessage                    → ChatMessage bubble (role; user msg 'sending' while submitted)
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
status error                 → system ChatMessage with the transport error`}),(0,L.jsx)(`h3`,{children:`The mock (what the demo runs)`}),(0,L.jsxs)(`p`,{className:X,children:[`The demo's streaming source — same shape a real`,` `,(0,L.jsx)(`code`,{className:Z,children:`useChat`}),` returns, scripted with`,` `,(0,L.jsx)(`code`,{className:Z,children:`setTimeout`}),`. Useful as a fixture for your own tests, too:`]}),(0,L.jsx)(j,{language:`ts`,className:$,children:ht}),(0,L.jsx)(`h3`,{children:`Known limits`}),(0,L.jsxs)(`ul`,{className:X,children:[(0,L.jsxs)(`li`,{children:[(0,L.jsx)(`strong`,{children:`Streaming text cadence.`}),` `,(0,L.jsx)(`code`,{className:Z,children:`StreamingText`}),` reveals its whole `,(0,L.jsx)(`code`,{className:Z,children:`text`}),` once and restarts the reveal whenever the prop `,(0,L.jsx)(`em`,{children:`grows`}),` — it fits parts that arrive whole (batched transports, the demo's mock) but not char-by-char deltas. If your transport grows text parts incrementally, render the plain block while`,` `,(0,L.jsx)(`code`,{className:Z,children:`state === 'streaming'`}),` `,`instead (one-line change in`,` `,(0,L.jsx)(`code`,{className:Z,children:`renderPart`}),`).`]}),(0,L.jsxs)(`li`,{children:[(0,L.jsx)(`strong`,{children:`Attachments, files, data parts.`}),` `,(0,L.jsx)(`code`,{className:Z,children:`file`}),`/`,` `,(0,L.jsx)(`code`,{className:Z,children:`data-*`}),` parts are skipped;`,(0,L.jsx)(`code`,{className:Z,children:`ChatInput`}),` is text-only in this version. Extend `,(0,L.jsx)(`code`,{className:Z,children:`renderPart`}),` `,`with your own branch when you need them.`]}),(0,L.jsxs)(`li`,{children:[(0,L.jsx)(`strong`,{children:`Branching, regeneration, voice.`}),` `,(0,L.jsx)(`code`,{className:Z,children:`branchNumber`}),`,`,` `,(0,L.jsx)(`code`,{className:Z,children:`regenerate`}),`, and speech parts are out of scope here; the adapter renders whichever branch the SDK exposes in `,(0,L.jsx)(`code`,{className:Z,children:`messages`}),`.`]}),(0,L.jsxs)(`li`,{children:[(0,L.jsx)(`strong`,{children:`v4 string content.`}),` Messages that predate the parts API (`,(0,L.jsx)(`code`,{className:Z,children:`content: string`}),`) render as empty bubbles — convert to parts, or map`,` `,(0,L.jsx)(`code`,{className:Z,children:`content`}),` to a synthetic text part first.`]})]})]})]})}export{zt as default};