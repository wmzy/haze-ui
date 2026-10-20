import type {ComponentItem} from '@/views/Layout/component-groups';

import {useMemo, useState} from 'react';
import {css} from '@linaria/core';
import {Link} from '@native-router/react';

import {Input} from '@/lib';
import {COMPONENT_GROUPS} from '@/views/Layout/component-groups';
import {page, section} from '@/views/ComponentDetail/styles';
import {GuideDocView, useGuideDoc} from '@/views/Guides/guide-content';
import rawContracts from '@/generated/a11y-contracts.json';
import {fill, useSiteLocale} from '@/views/i18n';

/*
 * /guides/a11y-contracts — 每组件「键盘 + ARIA 契约」总览。
 *
 * 数据源是 src/generated/a11y-contracts.json（scripts/generate-a11y-contracts.mjs
 * 从每个组件的测试套件同源提取：getByRole/role 字面量 → roles、
 * toHaveAttribute('aria-…') → aria、userEvent 键语法/key 字面量 → keys、
 * it( 计数 → testCount）。契约的真实来源始终是组件测试——本页只是它的
 * 生成视图：测试新增断言，这里自动跟进；某列为空说明该套件尚未钉住
 * 这一面（展示为 —），而不是组件没有该行为。
 *
 * 文案（标题/导语/表头/过滤 chrome）来自 ./guide-content 的结构化
 * content（en/zh）；分组标题走 locale 字典的 componentGroups。
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

const contractsData: A11yContractsData = rawContracts;

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

/* Localized group title: locale overrides sit in the dictionary keyed by
 * the canonical English group name; unknown groups fall back to it. */
function groupLabel(groups: Record<string, string>, name: string): string {
  return groups[name] ?? name;
}

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
  const {t} = useSiteLocale();
  const doc = useGuideDoc('a11yContracts');

  const {
    filterPlaceholder,
    filterLabel,
    countTemplate = '',
    extractedTemplate = '',
    noMatchTemplate = '',
    headerComponent,
    headerRoles,
    headerAria,
    headerKeys,
    headerTests,
  } = doc.ui ?? {};

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
      <h1>{doc.title}</h1>
      <GuideDocView doc={doc} />

      <div className={filterBar} data-slot='filter-bar'>
        <Input
          size='sm'
          className={filterInput}
          placeholder={filterPlaceholder}
          aria-label={filterLabel}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
        <span className={countText}>
          {fill(countTemplate, {matched, total})}
        </span>
      </div>
      <p className={generatedText}>
        {fill(extractedTemplate, {
          date: contractsData.generatedAt.slice(0, 10),
          tests: contractsData.components.reduce((sum, c) => sum + c.testCount, 0),
        })}
      </p>

      {matched === 0 && q !== '' ? (
        <p className={noMatch}>
          {fill(noMatchTemplate, {query: filter.trim()})}
        </p>
      ) : (
        groups.map((group) => {
          if (group.items.length === 0) return null;
          return (
            <div key={group.group} className={section}>
              <h2>
                {groupLabel(t.componentGroups, group.group)}
                <span className={sectionCount}>{group.items.length}</span>
              </h2>
              <div className={tableWrap} data-slot='contract-table'>
                <table className={table}>
                  <thead>
                    <tr>
                      <th>{headerComponent}</th>
                      <th>{headerRoles}</th>
                      <th>{headerAria}</th>
                      <th>{headerKeys}</th>
                      <th>{headerTests}</th>
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
