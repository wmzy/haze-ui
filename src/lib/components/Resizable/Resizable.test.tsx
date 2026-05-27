import { render, screen } from '@testing-library/react';

import { ResizablePanel, ResizableGroup, ResizableHandle } from './index';

describe('Resizable', () => {
  it('renders panels', () => {
    render(
      <ResizableGroup>
        <ResizablePanel>Left</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>Right</ResizablePanel>
      </ResizableGroup>
    );
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });

  it('applies className to group', () => {
    const { container } = render(
      <ResizableGroup className="custom">
        <ResizablePanel>Content</ResizablePanel>
      </ResizableGroup>
    );
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders handle', () => {
    const { container } = render(
      <ResizableGroup>
        <ResizablePanel>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>B</ResizablePanel>
      </ResizableGroup>
    );
    const handles = container.querySelectorAll('[role="separator"]');
    expect(handles.length).toBe(1);
  });

  it('handle has aria-orientation', () => {
    const { container } = render(
      <ResizableGroup direction="vertical">
        <ResizablePanel>A</ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>B</ResizablePanel>
      </ResizableGroup>
    );
    const handle = container.querySelector('[role="separator"]');
    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
  });
});
