import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BottomSheet from './BottomSheet';

describe('BottomSheet', () => {
  it('renders when open', () => {
    render(<BottomSheet open>Content</BottomSheet>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<BottomSheet>Content</BottomSheet>);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<BottomSheet open className="custom">Content</BottomSheet>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('closes on overlay click', async () => {
    const user = userEvent.setup();
    render(<BottomSheet open>Content</BottomSheet>);
    const overlay = screen.getByText('Content').closest('[class]')?.parentElement;
    if (overlay) await user.click(overlay);
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('does not close on content click', async () => {
    const user = userEvent.setup();
    render(<BottomSheet open>Content</BottomSheet>);
    await user.click(screen.getByText('Content'));
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
