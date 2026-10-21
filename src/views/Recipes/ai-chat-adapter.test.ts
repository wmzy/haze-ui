import type { ReactElement, ReactNode } from 'react';

import { createElement } from 'react';

import { act, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

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

import { renderUIMessages, useHazeChat } from './ai-chat-adapter';
import { useMockChat } from './mock-use-chat';

// ─── fixtures ──────────────────────────────────────────────────────────

const text = (t: string, state?: 'streaming' | 'done') => ({
  type: 'text',
  text: t,
  ...(state ? { state } : {}),
});
const msg = (role: string, parts: unknown[], id = `m-${role}`) => ({ id, role, parts });

/** React 19 types element props as `unknown` — assert through a loose record. */
type El = ReactElement<Record<string, unknown>>;
const el = (node: ReactNode): El => node as El;
/** First child element of a rendered ChatMessage's children. */
const firstBody = (messageNode: ReactNode): El => {
  const children = el(messageNode).props.children as ReactNode;
  return el((Array.isArray(children) ? children[0] : children) as ReactNode);
};
const bodyOf = (messageNode: ReactNode): El[] =>
  el(messageNode).props.children as El[];

// ---------------------------------------------------------------------------
// Native popover API tier: jsdom ships no popover machinery, so the minimal
// surface the floating engine relies on is mocked here (same approach as
// Popover.test.tsx / InlineCitation.test.tsx) to exercise the native path.
// ---------------------------------------------------------------------------

class ToggleEventPolyfill extends Event {
  newState: string;
  constructor(type: string, init: { newState: string }) {
    super(type);
    this.newState = init.newState;
  }
}

const showPopoverMock = vi.fn(function (this: HTMLElement) {
  this.setAttribute('data-popover-open', '');
  this.dispatchEvent(new ToggleEventPolyfill('toggle', { newState: 'open' }));
});

const hidePopoverMock = vi.fn(function (this: HTMLElement) {
  if (!this.hasAttribute('data-popover-open')) return;
  this.removeAttribute('data-popover-open');
  this.dispatchEvent(new ToggleEventPolyfill('toggle', { newState: 'closed' }));
});

type PopoverProtoPatch = {
  popover?: unknown;
  showPopover?: () => void;
  hidePopover?: () => void;
};

function installNativePopover() {
  Object.defineProperty(HTMLElement.prototype, 'popover', {
    configurable: true,
    value: 'manual',
  });
  HTMLElement.prototype.showPopover = showPopoverMock;
  HTMLElement.prototype.hidePopover = hidePopoverMock;
}

function removeNativePopover() {
  const proto = HTMLElement.prototype as PopoverProtoPatch;
  delete proto.popover;
  delete proto.showPopover;
  delete proto.hidePopover;
}

// ─── text parts → messages ─────────────────────────────────────────────

describe('renderUIMessages', () => {
  it('maps text parts to ChatMessage bubbles with role and content', () => {
    const nodes = renderUIMessages({
      status: 'ready',
      messages: [msg('user', [text('Hello')]), msg('assistant', [text('Hi there', 'done')])],
    });

    expect(nodes).toHaveLength(2);
    const userNode = el(nodes[0]);
    const assistantNode = el(nodes[1]);
    expect(userNode.type).toBe(ChatMessage);
    expect(userNode.props.role).toBe('user');
    expect(firstBody(nodes[0]).props.children).toBe('Hello');
    // settled runs mark user messages as sent
    expect(userNode.props.status).toBe('sent');
    expect(assistantNode.props.role).toBe('assistant');
    expect(firstBody(nodes[1]).props.children).toBe('Hi there');
  });

  it('defaults unknown roles to assistant', () => {
    const nodes = renderUIMessages({
      status: 'ready',
      messages: [msg('tool', [text('??')])],
    });
    expect(el(nodes[0]).props.role).toBe('assistant');
  });

  it('renders the trailing streaming text part through StreamingText, settled parts as plain blocks', () => {
    const streaming = renderUIMessages({
      status: 'streaming',
      messages: [msg('assistant', [text('The answer, typed out', 'streaming')])],
    });
    const streamEl = firstBody(streaming[0]);
    expect(streamEl.type).toBe(StreamingText);
    expect(streamEl.props.text).toBe('The answer, typed out');

    const settled = renderUIMessages({
      status: 'ready',
      messages: [msg('assistant', [text('The answer, typed out', 'streaming')])],
    });
    const plainEl = firstBody(settled[0]);
    expect(plainEl.type).toBe('div');
    expect(plainEl.props.children).toBe('The answer, typed out');
  });

  // ─── tool parts → ToolCallCard ─────────────────────────────────────

  it('maps v5 tool parts to ToolCallCard across the state lifecycle', () => {
    const card = (states: string[], extra: Record<string, unknown> = {}) =>
      firstBody(
        renderUIMessages({
          status: 'streaming',
          messages: [msg('assistant', [{ type: 'tool-getWeather', toolCallId: 'c1', states, ...extra }])],
        })[0]
      );

    expect(card(['input-streaming']).props.status).toBe('running');
    expect(card(['input-available'], { input: { city: 'Oslo' } }).props.status).toBe('running');
    const withInput = card(['input-available'], { input: { city: 'Oslo' } });
    expect(withInput.props.name).toBe('getWeather');
    expect(withInput.props.input).toBe('{\n  "city": "Oslo"\n}');

    const done = card(['output-available'], {
      input: { city: 'Oslo' },
      output: { temp: 21 },
    });
    expect(done.props.status).toBe('done');
    expect(done.props.output).toBe('{\n  "temp": 21\n}');

    expect(card(['output-error']).props.status).toBe('error');
    // unknown/absent states → pending
    expect(card([]).props.status).toBe('pending');
  });

  it('folds a v4 tool-result into its tool-call card, matched by toolCallId', () => {
    const nodes = renderUIMessages({
      status: 'ready',
      messages: [
        msg('assistant', [
          { type: 'tool-call', toolCallId: 'c9', toolName: 'searchDocs', args: { q: 'css' } },
          { type: 'tool-result', toolCallId: 'c9', result: { hits: 3 } },
        ]),
      ],
    });
    const body = bodyOf(nodes[0]);
    expect(body).toHaveLength(1); // two parts, one card
    expect(body[0]!.type).toBe(ToolCallCard);
    expect(body[0]!.props.name).toBe('searchDocs');
    expect(body[0]!.props.input).toContain('"q": "css"');
    expect(body[0]!.props.output).toContain('"hits": 3');
    expect(body[0]!.props.status).toBe('done');
  });

  it('keeps a result-less v4 tool-call running; flags isError results; renders orphan results standalone', () => {
    const pending = renderUIMessages({
      status: 'streaming',
      messages: [msg('assistant', [{ type: 'tool-call', toolCallId: 'c2', toolName: 'run', args: 'ls' }])],
    });
    const pendingCard = firstBody(pending[0]);
    expect(pendingCard.props.status).toBe('running');
    expect(pendingCard.props.input).toBe('ls');
    expect(pendingCard.props.output).toBeUndefined();

    const failed = renderUIMessages({
      status: 'ready',
      messages: [
        msg('assistant', [
          { type: 'tool-call', toolCallId: 'c3', toolName: 'run' },
          { type: 'tool-result', toolCallId: 'c3', result: 'exit 1', isError: true },
        ]),
      ],
    });
    expect(firstBody(failed[0]).props.status).toBe('error');

    const orphan = renderUIMessages({
      status: 'ready',
      messages: [msg('assistant', [{ type: 'tool-result', toolCallId: 'c4', result: 'late' }])],
    });
    const orphanCard = firstBody(orphan[0]);
    expect(orphanCard.type).toBe(ToolCallCard);
    expect(orphanCard.props.output).toBe('late');
    expect(orphanCard.props.status).toBe('done');
  });

  // ─── reasoning → ThinkingIndicator / StepTimeline ─────────────────

  it('shows ThinkingIndicator while reasoning streams with no text, then a collapsible StepTimeline transcript', () => {
    const pending = renderUIMessages({
      status: 'streaming',
      messages: [msg('assistant', [{ type: 'reasoning', text: '', state: 'streaming' }])],
    });
    expect(firstBody(pending[0]).type).toBe(ThinkingIndicator);

    // Text landing mid-stream upgrades the dots to a running row.
    const running = renderUIMessages({
      status: 'streaming',
      messages: [msg('assistant', [{ type: 'reasoning', text: 'Hmm…', state: 'streaming' }])],
    });
    const runningItem = el(firstBody(running[0]).props.children as ReactNode);
    expect(firstBody(running[0]).type).toBe(StepTimeline);
    expect(runningItem.type).toBe(StepTimelineItem);
    expect(runningItem.props.status).toBe('running');
    expect(runningItem.props.label).toBe('Thought process');
    expect(runningItem.props.collapsible).toBe(true);
    expect(runningItem.props.time).toBeUndefined();

    // Settled → done row with the provider-reported thinking time.
    const done = renderUIMessages({
      status: 'ready',
      messages: [
        msg('assistant', [
          {
            type: 'reasoning',
            text: 'Thought it through.',
            state: 'done',
            providerMetadata: { anthropic: { duration: 1240 } },
          },
        ]),
      ],
    });
    const doneItem = el(firstBody(done[0]).props.children as ReactNode);
    expect(doneItem.props.status).toBe('done');
    expect(doneItem.props.time).toBe('1.2s');
    expect(el(doneItem.props.content as ReactNode).props.children).toBe('Thought it through.');
  });

  it('formats reasoning durations from either ai-sdk providerMetadata or ag-ui top-level duration', () => {
    const item = (part: Record<string, unknown>): El => {
      const nodes = renderUIMessages({ status: 'ready', messages: [msg('assistant', [part])] });
      return el(firstBody(nodes[0]).props.children as ReactNode);
    };
    expect(item({ type: 'reasoning', text: 'a', state: 'done', duration: 900 }).props.time).toBe('900ms');
    expect(item({ type: 'reasoning', text: 'a', state: 'done', duration: 2050 }).props.time).toBe('2.1s');
    // absurd / absent values render no time at all
    expect(item({ type: 'reasoning', text: 'a', state: 'done', duration: -5 }).props.time).toBeUndefined();
    expect(item({ type: 'reasoning', text: 'a', state: 'done', providerMetadata: { x: { duration: 0 } } }).props.time).toBeUndefined();
  });

  // ─── status → in-flight presentation ───────────────────────────────

  it('marks the in-flight user message sending and appends waiting dots while submitted', () => {
    const nodes = renderUIMessages({
      status: 'submitted',
      messages: [msg('user', [text('ping')])],
    });
    expect(nodes).toHaveLength(2);
    expect(el(nodes[0]).props.status).toBe('sending');
    expect(el(nodes[1]).type).toBe(ThinkingIndicator);
  });

  it('renders waiting dots inside the bubble for a part-less assistant message', () => {
    const nodes = renderUIMessages({
      status: 'streaming',
      messages: [msg('user', [text('ping')]), msg('assistant', [], 'a0')],
    });
    const assistant = el(nodes[1]);
    expect(assistant.props.role).toBe('assistant');
    expect(el(assistant.props.children as ReactNode).type).toBe(ThinkingIndicator);
  });

  it('renders transport errors as a system bubble', () => {
    const nodes = renderUIMessages({
      status: 'error',
      messages: [msg('user', [text('ping')])],
      error: new Error('socket closed'),
    });
    const last = el(nodes[nodes.length - 1]);
    expect(last.type).toBe(ChatMessage);
    expect(last.props.role).toBe('system');
    expect(last.props.children).toBe('socket closed');

    const fallback = renderUIMessages({ status: 'error', messages: [], error: undefined });
    expect(el(fallback[0]).props.children).toBe('Something went wrong.');
  });

  it('maps source parts to a numbered InlineCitation strip under the message text', () => {
    const nodes = renderUIMessages({
      status: 'ready',
      messages: [
        msg('assistant', [
          text('Answer with two sources.'),
          { type: 'source', source: { url: 'https://example.com/a', title: 'A doc', snippet: 'From A.' } },
          { type: 'source-url', url: 'https://example.com/b' }, // ai-sdk v5 shape
          { type: 'source', source: { title: 'no url — skipped' } },
        ]),
      ],
    });
    const body = bodyOf(nodes[0]);
    expect(body).toHaveLength(2); // text block + citation strip
    const strip = body[1]!;
    expect(strip.type).toBe('div');
    const badges = strip.props.children as El[];
    expect(badges).toHaveLength(2);
    expect(badges[0]!.type).toBe(InlineCitation);
    expect(badges[0]!.props.index).toBe(1); // numbered in part order
    expect(badges[0]!.props.href).toBe('https://example.com/a');
    expect(badges[0]!.props.title).toBe('A doc');
    expect(badges[0]!.props.snippet).toBe('From A.');
    expect(badges[1]!.props.index).toBe(2);
    expect(badges[1]!.props.href).toBe('https://example.com/b');
    expect(badges[1]!.props.title).toBe('https://example.com/b'); // falls back to the url
  });

  it('opens the citation source card from the strip on the native popover tier', async () => {
    installNativePopover();
    try {
      const nodes = renderUIMessages({
        status: 'ready',
        messages: [
          msg('assistant', [
            text('Cited claim.'),
            { type: 'source', source: { url: 'https://example.com/a', title: 'A doc', snippet: 'From A.' } },
          ]),
        ],
      });
      render(createElement('div', null, nodes));
      const badge = screen.getByRole('button', { name: '[1]' });
      await userEvent.setup().click(badge);
      expect(badge).toHaveAttribute('aria-expanded', 'true');
      const panel = document.getElementById(badge.getAttribute('aria-controls')!)!;
      expect(within(panel).getByText('A doc')).toBeInTheDocument();
      expect(within(panel).getByText('From A.')).toBeInTheDocument();
      // jsdom's UA sheet keeps [popover] display:none (:popover-open is
      // unknowable to it), so the link is "hidden" to the a11y tree here.
      expect(within(panel).getByRole('link', { name: 'A doc', hidden: true })).toHaveAttribute(
        'href',
        'https://example.com/a'
      );
      await userEvent.setup().click(badge); // leave the panel closed
      expect(badge).toHaveAttribute('aria-expanded', 'false');
    } finally {
      removeNativePopover();
    }
  });

  // ─── data-plan → Plan ─────────────────────────────────────────────

  it('maps data-plan parts to a Plan tree with normalized step statuses', () => {
    const nodes = renderUIMessages({
      status: 'streaming',
      messages: [
        msg('assistant', [
          {
            type: 'data-plan',
            id: 'p1',
            data: {
              state: 'active',
              steps: [
                { id: 's1', label: 'Search docs', status: 'completed' },
                { id: 's2', title: 'Read results', status: 'in progress', description: 'skimming' },
                { status: 'queued' }, // no label → positional fallback
              ],
            },
          },
        ]),
      ],
    });
    const plan = firstBody(nodes[0]);
    expect(plan.type).toBe(Plan);
    expect(plan.props.title).toBe('Plan');
    const items = plan.props.children as El[];
    expect(items).toHaveLength(3);
    expect(items[0]!.type).toBe(PlanItem);
    expect(items[0]!.props.label).toBe('Search docs');
    expect(items[0]!.props.status).toBe('done');
    expect(items[1]!.props.status).toBe('active');
    expect(items[1]!.props.label).toBe('Read results');
    expect(items[1]!.props.description).toBe('skimming');
    expect(items[2]!.props.status).toBe('pending');
    expect(items[2]!.props.label).toBe('Step 3');
  });

  it('lets Plan compute the progress summary from the mapped item statuses', () => {
    const nodes = renderUIMessages({
      status: 'ready',
      messages: [
        msg('assistant', [
          {
            type: 'data-plan',
            data: {
              state: 'active',
              steps: [
                { label: 'One', status: 'done' },
                { label: 'Two', status: 'in_progress' },
                { label: 'Three', status: 'pending' },
              ],
            },
          },
        ]),
      ],
    });
    const { container } = render(createElement('div', null, nodes));
    expect(container.querySelector('[data-slot="plan-summary"]')).toHaveTextContent('1 / 3');
    const bar = container.querySelector('[data-slot="plan-progress"]');
    expect(bar).toHaveAttribute('aria-valuenow', '1');
    expect(bar).toHaveAttribute('aria-valuemax', '3');
  });

  // ─── data-queue → Queue ───────────────────────────────────────────

  it('maps data-queue parts to Queue items and wires remove to onQueueRemove', async () => {
    const onQueueRemove = vi.fn();
    const nodes = renderUIMessages(
      {
        status: 'ready',
        messages: [
          msg('assistant', [
            {
              type: 'data-queue',
              id: 'q1',
              data: {
                items: [
                  { id: 'i1', title: 'Emit file', status: 'sending' },
                  { id: 'i2', title: 'Purge cache', status: 'failed', description: '403' },
                ],
              },
            },
          ]),
        ],
      },
      { onQueueRemove }
    );
    const queue = firstBody(nodes[0]);
    expect(queue.type).toBe(Queue);
    const items = queue.props.children as El[];
    expect(items).toHaveLength(2);
    expect(items[0]!.type).toBe(QueueItem);
    expect(items[0]!.props.title).toBe('Emit file');
    expect(items[0]!.props.status).toBe('sending');
    expect(items[1]!.props.status).toBe('failed');
    expect(items[1]!.props.description).toBe('403');

    const { container } = render(createElement('div', null, nodes));
    await userEvent.setup().click(screen.getByRole('button', { name: 'Remove Purge cache' }));
    expect(onQueueRemove).toHaveBeenCalledExactlyOnceWith('q1', 'i2');
    expect(container.querySelector('[data-slot="queue-remove-button"]')).toBeInTheDocument();
  });

  it('renders queue items without remove buttons when no callback is provided', () => {
    const nodes = renderUIMessages({
      status: 'ready',
      messages: [
        msg('assistant', [
          { type: 'data-queue', data: { items: [{ id: 'i1', title: 'Emit file', status: 'queued' }] } },
        ]),
      ],
    });
    const items = firstBody(nodes[0]).props.children as El[];
    expect(items[0]!.props.status).toBe('queued');
    const { container } = render(createElement('div', null, nodes));
    expect(container.querySelector('[data-slot="queue-remove-button"]')).toBeNull();
  });

  // ─── accessibility ─────────────────────────────────────────────────

  it('renders the full agentic transcript with no axe violations', async () => {
    const { axe } = await import('jest-axe');
    const nodes = renderUIMessages(
      {
        status: 'ready',
        messages: [
          msg('user', [text('How does haze-ui ship CSS?')]),
          msg(
            'assistant',
            [
              {
                type: 'reasoning',
                text: 'Checking the docs before answering.',
                state: 'done',
                providerMetadata: { anthropic: { duration: 900 } },
              },
              {
                type: 'data-plan',
                id: 'p1',
                data: {
                  state: 'done',
                  steps: [
                    { label: 'Search docs', status: 'completed' },
                    { label: 'Summarize', status: 'in_progress' },
                  ],
                },
              },
              {
                type: 'tool-searchDocs',
                toolCallId: 'c1',
                states: ['output-available'],
                input: { q: 'css' },
                output: { hits: 2 },
              },
              text('Two loading modes — subpaths and the aggregate.', 'done'),
              { type: 'source', source: { url: 'https://example.com/css', title: 'CSS modes' } },
              {
                type: 'data-queue',
                id: 'q1',
                data: {
                  items: [
                    { id: 'i1', title: 'Emit file', status: 'sending' },
                    { id: 'i2', title: 'Purge cache', status: 'failed' },
                  ],
                },
              },
            ],
            'a1'
          ),
        ],
      },
      { onQueueRemove: (): void => undefined }
    );
    render(createElement('div', null, nodes));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  // ─── tolerance: empty / malformed / hostile ─────────────────────────

  it('returns no nodes for empty or missing conversations', () => {
    expect(renderUIMessages({})).toEqual([]);
    expect(renderUIMessages({ status: 'ready', messages: [] })).toEqual([]);
    expect(renderUIMessages({ status: 'ready', messages: undefined })).toEqual([]);
  });

  it('tolerates messages without parts and skips unknown part types', () => {
    const nodes = renderUIMessages({
      status: 'ready',
      messages: [
        msg('assistant', [
          { type: 'step-start' },
          { type: 'data-progress', data: { p: 1 } },
          { type: 'file' },
          { type: 'text', text: undefined },
          { type: 'text', text: 42 },
          { type: 'text', text: 'kept' },
        ]),
      ],
    });
    expect(nodes).toHaveLength(1);
    expect(bodyOf(nodes[0])).toHaveLength(1);
    expect(firstBody(nodes[0]).props.children).toBe('kept');
  });

  it('never throws on hostile payloads', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() =>
      renderUIMessages({
        status: 'streaming',
        messages: [
          null,
          7,
          'nope',
          msg('assistant', [
            { type: 'text', text: 42 },
            { type: 'tool-', states: 'not-an-array', input: circular },
            { type: 'tool-call', toolName: 9, args: circular, toolCallId: 1 },
            { type: 'source', source: { title: 'no url' } },
            { type: 'source-url', url: 42 },
            { type: 'reasoning', text: {} },
            { type: 'reasoning', text: 'ok', state: 'done', providerMetadata: { weird: { duration: Number.NaN } } },
            { type: 'data-plan', data: 'not-an-object' },
            { type: 'data-plan', data: { steps: 'nope' } },
            { type: 'data-queue', data: { items: [null, 7, 'x'] } },
            null,
          ]),
        ],
      })
    ).not.toThrow();
  });
});

// ─── useHazeChat hook wiring ────────────────────────────────────────────

describe('useHazeChat', () => {
  it('routes sends through v5 sendMessage, else v4 append, trimming blanks', () => {
    const sendMessage = vi.fn();
    const first = renderHook(() => useHazeChat({ messages: [], status: 'ready', sendMessage }));
    act(() => first.result.current.send('  hello  '));
    expect(sendMessage).toHaveBeenCalledWith({ text: 'hello' });

    const append = vi.fn();
    const second = renderHook(() => useHazeChat({ messages: [], status: 'ready', append }));
    act(() => second.result.current.send('hi'));
    expect(append).toHaveBeenCalledWith({ role: 'user', content: 'hi' });
  });

  it('ignores empty sends, derives busy/error, and passes stop through', () => {
    const sendMessage = vi.fn();
    const stop = vi.fn();
    const { result } = renderHook(() =>
      useHazeChat({ messages: [], status: 'streaming', sendMessage, stop })
    );
    expect(result.current.busy).toBe(true);
    expect(result.current.error).toBe(false);
    act(() => result.current.send('   '));
    expect(sendMessage).not.toHaveBeenCalled();
    act(() => result.current.stop());
    expect(stop).toHaveBeenCalledOnce();

    const failed = renderHook(() => useHazeChat({ messages: [], status: 'error' }));
    expect(failed.result.current.busy).toBe(false);
    expect(failed.result.current.error).toBe(true);
  });

  it('returns ready-to-render nodes that track the conversation', () => {
    const { result, rerender } = renderHook(
      ({ messages }: { messages: unknown }) => useHazeChat({ messages, status: 'ready' }),
      { initialProps: { messages: [msg('user', [text('hello')])] } }
    );
    expect(result.current.messages).toHaveLength(1);
    expect(el(result.current.messages[0]).props.role).toBe('user');

    rerender({ messages: [msg('user', [text('hello')]), msg('assistant', [text('hi')])] });
    expect(result.current.messages).toHaveLength(2);
  });
});

// ─── mock script drives the full adapter ────────────────────────────────

describe('useMockChat script', () => {
  it('plays the full agentic part spectrum through the adapter', async () => {
    vi.useFakeTimers();
    try {
      const { result } = renderHook(() => useHazeChat(useMockChat()));
      act(() => result.current.send('css'));
      expect(result.current.busy).toBe(true);

      // Advance until the scripted run settles (reasoning → plan → tool
      // → text reveal → sources → queue → ready).
      await act(async () => {
        for (let i = 0; i < 600 && result.current.busy; i += 1) {
          vi.advanceTimersByTime(100);
        }
        await Promise.resolve();
      });
      expect(result.current.busy).toBe(false);

      // welcome(0) → user(1) → assistant(2); the assistant body covers
      // every agentic mapping the adapter promises.
      const assistant = el(result.current.messages[2]);
      const body = assistant.props.children as El[];
      const bodyParts = body.map((node) => el(node).type);
      expect(bodyParts).toContain(StepTimeline); // reasoning row
      expect(bodyParts).toContain(Plan);
      expect(bodyParts).toContain(ToolCallCard);
      expect(bodyParts).toContain(Queue);

      // The citation strip: two numbered InlineCitation badges, in order.
      const strip = body.find(
        (node) => el(node).type === 'div' && Array.isArray(el(node).props.children)
      );
      expect(strip).toBeDefined();
      const badges = el(strip).props.children as El[];
      expect(badges).toHaveLength(2);
      expect(el(badges[0]).type).toBe(InlineCitation);
      expect(el(badges[0]).props.index).toBe(1);
      expect(el(badges[1]).props.index).toBe(2);

      // The scripted plan finished: every item done, Plan's own count full.
      const planNode = body.find((node) => el(node).type === Plan)!;
      const planItems = el(planNode).props.children as El[];
      expect(planItems.map((item) => item.props.status)).toEqual(['done', 'done', 'done']);

      // The scripted queue ends with one failed delivery.
      const queueNode = body.find((node) => el(node).type === Queue)!;
      const queueItems = el(queueNode).props.children as El[];
      expect(queueItems.map((item) => item.props.status)).toEqual(['failed', 'queued']);
    } finally {
      vi.useRealTimers();
    }
  });
});
