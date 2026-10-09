import { render, screen } from '@testing-library/react';

import VisuallyHidden from './VisuallyHidden';

describe('VisuallyHidden', () => {
  it('renders children in the accessibility tree', () => {
    render(<VisuallyHidden>Open settings</VisuallyHidden>);
    // the clip recipe keeps the text exposed to AT (the whole point —
    // display:none would drop it)
    expect(screen.getByText('Open settings')).toBeInTheDocument();
  });

  it('carries the clipped-visuals class and data-slot', () => {
    const { container } = render(<VisuallyHidden>x</VisuallyHidden>);
    const el = container.querySelector("[data-slot='visually-hidden']");
    expect(el).not.toBeNull();
    expect(el!.className).toContain('haze-');
  });

  it('applies className and forwards native props', () => {
    render(<VisuallyHidden className='custom' id='vh'>hint</VisuallyHidden>);
    const el = screen.getByText('hint');
    expect(el).toHaveClass('custom');
    expect(el).toHaveAttribute('id', 'vh');
  });

  it('labels an icon-only button when composed as its child', () => {
    render(
      <button type='button'>
        ⚙<VisuallyHidden>Settings</VisuallyHidden>
      </button>
    );
    expect(screen.getByRole('button', { name: /Settings/ })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <span>
        Visually <VisuallyHidden>hidden</VisuallyHidden> text
      </span>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
