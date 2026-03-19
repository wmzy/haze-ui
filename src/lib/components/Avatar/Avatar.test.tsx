import { render, screen, fireEvent } from '@testing-library/react';

import Avatar from './Avatar';

describe('Avatar', () => {
  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.png" alt="User" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
    expect(img).toHaveAttribute('alt', 'User');
  });

  it('renders first letter of alt as fallback when no src', () => {
    render(<Avatar alt="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders "?" when no src and no alt', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders custom fallback', () => {
    render(<Avatar fallback={<span data-testid="fb">FB</span>} />);
    expect(screen.getByTestId('fb')).toBeInTheDocument();
  });

  it('falls back to text when image errors', () => {
    render(<Avatar src="broken.png" alt="Jane" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Avatar className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders image with empty alt when alt is undefined', () => {
    const { container } = render(<Avatar src="https://example.com/avatar.png" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', '');
  });
});
