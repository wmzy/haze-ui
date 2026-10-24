import type { Route } from '@native-router/react';

import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, View } from '@native-router/react';

import ApiReference from './index';

/*
 * /api/:componentId 生成页：
 * - 直接消费已入库的 props.json / props-docs.json（经 PropsTable）/
 *   a11y-contracts.json / COMPONENT_TOKENS，抽真实组件对账关键行；
 * - 无 props 索引的路由（form 等 4 个）降级渲染说明而非空页；
 * - 非法 componentId 走 404 兜底；
 * - document.title 经 useTitle 跟随组件名。
 */

function renderPage(componentId: string) {
  const routes = [
    {
      path: '/api/:componentId',
      component: () => Promise.resolve({ default: ApiReference }),
    },
    {
      path: '/components/:name',
      component: () => Promise.resolve({ default: () => null }),
    },
    {
      path: '/guides/a11y-contracts',
      component: () => Promise.resolve({ default: () => null }),
    },
  ] as Route[];
  return render(
    <MemoryRouter routes={routes} initialEntries={[`/api/${componentId}`]}>
      <View />
    </MemoryRouter>
  );
}

describe('ApiReference page', () => {
  it('renders the Button reference from the checked-in generated data', async () => {
    renderPage('button');

    // 页头：标题 + 回 demo 深链。
    expect(
      await screen.findByRole('heading', { name: 'Button API', level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Button demo/ })).toHaveAttribute(
      'href',
      '/components/button'
    );

    // Import 块来自 props.json 的 imports/cssFamily。
    expect(screen.getByText(/buttonSizes/)).toBeInTheDocument();
    expect(screen.getByText(/haze-ui\/css\/button\.css/)).toBeInTheDocument();

    // 每个导出类型一张 props 表：ButtonProps 的 variant 行带着
    // props-docs.json 的默认值。
    expect(
      screen.getByRole('heading', { name: 'ButtonProps', level: 3 })
    ).toBeInTheDocument();
    expect(screen.getAllByText('variant').length).toBeGreaterThan(0);
    expect(screen.getAllByText("'solid'").length).toBeGreaterThan(0);

    // tokens 表来自 COMPONENT_TOKENS 的 button 家族（TokensTable 只渲染
    // TOKEN_REGISTRY 里登记的令牌——抽 button 家族的语义色）。
    expect(screen.getAllByText('--haze-color-primary').length).toBeGreaterThan(
      0
    );

    // document.title 跟随组件名。
    expect(document.title).toBe('Button API — Haze UI');
  });

  it('renders the a11y contract chips and test count', async () => {
    renderPage('button');

    const a11ySection = (
      await screen.findByRole('heading', { name: 'Accessibility' })
    ).closest('div');
    expect(a11ySection).not.toBeNull();
    const scope = within(a11ySection!);

    // roles / aria 抽样 + 契约页深链 + testCount（Button=30）。
    expect(scope.getByText('button')).toBeInTheDocument();
    expect(scope.getByText('link')).toBeInTheDocument();
    expect(scope.getByText('aria-busy')).toBeInTheDocument();
    expect(scope.getByText(/Enforced by 30 tests/)).toBeInTheDocument();
    expect(
      scope.getByRole('link', { name: /contracts page/ })
    ).toHaveAttribute('href', '/guides/a11y-contracts');
  });

  it('degrades gracefully for a route without a props index entry', async () => {
    renderPage('form');

    expect(
      await screen.findByRole('heading', { name: 'Form API', level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no entry in the generated props index/)
    ).toBeInTheDocument();
    // 无 props/tokens 数据 → 不渲染任何表。
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Form demo/ })).toHaveAttribute(
      'href',
      '/components/form'
    );
    expect(document.title).toBe('Form API — Haze UI');
  });

  it('labels the space key as Space like the contracts page', async () => {
    renderPage('tree');

    // Tree 契约的键含 ' '（userEvent 裸空格）与 ArrowRight。
    await screen.findByRole('heading', { name: 'Tree API', level: 1 });
    expect(screen.getAllByText('Space').length).toBeGreaterThan(0);
    expect(screen.getAllByText('ArrowRight').length).toBeGreaterThan(0);
  });

  it('falls back to 404 for an unknown componentId', async () => {
    renderPage('does-not-exist');

    expect(
      await screen.findByRole('heading', {
        name: 'Component not found: does-not-exist',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No component lives at this URL/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Back to all components' })
    ).toHaveAttribute('href', '/components');
    // 兜底页不出 props 表。
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
