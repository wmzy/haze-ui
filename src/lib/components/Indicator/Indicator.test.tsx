import { render, screen } from '@testing-library/react';

import Indicator from './Indicator';

describe('Indicator', () => {
  it('wraps the host child and renders a dot when label is omitted', () => {
    render(
      <Indicator>
        <span data-testid='host'>host</span>
      </Indicator>
    );
    expect(screen.getByTestId('host')).toBeInTheDocument();
    expect(document.querySelector("[data-slot='dot']")).not.toBeNull();
    expect(screen.queryByText('0')).toBeNull();
  });

  it('renders the label as a count badge, aria-hidden', () => {
    render(
      <Indicator label={5}>
        <span>inbox</span>
      </Indicator>
    );
    const badge = document.querySelector("[data-slot='badge']");
    expect(badge).toHaveTextContent('5');
    expect(badge).toHaveAttribute('aria-hidden', 'true');
  });

  it('hides a zero badge by default and honors showZero', () => {
    const { rerender } = render(<Indicator label={0}><span>x</span></Indicator>);
    expect(document.querySelector("[data-slot='badge']")).toBeNull();
    rerender(<Indicator label={0} showZero><span>x</span></Indicator>);
    expect(document.querySelector("[data-slot='badge']")).toHaveTextContent('0');
  });

  it('string labels bypass the zero rule', () => {
    render(<Indicator label='99+'><span>x</span></Indicator>);
    expect(document.querySelector("[data-slot='badge']")).toHaveTextContent('99+');
  });

  it('renders render-empty labels (false / "") as a dot, not an empty badge', () => {
    const { container } = render(<Indicator label={false}>x</Indicator>);
    expect(container.querySelector("[data-slot='dot']")).not.toBeNull();
    expect(container.querySelector("[data-slot='badge']")).toBeNull();
    const { container: c2 } = render(<Indicator label=''>x</Indicator>);
    expect(c2.querySelector("[data-slot='dot']")).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Indicator label={3}>
        <button type='button' aria-label='Notifications'>bell</button>
      </Indicator>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
