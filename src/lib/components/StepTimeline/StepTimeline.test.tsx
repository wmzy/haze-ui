import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useControl } from 'react-use-control';

import StepTimeline, { StepTimelineItem } from './StepTimeline';

describe('StepTimeline', () => {
  it('renders children', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Step 1" />
      </StepTimeline>,
    );
    expect(screen.getByText('Step 1')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<StepTimeline className="custom"><StepTimelineItem label="S" /></StepTimeline>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders multiple items', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Step 1" />
        <StepTimelineItem label="Step 2" />
        <StepTimelineItem label="Step 3" />
      </StepTimeline>,
    );
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Step 1" description="Details here" />
      </StepTimeline>,
    );
    expect(screen.getByText('Details here')).toBeInTheDocument();
  });

  it('renders done status with checkmark', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Done" status="done" />
      </StepTimeline>,
    );
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('renders error status with exclamation', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Error" status="error" />
      </StepTimeline>,
    );
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('renders running status with a marker and data-status', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Compiling" status="running" />
      </StepTimeline>,
    );
    const itemEl = screen.getByText('Compiling').closest('[data-slot="item"]');
    expect(itemEl).toHaveAttribute('data-status', 'running');
    expect(itemEl?.querySelector('[data-slot="dot"]')).toBeTruthy();
  });

  it('renders time next to the label', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Build" status="done" time="2.4s" />
      </StepTimeline>,
    );
    const timeEl = screen.getByText('2.4s');
    expect(timeEl).toHaveAttribute('data-slot', 'time');
    expect(
      timeEl.closest('[data-slot="label-row"]'),
    ).toContainElement(screen.getByText('Build'));
  });

  it('renders a custom icon overriding the status glyph', () => {
    render(
      <StepTimeline>
        <StepTimelineItem
          label="Custom"
          status="done"
          icon={<span data-testid="custom-icon">◆</span>}
        />
      </StepTimeline>,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.queryByText('✓')).toBeNull();
  });

  it('applies className to item', () => {
    render(<StepTimelineItem label="S" className="custom" />);
    expect(screen.getByText('S').closest('[class*="custom"]')).toBeTruthy();
  });

  it('wires aria-expanded and aria-controls to the hidden panel', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Tool call" collapsible content="Payload" />
      </StepTimeline>,
    );
    const toggle = screen.getByRole('button', { name: 'Tool call' });
    const panel = screen
      .getByText('Payload')
      .closest('[data-slot="panel"]');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', panel?.id);
    expect(panel).toHaveAttribute('hidden');
  });

  it('toggles a collapsible item on click', async () => {
    const user = userEvent.setup();
    render(
      <StepTimeline>
        <StepTimelineItem
          label="Tool call"
          description="read_file"
          time="0.3s"
          collapsible
          content="Payload"
        />
      </StepTimeline>,
    );
    const toggle = screen.getByRole('button', { name: /Tool call/ });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Payload')).toBeVisible();
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Payload')).not.toBeVisible();
  });

  it('toggles a collapsible item with Enter and Space', async () => {
    const user = userEvent.setup();
    render(
      <StepTimeline>
        <StepTimelineItem label="Tool call" collapsible content="Payload" />
      </StepTimeline>,
    );
    const toggle = screen.getByRole('button', { name: 'Tool call' });
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Payload')).toBeVisible();
    // user-event does not perform the native space→click step for
    // buttons (DropdownMenu.test precedent): dispatch the UA click by
    // hand after the keydown — the native button needs no key handlers.
    toggle.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }),
    );
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Payload')).not.toBeVisible();
  });

  it('treats a plain open value as the uncontrolled default', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Tool call" collapsible open content="Payload" />
      </StepTimeline>,
    );
    expect(screen.getByRole('button', { name: 'Tool call' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByText('Payload')).toBeVisible();
  });

  it('drives a controlled open control and fires onOpenChange', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function Controlled() {
      const [, , openCtrl] = useControl(undefined, false);
      return (
        <StepTimelineItem
          label="Tool call"
          collapsible
          content="Payload"
          open={openCtrl}
          onOpenChange={onOpenChange}
        />
      );
    }
    render(<Controlled />);
    const toggle = screen.getByRole('button', { name: 'Tool call' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await user.click(toggle);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders nested child steps inside an indented sub-timeline', () => {
    render(
      <StepTimeline>
        <StepTimelineItem label="Parent" status="done">
          <StepTimelineItem label="Child A" status="done" time="12ms" />
          <StepTimelineItem label="Child B" status="running" time="1.2s" />
        </StepTimelineItem>
        <StepTimelineItem label="Next" status="pending" />
      </StepTimeline>,
    );
    expect(screen.getByText('Child A')).toBeInTheDocument();
    expect(screen.getByText('Child B')).toBeInTheDocument();
    const subSteps = screen
      .getByText('Child A')
      .closest('[data-slot="sub-steps"]');
    expect(subSteps).toBeTruthy();
    expect(subSteps?.querySelector('[data-slot="step-timeline"]')).toBeTruthy();
    // the sub-timeline lives inside the parent item's panel
    const parentItem = subSteps?.closest('[data-slot="item"]');
    expect(parentItem).toHaveAttribute('data-status', 'done');
  });

  it('reveals nested steps only while a collapsible parent is open', async () => {
    const user = userEvent.setup();
    render(
      <StepTimeline>
        <StepTimelineItem label="Parent" status="done" collapsible>
          <StepTimelineItem label="Child A" status="done" />
        </StepTimelineItem>
      </StepTimeline>,
    );
    expect(screen.getByText('Child A')).not.toBeVisible();
    // name regex: the done marker's ✓ glyph sits inside the button, so
    // the full accessible name is "✓ Parent".
    await user.click(screen.getByRole('button', { name: /Parent/ }));
    expect(screen.getByText('Child A')).toBeVisible();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <StepTimeline>
        <StepTimelineItem label="Plan" status="done" time="0.8s" />
        <StepTimelineItem
          label="Tool call"
          status="running"
          time="2.4s"
          collapsible
          open
          content={<pre>input: src/**/*.ts</pre>}
        >
          <StepTimelineItem label="stat" status="done" time="12ms" />
          <StepTimelineItem label="read" status="running" time="0.3s" />
        </StepTimelineItem>
        <StepTimelineItem
          label="Collapsed"
          status="done"
          collapsible
          content="Hidden body"
        />
        <StepTimelineItem label="Failed" status="error" description="Schema mismatch" />
        <StepTimelineItem label="Review" status="pending" />
      </StepTimeline>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
