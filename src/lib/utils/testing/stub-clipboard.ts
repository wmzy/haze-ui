/**
 * jsdom test double for navigator.clipboard.
 *
 * jsdom 30 implements neither navigator.clipboard nor
 * document.execCommand; this stub installs a controllable async
 * writeText so copy success/failure paths run. Shared by the
 * co-located tests of ChatMessage, CopyButton, JsonView and the
 * useClipboard hook.
 *
 * The stub MUST be installed AFTER userEvent.setup(): user-event
 * attaches its own navigator.clipboard polyfill during setup, silently
 * replacing any earlier stub (ours is configurable, so redefining on
 * top of user-event's works).
 *
 * Test-only module — never import from library source and never
 * re-export through a barrel.
 */
import { vi } from 'vitest';

export function stubClipboard(writeText: (text: string) => Promise<void>) {
  const fn = vi.fn(writeText);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: fn },
    configurable: true,
  });
  return {
    fn,
    restore: () => {
      Reflect.deleteProperty(navigator, 'clipboard');
    },
  };
}
