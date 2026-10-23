import { expect } from 'vitest';
import { createRef } from 'react';
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
