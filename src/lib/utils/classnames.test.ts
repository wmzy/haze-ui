import { classnames } from './classnames';

describe('classnames', () => {
  it('joins string arguments with spaces', () => {
    expect(classnames('a', 'b')).toBe('a b');
  });

  it('skips falsy values', () => {
    expect(classnames('a', '', null, undefined, false, 0)).toBe('a');
  });

  it('stringifies numbers', () => {
    expect(classnames('col', 2)).toBe('col 2');
  });

  it('flattens nested arrays', () => {
    expect(classnames('a', ['b', ['c']])).toBe('a b c');
  });

  it('includes object keys with truthy values only', () => {
    expect(classnames({ active: true, hidden: false, 'x-y': 1 })).toBe(
      'active x-y'
    );
  });

  it('returns empty string with no usable input', () => {
    expect(classnames()).toBe('');
  });
});
