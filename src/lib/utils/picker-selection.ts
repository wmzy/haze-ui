/**
 * Shared selection semantics of the multi-value picker families —
 * Select's floating multiple/tags paths (SelectFloating) and Combobox's
 * multiple mode. The formulas below used to live as parallel inline
 * logic in the two components with cross-referencing comments
 * ("Combobox parity" / "Select's contract"); they are one contract:
 *
 * - maxCount cap: once the selection reaches `maxCount`, options that
 *   are not currently selected are locked — dimmed, `aria-disabled`,
 *   clicks and Enter rejected — until something is deselected.
 *   Selected entries stay removable.
 * - inert rows: option-level disabled (from the compound `disabled`
 *   prop or the data-driven `options` prop) and the maxCount lock join
 *   under one inert-row contract, both enforced on the click and the
 *   keyboard pick paths.
 * - create rows are never rendered locked — they are suppressed at the
 *   cap (and while loading, and when the query matches anything).
 * - keyboard chip parity: Backspace drops the most recently selected
 *   value (the pointer-only chip × has no keyboard twin). The Enter
 *   commit / Escape close dispatch is shared too (pickerCommitKey) —
 *   the per-site axes (the trigger button's Space key and open gate,
 *   the input default suppression, the post-close refocus) are
 *   options on it.
 * - query matching: the needle trims first (a whitespace-only query
 *   keeps the full list instead of matching nothing), then compares as
 *   a case-insensitive substring.
 *
 * Pure functions only — no css, no DOM, so this module needs no
 * split-css registration. Combobox consumes it alongside Select's
 * filterSelectEntries (components/Select/select-options), which routes
 * its needle through the same labelMatchesQuery.
 */

/** True once a multiple-mode selection reaches the `maxCount` cap —
 * `multiple` is folded in, so callers read the flag directly for both
 * the row lock and the create-row suppression. */
export function pickerMaxCountReached(
  multiple: boolean,
  maxCount: number | undefined,
  selectedCount: number
): boolean {
  return multiple && maxCount !== undefined && selectedCount >= maxCount;
}

/**
 * Toggle one value in a multiple-mode selection: deselecting always
 * commits, selecting at the maxCount cap is rejected. The row's
 * aria-disabled state already stops the pointer path — this guard is
 * what enforces the cap for the keyboard path and for controlled and
 * uncontrolled consumers alike. A rejected select returns the input
 * array unchanged (same reference), so callers no-op on identity.
 */
export function togglePickerValue<T>(
  selected: T[],
  value: T,
  maxCountReached: boolean
): T[] {
  if (selected.includes(value)) return selected.filter((v) => v !== value);
  if (maxCountReached) return selected;
  return [...selected, value];
}

/**
 * The selection minus its most recently appended value — the Backspace
 * chip-drop target of the picker triggers and query inputs.
 */
export function dropLastPickerValue<T>(selected: readonly T[]): T[] {
  return selected.slice(0, -1);
}

/**
 * The Enter/Escape arms every picker keydown site shares after the
 * navigation skeleton (utils/use-listbox-navigation's
 * handleNavigationKey): Enter commits the highlighted row through the
 * family's commit path (create-row routing and disabled-row inertia
 * live there — Select's `choose`, Combobox's `handleSelect`), Escape
 * closes the panel. Returns whether the event was consumed, so site
 * keys (Backspace everywhere, the trigger button's ungated
 * fall-through to the native click) compose after it.
 */
export function pickerCommitKey<T>(
  e: { readonly key: string; preventDefault: () => void },
  site: {
    /** The flat row list in keyboard order (Select's
     * `navigableOptions`, Combobox's `listItems` — the create row is
     * a plain leading row in both). */
    items: readonly { readonly value: T }[];
    /** The highlighted row index, straight from useListboxNavigation
     * (-1 = none). */
    activeIndex: number;
    /** The family commit path for the highlighted row's value. */
    onCommit: (value: T) => void;
    /** The family close path (the setOpen(false) call). */
    onClose: () => void;
    /**
     * The trigger button's contract: Space joins Enter as a commit key
     * (' ' arrives from real browsers; user-event's {Space} reports
     * the legacy 'Space' key name — accept both), the commit stays
     * gated on an open panel (`open`) with a highlighted row so an
     * ungated Enter/Space falls through to the native click (with no
     * highlight, a fresh open, the panel keeps toggling like any
     * button), the gate's preventDefault is what suppresses that
     * activation (the follow-up click would run the trigger's toggle
     * and close the panel mid-selection), and Escape drops its
     * suppression (a button keydown has no default worth
     * suppressing).
     */
    button?: boolean;
    /** The button gate's open state — only consulted with `button`. */
    open?: boolean;
    /**
     * The input-site contract of Select's tags and panel-search
     * inputs: an Enter with no highlighted row is still consumed — an
     * unhandled Enter in an input would submit an enclosing form —
     * and the Escape close also suppresses the native default.
     * Combobox's input keeps its long-standing laxer contract (an
     * unhighlighted Enter falls through untouched, Escape keeps its
     * native default).
     */
    suppressDefaults?: boolean;
    /**
     * Invoked after the Escape close — the panel search input, whose
     * focus does not live in the field, hands focus back to the
     * trigger.
     */
    refocus?: () => void;
  }
): boolean {
  const highlighted = site.items[site.activeIndex];
  const commit =
    e.key === 'Enter' ||
    (site.button === true && (e.key === ' ' || e.key === 'Space'));
  // The commit gate: the trigger button stays gated on an open panel
  // with a highlighted row (ungated keys fall through to the native
  // click); every other site either demands a highlighted row
  // (Combobox) or suppresses instead of gating (Select's inputs).
  const gate =
    site.button === true
      ? site.open === true && highlighted
      : site.suppressDefaults === true || highlighted;
  if (commit && gate) {
    e.preventDefault();
    if (highlighted) site.onCommit(highlighted.value);
    return true;
  }
  if (e.key === 'Escape') {
    if (site.suppressDefaults === true) e.preventDefault();
    site.onClose();
    site.refocus?.();
    return true;
  }
  return false;
}

/**
 * The inert-row formula of a picker option row: option-level disabled,
 * or the maxCount lock (an unselected row once the cap is reached).
 * `isCreateRow` exempts the create row — it is suppressed at the cap
 * (see pickerShowsCreateRow), never rendered locked; Combobox's create
 * row cannot coexist with the cap at all, so it passes nothing.
 */
export function pickerRowDisabled(
  optionDisabled: boolean | undefined,
  maxCountReached: boolean,
  isSelected: boolean,
  isCreateRow?: boolean
): boolean {
  return (
    optionDisabled === true ||
    (maxCountReached && !isSelected && !isCreateRow)
  );
}

/**
 * The create-row offer formula: a creatable picker offers the trimmed
 * query as a new value only when a non-blank query matches nothing,
 * not while loading, and not at the maxCount cap. Select's tags path
 * appends its own dedupe on top (a tag's label may differ from its
 * value there, so the query can miss every label filter yet already
 * exist as a selected tag or an option value — committing it would be
 * a no-op, so it is not offered at all).
 */
export function pickerShowsCreateRow(input: {
  /** The family's creatable switch: Select's `tags` mode, Combobox's `creatable`. */
  creatable: boolean;
  /** Async pending state — never offer creation about options not yet received. */
  loading: boolean;
  /** The trimmed query; blank never offers a create row. */
  trimmedQuery: string;
  /** Count of options surviving the query filter. */
  matchCount: number;
  /** The maxCount lock (pickerMaxCountReached). */
  maxCountReached: boolean;
}): boolean {
  return (
    input.creatable &&
    !input.loading &&
    input.trimmedQuery !== '' &&
    input.matchCount === 0 &&
    !input.maxCountReached
  );
}

/**
 * Case-insensitive substring containment against the normalized query
 * needle: the query trims first, then compares lowercased. A
 * whitespace-only query matches everything — callers that owe list
 * stability short-circuit it before filtering (Select's
 * filterSelectEntries, Combobox's blank-query branch). The shared
 * matching contract of Select's entry filter and Combobox's inline
 * label filter.
 */
export function labelMatchesQuery(label: string, query: string): boolean {
  const needle = query.trim().toLowerCase();
  return needle === '' || label.toLowerCase().includes(needle);
}

/**
 * The values a `maxTagCount`-capped trigger renders as chips: the whole
 * selection when uncapped, else the first `maxTagCount` (a zero or
 * negative cap renders none — the rest folds into the shared overflow
 * badge). The shared slicing contract of Combobox's multiple trigger
 * and PickerChips.
 */
export function visiblePickerValues<T>(
  values: readonly T[],
  maxTagCount: number | undefined
): T[] {
  // The uncapped branch hands back the input reference — callers only
  // map over it, and slicing there would allocate on every render.
  return maxTagCount === undefined
    ? (values as T[])
    : values.slice(0, Math.max(maxTagCount, 0));
}
