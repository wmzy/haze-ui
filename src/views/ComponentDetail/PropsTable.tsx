import {css} from '@linaria/core';

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
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
  margin-bottom: var(--pbl-space-6);
`;

const th = css`
  text-align: left;
  padding: var(--pbl-space-2) var(--pbl-space-3);
  border-bottom: 2px solid var(--pbl-color-border);
  color: var(--pbl-color-text);
  font-weight: var(--pbl-weight-semibold);
`;

const td = css`
  padding: var(--pbl-space-2) var(--pbl-space-3);
  border-bottom: 1px solid var(--pbl-color-border);
  color: var(--pbl-color-text-secondary);
  vertical-align: top;
`;

const code = css`
  font-family: var(--pbl-font-mono);
  font-size: var(--pbl-text-xs);
  background: var(--pbl-color-bg-muted);
  padding: 1px var(--pbl-space-1);
  border-radius: var(--pbl-radius-sm);
  color: var(--pbl-color-text);
`;

export default function PropsTable({props}: PropsTableProps) {
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
            <td className={td}><span className={code}>{p.name}</span></td>
            <td className={td}><span className={code}>{p.type}</span></td>
            <td className={td}>{p.default ? <span className={code}>{p.default}</span> : '—'}</td>
            <td className={td}>{p.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export type {PropDef, PropsTableProps};
