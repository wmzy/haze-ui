import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConversationList from './ConversationList';
import ConversationItem from './ConversationItem';

describe('ConversationList', () => {
  it('renders children', () => {
    render(
      <ConversationList>
        <ConversationItem title="Chat 1" />
      </ConversationList>,
    );
    expect(screen.getByText('Chat 1')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<ConversationList className="custom"><div /></ConversationList>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders multiple items', () => {
    render(
      <ConversationList>
        <ConversationItem title="Chat 1" />
        <ConversationItem title="Chat 2" />
      </ConversationList>,
    );
    expect(screen.getByText('Chat 1')).toBeInTheDocument();
    expect(screen.getByText('Chat 2')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<ConversationItem title="Chat" subtitle="Last message" />);
    expect(screen.getByText('Last message')).toBeInTheDocument();
  });

  it('renders active state', () => {
    render(<ConversationItem title="Chat" active />);
    expect(screen.getByText('Chat').closest('[aria-current]')).toBeTruthy();
  });

  it('calls onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ConversationItem title="Chat" onClick={onClick} />);
    await user.click(screen.getByText('Chat'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders end slot', () => {
    render(<ConversationItem title="Chat" end={<span>Delete</span>} />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
