import { render, screen } from '@testing-library/react';

import Flex from './Flex';

describe('Flex', () => {
  it('renders children', () => {
    render(<Flex>Content</Flex>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders as a div', () => {
    const { container } = render(<Flex>Content</Flex>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('applies className', () => {
    const { container } = render(<Flex className="custom">Content</Flex>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies direction style', () => {
    const { container } = render(<Flex direction="column">Content</Flex>);
    expect(container.firstChild).toHaveStyle({ flexDirection: 'column' });
  });

  it('applies align and justify styles', () => {
    const { container } = render(
      <Flex align="center" justify="space-between">Content</Flex>
    );
    expect(container.firstChild).toHaveStyle({
      alignItems: 'center',
      justifyContent: 'space-between',
    });
  });

  it('applies numeric gap as px', () => {
    const { container } = render(<Flex gap={16}>Content</Flex>);
    expect(container.firstChild).toHaveStyle({ gap: '16px' });
  });

  it('applies string gap as-is', () => {
    const { container } = render(<Flex gap="1rem">Content</Flex>);
    expect(container.firstChild).toHaveStyle({ gap: '1rem' });
  });

  it('applies wrap style', () => {
    const { container } = render(<Flex wrap>Content</Flex>);
    expect(container.firstChild).toHaveStyle({ flexWrap: 'wrap' });
  });
});
