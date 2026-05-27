import { useMemo } from 'react';
import { css } from '@linaria/core';

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

const wrapper = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-relaxed);
  color: var(--haze-color-text);
  word-break: break-word;

  & h1, & h2, & h3, & h4, & h5, & h6 {
    font-weight: var(--haze-weight-semibold);
    margin-top: var(--haze-space-4);
    margin-bottom: var(--haze-space-2);
    line-height: var(--haze-leading-tight);
  }

  & h1 { font-size: var(--haze-text-2xl); }
  & h2 { font-size: var(--haze-text-xl); }
  & h3 { font-size: var(--haze-text-lg); }
  & h4 { font-size: var(--haze-text-base); }

  & p {
    margin-bottom: var(--haze-space-3);
  }

  & ul, & ol {
    margin-bottom: var(--haze-space-3);
    padding-left: var(--haze-space-6);
  }

  & li {
    margin-bottom: var(--haze-space-1);
  }

  & code {
    font-family: var(--haze-font-mono);
    font-size: 0.875em;
    background: var(--haze-color-muted);
    padding: 0.125em 0.375em;
    border-radius: var(--haze-radius-sm);
  }

  & pre {
    margin-bottom: var(--haze-space-3);
    padding: var(--haze-space-4);
    background: var(--haze-color-muted);
    border-radius: var(--haze-radius-md);
    overflow-x: auto;

    & code {
      background: none;
      padding: 0;
    }
  }

  & blockquote {
    margin-bottom: var(--haze-space-3);
    padding-left: var(--haze-space-4);
    border-left: 3px solid var(--haze-color-border);
    color: var(--haze-color-text-muted);
  }

  & a {
    color: var(--haze-color-primary);
    text-decoration: underline;
  }

  & table {
    width: 100%;
    margin-bottom: var(--haze-space-3);
    border-collapse: collapse;
  }

  & th, & td {
    padding: var(--haze-space-2) var(--haze-space-3);
    border: 1px solid var(--haze-color-border);
    text-align: left;
  }

  & th {
    background: var(--haze-color-muted);
    font-weight: var(--haze-weight-medium);
  }

  & hr {
    margin: var(--haze-space-4) 0;
    border: none;
    border-top: 1px solid var(--haze-color-border);
  }

  & img {
    max-width: 100%;
    border-radius: var(--haze-radius-md);
  }
`;

function parseMarkdown(src: string): string {
  let html = src;

  // code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    return `<pre><code class="lang-${lang}">${escapeHtml(code.trim())}</code></pre>`;
  });

  // inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // headings
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // blockquote
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // unordered list
  html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // ordered list
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<oli>$1</oli>');
  html = html.replace(/((?:<oli>.*<\/oli>\n?)+)/g, (m) => {
    return '<ol>' + m.replace(/<\/?oli>/g, (t) => t.replace('oli', 'li')) + '</ol>';
  });

  // horizontal rule
  html = html.replace(/^---$/gm, '<hr />');

  // links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');

  // paragraphs (lines not already wrapped in block elements)
  html = html.replace(/^(?!<[a-z])((?!<\/).+)$/gm, (line) => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    return `<p>${trimmed}</p>`;
  });

  // line breaks
  html = html.replace(/\n{2,}/g, '\n');

  return html;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div
      x-class={[wrapper, className]}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export type { MarkdownRendererProps };
