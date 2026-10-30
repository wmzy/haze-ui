/**
 * jsdom test double for Element.prototype.scrollIntoView.
 *
 * jsdom does not implement scrollIntoView; this stub installs a vi.fn
 * on the prototype (Element-level, so every element subclass resolves
 * it) and restores the exact prior state afterwards — a property that
 * was not the prototype's own is deleted again, so test order can
 * never leak the stub into other files. Shared by the co-located
 * tests of Carousel, Tour, Mentions, PromptInput, Tree's useTree and
 * rtl (RTL arrow-key mirroring). Pass an implementation to capture the
 * scrolled elements instead of asserting call args (useTree).
 *
 * Test-only module — never import from library source and never
 * re-export through a barrel.
 */
import { vi } from 'vitest';

type ScrollIntoViewFn<E extends Element> = (
  this: E,
  arg?: ScrollIntoViewOptions
) => void;

export function stubScrollIntoView<E extends Element = Element>(
  impl?: ScrollIntoViewFn<E>
) {
  const proto = Element.prototype as { scrollIntoView?: unknown };
  const hadOwn = Object.prototype.hasOwnProperty.call(
    proto,
    'scrollIntoView'
  );
  const original = proto.scrollIntoView;
  const fn = vi.fn(impl);
  proto.scrollIntoView = fn;
  return {
    fn,
    restore: () => {
      if (hadOwn) proto.scrollIntoView = original;
      else delete proto.scrollIntoView;
    },
  };
}
