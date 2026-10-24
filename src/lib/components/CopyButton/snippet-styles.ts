import {css} from '@linaria/core';

/**
 * Shared Snippet skin — the inline code chip `Snippet` renders: mono
 * content cell that ellipsizes, with a CopyButton docked at the
 * trailing edge. Living in its own module keeps the component file
 * free of style internals (react-refresh boundary); split-css groups
 * the emitted CSS into `haze-ui/css/copy-button.css` (Snippet lives
 * in the CopyButton directory and shares its css family).
 */

export const snippet = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-1);
  max-width: 100%;
  padding-inline: var(--haze-space-3) var(--haze-space-1);
  padding-block: var(--haze-space-1);
  background: var(--haze-color-bg-muted);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  font-family: var(--haze-font-mono);
`;

export const content = css`
  /* One line, ellipsized: a snippet is an inline value to copy, not a
   * code listing (CodeBlock is the multiline reader). font-family is
   * declared because the UA sheet gives every code element a real
   * monospace font-family declaration, which beats the chip's
   * inherited mono stack and would silently fall back to the host's
   * default mono (breaking any consumer override of --haze-font-mono,
   * and the e2e harness's pinned webfont). */
  font-family: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-relaxed);
  color: var(--haze-color-text);
`;
