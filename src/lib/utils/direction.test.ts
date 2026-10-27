import { inlineAxisKeys } from './direction';

describe('inlineAxisKeys', () => {
  // The explicit matrix: only the horizontal axis mirrors; vertical is
  // direction-invariant.
  const matrix: readonly [
      orientation: 'horizontal' | 'vertical',
      dir: 'ltr' | 'rtl',
      next: string,
      prev: string,
    ][] = [
    ['horizontal', 'ltr', 'ArrowRight', 'ArrowLeft'],
    ['horizontal', 'rtl', 'ArrowLeft', 'ArrowRight'],
    ['vertical', 'ltr', 'ArrowDown', 'ArrowUp'],
    ['vertical', 'rtl', 'ArrowDown', 'ArrowUp'],
  ];

  it.each(matrix)(
    '%s under %s maps next=%s prev=%s',
    (orientation, dir, next, prev) => {
      expect(inlineAxisKeys(orientation, dir)).toEqual({ next, prev });
    }
  );

  describe("dir: 'auto' resolves from the document's rendered direction", () => {
    afterEach(() => {
      document.documentElement.removeAttribute('dir');
    });

    it('reads ltr when no [dir] ancestor exists', () => {
      expect(inlineAxisKeys('horizontal', 'auto')).toEqual({
        next: 'ArrowRight',
        prev: 'ArrowLeft',
      });
    });

    it('mirrors the horizontal axis when the document is rtl', () => {
      document.documentElement.setAttribute('dir', 'rtl');
      expect(inlineAxisKeys('horizontal', 'auto')).toEqual({
        next: 'ArrowLeft',
        prev: 'ArrowRight',
      });
    });

    it('never mirrors the vertical axis, even under an rtl document', () => {
      document.documentElement.setAttribute('dir', 'rtl');
      expect(inlineAxisKeys('vertical', 'auto')).toEqual({
        next: 'ArrowDown',
        prev: 'ArrowUp',
      });
    });
  });
});
