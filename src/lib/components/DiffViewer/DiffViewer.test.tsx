import { render, screen } from '@testing-library/react';

import DiffViewer from './DiffViewer';

describe('DiffViewer', () => {
  it('renders unchanged lines', () => {
    render(<DiffViewer oldValue="hello" newValue="hello" />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<DiffViewer oldValue="a" newValue="b" className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('shows added lines', () => {
    const { container } = render(<DiffViewer oldValue="" newValue="new line" />);
    expect(container.querySelector('[class*="added"]')).toBeInTheDocument();
  });

  it('shows removed lines', () => {
    const { container } = render(<DiffViewer oldValue="old line" newValue="" />);
    expect(container.querySelector('[class*="removed"]')).toBeInTheDocument();
  });

  it('shows diff header', () => {
    render(<DiffViewer oldValue="a" newValue="b" />);
    expect(screen.getByText('Diff')).toBeInTheDocument();
  });

  it('handles multiline diff', () => {
    render(<DiffViewer oldValue={'line1\nline2'} newValue={'line1\nline3'} />);
    expect(screen.getByText('line1')).toBeInTheDocument();
  });
});
