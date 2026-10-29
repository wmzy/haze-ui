import { useMemo } from 'react';
import { css } from '@linaria/core';

import { useStrings } from '../LocaleProvider';

type DiffLine = {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  oldLine?: number;
  newLine?: number;
};

type DiffViewerProps = {
  oldValue: string;
  newValue: string;
  className?: string;
};

const wrapper = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  line-height: var(--haze-leading-relaxed);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  overflow: hidden;
`;

const header = css`
  display: flex;
  padding: var(--haze-space-2) var(--haze-space-3);
  background: var(--haze-color-bg-muted);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  border-bottom: 1px solid var(--haze-color-border);
`;

const body = css`
  overflow-x: auto;
`;

const line = css`
  display: flex;
  min-height: 1.25rem;
`;

const lineNum = css`
  flex-shrink: 0;
  width: 3rem;
  padding: 0 var(--haze-space-2);
  text-align: end;
  color: var(--haze-color-text-muted);
  user-select: none;
  border-inline-end: 1px solid var(--haze-color-border);
`;

const lineContent = css`
  flex: 1;
  padding: 0 var(--haze-space-3);
  white-space: pre;
`;

const added = css`
  background: var(--haze-color-success-subtle);
`;

const removed = css`
  background: var(--haze-color-danger-subtle);
`;

const addedPrefix = css`
  color: var(--haze-color-success);
`;

const removedPrefix = css`
  color: var(--haze-color-danger);
`;

/* Look-ahead distance (lines) used to re-sync the two walks once they
 * diverge: a common line within this window marks the end of a pure
 * insertion/deletion run, so a single mid-document edit no longer
 * cascades into paired removed/added rows all the way down. */
const SYNC_WINDOW = 5;

/** Index of the next occurrence of `target` within the sync window
 * after `start`, or -1 when the line does not reappear nearby. */
function findAnchor(lines: string[], start: number, target: string): number {
  const end = Math.min(start + SYNC_WINDOW, lines.length - 1);
  for (let i = start + 1; i <= end; i++) {
    if (lines[i] === target) return i;
  }
  return -1;
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result: DiffLine[] = [];

  let oldIdx = 0;
  let newIdx = 0;

  // Line-by-line diff with windowed re-synchronization
  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    const oldLine = oldLines[oldIdx]!;
    const newLine = newLines[newIdx]!;

    if (oldIdx >= oldLines.length) {
      result.push({ type: 'added', content: newLine, newLine: newIdx + 1 });
      newIdx++;
    } else if (newIdx >= newLines.length) {
      result.push({ type: 'removed', content: oldLine, oldLine: oldIdx + 1 });
      oldIdx++;
    } else if (oldLine === newLine) {
      result.push({ type: 'unchanged', content: oldLine, oldLine: oldIdx + 1, newLine: newIdx + 1 });
      oldIdx++;
      newIdx++;
    } else {
      // Before pairing the diverging lines as a modification, look for
      // a re-sync anchor: the old line reappearing ahead in the new
      // text marks a pure insertion, the new line reappearing ahead in
      // the old text a pure deletion (the nearer anchor wins). Only
      // when neither side re-syncs within the window do the lines pair
      // up as a single modification.
      const insertAt = findAnchor(newLines, newIdx, oldLine);
      const deleteAt = findAnchor(oldLines, oldIdx, newLine);
      if (
        insertAt !== -1 &&
        (deleteAt === -1 || insertAt - newIdx <= deleteAt - oldIdx)
      ) {
        for (let i = newIdx; i < insertAt; i++) {
          result.push({ type: 'added', content: newLines[i]!, newLine: i + 1 });
        }
        newIdx = insertAt;
      } else if (deleteAt !== -1) {
        for (let i = oldIdx; i < deleteAt; i++) {
          result.push({ type: 'removed', content: oldLines[i]!, oldLine: i + 1 });
        }
        oldIdx = deleteAt;
      } else {
        result.push({ type: 'removed', content: oldLine, oldLine: oldIdx + 1 });
        result.push({ type: 'added', content: newLine, newLine: newIdx + 1 });
        oldIdx++;
        newIdx++;
      }
    }
  }

  return result;
}

export default function DiffViewer({ oldValue, newValue, className }: DiffViewerProps) {
  const strings = useStrings('diffViewer');
  const lines = useMemo(() => computeDiff(oldValue, newValue), [oldValue, newValue]);

  return (
    <div data-slot="diff-viewer" x-class={[wrapper, className]}>
      <div data-slot="header" x-class={[header]}>{strings.header}</div>
      <div data-slot="body" x-class={[body]}>
        {lines.map((line, i) => (
          <div key={i} data-slot="line" x-class={[lineStyle, line.type === 'added' && added, line.type === 'removed' && removed]}>
            <span data-slot="gutter" x-class={[lineNum]}>{line.oldLine ?? ''}</span>
            <span data-slot="gutter" x-class={[lineNum]}>{line.newLine ?? ''}</span>
            <span data-slot="content" x-class={[lineContent]}>
              {line.type === 'added' && <span data-slot="sign" x-class={[addedPrefix]}>+ </span>}
              {line.type === 'removed' && <span data-slot="sign" x-class={[removedPrefix]}>- </span>}
              {line.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// alias to avoid Linaria collision with the prop name
const lineStyle = line;

export type { DiffViewerProps, DiffLine };
