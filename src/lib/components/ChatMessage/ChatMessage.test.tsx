import { render, screen } from '@testing-library/react';

import ChatMessage from './ChatMessage';

describe('ChatMessage', () => {
  it('renders children', () => {
    render(<ChatMessage role="user">Hello</ChatMessage>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders assistant message', () => {
    render(<ChatMessage role="assistant">Hi there</ChatMessage>);
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('renders system message', () => {
    render(<ChatMessage role="system">System notice</ChatMessage>);
    expect(screen.getByText('System notice')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<ChatMessage role="user" className="custom">Msg</ChatMessage>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders avatar fallback', () => {
    render(<ChatMessage role="user">Msg</ChatMessage>);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('renders custom avatar', () => {
    render(<ChatMessage role="assistant" avatar={<span>AI</span>}>Msg</ChatMessage>);
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('renders name and timestamp', () => {
    render(<ChatMessage role="user" name="Alice" timestamp="10:30">Msg</ChatMessage>);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });

  it('renders error status', () => {
    render(<ChatMessage role="user" status="error">Msg</ChatMessage>);
    expect(screen.getByText('Failed to send')).toBeInTheDocument();
  });

  it('renders sending status', () => {
    render(<ChatMessage role="user" status="sending">Msg</ChatMessage>);
    expect(screen.getByText('Sending...')).toBeInTheDocument();
  });
});
