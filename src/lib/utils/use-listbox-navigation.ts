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

/** How the highlight answers a changed panel query: `first-match`
 * re-highlights the first option of the fresh result set (Select's
 * MUI-Autocomplete posture — Enter right after typing picks it without
 * an arrow press first), `none` clears it (Combobox's drop-on-refilter). */
type QueryHighlightReset = 'first-match' | 'none';

/** Third-argument options of `useListboxNavigation`. */
type ListboxQueryReset = {
  /** The site's current panel search query. */
  query: string;
  /** What a changed query does to the highlight. */
  reset: QueryHighlightReset;
};

/** Controller surface of `useListboxNavigation`. */
type ListboxNavigation = {
  /** The highlighted option's flat index; -1 while nothing is highlighted. */
  activeIndex: number;
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
  onNavigate?: () => void,
  /**
   * When given, the hook tracks the panel query and resets the
   * highlight on change (during render, the React-endorsed reset), so
   * the first filtered frame already carries the site's typing
   * posture instead of a stale highlight.
   */
  queryReset?: ListboxQueryReset
): ListboxNavigation {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [prevQuery, setPrevQuery] = useState(queryReset?.query);
  if (queryReset !== undefined && queryReset.query !== prevQuery) {
    setPrevQuery(queryReset.query);
    setActiveIndex(
      queryReset.reset === 'first-match' ? (count > 0 ? 0 : -1) : -1
    );
  }

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

  return { activeIndex, handleNavigationKey };
}

export type {
  ListboxNavigation,
  ListboxQueryReset,
  NavigationKeyEvent,
  QueryHighlightReset,
};
