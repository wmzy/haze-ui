import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Chip from './Chip';

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

  it('renders different variants', () => {
    render(<Chip variant="outline">Outlined</Chip>);
    expect(screen.getByText('Outlined')).toBeInTheDocument();
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
