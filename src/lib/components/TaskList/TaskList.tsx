import type { ComponentPropsWithoutRef, Key, ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { warnItemsChildrenConflict } from '../../utils/warn-items-children';

import { CheckboxCore } from '../Checkbox';

type TaskListProps = {
  /** `TaskList.Item` elements. */
  children?: ReactNode;
  /**
   * Data-driven mode: renders one `TaskList.Item` per entry — the
   * compound path underneath, so every entry keeps the full checkbox
   * machinery (`useControl` wiring, completion styling). Mutually
   * exclusive with compound `children`; when both are given, `items`
   * wins and a dev-time console.error explains the conflict (the Tabs
   * `items` precedent).
   */
  items?: TaskData[];
  className?: string;
} & Omit<ComponentPropsWithoutRef<'ul'>, 'children'>;

type TaskListItemProps = {
  /** Completion state — controlled or uncontrolled, default `false`. */
  checked?: ControlOrValue<boolean>;
  /** Fires on every check transition, whatever drove it. */
  onCheckedChange?: (checked: boolean) => void;
  /** Task summary; strikes through and dims once `checked`. */
  title: ReactNode;
  /** Secondary line under the title (agent output, links, timing). */
  description?: ReactNode;
  /** Replaces the default checkbox toggle — e.g. a `Spinner` for a
   * running task. The row stops being interactive: no checkbox
   * renders, the title keeps reflecting `checked`. */
  indicator?: ReactNode;
  /** Trailing affordances (copy/retry buttons), kept outside the
   * toggle label so activating them never toggles the task. */
  actions?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'li'>, 'children' | 'title'>;

type TaskData = {
  /** React key of the rendered item (the Tabs `value` precedent). */
  key: Key;
  checked?: ControlOrValue<boolean>;
  onCheckedChange?: (checked: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  indicator?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

const list = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--haze-font-sans);
`;

const item = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-2);
  padding-block: var(--haze-space-1);
`;

const row = css`
  display: flex;
  align-items: flex-start;
  gap: var(--haze-space-3);
  flex: 1;
  min-width: 0;
`;

/* Only the default-indicator branch is a label: the visible title
   names the checkbox and clicking anywhere on the row toggles it —
   Checkbox's own label pattern, scaled up to the task row. */
const rowLabel = css`
  cursor: pointer;
  user-select: none;

  /* CheckboxCore ships standalone 4px margins (its bare-input 32px
     optical footprint); inside the row the gap owns horizontal spacing
     and the 24px box centers on the first title line instead. The
     nested selector beats the single-class base no matter the
     stylesheet emission order. */
  & > input {
    margin: 0;
    margin-block-start: -0.125rem;
  }
`;

const indicatorSlot = css`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Same 24px footprint and first-line nudge as the checkbox column,
     so titles align across toggleable and in-flight rows alike. */
  width: var(--haze-space-6);
  height: var(--haze-space-6);
  margin-block-start: -0.125rem;
`;

const body = css`
  flex: 1;
  min-width: 0;
`;

const titleStyle = css`
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text);
`;

const titleDone = css`
  color: var(--haze-color-text-muted);
  text-decoration: line-through;
`;

const descriptionStyle = css`
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  margin-block-start: var(--haze-space-1);
`;

const actionsStyle = css`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--haze-space-1);
`;

function TaskListItem({
  checked: checkedControl,
  onCheckedChange,
  title,
  description,
  indicator,
  actions,
  className,
  ...rest
}: TaskListItemProps) {
  const [checked, setChecked] = useControl(checkedControl, false);

  const handleChecked = (next: boolean) => {
    setChecked(next);
    onCheckedChange?.(next);
  };

  const bodyNode = (
    <div data-slot='task-body' x-class={[body]}>
      <div data-slot='task-title' x-class={[titleStyle, checked && titleDone]}>
        {title}
      </div>
      {description && (
        <div data-slot='task-description' x-class={[descriptionStyle]}>
          {description}
        </div>
      )}
    </div>
  );

  return (
    <li
      data-slot='task-item'
      data-checked={checked}
      x-class={[item, className]}
      {...rest}
    >
      {indicator ? (
        <div data-slot='task-row' x-class={[row]}>
          <span data-slot='task-indicator' x-class={[indicatorSlot]}>
            {indicator}
          </span>
          {bodyNode}
        </div>
      ) : (
        <label data-slot='task-row' x-class={[row, rowLabel]}>
          <CheckboxCore checked={checked} onChange={handleChecked} />
          {bodyNode}
        </label>
      )}
      {actions && (
        <div data-slot='task-actions' x-class={[actionsStyle]}>
          {actions}
        </div>
      )}
    </li>
  );
}

function TaskList({ items, children, className, ...rest }: TaskListProps) {
  const useItems = items !== undefined;
  if (useItems && children != null) {
    // Dev-time guard rather than a throw: rendering continues with the
    // items path so a partially-migrated call site still shows tasks,
    // while the console names the contract breach.
    warnItemsChildrenConflict('TaskList');
  }

  return (
    <ul data-slot='task-list' x-class={[list, className]} {...rest}>
      {useItems
        ? items.map(({ key, ...task }) => <TaskListItem key={key} {...task} />)
        : children}
    </ul>
  );
}

export default TaskList;
export { TaskListItem };
export type { TaskListProps, TaskListItemProps, TaskData };
