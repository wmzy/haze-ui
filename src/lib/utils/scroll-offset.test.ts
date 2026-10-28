import {
  readLogicalScrollLeft,
  writeLogicalScrollLeft,
} from './scroll-offset';

/** Detached element whose nearest `[dir]` ancestor carries `dir`. */
function hostUnderDir(dir: 'ltr' | 'rtl'): HTMLDivElement {
  const carrier = document.createElement('div');
  carrier.setAttribute('dir', dir);
  const el = document.createElement('div');
  carrier.append(el);
  return el;
}

describe('readLogicalScrollLeft', () => {
  it('reads LTR scrollLeft as-is', () => {
    const el = hostUnderDir('ltr');
    el.scrollLeft = 120;
    expect(readLogicalScrollLeft(el)).toBe(120);
  });

  it('negates evergreen RTL scrollLeft into distance-from-start', () => {
    const el = hostUnderDir('rtl');
    el.scrollLeft = -150;
    expect(readLogicalScrollLeft(el)).toBe(150);
  });

  it('honors an explicit rtl flag over the rendered direction', () => {
    const el = hostUnderDir('ltr');
    el.scrollLeft = -40;
    expect(readLogicalScrollLeft(el, true)).toBe(40);
  });

  it('accepts structural literals (scroll-math contract)', () => {
    expect(readLogicalScrollLeft({ scrollLeft: -50 }, true)).toBe(50);
    expect(readLogicalScrollLeft({ scrollLeft: 50 }, false)).toBe(50);
  });
});

describe('writeLogicalScrollLeft', () => {
  it('writes the LTR value as-is', () => {
    const el = hostUnderDir('ltr');
    writeLogicalScrollLeft(el, 200);
    expect(el.scrollLeft).toBe(200);
  });

  it('negates the value for RTL elements', () => {
    const el = hostUnderDir('rtl');
    writeLogicalScrollLeft(el, 200);
    expect(el.scrollLeft).toBe(-200);
  });

  it('round-trips with the reader', () => {
    const el = hostUnderDir('rtl');
    writeLogicalScrollLeft(el, 75);
    expect(readLogicalScrollLeft(el)).toBe(75);
  });

  it('accepts structural literals (scroll-math contract)', () => {
    const literal = { scrollLeft: 0 };
    writeLogicalScrollLeft(literal, 30, true);
    expect(literal.scrollLeft).toBe(-30);
  });
});
