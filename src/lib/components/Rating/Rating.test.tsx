import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Rating from './Rating';

describe('Rating', () => {
  it('renders 5 stars by default', () => {
    const { container } = render(<Rating />);
    const stars = container.querySelectorAll('[role="radio"]');
    expect(stars.length).toBe(5);
  });

  it('applies className', () => {
    const { container } = render(<Rating className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders custom count', () => {
    const { container } = render(<Rating count={3} />);
    const stars = container.querySelectorAll('[role="radio"]');
    expect(stars.length).toBe(3);
  });

  it('calls onChange on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rating onChange={onChange} />);
    const stars = screen.getAllByRole('radio');
    await user.click(stars[2]!);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('highlights stars up to value', () => {
    const { container } = render(<Rating value={3} />);
    const stars = container.querySelectorAll('[role="radio"]');
    expect(stars[0]).toHaveAttribute('aria-checked', 'true');
    expect(stars[1]).toHaveAttribute('aria-checked', 'true');
    expect(stars[2]).toHaveAttribute('aria-checked', 'true');
    expect(stars[3]).toHaveAttribute('aria-checked', 'false');
  });

  it('supports half rating', () => {
    const { container } = render(<Rating value={3.5} allowHalf />);
    const stars = container.querySelectorAll('[role="radio"]');
    expect(stars.length).toBe(5);
  });
});
