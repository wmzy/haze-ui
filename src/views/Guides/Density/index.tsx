import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

import {
  Button,
  Flex,
  Input,
  List,
  ListItem,
  Option,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  spacing,
} from '@/lib';
import { COMPACT_OVERRIDES, compact } from '@/lib/tokens/density';
import { SPACING_DEFAULTS } from '@/lib/tokens/spacing';
import { page } from '@/views/ComponentDetail/styles';
import { GuideDocView, useGuideDoc } from '@/views/Guides/guide-content';

/*
 * Density guide. Prose and code samples live in ./guide-content (en
 * source + zh translation). The scale table and the live default-vs-
 * compact comparison stay here (data-driven / stateful) and arrive via
 * slots; demo fixtures (buttons, options, ship rows) stay English like
 * every other demo on the site.
 */

const islandRow = css`
  display: flex;
  gap: var(--haze-space-4);
  flex-wrap: wrap;
  align-items: flex-start;
  margin: var(--haze-space-4) 0 var(--haze-space-2);
`;

const island = css`
  flex: 1;
  min-width: 240px;
  max-width: 360px;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-3);
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
`;

const islandTitle = css`
  font-weight: var(--haze-weight-semibold);
  font-size: var(--haze-text-sm);
`;

const islandSample = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-2);
`;

const demoStatus = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-2);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
  font-family: var(--haze-font-mono);
  margin: 0 0 var(--haze-space-3);
`;

const tableWrap = css`
  overflow-x: auto;
  margin: var(--haze-space-2) 0 var(--haze-space-4);
`;

const scaleTable = css`
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

const px = (value: string): number => Number.parseFloat(value);

// Scale table rows come straight from the shipped constants, so the guide
// can never drift from what the classes actually declare.
const SCALE_ROWS = Object.entries(SPACING_DEFAULTS)
  .map(([token, value]) => ({
    token,
    value,
    compact: COMPACT_OVERRIDES[
      token.replace('--haze-space-', '--haze-density-space-') as keyof typeof COMPACT_OVERRIDES
    ],
  }))
  .sort((a, b) => px(a.value) - px(b.value));

const SHIP_ROWS = [
  { name: 'Alice', role: 'Engineer', status: 'Active' },
  { name: 'Bob', role: 'Designer', status: 'Away' },
];

/** The sample set both density islands render — only the container differs. */
function DensitySamples() {
  return (
    <div className={islandSample}>
      <Flex gap='var(--haze-space-2)' wrap>
        <Button size='sm'>Small</Button>
        <Button size='md'>Medium</Button>
        <Button size='sm' variant='outline'>
          Outline
        </Button>
      </Flex>
      <Input size='sm' placeholder='Input' aria-label='Density sample input' />
      <Select size='sm' aria-label='Density sample select'>
        <Option value='a'>Option A</Option>
        <Option value='b'>Option B</Option>
      </Select>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell as='th'>Name</TableCell>
            <TableCell as='th'>Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {SHIP_ROWS.map((row) => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <List variant='unordered'>
        <ListItem>First item</ListItem>
        <ListItem>Second item</ListItem>
      </List>
    </div>
  );
}

/**
 * Live default-vs-compact comparison. The right island re-declares the
 * spacing class next to compact — custom properties substitute eagerly at
 * the element that declares them, so a compact island inside a page that
 * already carries spacing must re-declare the scale locally.
 */
function DensityCompareDemo({
  statusOn,
  statusOff,
  defaultTitle,
  compactTitle,
  switchLabel,
}: {
  statusOn: string;
  statusOff: string;
  defaultTitle: string;
  compactTitle: string;
  switchLabel: string;
}) {
  // Control triple: the Switch takes the control, nothing else writes it.
  const [compactOn, , compactCtrl] = useControl(undefined, false);

  return (
    <div>
      <div className={demoStatus}>
        <Switch checked={compactCtrl} aria-label={switchLabel} />
        {compactOn ? statusOn : statusOff}
      </div>
      <div className={islandRow}>
        <div className={island}>
          <span className={islandTitle}>{defaultTitle}</span>
          <DensitySamples />
        </div>
        <div x-class={[island, spacing, compactOn && compact]}>
          <span className={islandTitle}>{compactTitle}</span>
          <DensitySamples />
        </div>
      </div>
    </div>
  );
}

export default function DensityGuide() {
  const doc = useGuideDoc('density');

  const {
    scaleHeaderToken = '',
    scaleHeaderDefault = '',
    scaleHeaderCompact = '',
    compareStatusOn = '',
    compareStatusOff = '',
    compareDefaultTitle = '',
    compareCompactTitle = '',
    compareSwitchLabel = '',
  } = doc.ui ?? {};

  return (
    <div className={page}>
      <h1>{doc.title}</h1>
      <GuideDocView
        doc={doc}
        slots={{
          'scale-table': (
            <div className={tableWrap}>
              <table className={scaleTable}>
                <thead>
                  <tr>
                    <th>{scaleHeaderToken}</th>
                    <th>{scaleHeaderDefault}</th>
                    <th>{scaleHeaderCompact}</th>
                  </tr>
                </thead>
                <tbody>
                  {SCALE_ROWS.map((row) => (
                    <tr key={row.token}>
                      <td>
                        <code>{row.token}</code>
                      </td>
                      <td>
                        <code>{row.value}</code>
                      </td>
                      <td>
                        <code>{row.compact}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ),
          'density-compare': (
            <DensityCompareDemo
              statusOn={compareStatusOn}
              statusOff={compareStatusOff}
              defaultTitle={compareDefaultTitle}
              compactTitle={compareCompactTitle}
              switchLabel={compareSwitchLabel}
            />
          ),
        }}
      />
    </div>
  );
}
