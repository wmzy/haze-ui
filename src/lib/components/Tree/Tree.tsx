import type { Control } from 'react-use-control';

import type { TreeNodeData, TreeProps } from './types';

import { useControl } from 'react-use-control';

import { css } from '@linaria/core';
import { useMemo } from 'react';

import TreeItem from './TreeItem';
import { findNodeByKey, getChildKeys, getParentKey } from './utils';

const base = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  overflow: auto;
`;

const group = css`
  min-width: 0;
`;

function computeCheckedKeys(
  keys: string[],
  data: TreeNodeData[],
  checkStrictly: boolean
): { checked: string[]; halfChecked: string[] } {
  if (checkStrictly) return { checked: keys, halfChecked: [] };

  const checkedSet = new Set(keys);
  const halfCheckedSet = new Set<string>();
  const toRemove = new Set<string>();

  const walk = (nodes: TreeNodeData[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        walk(node.children);
        const allDescendants = getChildKeys(data, node.key);
        const checkedDescendants = allDescendants.filter((k) =>
          checkedSet.has(k)
        );
        if (checkedDescendants.length === 0) {
          toRemove.add(node.key);
        } else if (checkedDescendants.length < allDescendants.length) {
          halfCheckedSet.add(node.key);
          toRemove.add(node.key);
        }
      }
    }
  };
  walk(data);

  return {
    checked: keys.filter((k) => !toRemove.has(k)),
    halfChecked: Array.from(halfCheckedSet),
  };
}

export default function Tree({
  treeData,
  multiple = false,
  checkable = false,
  checkStrictly = false,
  selectable = true,
  disabled = false,
  blockNode = false,
  showLine = false,
  showIcon = false,
  switcherIcon,
  loadingIcon,
  titleRender,
  iconRender,
  expandedKeys: expandedKeysControl,
  selectedKeys: selectedKeysControl,
  checkedKeys: checkedKeysControl,
  className,
  onExpand,
  onSelect,
  onCheck,
}: TreeProps) {
  const [expandedKeys, setExpandedKeys] = useControl(
    expandedKeysControl as Control<string[]> | undefined,
    []
  );
  const [selectedKeys, setSelectedKeys] = useControl(
    selectedKeysControl as Control<string[]> | undefined,
    []
  );
  const [checkedKeysRaw, setCheckedKeysRaw] = useControl(
    checkedKeysControl as Control<string[]> | undefined,
    []
  );

  const rawChecked = checkedKeysRaw;

  const derived = useMemo(
    () => computeCheckedKeys(rawChecked, treeData, checkStrictly),
    [rawChecked, treeData, checkStrictly]
  );
  const checkedKeys = derived.checked;
  const halfCheckedKeys = derived.halfChecked;

  function handleToggle(key: string) {
    const isExpanded = expandedKeys.includes(key);
    const newKeys = isExpanded
      ? expandedKeys.filter((k) => k !== key)
      : [...expandedKeys, key];

    setExpandedKeys(newKeys);
    onExpand?.(newKeys, {
      expanded: !isExpanded,
      node: findNodeByKey(treeData, key)!,
    });
  }

  function handleSelect(key: string) {
    const node = findNodeByKey(treeData, key);
    if (!node?.selectable && node?.selectable !== undefined) return;
    if (!selectable) return;

    let newKeys: string[];
    if (multiple) {
      const idx = selectedKeys.indexOf(key);
      newKeys =
        idx >= 0
          ? selectedKeys.filter((k) => k !== key)
          : [...selectedKeys, key];
    } else {
      newKeys = selectedKeys.includes(key) ? [] : [key];
    }

    setSelectedKeys(newKeys);
    onSelect?.(newKeys, {
      selected: newKeys.includes(key),
      selectedNodes: newKeys
        .map((k) => findNodeByKey(treeData, k)!)
        .filter(Boolean),
      node: node!,
    });
  }

  function handleCheck(key: string) {
    if (!checkable) return;
    const node = findNodeByKey(treeData, key);
    if (node?.disableCheckbox) return;
    const isChecked = checkedKeys.includes(key);
    let newChecked: string[];

    if (checkStrictly) {
      newChecked = isChecked
        ? checkedKeys.filter((k) => k !== key)
        : [...checkedKeys, key];
    } else {
      const childKeys = getChildKeys(treeData, key);
      if (isChecked) {
        newChecked = checkedKeys.filter(
          (k) => k !== key && !childKeys.includes(k)
        );
        let parentKey = getParentKey(treeData, key);
        while (parentKey) {
          newChecked = newChecked.filter((k) => k !== parentKey);
          parentKey = getParentKey(treeData, parentKey);
        }
      } else {
        const toAdd = [key, ...childKeys].filter(
          (k) => !checkedKeys.includes(k)
        );
        newChecked = [...checkedKeys, ...toAdd];

        let parentKey = getParentKey(treeData, key);
        while (parentKey) {
          const siblings = getChildKeys(treeData, parentKey);
          const allSiblingsChecked = siblings.every((k) =>
            newChecked.includes(k)
          );
          if (allSiblingsChecked && !newChecked.includes(parentKey)) {
            newChecked.push(parentKey);
          }
          parentKey = getParentKey(treeData, parentKey);
        }
      }
    }

    const computed = computeCheckedKeys(newChecked, treeData, checkStrictly);

    setCheckedKeysRaw(checkStrictly ? newChecked : computed.checked);
    onCheck?.(checkStrictly ? newChecked : computed, {
      checked: !isChecked,
      checkedNodes: newChecked
        .map((k) => findNodeByKey(treeData, k)!)
        .filter(Boolean),
      node: findNodeByKey(treeData, key)!,
      halfCheckedKeys: computed.halfChecked,
    });
  }

  function renderNodes(
    nodes: TreeNodeData[],
    level: number,
    parentIsLast: boolean[]
  ) {
    return nodes.map((node, index) => {
      const hasChildren = !!node.children?.length;
      const isExpanded = expandedKeys.includes(node.key);
      const isSelected = selectedKeys.includes(node.key);
      const isChecked = checkedKeys.includes(node.key);
      const isHalfChecked = halfCheckedKeys.includes(node.key);
      const checkedState: 'checked' | 'halfChecked' | 'unchecked' = isChecked
        ? 'checked'
        : isHalfChecked
          ? 'halfChecked'
          : 'unchecked';

      const isLastAtThisLevel = index === nodes.length - 1;
      const currentIsLast = [...parentIsLast, isLastAtThisLevel];

      return (
        <div key={node.key} role='group' x-class={group}>
          <TreeItem
            node={node}
            level={level}
            expanded={isExpanded}
            selected={isSelected}
            checked={checkedState}
            disabled={disabled}
            checkable={checkable}
            selectable={selectable}
            blockNode={blockNode}
            showLine={showLine}
            showIcon={showIcon}
            switcherIcon={switcherIcon}
            loadingIcon={loadingIcon}
            loading={false}
            titleRender={titleRender}
            iconRender={iconRender}
            isLast={currentIsLast}
            onToggle={() => handleToggle(node.key)}
            onSelect={() => handleSelect(node.key)}
            onCheck={() => handleCheck(node.key)}
          />
          {hasChildren && isExpanded && (
            <div>{renderNodes(node.children!, level + 1, currentIsLast)}</div>
          )}
        </div>
      );
    });
  }

  return (
    <div role='tree' x-class={[base, className]}>
      {renderNodes(treeData, 0, [])}
    </div>
  );
}

export type { TreeProps };
