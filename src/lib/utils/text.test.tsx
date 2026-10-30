import { reactNodeText } from './text';

describe('reactNodeText', () => {
  it('passes strings and numbers through', () => {
    expect(reactNodeText('Save')).toBe('Save');
    expect(reactNodeText(42)).toBe('42');
    expect(reactNodeText(0)).toBe('0');
  });

  it('drops booleans like React does (rendered-output parity)', () => {
    expect(reactNodeText(true)).toBe('');
    expect(reactNodeText(false)).toBe('');
  });

  it('walks nested arrays and elements depth-first', () => {
    expect(
      reactNodeText(
        <span>
          a<b>{[1, <em key="em">b</em>]}</b>
        </span>
      )
    ).toBe('a1b');
  });

  it('mixes booleans with element children in document order', () => {
    expect(reactNodeText([true, ' ', <span key="s">{false}ok</span>, 7])).toBe(
      ' ok7'
    );
  });

  it('drops null, undefined and non-text nodes', () => {
    expect(reactNodeText(null)).toBe('');
    expect(reactNodeText(undefined)).toBe('');
    expect(reactNodeText(<span key="s" />)).toBe('');
  });
});
