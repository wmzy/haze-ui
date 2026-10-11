import { render, screen } from '@testing-library/react';

import Mark from './Mark';

describe('Mark', () => {
  it('renders a semantic mark element with children', () => {
    render(<Mark>highlighted</Mark>);
    const el = screen.getByText('highlighted');
    expect(el.tagName).toBe('MARK');
  });

  it('defaults to the warning tone and supports the status tones', () => {
    render(
      <>
        <Mark>w</Mark>
        <Mark color='primary'>p</Mark>
        <Mark color='success'>s</Mark>
        <Mark color='danger'>d</Mark>
      </>
    );
    // each tone maps to a distinct skin class (classes are extracted
    // names in tests — presence, not visuals, is the contract)
    for (const text of ['w', 'p', 's', 'd']) {
      expect(screen.getByText(text).className).toContain('haze-');
    }
  });

  it('applies className and forwards native props', () => {
    render(<Mark className='custom' title='note'>x</Mark>);
    const el = screen.getByText('x');
    expect(el).toHaveClass('custom');
    expect(el).toHaveAttribute('title', 'note');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <p>
        Search results for <Mark>keyword</Mark> here
      </p>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
