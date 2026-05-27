import { render, screen } from '@testing-library/react';

import Affix from './Affix';

describe('Affix', () => {
  it('renders children', () => {
    render(<Affix>Fixed content</Affix>);
    expect(screen.getByText('Fixed content')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Affix className="custom">Content</Affix>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('defaults to top position', () => {
    const { container } = render(<Affix>Content</Affix>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.top).toBe('0px');
  });

  it('applies bottom position', () => {
    const { container } = render(<Affix position="bottom">Content</Affix>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.bottom).toBe('0px');
  });

  it('applies offset', () => {
    const { container } = render(<Affix offset={20}>Content</Affix>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.top).toBe('20px');
  });

  it('applies custom style', () => {
    const { container } = render(<Affix style={{ zIndex: 999 }}>Content</Affix>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.zIndex).toBe('999');
  });
});
