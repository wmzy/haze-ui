import { render, screen, fireEvent } from '@testing-library/react';

import Image from './Image';

describe('Image', () => {
  it('renders an image with src and alt', () => {
    render(<Image src="photo.jpg" alt="A photo" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'photo.jpg');
    expect(img).toHaveAttribute('alt', 'A photo');
  });

  it('applies className to wrapper', () => {
    const { container } = render(<Image src="photo.jpg" alt="test" className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies aspectRatio style', () => {
    const { container } = render(<Image src="photo.jpg" alt="test" aspectRatio="16/9" />);
    expect(container.firstChild).toHaveStyle({ aspectRatio: '16/9' });
  });

  it('applies objectFit style to img', () => {
    render(<Image src="photo.jpg" alt="test" objectFit="contain" />);
    expect(screen.getByRole('img')).toHaveStyle({ objectFit: 'contain' });
  });

  it('shows fallback when image errors', () => {
    render(<Image src="broken.jpg" alt="test" fallback={<span data-testid="fb">Error</span>} />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByTestId('fb')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('still shows img when error but no fallback', () => {
    render(<Image src="broken.jpg" alt="test" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
