import { render, screen } from '@testing-library/react';

import ScrollArea from './ScrollArea';

describe('ScrollArea', () => {
  it('renders children', () => {
    render(<ScrollArea>Content</ScrollArea>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<ScrollArea className="custom">X</ScrollArea>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('sets max-height via style', () => {
    const { container } = render(<ScrollArea maxHeight={200}>X</ScrollArea>);
    expect(container.firstChild).toHaveStyle({ maxHeight: '200px' });
  });

  it('sets max-height as string', () => {
    const { container } = render(<ScrollArea maxHeight="50vh">X</ScrollArea>);
    // jsdom 30+ 的 getComputedStyle 会把 vh 解析为像素，故直接断言 inline style
    expect((container.firstChild as HTMLElement).style.maxHeight).toBe('50vh');
  });
});
