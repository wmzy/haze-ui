import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import VersionSwitcher from './VersionSwitcher';

/*
 * 通道/版本与清单都是构建产物（version-info 读 git、versions.json 读
 * GitHub API），测试里全部 mock 固定，避免环境漂移影响断言（与
 * VersionBadge.test 同一思路，getter 保证每个用例读到当次状态）。
 * 组件在模块顶层就读 versions.json，mock getter 会在测试文件的 const
 * 初始化之前执行，因此可变状态必须放进 vi.hoisted。
 * i18n 的 chrome.version 键由 wave manifest 补进词典，这里直接钉住
 * 标签文案，测试不依赖 manifest 应用时序。
 *
 * 跳转 URL 用 hash 形式：jsdom 只实现 same-document 导航，hash assign
 * 能真实落地，正好断言「选中 → 跳到该条目 url」的接线。
 */
const { channelState, defaultEntries, manifestState } = vi.hoisted(() => {
  type Entry = { version: string; url: string };
  const channelState: { channel: 'stable' | 'dev'; version: string } = {
    channel: 'stable',
    version: 'v9.9.9',
  };
  const defaultEntries: Entry[] = [
    { version: 'v2.0.0', url: '#latest' },
    { version: 'v9.9.9', url: '#v9-9-9' },
    { version: 'v1.8.0', url: '#v1-8-0' },
    { version: 'dev', url: '#dev' },
  ];
  const manifestState: { latest: string; entries: typeof defaultEntries } = {
    latest: 'v2.0.0',
    entries: defaultEntries,
  };
  return { channelState, defaultEntries, manifestState };
});

vi.mock('@/views/version-info', () => ({
  get versionInfo() {
    return {
      version: channelState.version,
      gitTag: channelState.version,
      commit: 'abc1234',
      buildDate: null,
      channel: channelState.channel,
    };
  },
}));

vi.mock('@/generated/versions.json', () => ({
  get default() {
    return manifestState;
  },
}));

vi.mock('@/views/i18n', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/views/i18n')>();
  return {
    ...actual,
    // 渲染期才调用真实 hook（mock 工厂在模块加载期执行，此时调用
    // useContext 会因没有 React dispatcher 而抛错）。
    useSiteLocale: () => {
      const base = actual.useSiteLocale();
      return {
        ...base,
        t: {
          ...base.t,
          chrome: { ...base.t.chrome, version: 'Version' },
        },
      };
    },
  };
});

function renderSwitcher() {
  return render(<VersionSwitcher />);
}

function resetHash() {
  window.history.replaceState(null, '', window.location.pathname);
}

describe('VersionSwitcher (stable channel)', () => {
  beforeEach(() => {
    channelState.channel = 'stable';
    channelState.version = 'v9.9.9';
    manifestState.entries = [...defaultEntries];
    resetHash();
  });

  it('renders a Version-labeled select listing the manifest entries', () => {
    renderSwitcher();
    expect(
      screen.getByRole('combobox', { name: 'Version' })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['v2.0.0', 'v9.9.9', 'v1.8.0', 'dev']);
  });

  it('selects the current stable version', () => {
    renderSwitcher();
    expect(screen.getByRole('combobox')).toHaveValue('v9.9.9');
  });

  it('navigates to the chosen entry url on selection', async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await user.selectOptions(screen.getByRole('combobox'), 'dev');
    expect(window.location.hash).toBe('#dev');
    await user.selectOptions(screen.getByRole('combobox'), 'v1.8.0');
    expect(window.location.hash).toBe('#v1-8-0');
  });

  it('keeps the page when re-selecting the current version', async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await user.selectOptions(screen.getByRole('combobox'), 'v9.9.9');
    expect(window.location.hash).toBe('');
  });

  it('is keyboard reachable', async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await user.tab();
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { container } = renderSwitcher();
    const { axe } = await import('jest-axe');
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});

describe('VersionSwitcher (dev channel)', () => {
  beforeEach(() => {
    channelState.channel = 'dev';
    manifestState.entries = [...defaultEntries];
    resetHash();
  });

  it('selects the dev entry', () => {
    renderSwitcher();
    expect(screen.getByRole('combobox')).toHaveValue('dev');
  });

  it('navigates from dev docs to an archived snapshot', async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await user.selectOptions(screen.getByRole('combobox'), 'v1.8.0');
    expect(window.location.hash).toBe('#v1-8-0');
  });

  it('has no axe violations', async () => {
    const { container } = renderSwitcher();
    const { axe } = await import('jest-axe');
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});

describe('VersionSwitcher (current version missing from manifest)', () => {
  beforeEach(() => {
    channelState.channel = 'stable';
    channelState.version = 'v9.9.9';
    // 旧快照内嵌的清单可能不含「当前版本」（生成时该版本尚未发布）。
    manifestState.entries = [
      { version: 'v2.0.0', url: '#latest' },
      { version: 'dev', url: '#dev' },
    ];
    resetHash();
  });

  it('prepends the current version pointing at the current page', () => {
    renderSwitcher();
    expect(screen.getByRole('combobox')).toHaveValue('v9.9.9');
    expect(
      screen.getByRole('option', { name: 'v9.9.9' })
    ).toBeInTheDocument();
  });

  it('still offers navigation to the listed versions', async () => {
    const user = userEvent.setup();
    renderSwitcher();
    await user.selectOptions(screen.getByRole('combobox'), 'v2.0.0');
    expect(window.location.hash).toBe('#latest');
  });

  it('has no axe violations', async () => {
    const { container } = renderSwitcher();
    const { axe } = await import('jest-axe');
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
