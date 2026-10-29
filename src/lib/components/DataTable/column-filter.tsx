import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import { useState } from 'react';
import { useControl } from 'react-use-control';

import { classnames } from '../../utils/classnames';
import { focusRingVisible } from '../../utils/focus-ring';

import { Button } from '../Button';
import { CheckboxCore } from '../Checkbox';
import { Popover } from '../Popover';
import { VisuallyHidden } from '../VisuallyHidden';

/** One predefined option of a column's header filter menu (`meta.filters`
 * entry): the visible label and the value landing in the `filters` state
 * when selected. */
type ColumnFilterOption = { text: ReactNode; value: unknown };

/* The funnel trigger's visual skin, applied through Popover's
 * `classNames.trigger` slot (the trigger span Popover renders). The icon
 * rides along in `color: inherit` chains: the data-slot descendant
 * selectors re-color it on hover/focus, and the active class pins it to
 * the primary color while the column carries a selection. */
const filterTrigger = css`
  display: inline-flex;
  align-items: center;
  margin-inline-start: var(--haze-space-1);
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;

  &:hover [data-slot='icon'],
  &:focus-visible [data-slot='icon'] {
    color: var(--haze-color-primary);
  }

  /* Keyboard ring: utils/focus-ring's focusRingVisible, composed into
     the Popover trigger slot below; only the rounded-corner delta
     stays — the ring and its forced-colors Highlight outline follow
     the element's radius. */
  &:focus-visible {
    border-radius: var(--haze-radius-sm);
  }
`;

const filterIcon = css`
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
`;

/* Defined after `filterIcon` at equal-or-higher specificity so the active
 * selection wins over the idle muted color (and hover — a filtered column
 * stays primary either way). */
const filterIconActive = css`
  color: var(--haze-color-primary);
`;

/* The checkbox list inside the panel: one column of labeled checkboxes,
 * the actions row below pinned to the panel's end edge. */
const filterMenu = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-2);
`;

const filterOptions = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
`;

const filterActions = css`
  display: flex;
  justify-content: flex-end;
  gap: var(--haze-space-2);
`;

/**
 * The panel body of one column's header filter menu: a draft checkbox
 * list (one row per `meta.filters` option) plus Apply/Reset. The draft is
 * local UI state that re-syncs whenever the committed selection changes —
 * the floating panel stays mounted while closed, so external (controlled)
 * updates must reach it. Apply commits the draft and closes the panel;
 * Reset commits an empty selection (clearing the filter) and closes.
 */
function ColumnFilterMenu({
  label,
  options,
  selected,
  onApply,
}: {
  /** Column label, naming the checkbox group accessibly. */
  label: string;
  /** The column's predefined options, in declared order. */
  options: ColumnFilterOption[];
  /** The committed selection (selected option values). */
  selected: unknown[];
  /** Commits a selection — empty array clears the filter. */
  onApply: (values: unknown[]) => void;
}) {
  const [draft, setDraft] = useState<unknown[]>(selected);
  // Re-sync the draft when the committed selection changes from the
  // outside (programmatic clear through the Control) — reset during
  // render on the prop change, the React-endorsed adjustment used by
  // utils/floating for the same purpose.
  const [prevSelected, setPrevSelected] = useState(selected);
  if (selected !== prevSelected) {
    setPrevSelected(selected);
    setDraft(selected);
  }

  return (
    <div data-slot='column-filter-menu' x-class={[filterMenu]}>
      <div
        role='group'
        aria-label={`${label} filters`}
        data-slot='filter-options'
        x-class={[filterOptions]}
      >
        {options.map((option) => (
          <CheckboxCore
            key={String(option.value)}
            checked={draft.includes(option.value)}
            onChange={() =>
              setDraft((prev) =>
                prev.includes(option.value)
                  ? prev.filter((value) => value !== option.value)
                  : [...prev, option.value]
              )
            }
            label={option.text}
          />
        ))}
      </div>
      <div data-slot='filter-actions' x-class={[filterActions]}>
        <Button
          size='sm'
          variant='ghost'
          onClick={() => {
            onApply([]);
          }}
        >
          Reset
        </Button>
        <Button
          size='sm'
          onClick={() => {
            onApply(draft);
          }}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}

/**
 * The funnel trigger on a filterable column's header cell: a `Popover`
 * (its trigger span carries `role=button`, `aria-expanded`,
 * `aria-haspopup` and the keyboard model) opening the column's filter
 * menu. The icon marks the active state — filled and primary-colored
 * while the column carries a selection.
 */
function ColumnFilterTrigger({
  label,
  options,
  selected,
  onChange,
}: {
  /** Column label — the trigger's sr-only name and the group's. */
  label: string;
  /** The column's predefined options, in declared order. */
  options: ColumnFilterOption[];
  /** The committed selection (selected option values). */
  selected: unknown[];
  /** Commits the next selection for this column. */
  onChange: (values: unknown[]) => void;
}) {
  const [, setOpen, openCtrl] = useControl(undefined, false);
  const active = selected.length > 0;

  return (
    <Popover
      open={openCtrl}
      classNames={{ trigger: classnames(filterTrigger, focusRingVisible) }}
      content={
        <ColumnFilterMenu
          label={label}
          options={options}
          selected={selected}
          onApply={(values) => {
            onChange(values);
            setOpen(false);
          }}
        />
      }
    >
      <span
        data-slot='icon'
        data-active={active ? 'true' : undefined}
        x-class={[filterIcon, active && filterIconActive]}
        aria-hidden='true'
      >
        {active ? '▼' : '▽'}
      </span>
      <VisuallyHidden>Filter {label}</VisuallyHidden>
    </Popover>
  );
}

export default ColumnFilterTrigger;
export type { ColumnFilterOption };
