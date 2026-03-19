import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Checkbox from './Checkbox';

describe('Checkbox', () => {
  it('renders a checkbox input', () => {
    render(<Checkbox aria-label="agree" />);
    expect(screen.getByRole('checkbox', { name: 'agree' })).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Checkbox className="custom" aria-label="test" />);
    expect(screen.getByRole('checkbox')).toHaveClass('custom');
  });

  it('defaults to unchecked', () => {
    render(<Checkbox aria-label="test" />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('can be initialized as checked', () => {
    render(<Checkbox checked aria-label="test" />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('toggles on click', async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="test" />);
    const cb = screen.getByRole('checkbox');
    await user.click(cb);
    expect(cb).toBeChecked();
    await user.click(cb);
    expect(cb).not.toBeChecked();
  });

  it('calls onChange handler', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox aria-label="test" onChange={onChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards disabled prop', () => {
    render(<Checkbox disabled aria-label="test" />);
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
