import type {ComponentItem} from '@/views/Layout/component-groups';

import {useMemo, useState} from 'react';
import {css} from '@linaria/core';
import {Link} from '@native-router/react';

import {Input} from '@/lib';
import {COMPONENT_GROUPS} from '@/views/Layout/component-groups';
import {intro, page, section} from '@/views/ComponentDetail/styles';
import rawContracts from '@/generated/a11y-contracts.json';

/*
 * /guides/a11y-contracts — 每组件「键盘 + ARIA 契约」总览。
 *
 * 数据源是 src/generated/a11y-contracts.json（scripts/generate-a11y-contracts.mjs
 * 从每个组件的测试套件同源提取：getByRole/role 字面量 → roles、
 * toHaveAttribute('aria-…') → aria、userEvent 键语法/key 字面量 → keys、
 * it( 计数 → testCount）。契约的真实来源始终是组件测试——本页只是它的
 * 生成视图：测试新增断言，这里自动跟进；某列为空说明该套件尚未钉住
 * 这一面（展示为 —），而不是组件没有该行为。
 */

type A11yContract = {
  component: string;
  roles: string[];
  aria: string[];
  keys: string[];
  testCount: number;
};

type A11yContractsData = {
  generatedAt: string;
  components: A11yContract[];
};

const contractsData = rawContracts;

const CONTRACT_BY_NAME = new Map<string, A11yContract>(
  contractsData.components.map((entry) => [entry.component, entry])
);

const EMPTY_CONTRACT: A11yContract = {
  component: '',
  roles: [],
  aria: [],
  keys: [],
  testCount: 0,
};

const paragraph = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-base);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-relaxed);
  margin: 0 0 var(--haze-space-4);
`;

const filterBar = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-3);
  flex-wrap: wrap;
  margin: 0 0 var(--haze-space-6);
  max-width: 560px;
`;

const filterInput = css`
  flex: 1;
  min-width: 220px;
`;

const countText = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  white-space: nowrap;
`;

const generatedText = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  margin: 0 0 var(--haze-space-6);
`;

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
    vertical-align: top;
    padding: var(--haze-space-2) var(--haze-space-3);
    border-bottom: 1px solid var(--haze-color-border);
  }

  th {
    font-weight: var(--haze-weight-semibold);
    color: var(--haze-color-text-secondary);
    font-size: var(--haze-text-xs);
    text-transform: uppercase;
    white-space: nowrap;
  }
`;

const compLink = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-semibold);
  color: var(--haze-color-text);
  text-decoration: none;

  &:hover {
    color: var(--haze-color-primary);
  }
`;

const chipRow = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--haze-space-1);
  max-width: 460px;
`;

const chip = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-secondary);
  background: var(--haze-color-bg-subtle);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-sm);
  padding: var(--haze-space-0) var(--haze-space-2);
  white-space: nowrap;
`;

const emptyCell = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
`;

const testCountCell = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-secondary);
  white-space: nowrap;
`;

const sectionCount = css`
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text-muted);
  margin-left: var(--haze-space-2);
`;

const noMatch = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-muted);
  padding: var(--haze-space-4) 0;
`;

/* The JSON stores the space key as ' ' (userEvent's bare-space spelling);
 * the table labels it like a keycap. */
const keyLabel = (key: string): string => (key === ' ' ? 'Space' : key);

function contractMatches(contract: A11yContract, name: string, q: string): boolean {
  if (name.toLowerCase().includes(q)) return true;
  const haystack = [...contract.roles, ...contract.aria, ...contract.keys.map(keyLabel)];
  return haystack.some((value) => value.toLowerCase().includes(q));
}

function Chips({values}: {values: string[]}) {
  if (values.length === 0) return <span className={emptyCell}>—</span>;
  return (
    <div className={chipRow}>
      {values.map((value) => (
        <code key={value} className={chip}>
          {keyLabel(value)}
        </code>
      ))}
    </div>
  );
}

export default function A11yContracts() {
  const [filter, setFilter] = useState('');
  const q = filter.trim().toLowerCase();

  const groups = useMemo(
    () =>
      COMPONENT_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (q === '') return true;
          const contract = CONTRACT_BY_NAME.get(item.name) ?? EMPTY_CONTRACT;
          return contractMatches(contract, item.name, q);
        }),
      })),
    [q]
  );

  const matched = groups.reduce((sum, group) => sum + group.items.length, 0);
  const total = COMPONENT_GROUPS.reduce(
    (sum, group) => sum + group.items.length,
    0
  );

  return (
    <div className={page}>
      <h1>Keyboard &amp; ARIA contracts</h1>
      <p className={intro}>
        Every interactive component in Haze UI pins its accessibility
        surface in its own test suite: the roles it renders, the{' '}
        <code>aria-*</code> attributes it asserts, and the keys it
        handles. This page is a generated view of those suites —{' '}
        <code>scripts/generate-a11y-contracts.mjs</code> extracts each
        table row from the component&rsquo;s co-located tests, so the
        contract shown here can never drift from the contract that is
        actually enforced. An empty cell (—) means the suite does not
        pin that facet yet, not that the component lacks it; the tests
        remain the source of truth.
      </p>

      <div className={filterBar} data-slot='filter-bar'>
        <Input
          size='sm'
          className={filterInput}
          placeholder='Filter by component, role, aria attribute or key…'
          aria-label='Filter contracts'
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
        <span className={countText}>
          {matched} / {total} components
        </span>
      </div>
      <p className={generatedText}>
        extracted {contractsData.generatedAt.slice(0, 10)} ·{' '}
        {contractsData.components.reduce((sum, c) => sum + c.testCount, 0)}{' '}
        tests
      </p>

      {matched === 0 && q !== '' ? (
        <p className={noMatch}>
          No components match &ldquo;{filter.trim()}&rdquo;.
        </p>
      ) : (
        groups.map((group) => {
          if (group.items.length === 0) return null;
          return (
            <div key={group.group} className={section}>
              <h2>
                {group.group}
                <span className={sectionCount}>{group.items.length}</span>
              </h2>
              <div className={tableWrap} data-slot='contract-table'>
                <table className={table}>
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Roles</th>
                      <th>ARIA attributes</th>
                      <th>Keys</th>
                      <th>Tests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item: ComponentItem) => {
                      const contract =
                        CONTRACT_BY_NAME.get(item.name) ?? EMPTY_CONTRACT;
                      return (
                        <tr key={item.route}>
                          <td>
                            <Link
                              className={compLink}
                              to={`/components/${item.route}`}
                            >
                              {item.name}
                            </Link>
                          </td>
                          <td>
                            <Chips values={contract.roles} />
                          </td>
                          <td>
                            <Chips values={contract.aria} />
                          </td>
                          <td>
                            <Chips values={contract.keys} />
                          </td>
                          <td className={testCountCell}>
                            {contract.testCount > 0 ? contract.testCount : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
