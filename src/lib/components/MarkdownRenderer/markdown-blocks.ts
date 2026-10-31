// Incremental markdown pipeline shared by MarkdownRenderer.
//
// `parseMarkdown` is the original whole-string regex pipeline (semantics
// unchanged); `splitBlocks` partitions a document into independently
// parseable blocks so a streaming render only re-parses its active tail
// block instead of the whole document on every chunk.

// Observability seam for the structural perf tests: counts entry into
// `parseMarkdown` and the total source length handed to it. The old
// whole-document re-parse per streamed chunk shows up here as `chars`
// growing quadratically with stream length; the incremental renderer
// keeps it linear in the document size.
export const parseStats = { calls: 0, chars: 0 };

export function parseMarkdown(src: string): string {
  parseStats.calls += 1;
  parseStats.chars += src.length;

  // Escape the ENTIRE source before any branch runs: every rule below
  // (headings, emphasis, quotes, lists, link text, link/img URLs) then
  // consumes already-escaped text, so raw markup in the source can never
  // reach the output as live HTML — the output only ever contains tags
  // this pipeline itself generates. escapeHtml touches none of the
  // structural characters the block/inline regexes key on (backticks,
  // newlines, fence markers, `*`, `#`, `>`, `-`), so parsing semantics
  // and splitBlocks' backtick-parity rule are unchanged.
  let html = escapeHtml(src);

  // code blocks — the payload was already escaped above; emitting it
  // verbatim keeps fence contents inert without double-escaping
  // (&amp;lt;).
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    return `<pre><code class="lang-${lang}" data-slot="code">${(code as string).trim()}</code></pre>`;
  });

  // inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // headings
  html = html.replace(/^######\s+(.+)$/gm, '<h6 data-slot="heading">$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5 data-slot="heading">$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4 data-slot="heading">$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 data-slot="heading">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2 data-slot="heading">$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1 data-slot="heading">$1</h1>');

  // bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // blockquote — the source's leading '>' was escaped to &gt; at entry, so
  // the rule matches the escaped form. A literal '&gt;' typed in the
  // source double-escapes to &amp;gt; and correctly stays a paragraph.
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // unordered list
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li data-slot="item">$1</li>');
  html = html.replace(/((?:<li [^>]*>.*<\/li>\n?)+)/g, '<ul data-slot="list">$1</ul>');

  // ordered list
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<oli data-slot="item">$1</oli>');
  html = html.replace(/((?:<oli [^>]*>.*<\/oli>\n?)+)/g, (m) => {
    return '<ol data-slot="list">' + m.replace(/<\/?oli[^>]*>/g, (t) => t.replace('oli', 'li')) + '</ol>';
  });

  // horizontal rule
  html = html.replace(/^---$/gm, '<hr />');

  // links — the URL is already escaped (its quotes are &quot;, so it
  // cannot break out of the attribute), but escaping says nothing about
  // the scheme: javascript:/data:/vbscript: would pass straight through.
  // sanitizeUrl enforces the whitelist; an unsafe URL degrades to a dead
  // '#' anchor — conservative on purpose, so the link text stays readable
  // and stylable while the navigation goes nowhere.
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text: string, url: string) => {
    const href = sanitizeUrl(url) ?? '#';
    return `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
  });

  // images — same URL whitelist for src. An unsafe image is dropped
  // entirely, leaving only its (already-escaped) alt text: a placeholder
  // src would risk a spurious fetch and keep the payload addressable.
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt: string, url: string) => {
    const src = sanitizeUrl(url);
    return src === null ? alt : `<img alt="${alt}" src="${src}" />`;
  });

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

// Scheme whitelist for URLs pulled out of markdown link/image syntax —
// the last line of defense behind the entry escape. Escaping already
// neutralizes quotes and angle brackets, but a well-formed
// javascript:/data:/vbscript: URL is perfectly quotable HTML; only a
// scheme check can stop it. Allowed: absolute http(s), mailto:, in-page
// #fragment, and scheme-free relative paths. Refused: every other scheme
// and protocol-relative //host (it inherits the page protocol).
//
// Embedded tab/CR/LF are stripped first because the browser URL parser
// removes them before matching schemes — without this, "java\tscript:"
// would smuggle through as a "relative" URL.
function sanitizeUrl(rawUrl: string): string | null {
  const url = rawUrl.replace(/[\t\r\n]/g, '').trim();
  if (/^(?:https?:|mailto:)/i.test(url)) return url;
  if (url.startsWith('#')) return url;
  if (url.startsWith('//')) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return null;
  return url;
}

// Must mirror parseMarkdown's code-block pass exactly: everything inside a
// matched fence is opaque to block splitting.
const FENCE_RE = /```(\w*)\n([\s\S]*?)```/g;

// Split a document into blocks that parse identically standalone as they
// do inside the whole document, so blocks.map(parseMarkdown).join('\n')
// === parseMarkdown(document).
//
// Two rules keep that equivalence bug-for-bug:
// - Never split inside a code fence (the fence regex consumes it atomically
//   in the full-document parse, so its blank lines are not boundaries).
// - Never split where an inline code span would cross the boundary: the
//   inline-code regex pairs backticks left-to-right, so a boundary is only
//   safe when the backtick parity of the text before it is even. Regions
//   with unpaired backticks simply stay fused into one larger block.
export function splitBlocks(src: string): string[] {
  const fences = Array.from(src.matchAll(FENCE_RE), (m) => {
    const start = m.index;
    return {
      start,
      // ``` + lang + newline: the code payload starts right after
      codeStart: start + (m[1] ?? '').length + 4,
      end: start + m[0].length,
    };
  });

  const blocks: string[] = [];
  let parity = 0; // backticks visible to the inline-code pass so far
  let blockStart = 0;
  let runStart = -1; // first '\n' of the current newline run
  let fenceIdx = 0;
  let i = 0;

  while (i < src.length) {
    const fence = fences[fenceIdx];
    if (fence && fence.start <= i) {
      // A newline run ending at the fence is a normal boundary.
      if (runStart >= 0) {
        if (i - runStart >= 2 && parity % 2 === 0) {
          blocks.push(src.slice(blockStart, runStart));
          blockStart = i;
        }
        runStart = -1;
      }
      // Backticks inside the escaped code payload survive the fence
      // replacement, so they still count toward inline-code pairing.
      for (let j = fence.codeStart; j < fence.end - 3; j++) {
        if (src[j] === '`') parity += 1;
      }
      i = fence.end;
      fenceIdx += 1;
      continue;
    }

    const ch = src[i];
    if (ch === '\n') {
      if (runStart < 0) runStart = i;
    } else {
      // A blank-line run (>= 2 newlines) at even parity is a block
      // boundary; the separator is dropped and re-joined as a single
      // newline, matching parseMarkdown's final `\n{2,}` collapse.
      if (runStart >= 0 && i - runStart >= 2 && parity % 2 === 0) {
        blocks.push(src.slice(blockStart, runStart));
        blockStart = i;
      }
      runStart = -1;
      if (ch === '`') parity += 1;
    }
    i += 1;
  }

  if (runStart >= 0 && src.length - runStart >= 2 && parity % 2 === 0) {
    blocks.push(src.slice(blockStart, runStart));
    blockStart = src.length;
  }
  return [...blocks, src.slice(blockStart)];
}
