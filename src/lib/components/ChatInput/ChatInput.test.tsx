import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ChatInput from './ChatInput';

describe('ChatInput', () => {
  it('renders textarea', () => {
    render(<ChatInput />);
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<ChatInput className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders custom placeholder', () => {
    render(<ChatInput placeholder="Ask me anything" />);
    expect(screen.getByPlaceholderText('Ask me anything')).toBeInTheDocument();
  });

  it('calls onSend on Enter', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const textarea = screen.getByPlaceholderText('Type a message...');
    await user.type(textarea, 'Hello{Enter}');
    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('does not call onSend on Shift+Enter', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const textarea = screen.getByPlaceholderText('Type a message...');
    await user.type(textarea, 'Hello{Shift>}{Enter}{/Shift}');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('clears input after send', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={vi.fn()} />);
    const textarea = screen.getByPlaceholderText('Type a message...');
    await user.type(textarea, 'Hello{Enter}');
    expect((textarea as HTMLTextAreaElement).value).toBe('');
  });

  it('does not send empty message', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const sendBtn = screen.getByRole('button', { name: 'Send' });
    await user.click(sendBtn);
    expect(onSend).not.toHaveBeenCalled();
  });

  it('disables input when disabled', () => {
    render(<ChatInput disabled />);
    expect(screen.getByPlaceholderText('Type a message...')).toBeDisabled();
  });
});
