import { render, screen } from '@testing-library/react';

import ToolCallCard from './ToolCallCard';

describe('ToolCallCard', () => {
  it('renders tool name', () => {
    render(<ToolCallCard name="search" />);
    expect(screen.getByText('search')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<ToolCallCard name="search" className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders default pending status', () => {
    render(<ToolCallCard name="search" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders running status', () => {
    render(<ToolCallCard name="search" status="running" />);
    expect(screen.getByText('Running...')).toBeInTheDocument();
  });

  it('renders done status', () => {
    render(<ToolCallCard name="search" status="done" />);
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders error status', () => {
    render(<ToolCallCard name="search" status="error" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders input', () => {
    render(<ToolCallCard name="search" input="query text" />);
    expect(screen.getByText('query text')).toBeInTheDocument();
  });

  it('renders output', () => {
    render(<ToolCallCard name="search" output="result data" />);
    expect(screen.getByText('result data')).toBeInTheDocument();
  });

  it('renders both input and output', () => {
    render(<ToolCallCard name="search" input="query" output="result" />);
    expect(screen.getByText('Input')).toBeInTheDocument();
    expect(screen.getByText('Output')).toBeInTheDocument();
  });
});
