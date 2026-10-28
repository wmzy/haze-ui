import type { Dispatch, SetStateAction } from 'react';

import { useCallback, useState } from 'react';

/**
 * The minimal keydown surface the navigation skeleton reads —
 * structurally satisfied by React's KeyboardEvent of any element, so
 * sites pass their typed events straight through.
 */
type NavigationKeyEvent = {
  readonly key: string;
  preventDefault: () => void;
};

/** Controller surface of `useListboxNavigation`. */
type ListboxNavigation = {
  /** The highlighted option's flat index; -1 while nothing is highlighted. */
  activeIndex: number;
  /**
   * Raw setter for the site's render-time resets: a new query typically
   * re-highlights (Select's auto-highlight of the first match) or clears
   * (Combobox's drop-on-refilter) — both are the caller's call, not the
   * skeleton's.
   */
  setActiveIndex: Dispatch<SetStateAction<number>>;
  /**
   * The ArrowUp/ArrowDown/Home/End skeleton of a listbox keydown:
   * suppresses the key's default and moves the clamped highlight, then
   * reports consumption (`true`) so the site's remaining keys — Enter,
   * Tab, Escape, Backspace — compose after it instead of re-checking
   * the navigation keys. Home/End are part of the shared skeleton even
   * where a site historically skipped them (Combobox regains them);
   * page keys stay per-site.
   */
  handleNavigationKey: (event: NavigationKeyEvent) => boolean;
};

/**
 * Clamped active-index navigation for the flat listbox model (Select's
 * floating paths, Combobox): the highlight lives on a flat option
 * index (the same coordinate aria-activedescendant reads), arrows step
 * it without falling off either end, Home/End jump to the edges, and
 * `-1` means "nothing highlighted" (both arrow directions land on 0
 * from there, the picker convention).
 *
 * The hook owns only index bookkeeping — panel opening on the first
 * navigation (`onNavigate`), choosing, dismissal and chip-editing keys
 * stay at the call site. Sibling skeleton: `use-textarea-suggest` runs
 * its own arrow/Enter cycle for the textarea-anchored suggestion
 * surfaces (Mentions/PromptInput) whose highlight is coupled to the
 * caret-marker state machine — do not route those through this hook.
 */
export function useListboxNavigation(
  /** Number of navigable options; 0 keeps the highlight at -1. */
  count: number,
  /**
   * Called for every consumed navigation key before the index moves —
   * the picker sites open their panel from the closed state here
   * (`setOpen(true)`; a no-op while already open).
   */
  onNavigate?: () => void
): ListboxNavigation {
  const [activeIndex, setActiveIndex] = useState(-1);

  const move = useCallback(
    (delta: 1 | -1) => {
      setActiveIndex((i) => Math.min(Math.max(i + delta, 0), count - 1));
    },
    [count]
  );

  const jump = useCallback(
    (key: 'Home' | 'End') => {
      setActiveIndex(key === 'Home' ? (count > 0 ? 0 : -1) : count - 1);
    },
    [count]
  );

  const handleNavigationKey = useCallback(
    (event: NavigationKeyEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          onNavigate?.();
          move(1);
          return true;
        case 'ArrowUp':
          event.preventDefault();
          onNavigate?.();
          move(-1);
          return true;
        case 'Home':
          event.preventDefault();
          onNavigate?.();
          jump('Home');
          return true;
        case 'End':
          event.preventDefault();
          onNavigate?.();
          jump('End');
          return true;
        default:
          return false;
      }
    },
    [jump, move, onNavigate]
  );

  return { activeIndex, setActiveIndex, handleNavigationKey };
}

export type { ListboxNavigation, NavigationKeyEvent };
