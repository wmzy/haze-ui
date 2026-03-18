import { css } from '@linaria/core';

type PropDef = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

type PropsTableProps = {
  props: PropDef[];
};

const table = css`
  width: 100%;
  border-collapse: collapse;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  margin-bottom: var(--haze-space-6);
`;

const th = css`
  text-align: left;
  padding: var(--haze-space-2) var(--haze-space-3);
  border-bottom: 2px solid var(--haze-color-border);
  color: var(--haze-color-text);
  font-weight: var(--haze-weight-semibold);
`;

const td = css`
  padding: var(--haze-space-2) var(--haze-space-3);
  border-bottom: 1px solid var(--haze-color-border);
  color: var(--haze-color-text-secondary);
  vertical-align: top;
`;

const code = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  background: var(--haze-color-bg-muted);
  padding: 1px var(--haze-space-1);
  border-radius: var(--haze-radius-sm);
  color: var(--haze-color-text);
`;

export default function PropsTable({ props }: PropsTableProps) {
  return (
    <table className={table}>
      <thead>
        <tr>
          <th className={th}>Prop</th>
          <th className={th}>Type</th>
          <th className={th}>Default</th>
          <th className={th}>Description</th>
        </tr>
      </thead>
      <tbody>
        {props.map((p) => (
          <tr key={p.name}>
            <td className={td}>
              <span className={code}>{p.name}</span>
            </td>
            <td className={td}>
              <span className={code}>{p.type}</span>
            </td>
            <td className={td}>
              {p.default ? <span className={code}>{p.default}</span> : '—'}
            </td>
            <td className={td}>{p.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export type { PropDef, PropsTableProps };
