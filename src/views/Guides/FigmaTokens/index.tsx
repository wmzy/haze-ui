import { css } from '@linaria/core';
import { Link } from '@native-router/react';

import { CodeBlock } from '@/lib';
import { intro, page, section } from '@/views/ComponentDetail/styles';

/*
 * Tokens in Figma guide: the W3C DTF token archives the package ships
 * (haze-ui/design-tokens/*.json), how they flow into Tokens Studio and on
 * to Figma Variables, and where that pipeline flattens or loses fidelity —
 * so designers reading Figma variables know exactly which mirror of the
 * system they are looking at.
 */

const paragraph = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-base);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-relaxed);
  margin: 0 0 var(--haze-space-4);
`;

const inlineCode = css`
  background: var(--haze-color-bg-muted);
  border-radius: var(--haze-radius-sm);
  padding: 0.15em 0.4em;
  font-family: var(--haze-font-mono);
  font-size: 0.9em;
`;

const codeMargin = css`
  margin: var(--haze-space-2) 0 var(--haze-space-4);
`;

const note = css`
  background: var(--haze-color-primary-subtle);
  border-left: 3px solid var(--haze-color-primary);
  border-radius: 0 var(--haze-radius-md) var(--haze-radius-md) 0;
  padding: var(--haze-space-3) var(--haze-space-4);
  margin: var(--haze-space-4) 0;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-normal);
`;

const tableWrap = css`
  overflow-x: auto;
  margin: var(--haze-space-2) 0 var(--haze-space-4);
`;

const mappingTable = css`
  border-collapse: collapse;
  width: 100%;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);

  th,
  td {
    border: 1px solid var(--haze-color-border);
    padding: var(--haze-space-2) var(--haze-space-3);
    text-align: start;
    vertical-align: top;
  }

  th {
    background: var(--haze-color-bg-subtle);
    font-weight: var(--haze-weight-medium);
  }

  code {
    font-family: var(--haze-font-mono);
    font-size: 0.9em;
  }
`;

export default function FigmaTokensGuide() {
  return (
    <div className={page}>
      <h1>Tokens in Figma</h1>
      <p className={intro}>
        haze-ui publishes its design token registry in the{' '}
        <a href="https://tr.designtokens.org/">W3C Design Tokens Format</a>{' '}
        (DTF): plain JSON every design tool can read, generated from the same{' '}
        <code className={inlineCode}>palette.ts</code> source the CSS comes
        from. This guide walks the pipeline — package JSON → Tokens Studio →
        Figma Variables — and, just as important, where it flattens or loses
        fidelity, so nobody mistakes the Figma mirror for the source of truth.
      </p>

      <div className={section}>
        <h2>What ships in the package</h2>
        <p className={paragraph}>
          Every build regenerates the archives under{' '}
          <code className={inlineCode}>haze-ui/design-tokens/</code>:
        </p>
        <ul className={paragraph}>
          <li>
            <code className={inlineCode}>light.json</code> /{' '}
            <code className={inlineCode}>dark.json</code> — the two built-in
            themes, semantic tokens only (the{' '}
            <code className={inlineCode}>primary</code>,{' '}
            <code className={inlineCode}>text</code>,{' '}
            <code className={inlineCode}>bg</code>, status and interaction
            families — not the 12-step primitive scales, which live in{' '}
            <code className={inlineCode}>palette.ts</code>).
          </li>
          <li>
            <code className={inlineCode}>{'{violet,teal,cyan,orange,rose}'}</code>{' '}
            × <code className={inlineCode}>light/dark</code> — ten brand
            archives: the color group rerouted through that brand preset,
            everything else identical to the defaults.
          </li>
        </ul>
        <p className={paragraph}>
          The shape is one <code className={inlineCode}>$value</code> /{' '}
          <code className={inlineCode}>$type</code> node per token, grouped by
          category:
        </p>
        <CodeBlock language='json' className={codeMargin}>
          {`{
  "$schema": "https://tr.designtokens.org/format/",
  "haze": {
    "color": {
      "primary": {
        "$type": "color",
        "$value": "oklch(0.563 0.241 260.8)",
        "$description": "Primary"
      }
    },
    "spacing": {
      "space-2": { "$type": "dimension", "$value": "8px" }
    },
    "radius": {
      "md": { "$type": "dimension", "$value": "6px" }
    },
    "typography": {
      "font-sans": { "$type": "fontFamily", "$value": "-apple-system, …" },
      "weight-bold": { "$type": "number", "$value": "700" }
    },
    "shadow": {
      "lg": { "$type": "shadow", "$value": "0 10px 15px rgba(0, 0, 0, 0.1)" }
    }
  }
}`}
        </CodeBlock>
        <p className={paragraph}>
          Two properties of these files matter for the Figma workflow. First,
          every value is <strong>concrete</strong>: there is no alias graph —
          a token that CSS would derive at runtime (hover from primary, for
          instance) appears as its pre-resolved color string per mode.
          Second, the two modes are <strong>separate, self-contained
          files</strong>: switching light → dark is swapping a whole token
          set, not walking alias branches.
        </p>
      </div>

      <div className={section}>
        <h2>Import into Tokens Studio</h2>
        <p className={paragraph}>
          <a href="https://tokens.studio/">Tokens Studio</a> is the Figma
          plugin that speaks DTF natively:
        </p>
        <ol className={paragraph}>
          <li>
            Install the Tokens Studio plugin in Figma (desktop app), open it,
            and create an empty token document.
          </li>
          <li>
            Use <code className={inlineCode}>Import</code> to load{' '}
            <code className={inlineCode}>light.json</code> — it lands as a
            token set whose paths mirror the JSON groups (
            <code className={inlineCode}>haze.color.primary</code>,{' '}
            <code className={inlineCode}>haze.radius.md</code>, …).
          </li>
          <li>
            Import <code className={inlineCode}>dark.json</code> the same way,
            as its own set.
          </li>
          <li>
            Define a <strong>Theme</strong> composing the sets —{' '}
            <code className={inlineCode}>light</code> as the source of truth,
            <code className={inlineCode}>dark</code> as the alternative — so
            toggling the theme swaps every token at once.
          </li>
        </ol>
        <p className={paragraph}>
          Repeat with a brand archive (
          <code className={inlineCode}>teal-light.json</code> etc.) instead of{' '}
          <code className={inlineCode}>light.json</code> if your product runs
          a brand preset. Current Tokens Studio versions parse the{' '}
          <code className={inlineCode}>oklch()</code> color strings directly;
          if yours rejects them, pre-convert the archives with the{' '}
          <code className={inlineCode}>oklchToHex</code> helper exported from{' '}
          <code className={inlineCode}>haze-ui/tokens</code>.
        </p>
        <div className={note}>
          Style Dictionary consumers can skip Figma entirely: the same JSON is
          a valid Style Dictionary source — point its configuration at{' '}
          <code className={inlineCode}>design-tokens/*.json</code> and
          generate platform output from the identical values.
        </div>
      </div>

      <div className={section}>
        <h2>On to Figma Variables</h2>
        <p className={paragraph}>
          Tokens Studio can push imported tokens into Figma Variables (the
          &ldquo;sync variables&rdquo; flow — a paid Tokens Studio tier as of
          writing; the free tier still applies tokens as the plugin&rsquo;s
          own data while you design). The mapping is mechanical but lossy in
          places:
        </p>
        <div className={tableWrap}>
          <table className={mappingTable}>
            <thead>
              <tr>
                <th>DTF group / $type</th>
                <th>Figma Variable</th>
                <th>Fidelity</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>color</code>
                </td>
                <td>Color variable</td>
                <td>
                  OKLCH is converted to the sRGB space Figma variables live
                  in — values round to the nearest representable color.
                </td>
              </tr>
              <tr>
                <td>
                  <code>spacing</code> / <code>radius</code>{' '}
                  (<code>dimension</code>)
                </td>
                <td>Number variable</td>
                <td>Units drop (<code>8px</code> → 8); re-attach px when
                  binding.</td>
              </tr>
              <tr>
                <td>
                  <code>typography</code> — sizes (<code>dimension</code>),
                  weights/leading (<code>number</code>)
                </td>
                <td>Number variables</td>
                <td>Font sizes, weights and line-heights sync as numbers.</td>
              </tr>
              <tr>
                <td>
                  <code>typography</code> — <code>fontFamily</code>
                </td>
                <td>String variable</td>
                <td>
                  Full stacks arrive as strings; Figma font picking stays
                  manual.
                </td>
              </tr>
              <tr>
                <td>
                  <code>shadow</code>
                </td>
                <td>—</td>
                <td>
                  Figma effects cannot be variables. Shadow tokens stay
                  Tokens Studio tokens, applied via the plugin.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={section}>
        <h2>Limits to know before designing against them</h2>
        <ul className={paragraph}>
          <li>
            <strong>Interaction states are frozen snapshots.</strong> In CSS,{' '}
            <code className={inlineCode}>--haze-color-primary-hover</code> is
            a relative-color formula that re-derives when you override{' '}
            <code className={inlineCode}>--haze-color-primary</code>. In the
            JSON (and therefore Figma) it is a pre-resolved constant: change{' '}
            <code className={inlineCode}>primary</code> in Figma and the
            hover/active/subtle siblings do not follow. Re-export from code
            to refresh them.
          </li>
          <li>
            <strong>OKLCH → sRGB is lossy.</strong> Hues outside the sRGB
            gamut clamp; two token values that differ only outside sRGB can
            collapse to the same Figma color. For exact hand-off comparisons,
            convert with <code className={inlineCode}>oklchToHex</code> from{' '}
            <code className={inlineCode}>haze-ui/tokens</code> and compare in
            code review, not by eyedropping Figma.
          </li>
          <li>
            <strong>Semantic layer only.</strong> The archives carry the
            semantic tokens your components consume — not the gray-1…12 /
            blue-1…12 primitive ramps. Designers who need ramp neighbors for
            charts or illustrations read them from{' '}
            <code className={inlineCode}>src/lib/tokens/palette.ts</code>.
          </li>
          <li>
            <strong>Modes are files, not aliases.</strong> Light and dark are
            independent value sets. Figma-side edits to one mode never
            propagate anywhere — there is no alias graph to walk.
          </li>
          <li>
            <strong>The docs Theme Editor exports a different shape.</strong>{' '}
            The <Link to='/theme-editor'>Theme Editor</Link> can download the
            theme you tuned as DTF JSON too, but its group names differ
            slightly from the shipped archives (
            <code className={inlineCode}>dimension/radius-md</code> vs{' '}
            <code className={inlineCode}>radius/md</code>) — import those
            exports as their own set rather than mixing them into the package
            sets.
          </li>
        </ul>
      </div>

      <div className={section}>
        <h2>The workflow that stays honest</h2>
        <p className={paragraph}>
          Treat Figma as a mirror and code as the source of truth, refreshing
          the mirror on release cadence:
        </p>
        <CodeBlock language='sh' className={codeMargin}>
          {`# regenerate the archives from palette.ts, then re-import in Tokens Studio
npm i haze-ui
cp node_modules/haze-ui/design-tokens/{light,dark}.json ./design/`}
        </CodeBlock>
        <p className={paragraph}>
          Design changes travel the other way as proposals: a Figma variable
          edit becomes a <code className={inlineCode}>palette.ts</code> PR
          (with the contrast suite in{' '}
          <code className={inlineCode}>contrast.test.ts</code> as the gate),
          the build regenerates CSS and JSON together, and the next import
          brings Figma back in sync — one direction of truth, no merge
          conflicts between two token masters.
        </p>
      </div>
    </div>
  );
}
