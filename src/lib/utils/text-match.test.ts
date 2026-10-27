import { findMatchRanges, splitMatchSegments } from './text-match';

describe('findMatchRanges', () => {
  it('finds every case-insensitive non-overlapping occurrence', () => {
    expect(findMatchRanges('Banana bandana', 'ANA')).toEqual([
      [1, 4],
      [11, 14],
    ]);
  });

  it('returns empty for an empty query or no hit', () => {
    expect(findMatchRanges('Target file', '')).toEqual([]);
    expect(findMatchRanges('Target file', 'zzz')).toEqual([]);
    expect(findMatchRanges('Target file', ['', ''])).toEqual([]);
  });

  it('respects caseSensitive', () => {
    expect(
      findMatchRanges('An apple a day, a banana', 'an', { caseSensitive: true })
    ).toEqual([
      [19, 21],
      [21, 23],
    ]);
    expect(findMatchRanges('AN an', 'AN', { caseSensitive: true })).toEqual([
      [0, 2],
    ]);
    expect(findMatchRanges('An an', 'AN', { caseSensitive: true })).toEqual([]);
  });

  it('supports multiple needles in one pass', () => {
    expect(findMatchRanges('cat and dog and cat', ['cat', 'dog'])).toEqual([
      [0, 3],
      [8, 11],
      [16, 19],
    ]);
  });

  it('prefers the longest overlapping needle', () => {
    expect(findMatchRanges('cats', ['cat', 'cats'])).toEqual([[0, 4]]);
  });

  it('treats needles literally (regex metacharacters carry no meaning)', () => {
    expect(findMatchRanges('a+b and aab', 'a+b')).toEqual([[0, 3]]);
  });
});

describe('splitMatchSegments', () => {
  it('alternates untouched text with matched runs, casing preserved', () => {
    expect(splitMatchSegments('An banana', [[0, 2], [4, 6]])).toEqual([
      { text: 'An', match: true },
      { text: ' b', match: false },
      { text: 'an', match: true },
      { text: 'ana', match: false },
    ]);
  });

  it('returns a single unmatched segment for empty ranges', () => {
    expect(splitMatchSegments('Target file', [])).toEqual([
      { text: 'Target file', match: false },
    ]);
  });
});
