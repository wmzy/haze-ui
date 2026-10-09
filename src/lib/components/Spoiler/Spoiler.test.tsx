import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import Spoiler from './Spoiler';

describe('Spoiler', () => {
  it('starts collapsed with the toggle labeled Show more', () => {
    render(<Spoiler maxHeight={64}>Long content</Spoiler>);
    const content = screen.getByText('Long content');
    expect(content).toHaveStyle('max-height: 64px');
    expect(screen.getByRole('button', { name: 'Show more' }))
      .toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles to expanded on click and back', async () => {
    const user = userEvent.setup();
    render(<Spoiler>Long content</Spoiler>);
    const toggle = screen.getByRole('button', { name: 'Show more' });
    await user.click(toggle);
    // expanded: no max-height constraint, label flips
    expect(screen.getByText('Long content')).not.toHaveStyle('max-height: 100px');
    expect(screen.getByRole('button', { name: 'Show less' }))
      .toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'Show less' }));
    expect(screen.getByRole('button', { name: 'Show more' }))
      .toHaveAttribute('aria-expanded', 'false');
  });

  it('supports controlled expanded state (writes flow back to the control)', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [expanded, , ctrl] = useControl<boolean>(false);
      return (
        <>
          <span data-testid='state'>{String(expanded)}</span>
          <Spoiler expanded={ctrl}>Body</Spoiler>
        </>
      );
    }
    render(<Harness />);
    expect(screen.getByTestId('state')).toHaveTextContent('false');
    // flipping the component's own toggle writes back through the
    // control to the harness state
    await user.click(screen.getByRole('button', { name: 'Show more' }));
    expect(screen.getByTestId('state')).toHaveTextContent('true');
    expect(screen.getByRole('button', { name: 'Show less' }))
      .toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'Show less' }));
    expect(screen.getByTestId('state')).toHaveTextContent('false');
  });

  it('label overrides beat the locale copy', () => {
    render(<Spoiler showLabel='展开' hideLabel='收起'>X</Spoiler>);
    expect(screen.getByRole('button', { name: '展开' })).toBeInTheDocument();
  });

  it('forwards native div props to the root (aria-* / data-*)', () => {
    const { container } = render(
      <Spoiler aria-label='terms and conditions' data-testid='root'>X</Spoiler>
    );
    const root = screen.getByTestId('root');
    expect(root.dataset.slot).toBe('spoiler');
    expect(root).toHaveAttribute('aria-label', 'terms and conditions');
    expect(container.firstChild).toBe(root);
  });

  it('has no axe violations in both states', async () => {
    const { axe } = await import('jest-axe');
    const { rerender } = render(<Spoiler>Body content</Spoiler>);
    let results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
    rerender(<Spoiler expanded>Body content</Spoiler>);
    results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
