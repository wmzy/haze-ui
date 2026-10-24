import type { ReactNode } from 'react';

import { createRef } from 'react';

import { expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Tag from './Tag';
import { tagVariants, tagSizes } from './index';

describe('Tag', () => {
  it('renders children', () => {
    render(<Tag>Label</Tag>);
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('renders as a span', () => {
    const { container } = render(<Tag>Label</Tag>);
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });

  it('applies className', () => {
    const { container } = render(<Tag className="custom">Label</Tag>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('does not render close button by default', () => {
    render(<Tag>Label</Tag>);
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('renders close button when closable', () => {
    render(<Tag closable>Label</Tag>);
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('honors removeLabel for the close button name', () => {
    render(<Tag closable removeLabel="标签移除">Label</Tag>);
    expect(screen.getByRole('button', { name: '标签移除' })).toBeInTheDocument();
  });

  it('forwards the ref onto the root span', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Tag ref={ref}>Label</Tag>);
    expect(ref.current).toBe(screen.getByText('Label'));
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Tag closable onClose={onClose}>Label</Tag>);
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <>
        <Tag>Static</Tag>
        <Tag closable onClose={() => undefined}>Removable</Tag>
      </>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('as polymorphism', () => {
  it("as='a' renders a tag link: href lands on <a>, skin and data-slot intact", () => {
    render(<Tag as='a' href='/filter/react'>React</Tag>);
    const link = screen.getByRole('link', { name: 'React' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/filter/react');
    expect(link).toHaveAttribute('data-slot', 'tag');
    expect(link).toHaveClass(tagVariants.default);
    expect(link).toHaveClass(tagSizes.md);
  });

  it("as='a' forwards native anchor attrs and the rest", () => {
    render(
      <Tag as='a' href='/x' target='_blank' data-testid='tag-link'>
        Linked
      </Tag>
    );
    expect(screen.getByTestId('tag-link')).toHaveAttribute('target', '_blank');
  });

  it("as='a' merges className with the tag skin", () => {
    render(
      <Tag as='a' href='/x' color='primary' className='custom'>
        Linked
      </Tag>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveClass('custom');
    expect(link).toHaveClass(tagVariants.primary);
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
      <Tag as={RouterLink} to='/routed'>
        Routed
      </Tag>
    );
    const link = screen.getByRole('link', { name: 'Routed' });
    expect(link).toHaveAttribute('href', '/routed');
    expect(link).toHaveAttribute('data-slot', 'tag');
  });

  it('tag links have no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <>
        <Tag as='a' href='/a'>Alpha</Tag>
        <Tag as='a' href='/b' color='success'>Beta</Tag>
      </>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('tagVariants / tagSizes exports', () => {
  it('exposes the color and size skin classes for composition', () => {
    expect(Object.keys(tagVariants)).toEqual([
      'default',
      'primary',
      'success',
      'warning',
      'danger',
      'info',
    ]);
    expect(Object.keys(tagSizes)).toEqual(['sm', 'md']);
    for (const cls of [...Object.values(tagVariants), ...Object.values(tagSizes)]) {
      expect(cls).toBeTruthy();
    }
  });

  it('are the exact classes Tag wears', () => {
    render(<Tag color="primary" size="sm">Skin</Tag>);
    const tag = screen.getByText('Skin');
    expect(tag).toHaveClass(tagVariants.primary);
    expect(tag).toHaveClass(tagSizes.sm);
  });

  it('maps the info color onto the tag', () => {
    const { container } = render(
      <Tag color="info" size="sm">Info</Tag>
    );
    expect(container.firstChild).toHaveClass(tagVariants.info);
  });
});
