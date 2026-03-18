import type {TokenDef} from '@/lib';

import {css} from '@linaria/core';

import {TOKEN_REGISTRY} from '@/lib';

const tableWrap = css`
  width: 100%;
  overflow-x: auto;
`;

const table = css`
  width: 100%;
  border-collapse: collapse;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);

  th,
  td {
    text-align: left;
    padding: var(--haze-space-2) var(--haze-space-3);
    border-bottom: 1px solid var(--haze-color-border);
  }

  th {
    font-weight: var(--haze-weight-semibold);
    color: var(--haze-color-text-secondary);
    font-size: var(--haze-text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    color: var(--haze-color-text);
  }
`;

const varName = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-primary);
`;

const swatchCell = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
`;

const swatch = css`
  width: 16px;
  height: 16px;
  border-radius: var(--haze-radius-sm);
  border: 1px solid var(--haze-color-border);
  flex-shrink: 0;
`;

const valueText = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-secondary);
`;

const registryMap = new Map<string, TokenDef>();
for (const t of TOKEN_REGISTRY) registryMap.set(t.name, t);

type TokensTableProps = {
  tokens: string[];
};

export default function TokensTable({tokens}: TokensTableProps) {
  if (!tokens.length) return null;

  const defs = tokens
    .map((name) => registryMap.get(name))
    .filter((d): d is TokenDef => d != null);

  if (!defs.length) return null;

  return (
    <div className={tableWrap}>
      <table className={table}>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Category</th>
            <th>Light</th>
            <th>Dark</th>
          </tr>
        </thead>
        <tbody>
          {defs.map((d) => (
            <tr key={d.name}>
              <td><code className={varName}>{d.name}</code></td>
              <td>{d.category}</td>
              <td>
                {d.type === 'color' ? (
                  <span className={swatchCell}>
                    <span className={swatch} style={{background: d.light}} />
                    <span className={valueText}>{d.light}</span>
                  </span>
                ) : (
                  <span className={valueText}>{d.light}</span>
                )}
              </td>
              <td>
                {d.type === 'color' ? (
                  <span className={swatchCell}>
                    <span className={swatch} style={{background: d.dark}} />
                    <span className={valueText}>{d.dark}</span>
                  </span>
                ) : (
                  <span className={valueText}>{d.dark}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
