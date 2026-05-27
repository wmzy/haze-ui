import { render, screen, fireEvent } from '@testing-library/react';

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
    const content = screen.getByText('Content').parentElement!;
    fireEvent.pointerDown(content, { clientX: 100 });
    fireEvent.pointerMove(content, { clientX: 200 });
    fireEvent.pointerUp(content);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
