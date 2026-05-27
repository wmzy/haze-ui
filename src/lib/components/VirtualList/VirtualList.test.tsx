import { render, screen } from '@testing-library/react';

import VirtualList from './VirtualList';

describe('VirtualList', () => {
  const items = Array.from({ length: 100 }, (_, i) => `Item ${i}`);

  it('renders visible items', () => {
    render(
      <VirtualList
        items={items}
        height={200}
        itemHeight={40}
        renderItem={(item) => <div>{item}</div>}
      />,
    );
    expect(screen.getByText('Item 0')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(
      <VirtualList
        items={items}
        height={200}
        itemHeight={40}
        renderItem={(item) => <div>{item}</div>}
        className="custom"
      />,
    );
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders empty list', () => {
    const { container } = render(
      <VirtualList
        items={[]}
        height={200}
        itemHeight={40}
        renderItem={(item) => <div>{item}</div>}
      />,
    );
    expect(container.querySelector('[style*="height"]')).toBeInTheDocument();
  });

  it('applies container height', () => {
    const { container } = render(
      <VirtualList
        items={items}
        height={300}
        itemHeight={40}
        renderItem={(item) => <div>{item}</div>}
      />,
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.height).toBe('300px');
  });
});
