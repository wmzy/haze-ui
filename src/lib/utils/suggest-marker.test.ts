import {
  findTokenAtCaret,
  spliceToken,
  suggestOptionId,
} from './suggest-marker';

describe('findTokenAtCaret', () => {
  it('finds a token opened at the start of the text', () => {
    expect(findTokenAtCaret('@ab', 3, ['@'])).toEqual({
      trigger: '@',
      start: 0,
      end: 3,
      query: 'ab',
    });
  });

  it('finds a token opened right after whitespace', () => {
    expect(findTokenAtCaret('hi @ab', 6, ['@'])).toEqual({
      trigger: '@',
      start: 3,
      end: 6,
      query: 'ab',
    });
  });

  it('reports an empty query the moment the trigger lands', () => {
    expect(findTokenAtCaret('hi @', 4, ['@'])).toEqual({
      trigger: '@',
      start: 3,
      end: 4,
      query: '',
    });
  });

  it('keeps email-like text ("a@b") from opening a token', () => {
    expect(findTokenAtCaret('a@b', 3, ['@'])).toBeNull();
    expect(findTokenAtCaret('mail me at a@b.co', 16, ['@'])).toBeNull();
  });

  it('stops at whitespace between the trigger and the caret', () => {
    expect(findTokenAtCaret('@a b', 4, ['@'])).toBeNull();
    expect(findTokenAtCaret('@a\nb', 4, ['@'])).toBeNull();
  });

  it('returns null when no trigger sits before the caret', () => {
    expect(findTokenAtCaret('plain text', 10, ['@'])).toBeNull();
    expect(findTokenAtCaret('', 0, ['@'])).toBeNull();
  });

  it('does not treat non-trigger characters as openers', () => {
    expect(findTokenAtCaret('@ab', 3, ['/'])).toBeNull();
  });

  it('matches any of several triggers', () => {
    expect(findTokenAtCaret('run /sum', 8, ['/', '@'])).toEqual({
      trigger: '/',
      start: 4,
      end: 8,
      query: 'sum',
    });
    expect(findTokenAtCaret('hi @bo', 6, ['/', '@'])?.trigger).toBe('@');
  });

  it('clamps a caret past the end of the text', () => {
    expect(findTokenAtCaret('@ab', 99, ['@'])).toEqual({
      trigger: '@',
      start: 0,
      end: 3,
      query: 'ab',
    });
  });
});

describe('spliceToken', () => {
  it('replaces the token with the insertion and reports the caret after it', () => {
    const marker = findTokenAtCaret('Ping @bo!', 8, ['@']);
    expect(marker).not.toBeNull();
    const spliced = spliceToken('Ping @bo!', marker!, '@bob ');
    expect(spliced).toEqual({ text: 'Ping @bob !', caret: 10 });
  });

  it('replaces only the token; the text after the caret keeps its place', () => {
    const marker = findTokenAtCaret('hi @zz tail', 6, ['@']);
    expect(marker).not.toBeNull();
    // The end is the recorded caret (right after "zz"), so the space that
    // followed the token stays — the insertion carries its own trailing
    // space (site convention), yielding the double space mid-text.
    const spliced = spliceToken('hi @zz tail', marker!, '@carol ');
    expect(spliced).toEqual({ text: 'hi @carol  tail', caret: 10 });
  });

  it('clamps a recorded end that outlived the live text', () => {
    const spliced = spliceToken(
      'hi @',
      { trigger: '@', start: 3, end: 40, query: 'stale-query' },
      '@bob '
    );
    expect(spliced).toEqual({ text: 'hi @bob ', caret: 8 });
  });
});

describe('suggestOptionId', () => {
  it('derives a stable row id from the listbox id and index', () => {
    expect(suggestOptionId('listbox-id', 2)).toBe('listbox-id-option-2');
    expect(suggestOptionId('listbox-id', 0)).toBe('listbox-id-option-0');
  });
});
