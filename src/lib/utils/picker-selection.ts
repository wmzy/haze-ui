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
 *   value (the pointer-only chip × has no keyboard twin). The Enter/
 *   Escape arms stay local per family — their focus semantics differ.
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
