import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FollowUpSuggestions from './FollowUpSuggestions';

const SUGGESTIONS = [
  'What is OKLCH?',
  'Show me the token palette',
  'How do I theme a component?',
];

describe('FollowUpSuggestions', () => {
  it('renders one chip per suggestion in a list', () => {
    render(<FollowUpSuggestions suggestions={SUGGESTIONS} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    for (const suggestion of SUGGESTIONS) {
      expect(screen.getByRole('button', { name: suggestion })).toBeInTheDocument();
    }
  });

  it('handles duplicate suggestions', () => {
    render(<FollowUpSuggestions suggestions={['Rewrite it', 'Rewrite it']} />);
    expect(screen.getAllByRole('button', { name: 'Rewrite it' })).toHaveLength(2);
  });

  it('renders an empty list when there are no suggestions', () => {
    render(<FollowUpSuggestions suggestions={[]} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  it('fires onSelect with the clicked suggestion', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<FollowUpSuggestions suggestions={SUGGESTIONS} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: SUGGESTIONS[1] }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(SUGGESTIONS[1]);
  });

  it('activates a suggestion with Enter', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<FollowUpSuggestions suggestions={SUGGESTIONS} onSelect={onSelect} />);
    screen.getByRole('button', { name: SUGGESTIONS[0] }).focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(SUGGESTIONS[0]);
  });

  it('disables every chip and swallows clicks', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<FollowUpSuggestions suggestions={SUGGESTIONS} onSelect={onSelect} disabled />);
    for (const suggestion of SUGGESTIONS) {
      expect(screen.getByRole('button', { name: suggestion })).toBeDisabled();
    }
    await user.click(screen.getByRole('button', { name: SUGGESTIONS[0] }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders skeleton placeholders instead of chips while loading', () => {
    const { container } = render(<FollowUpSuggestions suggestions={SUGGESTIONS} loading />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    const skeletons = container.querySelectorAll('[data-slot="follow-up-suggestion-skeleton"]');
    expect(skeletons).toHaveLength(3);
    for (const node of skeletons) {
      expect(node).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('renders three placeholders while loading an empty suggestion list', () => {
    const { container } = render(<FollowUpSuggestions suggestions={[]} loading />);
    expect(
      container.querySelectorAll('[data-slot="follow-up-suggestion-skeleton"]')
    ).toHaveLength(3);
  });

  it('applies className and forwards native props to the list', () => {
    render(
      <FollowUpSuggestions
        suggestions={SUGGESTIONS}
        className="custom"
        data-testid="followups"
        id="followups"
        aria-label="Suggested follow-up questions"
      />,
    );
    const list = screen.getByRole('list', { name: 'Suggested follow-up questions' });
    expect(list).toHaveClass('custom');
    expect(list).toHaveAttribute('id', 'followups');
    expect(list).toHaveAttribute('data-testid', 'followups');
  });

  it('forwards the ref onto the root list', () => {
    const ref = createRef<HTMLDivElement>();
    render(<FollowUpSuggestions suggestions={SUGGESTIONS} ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('list'));
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    const { rerender } = render(<FollowUpSuggestions suggestions={SUGGESTIONS} />);
    // 'region' fires for content outside a landmark — an artifact of the
    // bare test document, not the component.
    let results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
    rerender(<FollowUpSuggestions suggestions={SUGGESTIONS} disabled />);
    results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
    rerender(<FollowUpSuggestions suggestions={SUGGESTIONS} loading />);
    results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
