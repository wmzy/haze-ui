import { useMemo, useRef } from 'react';
import { css } from '@linaria/core';

import { proseContent } from '../../utils/prose-skin';

import { parseMarkdown, splitBlocks } from './markdown-blocks';

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

/* Container base only — the typographic document rules (headings,
   paragraphs, lists, code, quotes, links, rules) come from the shared
   utils/prose-skin `proseContent` class composed below; the table and
   img arms are markdown-only surfaces and stay here. */
const wrapper = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-relaxed);
  color: var(--haze-color-text);
  word-break: break-word;

  & table {
    width: 100%;
    margin-bottom: var(--haze-space-3);
    border-collapse: collapse;
  }

  & th, & td {
    padding: var(--haze-space-2) var(--haze-space-3);
    border: 1px solid var(--haze-color-border);
    text-align: start;
  }

  & th {
    background: var(--haze-color-bg-muted);
    font-weight: var(--haze-weight-medium);
  }

  & img {
    max-width: 100%;
    border-radius: var(--haze-radius-md);
  }
`;

type BlockCache = { source: readonly string[]; parsed: string[] };

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Partition at blank-line boundaries (outside code fences, at even
  // backtick parity — see markdown-blocks.ts). While content streams in,
  // only the active tail block changes; every earlier block is stable.
  const blocks = useMemo(() => splitBlocks(content), [content]);

  // Sliding per-block memo: value-compare each block against the previous
  // content's block list (`===` compares string values), so stable prefix
  // blocks reuse their parse and only changed blocks run the pipeline.
  // parseMarkdown is pure, so caching across renders is safe even for
  // discarded concurrent renders.
  const cacheRef = useRef<BlockCache>({ source: [], parsed: [] });
  const html = useMemo(() => {
    const prev = cacheRef.current;
    const parsed = blocks.map((block, i) =>
      // source/parsed are same-length; a matching source slot always has
      // its parsed counterpart.
      prev.source[i] === block ? prev.parsed[i]! : parseMarkdown(block),
    );
    cacheRef.current = { source: blocks, parsed };
    // Single newline between blocks — exactly what parseMarkdown's final
    // `\n{2,}` collapse produces for the blank-line separators.
    return parsed.join('\n');
  }, [blocks]);

  return (
    <div
      data-slot='markdown'
      x-class={[wrapper, proseContent, className]}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export type { MarkdownRendererProps };
