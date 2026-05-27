import { render, screen } from '@testing-library/react';

import { Title, Text, Paragraph } from './index';

describe('Title', () => {
  it('renders an h1 by default', () => {
    render(<Title>Hello</Title>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders different levels', () => {
    render(<Title level={2}>Sub</Title>);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Title className="custom">T</Title>);
    expect(screen.getByRole('heading')).toHaveClass('custom');
  });
});

describe('Text', () => {
  it('renders a span', () => {
    render(<Text>hello</Text>);
    expect(screen.getByText('hello').tagName).toBe('SPAN');
  });

  it('renders with different types', () => {
    render(<Text type="secondary">sec</Text>);
    expect(screen.getByText('sec')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Text className="custom">x</Text>);
    expect(screen.getByText('x')).toHaveClass('custom');
  });

  it('renders strong', () => {
    render(<Text strong>bold</Text>);
    expect(screen.getByText('bold').tagName).toBe('STRONG');
  });

  it('renders code', () => {
    render(<Text code>npm</Text>);
    expect(screen.getByText('npm').tagName).toBe('CODE');
  });
});

describe('Paragraph', () => {
  it('renders a p element', () => {
    render(<Paragraph>text</Paragraph>);
    expect(screen.getByText('text').tagName).toBe('P');
  });

  it('applies className', () => {
    render(<Paragraph className="custom">x</Paragraph>);
    expect(screen.getByText('x')).toHaveClass('custom');
  });
});
