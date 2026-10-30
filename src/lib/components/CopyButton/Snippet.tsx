import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import { truncate } from '../../utils/truncate';

import CopyButton from './CopyButton';


import { content as contentClass, snippet } from './snippet-styles';

/** Semantic slot classes for Snippet (AntD v6 `classNames` shape;
 * keys follow the data-slot names). */
type SnippetClassNames = {
  /** The chip wrapper (data-slot='snippet'). */
  root?: string;
  /** The mono content cell (data-slot='content'). */
  content?: string;
  /** The docked copy button (forwarded to CopyButton's root slot). */
  copyButton?: string;
  /** The copy/check glyphs (forwarded to CopyButton's icon slot). */
  icon?: string;
};

type SnippetOwnProps = {
  /** The text the copy button puts on the clipboard. */
  value: string;
  /** How long the copied feedback lasts, in ms. Defaults to 2000. */
  copiedTimeout?: number;
  /** CopyButton's accessible name while idle. Defaults to 'Copy'. */
  copyLabel?: string;
  /** CopyButton's accessible name while copied. Defaults to 'Copied'. */
  copiedLabel?: string;
  /** Slot classes (see {@link SnippetClassNames}). */
  classNames?: SnippetClassNames;
};

type SnippetProps = SnippetOwnProps & {
  /**
   * Display content inside the chip; defaults to `value` verbatim.
   * Pass a styled node to mask secrets or abbreviate long payloads —
   * the clipboard always gets `value`.
   */
  children?: ReactNode;
  className?: string;
  /** Forwarded to the chip wrapper (data-slot='snippet'). */
  ref?: Ref<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, keyof SnippetOwnProps | 'className' | 'children'>;

/**
 * An inline snippet with one-click copy: a mono chip (`value`, or a
 * custom `children` display) with a small ghost `CopyButton` docked
 * at the trailing edge — the install-command / API-key / share-link
 * affordance. Display and clipboard payload are independent: children
 * never reach the clipboard, `value` always does.
 *
 * For a multiline code listing with optional syntax highlighting, use
 * `CodeBlock` instead — a snippet is a single inline value.
 */
export default function Snippet({
  value,
  copiedTimeout,
  copyLabel,
  copiedLabel,
  classNames,
  className,
  children,
  ref,
  ...rest
}: SnippetProps) {
  return (
    <div
      ref={ref}
      data-slot="snippet"
      x-class={[snippet, className, classNames?.root]}
      {...rest}
    >
      <code
        data-slot="content"
        x-class={[truncate, contentClass, classNames?.content]}
      >
        {children ?? value}
      </code>
      <CopyButton
        value={value}
        copiedTimeout={copiedTimeout}
        copyLabel={copyLabel}
        copiedLabel={copiedLabel}
        size="sm"
        variant="ghost"
        classNames={{ root: classNames?.copyButton, icon: classNames?.icon }}
      />
    </div>
  );
}

export type { SnippetClassNames, SnippetProps };
