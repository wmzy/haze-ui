import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Pagination from './Pagination';

describe('Pagination', () => {
  it('renders a nav element', () => {
    render(<Pagination total={100} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders page buttons', () => {
    render(<Pagination total={50} pageSize={10} />);
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
  });

  it('renders prev and next buttons', () => {
    render(<Pagination total={50} pageSize={10} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('disables prev button on first page', () => {
    render(<Pagination total={50} pageSize={10} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination total={50} pageSize={10} page={5} />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('calls page change on click', async () => {
    const user = userEvent.setup();
    render(<Pagination total={50} pageSize={10} />);
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Pagination className="custom" total={50} />);
    expect(screen.getByRole('navigation')).toHaveClass('custom');
  });
});
