import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SwipeAction from './SwipeAction';

describe('SwipeAction', () => {
  it('renders children', () => {
    render(<SwipeAction>Content</SwipeAction>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<SwipeAction className="custom">Content</SwipeAction>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders left action', () => {
    render(<SwipeAction left={<span>Delete</span>}>Content</SwipeAction>);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders right action', () => {
    render(<SwipeAction right={<span>Archive</span>}>Content</SwipeAction>);
    expect(screen.getByText('Archive')).toBeInTheDocument();
  });

  it('handles pointer events', () => {
    render(<SwipeAction>Content</SwipeAction>);
    const content = screen.getByText('Content');
    fireEvent.pointerDown(content, { clientX: 100 });
    fireEvent.pointerMove(content, { clientX: 200 });
    fireEvent.pointerUp(content);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('calls onSwipeRight when dragged past threshold', async () => {
    const user = userEvent.setup();
    const onSwipeRight = vi.fn();
    const onSwipeLeft = vi.fn();
    render(
      <SwipeAction onSwipeRight={onSwipeRight} onSwipeLeft={onSwipeLeft}>
        Content
      </SwipeAction>
    );
    const content = screen.getByText('Content');
    await user.pointer([
      { keys: '[MouseLeft>]', target: content, coords: { clientX: 100 } },
      { target: content, coords: { clientX: 220 } },
      { keys: '[/MouseLeft]', target: content, coords: { clientX: 220 } },
    ]);
    expect(onSwipeRight).toHaveBeenCalledTimes(1);
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('calls onSwipeLeft when dragged past negative threshold', async () => {
    const user = userEvent.setup();
    const onSwipeLeft = vi.fn();
    render(<SwipeAction onSwipeLeft={onSwipeLeft}>Content</SwipeAction>);
    const content = screen.getByText('Content');
    await user.pointer([
      { keys: '[MouseLeft>]', target: content, coords: { clientX: 100 } },
      { target: content, coords: { clientX: -100 } },
      { keys: '[/MouseLeft]', target: content, coords: { clientX: -100 } },
    ]);
    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });

  it('does not call callbacks when drag stays below threshold', async () => {
    const user = userEvent.setup();
    const onSwipeRight = vi.fn();
    render(<SwipeAction onSwipeRight={onSwipeRight}>Content</SwipeAction>);
    const content = screen.getByText('Content');
    await user.pointer([
      { keys: '[MouseLeft>]', target: content, coords: { clientX: 100 } },
      { target: content, coords: { clientX: 140 } },
      { keys: '[/MouseLeft]', target: content, coords: { clientX: 140 } },
    ]);
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('clamps drag offset and resets it on release', async () => {
    const user = userEvent.setup();
    render(<SwipeAction>Content</SwipeAction>);
    const content = screen.getByText('Content');
    await user.pointer([
      { keys: '[MouseLeft>]', target: content, coords: { clientX: 0 } },
      { target: content, coords: { clientX: 300 } },
    ]);
    expect(content).toHaveStyle({ transform: 'translateX(120px)' });
    await user.pointer([{ keys: '[/MouseLeft]', target: content, coords: { clientX: 300 } }]);
    expect(content).toHaveStyle({ transform: 'translateX(0px)' });
  });

  it('ignores moves without a prior pointerdown', async () => {
    const user = userEvent.setup();
    render(<SwipeAction>Content</SwipeAction>);
    const content = screen.getByText('Content');
    await user.pointer([{ target: content, coords: { clientX: 500 } }]);
    expect(content).toHaveStyle({ transform: 'translateX(0px)' });
  });

  it('has no axe violations with actions on both sides', async () => {
    const { axe } = await import('jest-axe');
    render(
      <SwipeAction left={<span>Delete</span>} right={<span>Archive</span>}>
        Content
      </SwipeAction>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
