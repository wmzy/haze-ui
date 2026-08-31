import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Checkbox from './Checkbox';
import CheckboxCore from './CheckboxCore';

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

describe('CheckboxCore', () => {
  it('renders the given checked value', () => {
    render(<CheckboxCore checked onChange={() => undefined} aria-label="core" />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onChange with the next checked value on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CheckboxCore checked={false} onChange={onChange} aria-label="core" />);
    await user.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle on its own: rerender drives the DOM', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const {rerender} = render(
      <CheckboxCore checked={false} onChange={onChange} aria-label="core" />
    );
    await user.click(screen.getByRole('checkbox'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    rerender(<CheckboxCore checked onChange={onChange} aria-label="core" />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });
});
