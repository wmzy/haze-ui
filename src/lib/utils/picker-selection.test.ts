import {
  dropLastPickerValue,
  labelMatchesQuery,
  pickerMaxCountReached,
  pickerRowDisabled,
  pickerShowsCreateRow,
  togglePickerValue,
} from './picker-selection';

describe('pickerMaxCountReached', () => {
  it('is false in single mode regardless of the counts', () => {
    expect(pickerMaxCountReached(false, 2, 5)).toBe(false);
  });

  it('is false without a cap or below it', () => {
    expect(pickerMaxCountReached(true, undefined, 5)).toBe(false);
    expect(pickerMaxCountReached(true, 3, 2)).toBe(false);
  });

  it('locks at and above the cap', () => {
    expect(pickerMaxCountReached(true, 3, 3)).toBe(true);
    expect(pickerMaxCountReached(true, 3, 4)).toBe(true);
  });
});

describe('togglePickerValue', () => {
  it('deselects a selected value and selects below the cap', () => {
    expect(togglePickerValue(['a', 'b'], 'a', false)).toEqual(['b']);
    expect(togglePickerValue(['a'], 'b', false)).toEqual(['a', 'b']);
  });

  it('rejects a select at the cap by returning the same reference', () => {
    const selected = ['a'];
    // The identity contract the callers' no-op gates rely on.
    expect(togglePickerValue(selected, 'b', true)).toBe(selected);
  });

  it('still deselects at the cap (selected entries stay removable)', () => {
    expect(togglePickerValue(['a', 'b'], 'a', true)).toEqual(['b']);
  });
});

describe('dropLastPickerValue', () => {
  it('drops the most recently appended value', () => {
    expect(dropLastPickerValue(['a', 'b', 'c'])).toEqual(['a', 'b']);
  });

  it('empties a singleton and stays empty', () => {
    expect(dropLastPickerValue(['a'])).toEqual([]);
    expect(dropLastPickerValue([])).toEqual([]);
  });
});

describe('pickerRowDisabled', () => {
  it('is disabled for option-level disabled regardless of the cap', () => {
    expect(pickerRowDisabled(true, false, false)).toBe(true);
    expect(pickerRowDisabled(true, true, false)).toBe(true);
  });

  it('locks unselected rows at the cap, exempts selected and create rows', () => {
    expect(pickerRowDisabled(false, true, false)).toBe(true);
    expect(pickerRowDisabled(false, true, true)).toBe(false);
    expect(pickerRowDisabled(false, true, false, true)).toBe(false);
    expect(pickerRowDisabled(false, false, false)).toBe(false);
  });
});

describe('pickerShowsCreateRow', () => {
  const base = {
    creatable: true,
    loading: false,
    trimmedQuery: 'new',
    matchCount: 0,
    maxCountReached: false,
  };

  it('offers the query when nothing matches a non-blank query', () => {
    expect(pickerShowsCreateRow(base)).toBe(true);
  });

  it('suppresses on blank query, loading, matches and the cap', () => {
    // trimmedQuery arrives pre-trimmed by contract (both callers trim
    // the raw query once and reuse it); blank means the empty string.
    expect(pickerShowsCreateRow({ ...base, trimmedQuery: '' })).toBe(false);
    expect(pickerShowsCreateRow({ ...base, loading: true })).toBe(false);
    expect(pickerShowsCreateRow({ ...base, matchCount: 2 })).toBe(false);
    expect(pickerShowsCreateRow({ ...base, maxCountReached: true })).toBe(false);
  });

  it('never offers without the creatable switch', () => {
    expect(pickerShowsCreateRow({ ...base, creatable: false })).toBe(false);
  });
});

describe('labelMatchesQuery', () => {
  it('matches case-insensitive substrings', () => {
    expect(labelMatchesQuery('Apple', 'app')).toBe(true);
    expect(labelMatchesQuery('apple', 'PPL')).toBe(true);
    expect(labelMatchesQuery('apple', 'pear')).toBe(false);
  });

  it('trims the query and matches everything when blank', () => {
    expect(labelMatchesQuery('apple', '  app ')).toBe(true);
    expect(labelMatchesQuery('apple', '   ')).toBe(true);
    expect(labelMatchesQuery('apple', '')).toBe(true);
  });
});
