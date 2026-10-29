import { css } from '@linaria/core';

/**
 * Shared prose skin — the typographic document rules the structural-
 * mirror prose pair (MarkdownRenderer's wrapper, RichTextEditor's
 * content area) both wear. The RTE content styles were lifted from
 * MarkdownRenderer verbatim (its own comment admitted the lineage), so
 * the drift between the two copies is pure spelling: this module
 * settles it in MarkdownRenderer's favor where they disagreed —
 * margins unified on logical properties (`margin-block-*`) and the
 * blockquote voice on `text-muted` — and extends the first-child top
 * margin reset (an RTE-only rule) to every block opener including
 * h5/h6, so a document flush to its container's top edge renders the
 * same in both consumers.
 *
 * What deliberately stays local: the container base each consumer
 * paints (MarkdownRenderer's font/color/word-break wrapper plus its
 * table/th/td/img rules — markdown-only surfaces; RichTextEditor's
 * flex/padding/overflow chrome, its `.tiptap` ProseMirror rules and the
 * extension-placeholder arm) — every property set here is disjoint
 * from those deltas, so dev-server injection order and dist split-css
 * order cannot change the computed result.
 *
 * The em/px literals (0.875em code voice, its 0.125em/0.375em padding,
 * the 3px quote bar) are host-relative metrics that intentionally
 * track the surrounding type size — no token maps 1:1.
 *
 * Pure Linaria class constants, no css map (nothing for the one-map-
 * per-module rule to collide on), no hooks, no DOM access (RSC-safe by
 * inspection; nothing RSC-listed imports it, so no rsc-safe.mjs entry
 * — the css rides with the markdown-renderer/rich-text-editor groups
 * via split-css sharedLayers).
 */
export const proseContent = css`
  & h1, & h2, & h3, & h4, & h5, & h6 {
    font-weight: var(--haze-weight-semibold);
    margin-block-start: var(--haze-space-4);
    margin-block-end: var(--haze-space-2);
    line-height: var(--haze-leading-tight);
  }

  & h1 { font-size: var(--haze-text-2xl); }
  & h2 { font-size: var(--haze-text-xl); }
  & h3 { font-size: var(--haze-text-lg); }
  & h4 { font-size: var(--haze-text-base); }

  /* A document that opens with a block sticks to the container's top
     edge — the surrounding chrome already carries the padding. */
  & h1:first-child, & h2:first-child, & h3:first-child,
  & h4:first-child, & h5:first-child, & h6:first-child,
  & p:first-child, & blockquote:first-child,
  & pre:first-child, & ul:first-child, & ol:first-child {
    margin-block-start: 0;
  }

  & p, & ul, & ol, & blockquote, & pre {
    margin-block-end: var(--haze-space-3);
  }

  & ul, & ol {
    padding-inline-start: var(--haze-space-6);
  }

  & li {
    margin-block-end: var(--haze-space-1);
  }

  & code {
    font-family: var(--haze-font-mono);
    font-size: 0.875em;
    background: var(--haze-color-bg-muted);
    padding: 0.125em 0.375em;
    border-radius: var(--haze-radius-sm);
  }

  & pre {
    padding: var(--haze-space-4);
    background: var(--haze-color-bg-muted);
    border-radius: var(--haze-radius-md);
    overflow-x: auto;

    & code {
      background: none;
      padding: 0;
    }
  }

  & blockquote {
    padding-inline-start: var(--haze-space-4);
    border-inline-start: 3px solid var(--haze-color-border);
    color: var(--haze-color-text-muted);
  }

  & a {
    color: var(--haze-color-primary);
    text-decoration: underline;
  }

  & hr {
    margin-block: var(--haze-space-4);
    margin-inline: 0;
    border: none;
    border-block-start: 1px solid var(--haze-color-border);
  }
`;
