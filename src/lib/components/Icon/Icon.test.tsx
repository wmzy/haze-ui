import { render } from '@testing-library/react';

import Icon from './Icon';

function MockSvgIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg data-testid="mock-svg" {...props}><circle r="5" /></svg>;
}

describe('Icon', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<Icon><svg /></Icon>);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders children when no icon prop', () => {
    const { container } = render(<Icon><svg data-testid="child-svg" /></Icon>);
    expect(container.querySelector('[data-testid="child-svg"]')).toBeInTheDocument();
  });

  it('renders icon component when provided', () => {
    const { container } = render(<Icon icon={MockSvgIcon} />);
    expect(container.querySelector('[data-testid="mock-svg"]')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Icon className="custom"><svg /></Icon>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('detects stroke-based SVG children', () => {
    const { container } = render(
      <Icon>
        <svg stroke="currentColor" strokeWidth="2"><line x1="0" y1="0" x2="10" y2="10" /></svg>
      </Icon>
    );
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('detects fill=none SVG children', () => {
    const { container } = render(
      <Icon>
        <svg fill="none"><path d="M0 0" /></svg>
      </Icon>
    );
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles non-stroke children', () => {
    const { container } = render(
      <Icon>
        <svg><rect width="10" height="10" /></svg>
      </Icon>
    );
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('handles null children', () => {
    const { container } = render(<Icon />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });
});
