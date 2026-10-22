import { render, screen } from '@testing-library/react';

import Card from './Card';
import { cardVariants } from './index';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders as a div', () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('applies className', () => {
    const { container } = render(<Card className="custom">Content</Card>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Card>
        <h3>Card title</h3>
        <p>Card content</p>
      </Card>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('cardVariants exports', () => {
  it('exposes the variant skin classes for composition', () => {
    expect(Object.keys(cardVariants)).toEqual(['elevated', 'outlined', 'filled']);
    for (const cls of Object.values(cardVariants)) {
      expect(cls).toBeTruthy();
    }
  });

  it('is the exact class Card wears', () => {
    render(<Card variant="outlined">Skin</Card>);
    expect(screen.getByText('Skin')).toHaveClass(cardVariants.outlined);
  });
});
