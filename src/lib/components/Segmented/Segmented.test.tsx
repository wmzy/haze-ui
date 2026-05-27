import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Segmented from './Segmented';

describe('Segmented', () => {
  it('renders options', () => {
    render(<Segmented options={['A', 'B', 'C']} />);
    expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'B' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'C' })).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Segmented options={['A']} className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('calls onChange on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Segmented options={['A', 'B']} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'B' }));
    expect(onChange).toHaveBeenCalledWith('B');
  });

  it('renders object options with label', () => {
    render(<Segmented options={[{ value: 'a', label: 'Alpha' }]} />);
    expect(screen.getByRole('button', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('disables option', () => {
    render(<Segmented options={[{ value: 'a', label: 'A', disabled: true }, 'B']} />);
    expect(screen.getByRole('button', { name: 'A' })).toBeDisabled();
  });
});
