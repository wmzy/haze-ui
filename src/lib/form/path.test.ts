import {toSegments} from './path';

describe('toSegments', () => {
  it('returns an already-segmented array unchanged', () => {
    expect(toSegments(['tags', 0, 'label'])).toEqual(['tags', 0, 'label']);
  });

  it('splits dotted paths into string segments', () => {
    expect(toSegments('user.tags')).toEqual(['user', 'tags']);
  });

  it('collapses repeated dots and tolerates leading/trailing dots', () => {
    expect(toSegments('a..b')).toEqual(['a', 'b']);
    expect(toSegments('.a.')).toEqual(['a']);
  });

  it('parses bracket-only numeric segments as numbers', () => {
    expect(toSegments('items[0].name')).toEqual(['items', 0, 'name']);
  });

  it('parses negative bracket indices as numbers', () => {
    expect(toSegments('a[-1]')).toEqual(['a', -1]);
  });

  it('keeps non-numeric bracket content as string keys', () => {
    expect(toSegments('a[b]')).toEqual(['a', 'b']);
  });

  it('rejects dotted numeric segments', () => {
    expect(() => toSegments('items.0.name')).toThrow(TypeError);
    expect(() => toSegments('items.0.name')).toThrow(
      /Numeric path segment must use bracket notation/
    );
  });

  it('parses quoted segments as string keys', () => {
    // items["0"] 表示字符串键，与 items[0] 的数字段相对
    expect(toSegments('items["0"]')).toEqual(['items', '0']);
  });

  it('accepts single-quoted segments with any content', () => {
    expect(toSegments("items['a b']")).toEqual(['items', 'a b']);
  });

  it('mixes dotted, bracket and quoted segments', () => {
    expect(toSegments('a[0].b["c d"].e')).toEqual(['a', 0, 'b', 'c d', 'e']);
  });

  it('throws on unterminated quotes', () => {
    expect(() => toSegments('items["a')).toThrow(/Unterminated quote/);
  });

  it('throws when a quoted segment is not closed with a bracket', () => {
    expect(() => toSegments('items["a"')).toThrow(/Expected "]"/);
  });

  it('throws on unterminated brackets', () => {
    expect(() => toSegments('items[0')).toThrow(/Unterminated bracket/);
  });

  it('parses an empty name as one empty segment', () => {
    expect(toSegments('')).toEqual(['']);
  });
});
