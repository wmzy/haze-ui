import { render } from '@testing-library/react';

import Skeleton from './Skeleton';

describe('Skeleton', () => {
  it('renders as a span', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild?.nodeName).toBe('SPAN');
  });

  it('applies className', () => {
    const { container } = render(<Skeleton className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies numeric width/height as px', () => {
    const { container } = render(<Skeleton width={100} height={20} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('100px');
    expect(el.style.height).toBe('20px');
  });

  it('applies string width/height as-is', () => {
    const { container } = render(<Skeleton width="50%" height="2rem" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('50%');
    expect(el.style.height).toBe('2rem');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Skeleton width={100} height={20} />);
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
