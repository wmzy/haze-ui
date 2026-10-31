import type { ComponentPropsWithoutRef } from 'react';

import { css } from '@linaria/core';
import { useState } from 'react';

import { CheckboxCore } from '../Checkbox';
import { useStrings } from '../LocaleProvider';
import { formatString } from '../LocaleProvider/locale';
import { quietSquareButton } from '../../utils/quiet-button-skin';

type TransferItem = {
  key: string;
  title: string;
  disabled?: boolean;
};

type TransferCoreProps = {
  dataSource: TransferItem[];
  /** Keys currently on the target side — the field value, emitted
   * verbatim by `onChange`. */
  value: string[];
  /** Emits the next value plus move metadata; the first argument is
   * always the complete next `string[]`, so a plain value channel
   * (e.g. FormItem's `input` bridge) can ignore the rest. */
  onChange: (
    value: string[],
    direction: 'left' | 'right',
    moveKeys: string[]
  ) => void;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'onChange' | 'children'>;

const container = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--haze-space-4);
  font-family: var(--haze-font-sans);
`;

const panel = css`
  flex: 1;
  /* 200px has no ladder step — the panel's readability floor next to
     its sibling, not a spacing rhythm; literal on purpose. */
  min-width: 200px;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  overflow: hidden;
`;

const panelHeader = css`
  padding: var(--haze-space-2) var(--haze-space-3);
  border-bottom: 1px solid var(--haze-color-border);
  background: var(--haze-color-bg-subtle);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text-secondary);
`;

const panelBody = css`
  /* 200px has no ladder step — the list's scroll clamp, chosen to keep
     short panels compact; literal on purpose. */
  max-height: 200px;
  overflow-y: auto;
  padding: var(--haze-space-1);
`;

const itemStyle = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-1) var(--haze-space-2);
  border-radius: var(--haze-radius-sm);
  font-size: var(--haze-text-sm);
  cursor: pointer;

  /* CheckboxCore ships standalone 4px margins (its bare-input 32px
     optical footprint); inside the row the gap owns horizontal spacing
     and the 24px box centers against the title. The nested selector
     beats the single-class base no matter the stylesheet emission
     order (TaskList's row delta precedent). */
  & > input {
    margin: 0;
  }

  &:hover {
    background: var(--haze-color-bg-subtle);
  }
`;

const actions = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--haze-space-2);
`;

/* The move buttons wear the shared quiet square skin
 * (utils/quiet-button-skin quietSquareButton) — the 36px seat, border
 * surface, hover wash and disabled mute this hand-roll carried. No
 * local delta remains: the former 2.25rem literals are the shared
 * calc's value at the default density (see the shared class's
 * header). */

/** Pure list toggle shared by both panels — returns the next list. */
const toggleIn = (list: string[], key: string): string[] =>
  list.includes(key) ? list.filter((k) => k !== key) : [...list, key];

/** One list panel: header count plus checkbox rows. Source and target
 * render the same shape — only items, selection, toggle and title
 * differ, so the duplicated JSX folds into one parameterized helper. */
function renderPanel(
  items: TransferItem[],
  selected: string[],
  toggle: (key: string) => void,
  title: string
) {
  return (
    <div data-slot="panel" x-class={[panel]}>
      <div data-slot="header" x-class={[panelHeader]}>{title}</div>
      <div data-slot="list" x-class={[panelBody]}>
        {items.map((item) => (
          <label key={item.key} data-slot="item" x-class={[itemStyle]}>
            {/* CheckboxCore renders the bare input (no label prop) so the
                row label keeps owning the wrapping and the accessible
                name — same pattern as TaskList's rows. */}
            <CheckboxCore
              checked={selected.includes(item.key)}
              disabled={item.disabled}
              onChange={() => toggle(item.key)}
              aria-label={item.title}
            />
            {item.title}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function TransferCore({
  dataSource,
  value: targetKeys,
  onChange,
  className,
  ...rest
}: TransferCoreProps) {
  const [selectedSource, setSelectedSource] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string[]>([]);
  const strings = useStrings('transfer');

  const sourceItems = dataSource.filter((item) => !targetKeys.includes(item.key));
  const targetItems = dataSource.filter((item) => targetKeys.includes(item.key));

  const moveToTarget = () => {
    if (selectedSource.length === 0) return;
    const next = [...targetKeys, ...selectedSource];
    onChange(next, 'right', selectedSource);
    setSelectedSource([]);
  };

  const moveToSource = () => {
    if (selectedTarget.length === 0) return;
    const next = targetKeys.filter((k) => !selectedTarget.includes(k));
    onChange(next, 'left', selectedTarget);
    setSelectedTarget([]);
  };

  return (
    <div data-slot="transfer" x-class={[container, className]} {...rest}>
      {renderPanel(
        sourceItems,
        selectedSource,
        (key) => setSelectedSource((prev) => toggleIn(prev, key)),
        formatString(strings.source, { count: sourceItems.length })
      )}
      <div data-slot="actions" x-class={[actions]}>
        <button
          type="button"
          data-slot="move-button"
          x-class={[quietSquareButton]}
          disabled={selectedSource.length === 0}
          onClick={moveToTarget}
          aria-label={strings.moveToTarget}
        >
          ›
        </button>
        <button
          type="button"
          data-slot="move-button"
          x-class={[quietSquareButton]}
          disabled={selectedTarget.length === 0}
          onClick={moveToSource}
          aria-label={strings.moveToSource}
        >
          ‹
        </button>
      </div>
      {renderPanel(
        targetItems,
        selectedTarget,
        (key) => setSelectedTarget((prev) => toggleIn(prev, key)),
        formatString(strings.target, { count: targetItems.length })
      )}
    </div>
  );
}

export type { TransferCoreProps, TransferItem };
