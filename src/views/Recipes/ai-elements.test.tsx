import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';

import AiElements, {
  ActionsDemo,
  AnswerTasksDemo,
  ContextDemo,
  DataDemo,
  ResponseDemo,
  SubagentDemo,
  ThoughtChainDemo,
} from './ai-elements';

describe('ai-elements recipe: Response', () => {
  it('renders the assistant message with its action group', () => {
    render(<ResponseDemo />);
    expect(screen.getByText(/Anchor positioning lands the popover/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy answer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Regenerate answer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Good answer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Poor answer' })).toBeInTheDocument();
  });

  it('regenerates cycles the canned answers and votes toggle aria-pressed', async () => {
    const user = userEvent.setup();
    render(<ResponseDemo />);

    await user.click(screen.getByRole('button', { name: 'Regenerate answer' }));
    expect(screen.getByText(/Short answer: the anchored tier/)).toBeInTheDocument();

    const up = screen.getByRole('button', { name: 'Good answer' });
    expect(up).toHaveAttribute('aria-pressed', 'false');
    await user.click(up);
    expect(up).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Feedback: up/)).toBeInTheDocument();
    await user.click(up);
    expect(up).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('ai-elements recipe: Actions', () => {
  it('renders the action row with the clamped overflow line', () => {
    render(<ActionsDemo />);
    expect(screen.getByRole('group', { name: 'Message actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy summary' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Actions sit in one row under the answer/)).toBeInTheDocument();
  });

  it('Extend thinking runs busy then counts the extension', async () => {
    const user = userEvent.setup();
    render(<ActionsDemo />);
    expect(screen.getByText(/has not run yet/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Extend thinking/ }));
    await waitFor(
      () => expect(screen.getByText(/Extended thinking 1 time/)).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });
});

describe('ai-elements recipe: ThoughtChain', () => {
  it('shows the collapsible step chain with per-step meta', () => {
    render(<ThoughtChainDemo />);
    expect(screen.getByRole('button', { name: /Thought for 4s/ })).toBeInTheDocument();
    expect(screen.getByText('Parse the request')).toBeInTheDocument();
    expect(screen.getByText('Search the docs corpus')).toBeInTheDocument();
    expect(screen.getByText('Draft the answer')).toBeInTheDocument();
    expect(screen.getByText('0.3s')).toBeInTheDocument();
  });

  it('collapses the transcript and replays the thinking phase', async () => {
    const user = userEvent.setup();
    render(<ThoughtChainDemo />);

    // collapse: Presence keeps the subtree mounted while the exit
    // transition would run, then unmounts once it settles (instant in
    // jsdom, still async).
    await user.click(screen.getByRole('button', { name: /Thought for 4s/ }));
    await waitFor(() =>
      expect(screen.queryByText('Search the docs corpus')).not.toBeInTheDocument()
    );

    // reopen, then replay: dots replace the chain until the timer lands
    await user.click(screen.getByRole('button', { name: /Thought for 4s/ }));
    await user.click(screen.getByRole('button', { name: 'Replay thinking' }));
    expect(screen.getByText(/Thinking — retracing/)).toBeInTheDocument();
    await waitFor(
      () => expect(screen.getByText('Search the docs corpus')).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });
});

describe('ai-elements recipe: Subagent', () => {
  it('runs the staged trace to completion with nested tool calls', async () => {
    const { container } = render(<SubagentDemo />);
    // planner starts running on mount
    expect(
      container.querySelector("[data-slot='item'][data-status='running']")
    ).not.toBeNull();

    await waitFor(
      () => {
        const pending = container.querySelector(
          "[data-slot='item'][data-status='pending'], [data-slot='item'][data-status='running'], [data-slot='item'][data-status='error']"
        );
        expect(pending).toBeNull();
      },
      { timeout: 6000 }
    );
  });

  it('exposes the nested research steps behind a disclosure', async () => {
    const user = userEvent.setup();
    const { container } = render(<SubagentDemo />);

    const research = screen.getByRole('button', { name: /Research subagent/ });
    expect(research).toHaveAttribute('aria-expanded', 'false');
    await user.click(research);
    expect(research).toHaveAttribute('aria-expanded', 'true');

    // the nested trace is present in the panel — the step title and the
    // tool card's name both read search_docs
    expect(screen.getAllByText('search_docs').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('fetch_metrics').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('anchor positioning tier')).toBeInTheDocument();

    // replay resets the run to the planner-running stage
    await user.click(screen.getByRole('button', { name: 'Replay the run' }));
    await waitFor(() =>
      expect(
        container.querySelector("[data-slot='item'][data-status='running']")
      ).not.toBeNull()
    );
  });
});

describe('ai-elements recipe: Context', () => {
  it('renders attachments, the uploading file and the cited sources', () => {
    render(<ContextDemo />);
    expect(screen.getByText('release-notes.md')).toBeInTheDocument();
    expect(screen.getByText('#deploy channel')).toBeInTheDocument();
    expect(screen.getByText('q3-popover-metrics.csv')).toBeInTheDocument();
    expect(screen.getByText('CSS anchor positioning — MDN')).toBeInTheDocument();
    expect(screen.getByText('Floating tier notes (internal)')).toBeInTheDocument();
    // the citations are links where a url exists
    expect(
      screen.getByRole('link', { name: /CSS anchor positioning — MDN/ })
    ).toBeInTheDocument();
  });

  it('detaches a chip from the context strip', async () => {
    const user = userEvent.setup();
    render(<ContextDemo />);
    await user.click(screen.getByRole('button', { name: 'Detach release-notes.md' }));
    expect(screen.queryByText('release-notes.md')).not.toBeInTheDocument();
    expect(screen.getByText('#deploy channel')).toBeInTheDocument();
  });
});

describe('ai-elements recipe: Data', () => {
  it('renders key/value data inside the bubble and switches to rows', async () => {
    const user = userEvent.setup();
    render(<DataDemo />);

    expect(screen.getByText('Tier coverage by engine')).toBeInTheDocument();
    expect(screen.getByText('Chromium 119+')).toBeInTheDocument();
    // three engines share the anchored-tier answer text
    expect(screen.getAllByText('Anchored tier (top layer)').length).toBe(3);

    await user.click(screen.getByRole('button', { name: 'Rows' }));
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('JS measured')).toBeInTheDocument();
    expect(screen.getByText('Same containment contract')).toBeInTheDocument();
  });
});

describe('ai-elements recipe: answer + tasks + follow-ups', () => {
  it('renders the scene: answer, checkable tasks, running task, suggestions', () => {
    render(<AnswerTasksDemo />);
    expect(screen.getByText(/Rollout plan ready/)).toBeInTheDocument();
    expect(screen.getByText('Flip popovers to the anchored tier')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Draft the release note' })
    ).toBeInTheDocument();
    // the list role is the TaskList; Sources-like structure is not needed here
    expect(screen.getAllByRole('list').length).toBeGreaterThan(0);
  });

  it('checks a task through the TaskList checkbox machinery', async () => {
    const user = userEvent.setup();
    render(<AnswerTasksDemo />);
    const gate = screen.getByRole('checkbox', { name: /Gate the JS tier/ });
    expect(gate).not.toBeChecked();
    await user.click(gate);
    expect(gate).toBeChecked();
  });

  it('asks a follow-up: user turn, thinking dots, canned answer, next chips', async () => {
    const user = userEvent.setup();
    render(<AnswerTasksDemo />);

    await user.click(screen.getByRole('button', { name: 'What breaks in the JS tier?' }));
    // the chip and the appended user turn both carry the text
    expect(screen.getAllByText('What breaks in the JS tier?').length).toBe(2);
    expect(screen.getByText(/Composing the follow-up/)).toBeInTheDocument();

    await waitFor(
      () =>
        expect(screen.getByText(/Legacy engines lose top-layer rendering/)).toBeInTheDocument(),
      { timeout: 3000 }
    );
    expect(
      screen.getByRole('button', { name: 'Show the diff for task 1' })
    ).toBeInTheDocument();
  });
});

describe('ai-elements page', () => {
  it('renders every section with its demo and source blocks', () => {
    render(<AiElements />);
    for (const heading of [
      'Response — message + action group',
      'Actions & ActionItem — one row of affordances',
      'ThoughtChain — collapsible reasoning',
      'Subagent — nested Trace × ToolCallCard',
      'Context — attachments & citations',
      'Data — structured answers in the bubble',
      'The whole scene — answer, tasks, follow-ups',
      'The whole file',
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: heading }),
        heading
      ).toBeInTheDocument();
    }
    // the page shows its own source (the ?raw self-import)
    const pres = document.querySelectorAll('pre');
    expect(pres.length).toBeGreaterThanOrEqual(8);
    const last = pres[pres.length - 1]!;
    expect(within(last).getByText(/The live source behind the Recipes/)).toBeInTheDocument();
  });
});
