import type {Route} from '@native-router/react';

import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter} from '@native-router/react';

import contracts from '@/generated/a11y-contracts.json';
import {COMPONENT_GROUPS} from '@/views/Layout/component-groups';

import A11yContracts from './index';

/*
 * /guides/a11y-contracts 契约页：
 * - 按 COMPONENT_GROUPS 分组渲染全部组件行（数据行对账）；
 * - roles/aria/keys 来自生成的 a11y-contracts.json（抽样对账 + 空值 —）；
 * - 组件名链接到 /components/<route>；
 * - 客户端过滤（组件名 / role / aria / key）与空态。
 */

const routes = [
  {
    path: '/guides/a11y-contracts',
    component: () => Promise.resolve({default: () => null}),
  },
  {
    path: '/components/:name',
    component: () => Promise.resolve({default: () => null}),
  },
] as Route[];

function renderPage() {
  return render(
    <MemoryRouter routes={routes} initialEntries={['/guides/a11y-contracts']}>
      <A11yContracts />
    </MemoryRouter>
  );
}

const TOTAL_COMPONENTS = COMPONENT_GROUPS.reduce(
  (sum, group) => sum + group.items.length,
  0
);

describe('A11yContracts guide page', () => {
  it('renders one row per sidebar component, grouped', () => {
    const {container} = renderPage();

    // 每组件一行数据行（tbody；thead 表头行不计入契约面）。
    const dataRows = container.querySelectorAll('tbody tr');
    expect(dataRows).toHaveLength(TOTAL_COMPONENTS);

    // 分组标题按 component-groups 顺序出现。
    for (const group of COMPONENT_GROUPS) {
      expect(
        screen.getByRole('heading', {name: new RegExp(`^${group.group}`)})
      ).toBeInTheDocument();
    }
  });

  it('links every component to its demo route', () => {
    renderPage();

    const dialogLink = screen.getByRole('link', {name: 'Dialog'});
    expect(dialogLink).toHaveAttribute('href', '/components/dialog');
    expect(screen.getByRole('link', {name: 'StreamingText'})).toHaveAttribute(
      'href',
      '/components/streaming-text'
    );
  });

  it('shows extracted contract values and — for uncovered facets', () => {
    renderPage();

    // 抽样：Tree 契约里的 treeitem role、aria-expanded、ArrowRight 键。
    const treeRow = screen.getByRole('link', {name: 'Tree'}).closest('tr');
    expect(treeRow).not.toBeNull();
    expect(treeRow!).toHaveTextContent('treeitem');
    expect(treeRow!).toHaveTextContent('aria-expanded');
    expect(treeRow!).toHaveTextContent('ArrowRight');
    // 空格键展示为 Space 键帽文案。
    expect(treeRow!).toHaveTextContent('Space');

    // Badge 测试不钉 role/aria/keys —— 三列都是 —。
    const badgeRow = screen.getByRole('link', {name: 'Badge'}).closest('tr');
    expect(badgeRow).not.toBeNull();
    expect(badgeRow!.querySelectorAll('td')[1]!).toHaveTextContent('—');
    expect(badgeRow!.querySelectorAll('td')[2]!).toHaveTextContent('—');
    expect(badgeRow!.querySelectorAll('td')[3]!).toHaveTextContent('—');
  });

  it('filters by component, role and key', async () => {
    const user = userEvent.setup();
    const {container} = renderPage();

    const input = screen.getByRole('textbox', {name: 'Filter contracts'});
    const dataRows = () => container.querySelectorAll('tbody tr');

    // 按 role：treeitem 只出现在 Tree / TreeSelect。
    await user.type(input, 'treeitem');
    expect(dataRows()).toHaveLength(2);
    expect(screen.getByRole('link', {name: 'Tree'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'TreeSelect'})).toBeInTheDocument();

    // 按 key：ArrowLeft 命中若干组件，且过滤计数与行数一致。
    await user.clear(input);
    await user.type(input, 'ArrowLeft');
    const leftCount = contracts.components.filter((c) =>
      c.keys.includes('ArrowLeft')
    ).length;
    expect(dataRows()).toHaveLength(leftCount);

    // 按组件名。
    await user.clear(input);
    await user.type(input, 'Switch');
    expect(dataRows()).toHaveLength(1);

    // 清空回到全量。
    await user.clear(input);
    expect(dataRows()).toHaveLength(TOTAL_COMPONENTS);
  });

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup();
    const {container} = renderPage();

    await user.type(
      screen.getByRole('textbox', {name: 'Filter contracts'}),
      'zzzz-nothing'
    );

    expect(container.querySelector('tbody tr')).toBeNull();
    expect(screen.getByText(/no components match/i)).toBeInTheDocument();
  });
});
