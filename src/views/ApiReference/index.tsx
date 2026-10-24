/*
 * /api/:componentId — 单组件 API 参考页（对标 antd/MUI 的 /api/<component>：
 * 深链 + SEO，搜索索引与组件 demo 页头都链接到这里）。
 *
 * 页面不复制任何数据，四个数据源全部现成：
 * - src/generated/props.json × props-docs.json —— 经 PropsTable 的 `of=`
 *   合并渲染（生成行 + 手写描述/默认值 + ghost 行），每个导出类型一张表；
 * - COMPONENT_TOKENS（lib tokens registry）—— TokensTable 复用；
 * - src/generated/a11y-contracts.json —— roles/aria/keys/testCount 契约面；
 * - COMPONENT_GROUPS —— 路由 ↔ 展示名换算；i18n `components` 一句话简介
 *   （五语言已有键，零新增）。
 *
 * demos map 外的导出（hooks 等）没有路由，天然不进本页；map 内但无
 * props.json 条目的四个路由（form/popconfirm/trace/pull-to-refresh）照常
 * 出页，缺省小节以一句说明交代。
 */

import { Link, useMatched } from '@native-router/react';

import { css } from '@linaria/core';

import { COMPONENT_TOKENS, useTitle } from '@/lib';

import generatedProps from '@/generated/props.json';
import rawContracts from '@/generated/a11y-contracts.json';

import PropsTable from '@/views/ComponentDetail/PropsTable';
import TokensTable from '@/views/ComponentDetail/TokensTable';
import { suggestComponents } from '@/views/ComponentDetail/legacy-routes';
import { codeBlock, intro, page, section } from '@/views/ComponentDetail/styles';
import { COMPONENT_GROUPS } from '@/views/Layout/component-groups';
import { fill, useSiteLocale } from '@/views/i18n';

type A11yContract = {
  component: string;
  roles: string[];
  aria: string[];
  keys: string[];
  testCount: number;
};

/* route → 侧边栏条目（展示名）。与 demos map 同源同集（160 项）。 */
const ITEM_BY_ROUTE = new Map(
  COMPONENT_GROUPS.flatMap((group) =>
    group.items.map((item) => [item.route, item] as const)
  )
);

/* route → 生成的 props 索引条目（156 项；form 等 4 路由无条目）。 */
const ENTRY_BY_ROUTE = new Map(
  Object.values(generatedProps.components).map((entry) => [
    entry.routeKey,
    entry,
  ])
);

/* 展示名 → a11y 契约（generate-a11y-contracts.mjs 从同址测试提取）。 */
const CONTRACT_BY_NAME = new Map<string, A11yContract>(
  (rawContracts as { components: A11yContract[] }).components.map((entry) => [
    entry.component,
    entry,
  ])
);

/* COMPONENT_TOKENS 的键是无分隔小写（confirmdialog）——与 Tokens 页同款换算。 */
const flatName = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]/g, '');

/* JSON 把空格键存为 ' '（userEvent 的裸空格写法）；展示为键帽文案。 */
const keyLabel = (key: string): string => (key === ' ' ? 'Space' : key);

const backLink = css`
  display: inline-block;
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-primary);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const typeHeading = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-semibold);
  color: var(--haze-color-text);
  margin: var(--haze-space-4) 0 var(--haze-space-2);
`;

const mutedNote = css`
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-muted);
  margin: 0;
`;

const contractList = css`
  margin: 0 0 var(--haze-space-3);
`;

const contractRow = css`
  display: flex;
  align-items: baseline;
  gap: var(--haze-space-3);
  padding: var(--haze-space-2) 0;
  border-bottom: 1px solid var(--haze-color-border);

  &:last-child {
    border-bottom: none;
  }
`;

const contractTerm = css`
  flex: none;
  width: 88px;
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--haze-color-text-secondary);
`;

const contractValue = css`
  margin: 0;
  min-width: 0;
`;

const chipRow = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--haze-space-1);
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

const emptyValue = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
`;

const contractNote = css`
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
  margin: 0;

  a {
    color: var(--haze-color-primary);
  }
`;

const notFound = css`
  h1 {
    margin-bottom: var(--haze-space-2);
  }
`;

const suggestionList = css`
  margin: 0 0 var(--haze-space-4);
  padding: 0;
  list-style: none;
`;

const suggestionItem = css`
  & + & {
    margin-top: var(--haze-space-1);
  }
`;

const suggestionLink = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-primary);

  &:hover {
    text-decoration: underline;
  }
`;

/** 404 兜底：与 ComponentDetail 的 NotFound 同构，建议链接指向 API 页。 */
function ApiNotFound({ name }: { name: string }) {
  const { t } = useSiteLocale();
  const suggestions = suggestComponents(name);
  return (
    <div className={page}>
      <section className={notFound}>
        <h1>{fill(t.componentDetail.notFoundTitle, { name })}</h1>
        <p className={mutedNote}>
          {suggestions.length > 0
            ? t.componentDetail.notFoundHintSuggestions
            : t.componentDetail.notFoundHintPlain}
        </p>
        {suggestions.length > 0 && (
          <ul className={suggestionList}>
            {suggestions.map((s) => (
              <li key={s.route} className={suggestionItem}>
                <Link className={suggestionLink} to={`/api/${s.route}`}>
                  {s.name} API
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link to='/components'>{t.componentDetail.backToAllComponents}</Link>
      </section>
    </div>
  );
}

function ContractRow({ label, values }: { label: string; values: string[] }) {
  return (
    <div className={contractRow}>
      <dt className={contractTerm}>{label}</dt>
      <dd className={contractValue}>
        {values.length === 0 ? (
          <span className={emptyValue}>—</span>
        ) : (
          <div className={chipRow}>
            {values.map((value) => (
              <code key={value} className={chip}>
                {value}
              </code>
            ))}
          </div>
        )}
      </dd>
    </div>
  );
}

export default function ApiReference() {
  const { params } = useMatched();
  const { t } = useSiteLocale();
  const componentId = params.componentId ?? '';
  const item = ITEM_BY_ROUTE.get(componentId);
  const entry = item ? ENTRY_BY_ROUTE.get(componentId) : undefined;
  const contract = item ? CONTRACT_BY_NAME.get(item.name) : undefined;
  const tokens = item ? COMPONENT_TOKENS[flatName(item.name)] : undefined;

  useTitle(item ? `${item.name} API — Haze UI` : 'API — Haze UI');

  if (!item) return <ApiNotFound name={componentId} />;

  const blurb = t.components[item.name];
  /* propsTypes（主组件在前）之后 otherTypes —— 每个导出类型一张表，
   * 表内行由 PropsTable 从 props.json × props-docs.json 合并。 */
  const typeNames = entry
    ? [...Object.keys(entry.propsTypes), ...Object.keys(entry.otherTypes)]
    : [];

  return (
    <div className={page}>
      <Link className={backLink} to={`/components/${item.route}`}>
        ← {item.name} demo
      </Link>
      <h1>{item.name} API</h1>
      {blurb !== undefined && blurb !== '' && (
        <p className={intro}>{blurb}</p>
      )}

      {entry && (
        <div className={section}>
          <h2>Import</h2>
          <pre className={codeBlock}>
            {[
              `import { ${entry.imports.join(', ')} } from 'haze-ui';`,
              `import 'haze-ui/css/tokens.css';`,
              `import 'haze-ui/css/${entry.cssFamily}.css';`,
            ].join('\n')}
          </pre>
        </div>
      )}

      <div className={section}>
        <h2>Props</h2>
        {typeNames.length > 0 ? (
          typeNames.map((typeName) => (
            <div key={typeName}>
              <h3 className={typeHeading}>{typeName}</h3>
              <PropsTable of={typeName} />
            </div>
          ))
        ) : (
          <p className={mutedNote}>
            {item.name} has no entry in the generated props index — see its
            demo page for the API tables.
          </p>
        )}
      </div>

      {tokens !== undefined && tokens.length > 0 && (
        <div className={section}>
          <h2>CSS Variables</h2>
          <TokensTable tokens={tokens} />
        </div>
      )}

      {contract && (
        <div className={section}>
          <h2>Accessibility</h2>
          <dl className={contractList}>
            <ContractRow label='Roles' values={contract.roles} />
            <ContractRow label='ARIA' values={contract.aria} />
            <ContractRow
              label='Keyboard'
              values={contract.keys.map(keyLabel)}
            />
          </dl>
          <p className={contractNote}>
            Enforced by {contract.testCount} tests in {item.name}
            &rsquo;s co-located suite —{' '}
            <Link to='/guides/a11y-contracts'>the contracts page</Link> lists
            every component.
          </p>
        </div>
      )}
    </div>
  );
}
