import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react';

import { useCallback, useEffect, useRef } from 'react';

/** How long typed characters keep accumulating before the buffer resets. */
const TYPEAHEAD_WINDOW_MS = 500;

/** Enabled menu items inside a menu container, in DOM order. */
export function getEnabledMenuItems(
  container: HTMLElement | null
): HTMLElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      '[role="menuitem"]:not([disabled])'
    )
  );
}
type UseMenuKeyboardOptions = {
  /** Element containing the `[role=menuitem]` children. */
  menuRef: RefObject<HTMLElement | null>;
  /** Called when the menu should close via keyboard; the caller returns
   * focus to the trigger. */
  onClose: () => void;
};

/**
 * Keyboard behavior for a `role="menu"` container with roving-tabindex
 * items: ↑/↓ move focus (wrapping, skipping disabled items), Home/End
 * jump to the ends, Escape closes (returning focus to the trigger), Tab
 * closes, and printable characters run typeahead — matching the WAI-ARIA
 * Menu Button pattern.
 */
export function useMenuKeyboard({ menuRef, onClose }: UseMenuKeyboardOptions) {
  const typedRef = useRef('');
  const resetTimerRef = useRef(0);

  useEffect(
    () => () => window.clearTimeout(resetTimerRef.current),
    []
  );

  return useCallback(
    (event: ReactKeyboardEvent) => {
      const items = getEnabledMenuItems(menuRef.current);
      if (items.length === 0) return;
      const current = items.indexOf(document.activeElement as HTMLElement);

      const focus = (index: number) => items[index]?.focus();

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          focus((current + 1) % items.length);
          return;
        case 'ArrowUp':
          event.preventDefault();
          focus((current - 1 + items.length) % items.length);
          return;
        case 'Home':
          event.preventDefault();
          focus(0);
          return;
        case 'End':
          event.preventDefault();
          focus(items.length - 1);
          return;
        case 'Escape':
          event.preventDefault();
          onClose();
          return;
        case 'Tab':
          // Close and hand focus to the trigger: without this the focused
          // item unmounts and focus drops to <body>. A following Tab
          // continues past the trigger.
          event.preventDefault();
          onClose();
          return;
        default: {
          if (
            event.key.length !== 1 ||
            event.ctrlKey ||
            event.metaKey ||
            event.altKey
          ) {
            return;
          }
          event.preventDefault();
          const typed = (typedRef.current + event.key).toLowerCase();
          typedRef.current = typed;
          window.clearTimeout(resetTimerRef.current);
          resetTimerRef.current = window.setTimeout(() => {
            typedRef.current = '';
          }, TYPEAHEAD_WINDOW_MS);
          // Search forward from the current item, wrapping; the current
          // item itself is the last candidate so repeating a character
          // cycles between items starting with it.
          const start = current + 1;
          for (let i = 0; i < items.length; i++) {
            const index = (start + i) % items.length;
            // Element.textContent is spec'd non-null (concatenation of
            // descendants; '' when empty)
            if (items[index]!.textContent.toLowerCase().startsWith(typed)) {
              focus(index);
              return;
            }
          }
        }
      }
    },
    [menuRef, onClose]
  );
}
