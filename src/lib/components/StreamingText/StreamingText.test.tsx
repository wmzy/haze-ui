import { render, screen, act } from '@testing-library/react';

import StreamingText from './StreamingText';

describe('StreamingText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders initially empty', () => {
    render(<StreamingText text="Hello" speed={100} />);
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
  });

  it('streams text over time', () => {
    render(<StreamingText text="Hi" speed={100} showCursor={false} />);
    act(() => { vi.advanceTimersByTime(100); });
    expect(screen.getByText('H')).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(100); });
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });

  it('calls onComplete when done', () => {
    const onComplete = vi.fn();
    render(<StreamingText text="OK" speed={50} onComplete={onComplete} />);
    act(() => { vi.advanceTimersByTime(50); });
    act(() => { vi.advanceTimersByTime(50); });
    expect(onComplete).toHaveBeenCalled();
  });

  it('applies className', () => {
    const { container } = render(<StreamingText text="Hi" className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });
});
