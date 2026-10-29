/**
 * jsdom test double for the native Popover API.
 *
 * jsdom implements neither the Popover API nor ToggleEvent; this module
 * polyfills the minimal surface the floating engine relies on (same
 * approach as Dialog's showModal/close mocks) to exercise the native path.
 *
 * Consumers (co-located *.test.tsx only): Popover, Popconfirm, HoverCard,
 * Tooltip, InlineCitation, DropdownMenu. Test-only module — never import
 * from library source and never re-export through a barrel.
 */
import { vi } from 'vitest';

export class ToggleEventPolyfill extends Event {
  newState: string;
  constructor(type: string, init: { newState: string }) {
    super(type);
    this.newState = init.newState;
  }
}

export const showPopoverMock = vi.fn(function (this: HTMLElement) {
  this.setAttribute('data-popover-open', '');
  this.dispatchEvent(new ToggleEventPolyfill('toggle', { newState: 'open' }));
});

export const hidePopoverMock = vi.fn(function (this: HTMLElement) {
  if (!this.hasAttribute('data-popover-open')) return;
  this.removeAttribute('data-popover-open');
  this.dispatchEvent(new ToggleEventPolyfill('toggle', { newState: 'closed' }));
});

type PopoverProtoPatch = {
  popover?: unknown;
  showPopover?: () => void;
  hidePopover?: () => void;
};

export function installNativePopover() {
  Object.defineProperty(HTMLElement.prototype, 'popover', {
    configurable: true,
    value: 'manual',
  });
  HTMLElement.prototype.showPopover = showPopoverMock;
  HTMLElement.prototype.hidePopover = hidePopoverMock;
}

export function removeNativePopover() {
  const proto = HTMLElement.prototype as PopoverProtoPatch;
  delete proto.popover;
  delete proto.showPopover;
  delete proto.hidePopover;
}
