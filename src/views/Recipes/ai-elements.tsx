import type { DescriptionsItem, TraceStatus } from '@/lib';

import { useCallback, useEffect, useRef, useState } from 'react';
import { css } from '@linaria/core';
import {
  Bot,
  Bookmark,
  Brain,
  ChevronDown,
  FileText,
  Lightbulb,
  Link2,
  RotateCcw,
  Share2,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';

import {
  Button,
  ChatMessage,
  Chip,
  CodeBlock,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  CopyButton,
  Descriptions,
  Ellipsis,
  FilePreview,
  FollowUpSuggestions,
  Icon,
  Segmented,
  Sources,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TaskList,
  ThinkingIndicator,
  Timeline,
  TimelineItem,
  ToolCallCard,
  Trace,
  TraceItem,
} from '@/lib';
import { intro, page, section } from '@/views/ComponentDetail/styles';

// The page shows its own source (?raw), so demo and code never drift —
// the same self-mapping the CRUD and icon recipes use for their files.
import pageSource from './ai-elements.tsx?raw';

/*
 * The live source behind the Recipes "AI chat elements" page — the docs
 * show this very file via ?raw, so demo and code never drift. Each
 * section maps one shadcn AI Elements pattern (Response, Actions /
 * ActionItem, ThoughtChain, Subagent, Context, Data) onto a composition
 * of stock haze-ui components; the closing section chains TaskList and
 * FollowUpSuggestions into the full answer + tasks + follow-up scene.
 */

const paragraph = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-base);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-relaxed);
  margin: 0 0 var(--haze-space-4);
`;

const inlineCode = css`
  background: var(--haze-color-bg-muted);
  border-radius: var(--haze-radius-sm);
  padding: 0.15em 0.4em;
  font-family: var(--haze-font-mono);
  font-size: 0.9em;
`;

const hint = css`
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-muted);
`;

const demoPanel = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-4) var(--haze-space-4) var(--haze-space-2);
  margin: var(--haze-space-4) 0 var(--haze-space-6);
  max-width: 560px;
`;

const demoColumn = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-4);
  margin-top: var(--haze-space-4);
  max-width: 480px;
`;

const actionRow = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--haze-space-2);
`;

const contextBar = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--haze-space-2);
`;

const thoughtTrigger = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-2);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
`;

const codeMargin = css`
  margin: var(--haze-space-2) 0 var(--haze-space-4);
`;

/**
 * One armed timeout per demo: replays re-arm the pending timer instead
 * of stacking, and unmounting the demo cancels whatever is in flight.
 */
function useDemoTimeout() {
  const timer = useRef<number | null>(null);
  const schedule = useCallback((fn: () => void, ms: number) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  }, []);
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    []
  );
  return schedule;
}

// ─── 1. Response — message + action group ───────────────────────────────

const RESPONSE_VARIANTS = [
  'Anchor positioning lands the popover without a JavaScript layout pass: the panel lives in the top layer, flips through position-try fallbacks, and the JS tier only runs on legacy engines.',
  'Short answer: the anchored tier measures and places natively — no JS on the hot path. Legacy engines fall back to the measured JS tier with the same containment contract.',
  'Two tiers answer this: anchored positioning for modern engines (zero JS at open time), and a measured fallback that keeps the containment promise everywhere else.',
] as const;

type Vote = 'up' | 'down' | null;

/** Live demo: one assistant message with copy, regenerate and votes. */
export function ResponseDemo() {
  const [answerIndex, setAnswerIndex] = useState(0);
  const [vote, setVote] = useState<Vote>(null);
  const answer = RESPONSE_VARIANTS[answerIndex] ?? RESPONSE_VARIANTS[0];

  return (
    <div className={demoColumn}>
      <ChatMessage
        role='assistant'
        name='haze-bot'
        avatar={<Icon icon={Bot} size='sm' />}
        timestamp='14:02'
        status='sent'
        actions={
          <>
            <CopyButton
              value={answer}
              variant='ghost'
              size='sm'
              square
              aria-label='Copy answer'
            />
            <Button
              variant='ghost'
              size='sm'
              square
              aria-label='Regenerate answer'
              onClick={() => setAnswerIndex((i) => (i + 1) % RESPONSE_VARIANTS.length)}
            >
              <Icon icon={RotateCcw} size='sm' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              square
              aria-pressed={vote === 'up'}
              aria-label='Good answer'
              onClick={() => setVote((v) => (v === 'up' ? null : 'up'))}
            >
              <Icon icon={ThumbsUp} size='sm' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              square
              aria-pressed={vote === 'down'}
              aria-label='Poor answer'
              onClick={() => setVote((v) => (v === 'down' ? null : 'down'))}
            >
              <Icon icon={ThumbsDown} size='sm' />
            </Button>
          </>
        }
      >
        {answer}
      </ChatMessage>
      <p className={hint}>
        Feedback: {vote ?? 'none'} — answer {answerIndex + 1} of{' '}
        {RESPONSE_VARIANTS.length}. Hover or tab the message to reveal the
        action bar.
      </p>
    </div>
  );
}

// ─── 2. Actions / ActionItem — one row of affordances ───────────────────

const ACTION_SUMMARY =
  'Actions: save to workspace, share the thread, extend thinking before answering, copy the summary. Overflow context stays clamped to one line.';

const ACTION_SUMMARY_LONG =
  'Actions sit in one row under the answer: primary affordances first (save, share, extend thinking), the copy action duplicates the summary for pasting elsewhere, and everything that would otherwise wrap — long explanations, caveats, links — collapses into a single clamped line until the reader asks for more.';

/** Live demo: an action row plus a clamped overflow line. */
export function ActionsDemo() {
  const [busy, setBusy] = useState(false);
  const [extended, setExtended] = useState(0);
  const schedule = useDemoTimeout();

  const extend = () => {
    if (busy) return;
    setBusy(true);
    schedule(() => {
      setBusy(false);
      setExtended((n) => n + 1);
    }, 900);
  };

  return (
    <div className={demoColumn}>
      <div className={actionRow} role='group' aria-label='Message actions'>
        <Button variant='outline' size='sm'>
          <Icon icon={Bookmark} size='sm' />Save
        </Button>
        <Button variant='outline' size='sm'>
          <Icon icon={Share2} size='sm' />Share
        </Button>
        <Button variant='outline' size='sm' loading={busy} onClick={extend}>
          <Icon icon={Lightbulb} size='sm' />
          {extended > 0 ? 'Extend thinking again' : 'Extend thinking'}
        </Button>
        <CopyButton
          value={ACTION_SUMMARY}
          variant='outline'
          size='sm'
          square={false}
          copyLabel='Copy summary'
        >
          Copy summary
        </CopyButton>
      </div>
      <Ellipsis lines={1} tooltip expandable className={hint}>
        {ACTION_SUMMARY_LONG}
      </Ellipsis>
      <p className={hint}>
        {extended === 0
          ? 'Extend thinking has not run yet.'
          : 'Extended thinking ' + String(extended) + ' time(s).'}
      </p>
    </div>
  );
}

// ─── 3. ThoughtChain — collapsible reasoning ────────────────────────────

const THINK_MS = 1200;

const THINK_STEPS = [
  {
    title: 'Parse the request',
    description: 'Two asks: why the anchored tier exists, and when the JS tier still runs.',
    time: '0.3s',
    color: 'default',
  },
  {
    title: 'Search the docs corpus',
    description: 'Matching: anchored tier, position-try fallbacks, containment contract.',
    time: '1.1s',
    color: 'primary',
  },
  {
    title: 'Draft the answer',
    description: 'Lead with the native path; keep the fallback to one aside.',
    time: '2.6s',
    color: 'success',
  },
] as const;

/** Live demo: dots while thinking, a collapsible step chain once done. */
export function ThoughtChainDemo() {
  const [thinking, setThinking] = useState(false);
  const schedule = useDemoTimeout();

  const replay = () => {
    setThinking(true);
    schedule(() => setThinking(false), THINK_MS);
  };

  return (
    <div className={demoColumn}>
      {thinking ? (
        <ThinkingIndicator text='Thinking — retracing the reasoning steps…' />
      ) : (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className={thoughtTrigger}>
            <Icon icon={Brain} size='sm' />
            Thought for 4s
            <Icon icon={ChevronDown} size='sm' />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Timeline>
              {THINK_STEPS.map((step) => (
                <TimelineItem
                  key={step.title}
                  title={step.title}
                  description={step.description}
                  time={step.time}
                  color={step.color}
                />
              ))}
            </Timeline>
          </CollapsibleContent>
        </Collapsible>
      )}
      <div>
        <Button variant='outline' size='sm' onClick={replay}>
          Replay thinking
        </Button>
      </div>
    </div>
  );
}

// ─── 4. Subagent — nested Trace × ToolCallCard ──────────────────────────

const STAGE_MS = 500;

type SubagentStage = {
  planner: TraceStatus;
  research: TraceStatus;
  search: TraceStatus;
  metrics: TraceStatus;
  writer: TraceStatus;
};

const SUBAGENT_STAGES: readonly SubagentStage[] = [
  { planner: 'running', research: 'pending', search: 'pending', metrics: 'pending', writer: 'pending' },
  { planner: 'done', research: 'running', search: 'running', metrics: 'pending', writer: 'pending' },
  { planner: 'done', research: 'running', search: 'done', metrics: 'error', writer: 'pending' },
  { planner: 'done', research: 'running', search: 'done', metrics: 'done', writer: 'pending' },
  { planner: 'done', research: 'done', search: 'done', metrics: 'done', writer: 'running' },
  { planner: 'done', research: 'done', search: 'done', metrics: 'done', writer: 'done' },
];

/** Live demo: a staged subagent run — planner, nested research, writer. */
export function SubagentDemo() {
  const [stageIndex, setStageIndex] = useState(0);
  const schedule = useDemoTimeout();
  const stage = SUBAGENT_STAGES[stageIndex] ?? SUBAGENT_STAGES[0]!;
  const finished = stageIndex >= SUBAGENT_STAGES.length - 1;

  useEffect(() => {
    if (finished) return;
    schedule(
      () => setStageIndex((i) => Math.min(i + 1, SUBAGENT_STAGES.length - 1)),
      STAGE_MS
    );
  }, [stageIndex, finished, schedule]);

  const replay = () => setStageIndex(0);

  return (
    <div className={demoColumn}>
      <Trace>
        <TraceItem
          title='Planner — decompose the question'
          status={stage.planner}
          details={
            <ToolCallCard
              name='plan_tasks'
              status={stage.planner}
              input={'{\n  "goal": "explain the floating tiers",\n  "maxSteps": 3\n}'}
              output={stage.planner === 'done' ? '3 steps queued: research, verify, write' : undefined}
            />
          }
        />
        <TraceItem
          title='Research subagent'
          icon={Bot}
          status={stage.research}
          details={
            <Trace>
              <TraceItem
                title='search_docs'
                status={stage.search}
                details={
                  <ToolCallCard
                    name='search_docs'
                    status={stage.search}
                    input='anchor positioning tier'
                    output={stage.search === 'done' ? '4 matches in /docs/floating' : undefined}
                  />
                }
              />
              <TraceItem
                title='fetch_metrics'
                status={stage.metrics}
                details={
                  <ToolCallCard
                    name='fetch_metrics'
                    status={stage.metrics}
                    input={'{\n  "table": "popovers",\n  "window": "7d"\n}'}
                    output={
                      stage.metrics === 'error'
                        ? 'timeout after 3000ms — retried once'
                        : stage.metrics === 'done'
                          ? '1,204 events, 3 users affected'
                          : undefined
                    }
                  />
                }
              />
            </Trace>
          }
        />
        <TraceItem title='Writer — compose the answer' status={stage.writer} />
      </Trace>
      <div>
        <Button variant='outline' size='sm' onClick={replay}>
          Replay the run
        </Button>
      </div>
    </div>
  );
}

// ─── 5. Context — attachments & citations ───────────────────────────────

type Attachment = {
  id: string;
  label: string;
  kind: 'file' | 'link';
};

const INITIAL_ATTACHMENTS: readonly Attachment[] = [
  { id: 'notes', label: 'release-notes.md', kind: 'file' },
  { id: 'channel', label: '#deploy channel', kind: 'link' },
];

const DEMO_SOURCES = [
  {
    id: 'mdn-anchor',
    title: 'CSS anchor positioning — MDN',
    url: 'https://developer.mozilla.org/docs/Web/CSS/CSS_anchor_positioning',
    snippet:
      'Anchor positioning allows placing elements relative to other elements on the page.',
  },
  {
    id: 'mdn-popover',
    title: 'Popover API — MDN',
    url: 'https://developer.mozilla.org/docs/Web/API/Popover_API',
    snippet: 'The Popover API provides a declarative way to render top-layer content.',
  },
  {
    id: 'internal',
    title: 'Floating tier notes (internal)',
    snippet:
      'The JS tier compensates with measured placement; containment stays a cross-tier contract.',
  },
] as const;

/** Live demo: attached context on the way in, cited sources on the way out. */
export function ContextDemo() {
  const [attachments, setAttachments] = useState(INITIAL_ATTACHMENTS);

  const detach = (id: string) =>
    setAttachments((list) => list.filter((item) => item.id !== id));

  return (
    <div className={demoColumn}>
      <div className={contextBar} aria-label='Attached context'>
        {attachments.map((item) => (
          <Chip
            key={item.id}
            variant='outline'
            icon={<Icon icon={item.kind === 'link' ? Link2 : FileText} size='sm' />}
            onClose={() => detach(item.id)}
            removeLabel={'Detach ' + item.label}
          >
            {item.label}
          </Chip>
        ))}
        <FilePreview
          file={{ name: 'q3-popover-metrics.csv', size: 48213, type: 'text/csv' }}
          status='uploading'
          progress={72}
        />
      </div>
      <ChatMessage role='user' timestamp='14:03'>
        Why does the popover flicker on first open? Notes and channel attached.
      </ChatMessage>
      <ChatMessage
        role='assistant'
        name='haze-bot'
        avatar={<Icon icon={Bot} size='sm' />}
        timestamp='14:03'
        status='sent'
      >
        First-open flicker is the zero-rect measurement: a display:none panel measures
        empty, so the first placement lands at the origin. Gating the place() call on
        the shown state fixes it — the sources below cover the details.
      </ChatMessage>
      <Sources items={[...DEMO_SOURCES]} />
    </div>
  );
}

// ─── 6. Data — structured answers in the bubble ─────────────────────────

const TIER_ITEMS: DescriptionsItem[] = [
  { key: 'chromium', label: 'Chromium 119+', children: 'Anchored tier (top layer)' },
  { key: 'firefox', label: 'Firefox 128+', children: 'Anchored tier (top layer)' },
  { key: 'webkit', label: 'Safari 17+', children: 'Anchored tier (top layer)' },
  { key: 'legacy', label: 'Legacy engines', children: 'JS tier — measured placement', span: 2 },
];

const TIER_ROWS = [
  { engine: 'Chromium 119+', tier: 'Anchored', note: 'Top layer, try fallbacks' },
  { engine: 'Firefox 128+', tier: 'Anchored', note: 'Top layer, try fallbacks' },
  { engine: 'Safari 17+', tier: 'Anchored', note: 'Top layer, try fallbacks' },
  { engine: 'Legacy', tier: 'JS measured', note: 'Same containment contract' },
] as const;

type DataView = 'descriptions' | 'table';

/** Live demo: key/value or row data inside the answer bubble. */
export function DataDemo() {
  const [view, setDataView] = useState<DataView>('descriptions');

  return (
    <ChatMessage
      role='assistant'
      name='haze-bot'
      avatar={<Icon icon={Bot} size='sm' />}
      timestamp='14:05'
      status='sent'
    >
      <div className={demoColumn}>
        <Segmented
          size='sm'
          value={view}
          onChange={(next) => setDataView(next === 'table' ? 'table' : 'descriptions')}
          options={[
            { value: 'descriptions', label: 'Key / value' },
            { value: 'table', label: 'Rows' },
          ]}
        />
        {view === 'descriptions' ? (
          <Descriptions
            size='sm'
            bordered
            title='Tier coverage by engine'
            items={TIER_ITEMS}
          />
        ) : (
          <Table bordered>
            <TableHead>
              <TableRow>
                <TableCell as='th'>Engine</TableCell>
                <TableCell as='th'>Tier</TableCell>
                <TableCell as='th'>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {TIER_ROWS.map((row) => (
                <TableRow key={row.engine}>
                  <TableCell>{row.engine}</TableCell>
                  <TableCell>{row.tier}</TableCell>
                  <TableCell>{row.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </ChatMessage>
  );
}

// ─── 7. The whole scene — answer, tasks, follow-ups ─────────────────────

const FOLLOW_UP_MS = 900;

type Turn = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
};

const INITIAL_TURNS: readonly Turn[] = [
  {
    id: 0,
    role: 'assistant',
    text: 'Rollout plan ready. I split it into three tasks — tick them off as you go, or pick a follow-up below.',
  },
];

const INITIAL_SUGGESTIONS = [
  'Draft the release note',
  'What breaks in the JS tier?',
  'Assign the tasks to the team',
] as const;

const NEXT_SUGGESTIONS = [
  'Show the diff for task 1',
  'Estimate the QA pass',
  'Summarize the risks',
] as const;

const FOLLOW_UP_ANSWERS: Record<string, string> = {
  'Draft the release note':
    'Release note drafted — highlights: anchored tier by default, JS fallback only for legacy engines, no visual regressions in the four baselines.',
  'What breaks in the JS tier?':
    'Legacy engines lose top-layer rendering and native anchor flip — the JS tier compensates with measured placement, at the cost of a layout pass per open.',
  'Assign the tasks to the team':
    'Assigned: platform owns the cutover, design reviews the motion tokens, QA walks the four visual baselines.',
};

const GENERIC_ANSWER =
  'On it — that follow-up maps onto the queued tasks. Ask again once the baselines finish recording.';

type DemoTask = {
  key: string;
  title: string;
  description: string;
  checked: boolean;
  running: boolean;
};

const INITIAL_TASKS: readonly DemoTask[] = [
  {
    key: 't1',
    title: 'Flip popovers to the anchored tier',
    description: 'position-area plus try fallbacks; delete the manual placement pass.',
    checked: true,
    running: false,
  },
  {
    key: 't2',
    title: 'Gate the JS tier behind a legacy flag',
    description: 'keeps old engines working without penalising the rest.',
    checked: false,
    running: false,
  },
  {
    key: 't3',
    title: 'Re-record the four visual baselines',
    description: 'running — capturing now.',
    checked: false,
    running: true,
  },
];

/** Live demo: answer + task list + follow-up chips, one feedback loop. */
export function AnswerTasksDemo() {
  const [turns, setTurns] = useState(INITIAL_TURNS);
  const [suggestions, setSuggestions] = useState<string[]>([...INITIAL_SUGGESTIONS]);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [pending, setPending] = useState(false);
  const nextId = useRef(INITIAL_TURNS.length);
  const schedule = useDemoTimeout();

  const ask = (value: string) => {
    if (pending) return;
    const userId = nextId.current;
    nextId.current += 1;
    setTurns((list) => [...list, { id: userId, role: 'user', text: value }]);
    setPending(true);
    schedule(() => {
      const answerId = nextId.current;
      nextId.current += 1;
      setTurns((list) => [
        ...list,
        { id: answerId, role: 'assistant', text: FOLLOW_UP_ANSWERS[value] ?? GENERIC_ANSWER },
      ]);
      setSuggestions([...NEXT_SUGGESTIONS]);
      setPending(false);
    }, FOLLOW_UP_MS);
  };

  const toggleTask = (key: string, checked: boolean) =>
    setTasks((list) => list.map((task) => (task.key === key ? { ...task, checked } : task)));

  return (
    <div className={demoColumn}>
      {turns.map((turn) => (
        <ChatMessage
          key={turn.id}
          role={turn.role}
          name={turn.role === 'assistant' ? 'haze-bot' : undefined}
          avatar={turn.role === 'assistant' ? <Icon icon={Bot} size='sm' /> : undefined}
        >
          {turn.text}
        </ChatMessage>
      ))}
      {pending && <ThinkingIndicator text='Composing the follow-up…' />}
      <TaskList
        items={tasks.map((task) => ({
          key: task.key,
          title: task.title,
          description: task.description,
          checked: task.checked,
          onCheckedChange: (checked: boolean) => toggleTask(task.key, checked),
          indicator: task.running ? <Spinner size='sm' /> : undefined,
        }))}
      />
      <FollowUpSuggestions suggestions={suggestions} onSelect={ask} />
    </div>
  );
}

// ─── The page ───────────────────────────────────────────────────────────

export default function AiElements() {
  return (
    <div className={page}>
      <h1>AI chat elements</h1>
      <p className={intro}>
        The six patterns behind agent chat UIs — response actions, action rows,
        thought chains, subagent traces, attached context and structured
        answers — assembled from the components you already have. Each section
        maps one shadcn AI Elements pattern onto a haze-ui composition: a live
        demo plus the wiring that drives it, and the whole file at the bottom.
        Everything is interactive — vote, regenerate, replay, detach, expand,
        ask.
      </p>

      <div className={section}>
        <h2>Response — message + action group</h2>
        <p className={paragraph}>
          The shadcn <code className={inlineCode}>Response</code> pattern is an
          answer plus the affordances that act on it.{' '}
          <code className={inlineCode}>ChatMessage</code> already owns the
          placement: an <code className={inlineCode}>actions</code> prop opts
          the message into a hover/focus reveal bar, and{' '}
          <code className={inlineCode}>copyable</code> is the shortcut when a
          plain copy button is all you need (providing{' '}
          <code className={inlineCode}>actions</code> alone skips the built-in
          button, so bring your own <code className={inlineCode}>CopyButton</code>{' '}
          — as below). Regenerate and the votes are stock{' '}
          <code className={inlineCode}>Button</code>s wearing icons, with{' '}
          <code className={inlineCode}>aria-pressed</code> carrying the vote
          state to assistive tech.
        </p>
        <div className={demoPanel}>
          <ResponseDemo />
        </div>
        <CodeBlock language='tsx' className={codeMargin}>
          {`const [answerIndex, setAnswerIndex] = useState(0);
const [vote, setVote] = useState<'up' | 'down' | null>(null);
const answer = RESPONSE_VARIANTS[answerIndex]!;

<ChatMessage
  role='assistant'
  name='haze-bot'
  avatar={<Icon icon={Bot} size='sm' />}
  status='sent'
  actions={                                   // the reveal bar — one fragment
    <>
      <CopyButton value={answer} variant='ghost' size='sm' square
        aria-label='Copy answer' />
      <Button variant='ghost' size='sm' square aria-label='Regenerate answer'
        onClick={() => setAnswerIndex((i) => (i + 1) % RESPONSE_VARIANTS.length)}>
        <Icon icon={RotateCcw} size='sm' />
      </Button>
      <Button variant='ghost' size='sm' square aria-pressed={vote === 'up'}
        aria-label='Good answer'
        onClick={() => setVote(vote === 'up' ? null : 'up')}>
        <Icon icon={ThumbsUp} size='sm' />
      </Button>
    </>
  }
>
  {answer}
</ChatMessage>

// copy is the only action you need? Skip actions entirely:
<ChatMessage role='assistant' copyable>…</ChatMessage>`}
        </CodeBlock>
      </div>

      <div className={section}>
        <h2>Actions &amp; ActionItem — one row of affordances</h2>
        <p className={paragraph}>
          shadcn&apos;s <code className={inlineCode}>Actions</code> is a row of{' '}
          <code className={inlineCode}>ActionItem</code>s — icon plus label,
          one concern each. A plain flex row of sm{' '}
          <code className={inlineCode}>Button</code>s is the whole pattern;
          the library supplies the gap. Overflow is where rows rot, so the
          long tail collapses into an{' '}
          <code className={inlineCode}>Ellipsis</code>: one clamped line,
          full text in the tooltip, an expand toggle when truncation is
          actually detected. Extend thinking demos{' '}
          <code className={inlineCode}>loading</code> — the busy phase blocks
          double clicks at the platform level.
        </p>
        <div className={demoPanel}>
          <ActionsDemo />
        </div>
        <CodeBlock language='tsx' className={codeMargin}>
          {`<div role='group' aria-label='Message actions'>
  <Button variant='outline' size='sm'><Icon icon={Bookmark} size='sm' />Save</Button>
  <Button variant='outline' size='sm'><Icon icon={Share2} size='sm' />Share</Button>
  <Button variant='outline' size='sm' loading={busy} onClick={extend}>
    <Icon icon={Lightbulb} size='sm' />Extend thinking
  </Button>
  <CopyButton value={summary} variant='outline' size='sm'>Copy summary</CopyButton>
</div>

// the overflow line: clamped, tooltip on hover, expandable on demand
<Ellipsis lines={1} tooltip expandable>{longSummary}</Ellipsis>`}
        </CodeBlock>
      </div>

      <div className={section}>
        <h2>ThoughtChain — collapsible reasoning</h2>
        <p className={paragraph}>
          The <code className={inlineCode}>ThoughtChain</code> pattern is two
          states: live dots while the model thinks, a collapsed transcript
          once it stops. <code className={inlineCode}>ThinkingIndicator</code>{' '}
          covers the first; the done state is a{' '}
          <code className={inlineCode}>Collapsible</code> whose trigger reads
          &ldquo;Thought for 4s&rdquo; and whose content is a{' '}
          <code className={inlineCode}>Timeline</code> — one{' '}
          <code className={inlineCode}>TimelineItem</code> per reasoning step,
          with per-step colors carrying outcome at a glance. Hit Replay
          thinking to watch the swap.
        </p>
        <div className={demoPanel}>
          <ThoughtChainDemo />
        </div>
        <CodeBlock language='tsx' className={codeMargin}>
          {`{thinking ? (
  <ThinkingIndicator text='Thinking — retracing the reasoning steps…' />
) : (
  <Collapsible defaultOpen>
    <CollapsibleTrigger>
      <Icon icon={Brain} size='sm' /> Thought for 4s <Icon icon={ChevronDown} size='sm' />
    </CollapsibleTrigger>
    <CollapsibleContent>
      <Timeline>
        <TimelineItem title='Parse the request' description='…' time='0.3s' />
        <TimelineItem title='Search the docs corpus' description='…' time='1.1s' color='primary' />
        <TimelineItem title='Draft the answer' description='…' time='2.6s' color='success' />
      </Timeline>
    </CollapsibleContent>
  </Collapsible>
)}

// StepTimelineItem is the same composition with status glyphs instead of
// colors — swap it in when steps are pending/running rather than replayed.`}
        </CodeBlock>
      </div>

      <div className={section}>
        <h2>Subagent — nested Trace × ToolCallCard</h2>
        <p className={paragraph}>
          The <code className={inlineCode}>Subagent</code> pattern shows an
          agent delegating: one line per step, tool calls nested under the
          step that made them. <code className={inlineCode}>Trace</code> lays
          out <code className={inlineCode}>TraceItem</code>s whose{' '}
          <code className={inlineCode}>details</code> are disclosures — a
          nested <code className={inlineCode}>Trace</code> for the subagent
          runs, <code className={inlineCode}>ToolCallCard</code>s for the
          calls, statuses shared by reference so the marker and the card
          agree. The demo runs the staging on mount: planner → research
          (search, metrics — including an error that recovers) → writer.
          Expand the lines; replay the run.
        </p>
        <div className={demoPanel}>
          <SubagentDemo />
        </div>
        <CodeBlock language='tsx' className={codeMargin}>
          {`<Trace>
  <TraceItem title='Planner — decompose the question' status={planner}
    details={
      <ToolCallCard name='plan_tasks' status={planner}
        input={'{ "goal": "explain the floating tiers", "maxSteps": 3 }'}
        output='3 steps queued: research, verify, write' />
    } />
  <TraceItem title='Research subagent' icon={Bot} status={research}
    details={                                   // a nested Trace = the sub-run
      <Trace>
        <TraceItem title='search_docs' status={search}
          details={<ToolCallCard name='search_docs' status={search}
            input='anchor positioning tier' output='4 matches in /docs/floating' />} />
        <TraceItem title='fetch_metrics' status={metrics}
          details={<ToolCallCard name='fetch_metrics' status={metrics}
            input='{ "table": "popovers", "window": "7d" }' />} />
      </Trace>
    } />
  <TraceItem title='Writer — compose the answer' status={writer} />
</Trace>`}
        </CodeBlock>
      </div>

      <div className={section}>
        <h2>Context — attachments &amp; citations</h2>
        <p className={paragraph}>
          shadcn&apos;s <code className={inlineCode}>Context</code> is the
          context strip attached to a turn. On the way in that is a row of{' '}
          <code className={inlineCode}>Chip</code>s — icon, name, a remove
          affordance — plus <code className={inlineCode}>FilePreview</code>{' '}
          for anything still uploading (progress, retry and error states come
          with it). On the way out,{' '}
          <code className={inlineCode}>Sources</code> renders the citations:
          numbered entries, hover/focus excerpts, optional outbound links —
          <code className={inlineCode}>compact</code> turns the same data
          into a <code className={inlineCode}>[1] [2] [3]</code> footnote
          row. Detach a chip to see the strip shrink.
        </p>
        <div className={demoPanel}>
          <ContextDemo />
        </div>
        <CodeBlock language='tsx' className={codeMargin}>
          {`<div aria-label='Attached context'>
  <Chip variant='outline' icon={<Icon icon={FileText} size='sm' />}
    onClose={() => detach('notes')} removeLabel='Detach release-notes.md'>
    release-notes.md
  </Chip>
  <Chip variant='outline' icon={<Icon icon={Link2} size='sm' />} onClose={() => detach('channel')}>
    #deploy channel
  </Chip>
  <FilePreview file={{ name: 'q3-popover-metrics.csv', size: 48213, type: 'text/csv' }}
    status='uploading' progress={72} />
</div>

// …and under the answer:
<Sources items={[
  { id: 'mdn-anchor', title: 'CSS anchor positioning — MDN',
    url: 'https://developer.mozilla.org/docs/Web/CSS/CSS_anchor_positioning',
    snippet: 'Anchor positioning places elements relative to other elements.' },
  { id: 'internal', title: 'Floating tier notes (internal)',
    snippet: 'The JS tier compensates with measured placement.' },
]} />`}
        </CodeBlock>
      </div>

      <div className={section}>
        <h2>Data — structured answers in the bubble</h2>
        <p className={paragraph}>
          The <code className={inlineCode}>Data</code> pattern is structured
          output inside the answer: totals, per-engine breakdowns, anything a
          paragraph would mangle. <code className={inlineCode}>Descriptions</code>{' '}
          fits key/value answers (a <code className={inlineCode}>dl</code>{' '}
          under the hood, so pairs are announced as term/definition);{' '}
          <code className={inlineCode}>Table</code> fits row-shaped ones — or{' '}
          <code className={inlineCode}>DataTable</code> when the set is large
          enough to need sorting and paging. Both are ordinary children of
          the bubble; a <code className={inlineCode}>Segmented</code> lets
          the reader pick the shape.
        </p>
        <div className={demoPanel}>
          <DataDemo />
        </div>
        <CodeBlock language='tsx' className={codeMargin}>
          {`<ChatMessage role='assistant' name='haze-bot' status='sent'>
  <Segmented size='sm' value={view} onChange={setView}
    options={[{ value: 'descriptions', label: 'Key / value' },
              { value: 'table', label: 'Rows' }]} />

  {view === 'descriptions' ? (
    <Descriptions size='sm' bordered title='Tier coverage by engine'
      items={[
        { key: 'chromium', label: 'Chromium 119+', children: 'Anchored tier (top layer)' },
        { key: 'legacy', label: 'Legacy engines', children: 'JS tier — measured placement', span: 2 },
      ]} />
  ) : (
    <Table bordered>
      <TableHead>
        <TableRow>
          <TableCell as='th'>Engine</TableCell>
          <TableCell as='th'>Tier</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow><TableCell>Chromium 119+</TableCell><TableCell>Anchored</TableCell></TableRow>
      </TableBody>
    </Table>
  )}
</ChatMessage>`}
        </CodeBlock>
      </div>

      <div className={section}>
        <h2>The whole scene — answer, tasks, follow-ups</h2>
        <p className={paragraph}>
          The closing pattern chains the new agent components into one
          feedback loop: the answer carries a{' '}
          <code className={inlineCode}>TaskList</code> (data-driven{' '}
          <code className={inlineCode}>items</code>, a{' '}
          <code className={inlineCode}>Spinner</code> indicator standing in
          for the still-running task) and{' '}
          <code className={inlineCode}>FollowUpSuggestions</code> under it —
          chips wearing Button semantics, so keyboard users get them for
          free. Picking a suggestion appends the user turn, shows the
          thinking dots, and answers with the next round of chips. Tick a
          task; ask something.
        </p>
        <div className={demoPanel}>
          <AnswerTasksDemo />
        </div>
        <CodeBlock language='tsx' className={codeMargin}>
          {`<TaskList
  items={tasks.map((task) => ({
    key: task.key,
    title: task.title,
    description: task.description,
    checked: task.checked,
    onCheckedChange: (checked) => toggleTask(task.key, checked),
    indicator: task.running ? <Spinner size='sm' /> : undefined,  // no checkbox while running
  }))}
/>

<FollowUpSuggestions suggestions={suggestions} onSelect={ask} />

// ask(): append the user turn, show ThinkingIndicator, answer on a timer —
// with a real transport the same shape streams from sendMessage callbacks.`}
        </CodeBlock>
      </div>

      <div className={section}>
        <h2>The whole file</h2>
        <p className={paragraph}>
          This is the real source powering every demo above — patterns,
          staging timers and all, nothing elided. Swap{' '}
          <code className={inlineCode}>@/lib</code> for{' '}
          <code className={inlineCode}>haze-ui</code> in your app:
        </p>
        <CodeBlock language='tsx' className={codeMargin}>
          {pageSource}
        </CodeBlock>
      </div>
    </div>
  );
}
