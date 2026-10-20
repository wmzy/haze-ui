import type { ReactNode } from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import {
  Avatar,
  Badge,
  Button,
  ChatContainer,
  ChatInput,
  ChatMessage,
  ConversationItem,
  ConversationList,
  Empty,
  StreamingText,
  ThinkingIndicator,
  ToolCallCard,
} from '@/lib';

/*
 * Chat block: the AI conversation family assembled into one screen — a
 * scrolling ChatContainer (role="log") of ChatMessages, a scripted agent
 * turn that plays a ThinkingIndicator, a ToolCallCard (running → done)
 * and a StreamingText answer, plus a ChatInput whose send button flips
 * to a stop control while the turn runs. The right rail is a
 * ConversationList: switching or starting chats swaps the transcript,
 * and every reply is scripted — no network, timers only. All layout
 * glue is inline styles over --haze-* tokens so the block re-themes.
 */

type Phase = 'idle' | 'thinking' | 'tool' | 'answering';

type Entry =
  | { id: number; kind: 'user'; text: string }
  | { id: number; kind: 'thinking' }
  | { id: number; kind: 'thought'; seconds: number }
  | { id: number; kind: 'tool'; status: 'running' | 'done' }
  | { id: number; kind: 'answer'; text: string; phase: 'streaming' | 'done' };

type Conversation = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
};

type ToolScript = { thoughtSeconds: number; runMs: number };

type TurnScript = { thinkMs: number; tool?: ToolScript; answer: string };

const AGENT_NAME = 'Nimbus Copilot';
const USER_NAME = 'Ana';

const TOUR_QUESTION =
  'Why did event volume drop for Ferrite Labs last week?';

const TOOL_INPUT = `{ "workspace": "ferrite-labs",
  "metric": "ingested_events",
  "range": "14d" }`;

const TOOL_OUTPUT = `wk 41 → 71,980 events
wk 42 → 44,610 events (−38%)
source: webhook/v2, 3 collectors`;

const TOUR_ANSWER =
  'Ferrite Labs lost 38% of ingested events in week 42 — all of it from the webhook source, while the SDK collectors stayed flat. The cliff starts Tuesday 09:40, which lines up with their v2.3 webhook rollout. The failing payload now sends a 1.2 MB body and gets rejected by the gateway before ingest. Retrying with the v2 batched format should recover it — want me to draft the migration note?';

const FOLLOW_UP_ANSWER =
  'Scanned the last 24 hours across this workspace: ingest is flat everywhere else, so the Ferrite Labs cliff is still the only outlier. I can pin an annotation to the chart and alert you when the webhook error rate clears — say the word.';

const SEED_CONVERSATIONS: Conversation[] = [
  { id: 'anomaly', title: 'Ferrite Labs volume drop', subtitle: 'Investigating the week-42 cliff', time: '09:41' },
  { id: 'retention', title: 'Weekly retention digest', subtitle: 'Summarized last week', time: 'Yesterday' },
  { id: 'ingest', title: 'Ingest backfill window', subtitle: 'Resolved', time: 'Mon' },
];

const SEED_ENTRIES: Record<string, Entry[]> = {
  anomaly: [{ id: 1, kind: 'user', text: TOUR_QUESTION }],
  retention: [
    { id: 2, kind: 'user', text: 'Give me the one-line retention story for last week.' },
    {
      id: 3,
      kind: 'answer',
      text: 'Rolling 7-day retention held at 41% — up 1.2 points. Power users drove the lift; trial workspaces were flat.',
      phase: 'done',
    },
  ],
  ingest: [
    { id: 4, kind: 'user', text: 'Is the October backfill window still open?' },
    { id: 5, kind: 'answer', text: 'It closed Sunday 23:59 UTC. The next window opens Nov 3 — queued replays carry over automatically.', phase: 'done' },
  ],
};

const TOUR_SCRIPT: TurnScript = {
  thinkMs: 1300,
  tool: { thoughtSeconds: 4, runMs: 1700 },
  answer: TOUR_ANSWER,
};

const FOLLOW_UP_SCRIPT: TurnScript = {
  thinkMs: 900,
  answer: FOLLOW_UP_ANSWER,
};

/** Deterministic fake clock — stable timestamps keep the demo (and its
 * smoke test) reproducible without dragging Date into the render. */
function stamp(id: number): string {
  return `09:${String(40 + (id % 20)).padStart(2, '0')}`;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

function Mono({ children }: { children: ReactNode }) {
  return (
    <code
      style={{
        fontFamily: 'var(--haze-font-mono)',
        fontSize: 'var(--haze-text-xs)',
        whiteSpace: 'pre',
        color: 'var(--haze-color-text-secondary)',
      }}
    >
      {children}
    </code>
  );
}

export default function ChatBlock() {
  const [conversations, setConversations] = useState(SEED_CONVERSATIONS);
  const [entries, setEntries] = useState(SEED_ENTRIES);
  const [phases, setPhases] = useState<Record<string, Phase>>({});
  // The active conversation is user-facing state — one Control, and a
  // host app could drive it externally.
  const [activeId, setActiveId] = useControl(undefined, 'anomaly');

  const runRef = useRef(0);
  const idRef = useRef(100);
  const nextId = () => (idRef.current += 1);

  // Invalidation guard: a new run, a stop or the unmount bumps the
  // counter, so stale sleeps from a cancelled turn never mutate state.
  useEffect(() => () => {
    runRef.current += 1;
  }, []);

  const append = useCallback((conv: string, entry: Entry) => {
    setEntries((prev) => ({ ...prev, [conv]: [...(prev[conv] ?? []), entry] }));
  }, []);

  const patch = useCallback(
    (conv: string, id: number, updater: (entry: Entry) => Entry) => {
      setEntries((prev) => ({
        ...prev,
        [conv]: (prev[conv] ?? []).map((entry) =>
          entry.id === id ? updater(entry) : entry
        ),
      }));
    },
    []
  );

  const setPhaseFor = useCallback((conv: string, phase: Phase) => {
    setPhases((prev) => ({ ...prev, [conv]: phase }));
  }, []);

  const playTurn = useCallback(
    async (conv: string, script: TurnScript) => {
      const run = (runRef.current += 1);
      const alive = () => run === runRef.current;

      setPhaseFor(conv, 'thinking');
      const thinkingId = nextId();
      append(conv, { id: thinkingId, kind: 'thinking' });
      await sleep(script.thinkMs);
      if (!alive()) return;

      const thoughtSeconds = script.tool
        ? script.tool.thoughtSeconds
        : Math.max(1, Math.round(script.thinkMs / 1000));
      patch(conv, thinkingId, () => ({
        id: thinkingId,
        kind: 'thought',
        seconds: thoughtSeconds,
      }));

      if (script.tool) {
        setPhaseFor(conv, 'tool');
        const toolId = nextId();
        append(conv, { id: toolId, kind: 'tool', status: 'running' });
        await sleep(script.tool.runMs);
        if (!alive()) return;
        patch(conv, toolId, () => ({ id: toolId, kind: 'tool', status: 'done' }));
      }

      setPhaseFor(conv, 'answering');
      append(conv, {
        id: nextId(),
        kind: 'answer',
        text: script.answer,
        phase: 'streaming',
      });
    },
    [append, patch, setPhaseFor]
  );

  // The scripted tour plays once on mount in the seeded conversation —
  // kicked from a timer so the effect body itself never writes state.
  useEffect(() => {
    const timer = setTimeout(() => {
      void playTurn('anomaly', TOUR_SCRIPT);
    }, 0);
    return () => clearTimeout(timer);
  }, [playTurn]);

  const phase = phases[activeId] ?? 'idle';

  const send = (text: string) => {
    append(activeId, { id: nextId(), kind: 'user', text });
    void playTurn(activeId, FOLLOW_UP_SCRIPT);
  };

  /** Stop keeps what finished and drops the in-flight tail (thinking
   * dots, a running tool, a half-streamed answer) in one pass. */
  const stopGeneration = () => {
    runRef.current += 1;
    setPhaseFor(activeId, 'idle');
    setEntries((prev) => {
      const list = [...(prev[activeId] ?? [])];
      while (list.length > 0) {
        const last = list[list.length - 1]!;
        const incomplete =
          last.kind === 'thinking' ||
          (last.kind === 'tool' && last.status === 'running') ||
          (last.kind === 'answer' && last.phase === 'streaming');
        if (!incomplete) break;
        list.pop();
      }
      return { ...prev, [activeId]: list };
    });
  };

  const newChat = () => {
    const id = `fresh-${conversations.length + 1}`;
    setConversations((prev) => [
      { id, title: 'New conversation', subtitle: 'Just started', time: 'now' },
      ...prev,
    ]);
    setActiveId(id);
  };

  const markAnswerDone = (id: number) => {
    patch(activeId, id, (entry) =>
      entry.kind === 'answer' ? { ...entry, phase: 'done' } : entry
    );
    setPhaseFor(activeId, 'idle');
  };

  const renderEntry = (entry: Entry) => {
    switch (entry.kind) {
      case 'user':
        return (
          <ChatMessage
            key={entry.id}
            role='user'
            name={USER_NAME}
            status='sent'
            timestamp={stamp(entry.id)}
            avatar={<Avatar size='sm' fallback='AN' />}
          >
            <div style={{ fontSize: 'var(--haze-text-sm)' }}>{entry.text}</div>
          </ChatMessage>
        );
      case 'thinking':
        return (
          <ThinkingIndicator
            key={entry.id}
            text='Pulling workspace metrics…'
          />
        );
      case 'thought':
        return (
          <div
            key={entry.id}
            data-slot='chat-thought'
            style={{
              padding: 'var(--haze-space-1) 0',
              fontSize: 'var(--haze-text-xs)',
              color: 'var(--haze-color-text-muted)',
            }}
          >
            Thought for {entry.seconds}s
          </div>
        );
      case 'tool':
        return (
          <ToolCallCard
            key={entry.id}
            name='query_events'
            status={entry.status}
            input={<Mono>{TOOL_INPUT}</Mono>}
            output={entry.status === 'done' ? <Mono>{TOOL_OUTPUT}</Mono> : undefined}
          />
        );
      case 'answer':
        return (
          <ChatMessage
            key={entry.id}
            role='assistant'
            name={AGENT_NAME}
            timestamp={stamp(entry.id)}
            copyable
            avatar={<Avatar size='sm' fallback='NC' />}
          >
            {entry.phase === 'streaming' ? (
              <StreamingText
                text={entry.text}
                speed={12}
                onComplete={() => markAnswerDone(entry.id)}
              />
            ) : (
              <div style={{ fontSize: 'var(--haze-text-sm)' }}>{entry.text}</div>
            )}
          </ChatMessage>
        );
    }
  };

  return (
    <div
      data-slot='chat-block'
      style={{
        display: 'flex',
        height: '100%',
        minHeight: '480px',
        fontFamily: 'var(--haze-font-sans)',
        color: 'var(--haze-color-text)',
      }}
    >
      <section
        aria-label={`Chat with ${AGENT_NAME}`}
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          data-slot='chat-header'
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--haze-space-3)',
            padding: 'var(--haze-space-3) var(--haze-space-4)',
            borderBottom: '1px solid var(--haze-color-border)',
          }}
        >
          <Avatar fallback='NC' />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 'var(--haze-text-sm)', fontWeight: 'var(--haze-weight-semibold)' }}>
              {AGENT_NAME}
            </div>
            <div style={{ fontSize: 'var(--haze-text-xs)', color: 'var(--haze-color-text-muted)' }}>
              Workspace analytics agent · scripted demo
            </div>
          </div>
          <span style={{ flex: 1 }} />
          {phase === 'idle' ? <Badge>Ready</Badge> : <Badge variant='info'>Generating…</Badge>}
        </header>

        {/* ChatContainer owns the scrollport; role="log" makes the whole
            transcript one live region for assistive tech. */}
        <ChatContainer
          role='log'
          aria-label='Conversation transcript'
          style={{ flex: 1, minHeight: 0, background: 'var(--haze-color-bg-subtle)' }}
        >
          {(entries[activeId] ?? []).length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '240px',
              }}
            >
              <Empty description='Ask about workspaces, events or alerts — every reply here is scripted, no network involved.' />
            </div>
          ) : (
            (entries[activeId] ?? []).map(renderEntry)
          )}
        </ChatContainer>

        <footer
          data-slot='chat-composer'
          style={{
            borderTop: '1px solid var(--haze-color-border)',
            padding: 'var(--haze-space-3)',
            background: 'var(--haze-color-bg)',
          }}
        >
          <ChatInput
            onSend={send}
            generating={phase !== 'idle'}
            onStop={stopGeneration}
            placeholder={
              phase === 'idle' ? 'Ask a follow-up…' : 'Assistant is responding…'
            }
          />
        </footer>
      </section>

      <aside
        data-slot='chat-conversations'
        aria-label='Conversations'
        style={{
          width: '264px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          borderInlineStart: '1px solid var(--haze-color-border)',
          background: 'var(--haze-color-bg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--haze-space-2)',
            padding: 'var(--haze-space-3) var(--haze-space-3) var(--haze-space-2)',
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: 'var(--haze-text-xs)',
              fontWeight: 'var(--haze-weight-semibold)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'var(--haze-color-text-muted)',
            }}
          >
            Conversations
          </span>
          <Button size='sm' variant='outline' onClick={newChat}>
            New chat
          </Button>
        </div>
        {/* ConversationList has no style prop (className only, for
            Linaria classes) — the rail wraps it and owns the overflow. */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '0 var(--haze-space-2)',
          }}
        >
          <ConversationList>
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                title={conversation.title}
                subtitle={conversation.subtitle}
                active={conversation.id === activeId}
                onClick={() => setActiveId(conversation.id)}
                end={
                  <span style={{ fontSize: 'var(--haze-text-xs)', color: 'var(--haze-color-text-muted)' }}>
                    {conversation.time}
                  </span>
                }
              />
            ))}
          </ConversationList>
        </div>
      </aside>
    </div>
  );
}
