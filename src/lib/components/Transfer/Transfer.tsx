import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useState } from 'react';
import { useControl } from 'react-use-control';

type TransferItem = {
  key: string;
  title: string;
  disabled?: boolean;
};

type TransferProps = {
  dataSource: TransferItem[];
  targetKeys?: Control<string[]> | string[];
  onChange?: (targetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
  className?: string;
};

const container = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--haze-space-4);
  font-family: var(--haze-font-sans);
`;

const panel = css`
  flex: 1;
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

const actionBtn = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--haze-color-bg-subtle);
    border-color: var(--haze-color-border-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function Transfer({
  dataSource,
  targetKeys: targetKeysControl,
  onChange,
  className,
}: TransferProps) {
  const [targetKeys, setTargetKeys] = useControl(targetKeysControl as Control<string[]>, []);
  const [selectedSource, setSelectedSource] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string[]>([]);

  const sourceItems = dataSource.filter((item) => !targetKeys.includes(item.key));
  const targetItems = dataSource.filter((item) => targetKeys.includes(item.key));

  const toggleSource = (key: string) => {
    setSelectedSource((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleTarget = (key: string) => {
    setSelectedTarget((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const moveToTarget = () => {
    if (selectedSource.length === 0) return;
    const next = [...targetKeys, ...selectedSource];
    setTargetKeys(next);
    onChange?.(next, 'right', selectedSource);
    setSelectedSource([]);
  };

  const moveToSource = () => {
    if (selectedTarget.length === 0) return;
    const next = targetKeys.filter((k) => !selectedTarget.includes(k));
    setTargetKeys(next);
    onChange?.(next, 'left', selectedTarget);
    setSelectedTarget([]);
  };

  return (
    <div x-class={[container, className]}>
      <div x-class={[panel]}>
        <div x-class={[panelHeader]}>Source ({sourceItems.length})</div>
        <div x-class={[panelBody]}>
          {sourceItems.map((item) => (
            <label key={item.key} x-class={[itemStyle]}>
              <input
                type="checkbox"
                checked={selectedSource.includes(item.key)}
                disabled={item.disabled}
                onChange={() => toggleSource(item.key)}
                aria-label={item.title}
              />
              {item.title}
            </label>
          ))}
        </div>
      </div>
      <div x-class={[actions]}>
        <button
          type="button"
          x-class={[actionBtn]}
          disabled={selectedSource.length === 0}
          onClick={moveToTarget}
          aria-label=">"
        >
          ›
        </button>
        <button
          type="button"
          x-class={[actionBtn]}
          disabled={selectedTarget.length === 0}
          onClick={moveToSource}
          aria-label="<"
        >
          ‹
        </button>
      </div>
      <div x-class={[panel]}>
        <div x-class={[panelHeader]}>Target ({targetItems.length})</div>
        <div x-class={[panelBody]}>
          {targetItems.map((item) => (
            <label key={item.key} x-class={[itemStyle]}>
              <input
                type="checkbox"
                checked={selectedTarget.includes(item.key)}
                disabled={item.disabled}
                onChange={() => toggleTarget(item.key)}
                aria-label={item.title}
              />
              {item.title}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { TransferProps, TransferItem };
