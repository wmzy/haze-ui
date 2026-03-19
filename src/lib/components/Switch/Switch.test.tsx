import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Switch from './Switch';

describe('Switch', () => {
  it('renders with switch role', () => {
    render(<Switch aria-label="toggle" />);
    expect(screen.getByRole('switch', { name: 'toggle' })).toBeInTheDocument();
  });

  it('has type="button"', () => {
    render(<Switch aria-label="toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('type', 'button');
  });

  it('applies className', () => {
    render(<Switch className="custom" aria-label="toggle" />);
    expect(screen.getByRole('switch')).toHaveClass('custom');
  });

  it('defaults to unchecked (aria-checked=false)', () => {
    render(<Switch aria-label="toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('can be initialized as checked', () => {
    render(<Switch checked aria-label="toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles on click', async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="toggle" />);
    const sw = screen.getByRole('switch');
    await user.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
    await user.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onClick handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Switch aria-label="toggle" onClick={onClick} />);
    await user.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards disabled prop', () => {
    render(<Switch disabled aria-label="toggle" />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });
});
