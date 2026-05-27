import { render, screen } from '@testing-library/react';

import CodeBlock from './CodeBlock';

describe('CodeBlock', () => {
  it('renders code content', () => {
    render(<CodeBlock>const x = 1;</CodeBlock>);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<CodeBlock className="custom">code</CodeBlock>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders language label', () => {
    render(<CodeBlock language="js">code</CodeBlock>);
    expect(screen.getByText('js')).toBeInTheDocument();
  });

  it('does not render language label when not provided', () => {
    const { container } = render(<CodeBlock>code</CodeBlock>);
    expect(container.querySelector('span')).not.toBeInTheDocument();
  });

  it('renders in pre > code', () => {
    const { container } = render(<CodeBlock>hello</CodeBlock>);
    expect(container.querySelector('pre > code')).toBeInTheDocument();
  });
});
