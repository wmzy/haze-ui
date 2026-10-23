import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Chip from './Chip';
import { chipVariants } from './index';

describe('Chip', () => {
  it('renders children', () => {
    render(<Chip>Hello</Chip>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Chip className="custom">X</Chip>);
    expect(screen.getByText('X')).toHaveClass('custom');
  });

  it('renders with icon', () => {
    render(<Chip icon={<span>i</span>}>With icon</Chip>);
    expect(screen.getByText('i')).toBeInTheDocument();
  });

  it('renders close button when onClose provided', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Chip onClose={onClose}>Deletable</Chip>);
    const closeBtn = screen.getByRole('button', { name: 'Remove' });
    expect(closeBtn).toBeInTheDocument();
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render close button without onClose', () => {
    render(<Chip>Simple</Chip>);
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('honors removeLabel for the close button name', () => {
    render(<Chip onClose={() => undefined} removeLabel="移除标签">Deletable</Chip>);
    expect(screen.getByRole('button', { name: '移除标签' })).toBeInTheDocument();
  });

  it('renders different variants', () => {
    render(<Chip variant="outline">Outlined</Chip>);
    expect(screen.getByText('Outlined')).toBeInTheDocument();
  });

  it('forwards the ref onto the root span', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Chip ref={ref}>Simple</Chip>);
    expect(ref.current).toBe(screen.getByText('Simple'));
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <>
        <Chip>Simple</Chip>
        <Chip icon={<span aria-hidden="true">i</span>} onClose={() => undefined}>
          Deletable
        </Chip>
      </>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('chipVariants exports', () => {
  it('exposes the variant × color skin matrix for composition', () => {
    expect(Object.keys(chipVariants)).toEqual(['solid', 'outline']);
    for (const colorMap of Object.values(chipVariants)) {
      expect(Object.keys(colorMap)).toEqual([
        'default',
        'primary',
        'success',
        'warning',
        'danger',
        'info',
      ]);
      for (const cls of Object.values(colorMap)) {
        expect(cls).toBeTruthy();
      }
    }
  });

  it('is the exact class Chip wears', () => {
    render(<Chip variant="outline" color="info">Skin</Chip>);
    expect(screen.getByText('Skin')).toHaveClass(chipVariants.outline.info);
  });
});
