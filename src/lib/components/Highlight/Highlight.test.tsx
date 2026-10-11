import { render, screen } from '@testing-library/react';

import Highlight from './Highlight';

describe('Highlight', () => {
  it('marks a single substring occurrence', () => {
    render(<Highlight highlight='wor'>hello world</Highlight>);
    const mark = screen.getByText('wor');
    expect(mark.tagName).toBe('MARK');
    // unmatched text stays text nodes
    expect(mark.textContent).toBe('wor');
  });

  it('marks every occurrence of the needle (case-insensitive by default)', () => {
    const { container } = render(
      <Highlight highlight='an'>An apple a day, a banana</Highlight>
    );
    const marks = container.querySelectorAll('mark');
    // "An", "an", "an" — banana carries two hits
    expect(marks).toHaveLength(3);
    expect(marks[0]!.textContent).toBe('An');
    expect(marks[2]!.textContent).toBe('an');
  });

  it('respects caseSensitive', () => {
    const { container } = render(
      <Highlight highlight='an' caseSensitive>An apple a day, a banana</Highlight>
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
    expect(marks[0]!.textContent).toBe('an');
  });

  it('supports multiple needles in one pass', () => {
    const { container } = render(
      <Highlight highlight={['cat', 'dog']}>cat and dog and cat</Highlight>
    );
    expect(container.querySelectorAll('mark')).toHaveLength(3);
  });

  it('prefers the longest overlapping needle (alternation order is not longest-match)', () => {
    const { container } = render(
      <Highlight highlight={['cat', 'cats']}>cats</Highlight>
    );
    // 未排序时 ['cat','cats'] 在 "cats" 处会先中 "cat" 并留下游离 "s"
    const marks = [...container.querySelectorAll('mark')].map((m) => m.textContent);
    expect(marks).toEqual(['cats']);
  });

  it('renders plain text when the needle is empty or absent', () => {
    const { container, rerender } = render(<Highlight highlight=''>hello</Highlight>);
    expect(container.querySelectorAll('mark')).toHaveLength(0);
    rerender(<Highlight highlight={[]}>hello</Highlight>);
    expect(container.querySelectorAll('mark')).toHaveLength(0);
  });

  it('escapes regex metacharacters in the needle', () => {
    const { container } = render(
      <Highlight highlight='a+b'>a+b and aab</Highlight>
    );
    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0]!.textContent).toBe('a+b');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <p>
        <Highlight highlight='hit'>This is a hit in a hit.</Highlight>
      </p>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
