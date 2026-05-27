import { render, screen } from '@testing-library/react';

import MarkdownRenderer from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('renders plain text', () => {
    render(<MarkdownRenderer content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<MarkdownRenderer content="text" className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders headings', () => {
    const { container } = render(<MarkdownRenderer content="# Title" />);
    expect(container.querySelector('h1')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('renders bold text', () => {
    const { container } = render(<MarkdownRenderer content="**bold**" />);
    expect(container.querySelector('strong')).toBeInTheDocument();
  });

  it('renders italic text', () => {
    const { container } = render(<MarkdownRenderer content="*italic*" />);
    expect(container.querySelector('em')).toBeInTheDocument();
  });

  it('renders inline code', () => {
    const { container } = render(<MarkdownRenderer content="`code`" />);
    expect(container.querySelector('code')).toBeInTheDocument();
  });

  it('renders code blocks', () => {
    const { container } = render(<MarkdownRenderer content={'```js\nconst x = 1;\n```'} />);
    expect(container.querySelector('pre')).toBeInTheDocument();
  });

  it('renders links', () => {
    const { container } = render(<MarkdownRenderer content="[link](https://example.com)" />);
    const a = container.querySelector('a');
    expect(a).toBeInTheDocument();
    expect(a).toHaveAttribute('href', 'https://example.com');
  });

  it('renders unordered lists', () => {
    const { container } = render(<MarkdownRenderer content="- item 1\n- item 2" />);
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('renders blockquote', () => {
    const { container } = render(<MarkdownRenderer content="> quote" />);
    expect(container.querySelector('blockquote')).toBeInTheDocument();
  });

  it('renders horizontal rule', () => {
    const { container } = render(<MarkdownRenderer content="---" />);
    expect(container.querySelector('hr')).toBeInTheDocument();
  });
});
