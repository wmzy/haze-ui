import { render, screen } from '@testing-library/react';

import ChatContainer from './ChatContainer';

describe('ChatContainer', () => {
  it('renders children', () => {
    render(<ChatContainer><div>Message</div></ChatContainer>);
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<ChatContainer className="custom">Content</ChatContainer>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders multiple children', () => {
    render(
      <ChatContainer>
        <div>Msg 1</div>
        <div>Msg 2</div>
        <div>Msg 3</div>
      </ChatContainer>,
    );
    expect(screen.getByText('Msg 1')).toBeInTheDocument();
    expect(screen.getByText('Msg 2')).toBeInTheDocument();
    expect(screen.getByText('Msg 3')).toBeInTheDocument();
  });
});
