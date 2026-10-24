import type { ReactNode } from 'react';

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

describe('as polymorphism', () => {
  it("as='a' renders the whole card as a link: href lands on <a>, skin and data-slot intact", () => {
    render(<Card as='a' href='/docs'>Docs card</Card>);
    const link = screen.getByRole('link', { name: /Docs card/ });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveAttribute('data-slot', 'card');
    expect(link).toHaveClass(cardVariants.elevated);
  });

  it("as='a' forwards native anchor attrs (target/rel) and the rest", () => {
    render(
      <Card as='a' href='/docs' target='_blank' rel='noopener' data-testid='card-link'>
        Docs
      </Card>
    );
    const link = screen.getByTestId('card-link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
  });

  it("as='a' merges className with the card skin", () => {
    render(
      <Card as='a' href='/docs' className='custom'>
        Linked
      </Card>
    );
    expect(screen.getByRole('link')).toHaveClass('custom');
  });

  it('as with a component: skin + data-slot reach the inner element', () => {
    function RouterLink({
      to,
      children,
      ...rest
    }: { to: string; children: ReactNode } & Record<string, unknown>) {
      return <a href={to} {...rest}>{children}</a>;
    }
    render(
      <Card as={RouterLink} to='/routed'>
        Routed
      </Card>
    );
    const link = screen.getByRole('link', { name: /Routed/ });
    expect(link).toHaveAttribute('href', '/routed');
    expect(link).toHaveAttribute('data-slot', 'card');
  });

  it('whole-card links have no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Card as='a' href='/docs'>
        <h3>Card title</h3>
        <p>Whole-card link</p>
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
