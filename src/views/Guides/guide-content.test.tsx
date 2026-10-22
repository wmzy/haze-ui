import type { GuideBlock, GuideDoc } from '@/views/Guides/guide-content';

import { render, screen } from '@testing-library/react';
import { expect } from 'vitest';
import { MemoryRouter } from '@native-router/react';

import { LOCALE_STORAGE_KEY, SITE_LOCALES, SiteLocaleProvider } from '@/views/i18n';
import { GUIDE_CONTENT, getGuideDoc } from '@/views/Guides/guide-content';
import A11yContracts from '@/views/Guides/A11yContracts';
import A11yGuide from '@/views/Guides/A11y';
import DarkModeGuide from '@/views/Guides/DarkMode';
import DensityGuide from '@/views/Guides/Density';
import MigrationGuide from '@/views/Guides/Migration';
import MotionGuide from '@/views/Guides/Motion';
import ServerActionsGuide from '@/views/Guides/ServerActions';
import StreamingA11yGuide from '@/views/Guides/StreamingA11y';

/*
 * 结构化 guide content 的契约：
 * - zh 与 en 逐 section 对齐（id、块类型序列、代码块原文、表格行数），
 *   翻译漏段在这里失败而不是静默漏渲染；
 * - 未翻译 locale（ja/de/fr）回退 en；
 * - 七篇页面在 en/zh 双 locale 冒烟：zh 出中文标题/段落，en 原文不变，
 *   代码块两种 locale 逐字相同。
 */

const blockShape = (block: GuideBlock): string =>
  block.type === 'table' ? `table:${block.rows.length}` : block.type;

describe('GUIDE_CONTENT structural parity', () => {
  const guideIds = Object.keys(GUIDE_CONTENT) as (keyof typeof GUIDE_CONTENT)[];

  it('every guide ships en and zh with identical section/block shape', () => {
    for (const id of guideIds) {
      const en = GUIDE_CONTENT[id].en;
      const zh = GUIDE_CONTENT[id].zh;
      if (zh === undefined) throw new Error(`${id} is missing its zh doc`);

      expect(zh.title, `${id} zh title is translated`).not.toBe(en.title);

      expect(
        zh.sections.map((s) => s.id),
        `${id} section ids`
      ).toEqual(en.sections.map((s) => s.id));

      en.sections.forEach((enSection, i) => {
        const zhSection = zh.sections[i];
        if (zhSection === undefined) {
          throw new Error(`${id}#${enSection.id} is missing in zh`);
        }
        expect(
          zhSection.heading,
          `${id}#${enSection.id} zh heading`
        ).not.toBe(enSection.heading);
        expect(
          zhSection.blocks.map(blockShape),
          `${id}#${enSection.id} block sequence`
        ).toEqual(enSection.blocks.map(blockShape));
      });
    }
  });

  it('code blocks are byte-identical across locales (code is never translated)', () => {
    const sources = (doc: GuideDoc) =>
      doc.sections.flatMap((s) =>
        s.blocks
          .filter((b) => b.type === 'code')
          .map((b) => b.code)
      );
    for (const id of guideIds) {
      const en = GUIDE_CONTENT[id].en;
      const zh = GUIDE_CONTENT[id].zh;
      if (zh === undefined) throw new Error(`${id} is missing its zh doc`);
      expect(sources(zh), `${id} code sources`).toEqual(sources(en));
    }
  });

  it('falls back to en for untranslated locales', () => {
    for (const locale of ['ja', 'de', 'fr'] as const) {
      expect(getGuideDoc('darkMode', locale).title).toBe('Dark mode');
    }
    expect(getGuideDoc('darkMode', 'zh').title).toBe('深色模式');
    expect(SITE_LOCALES).toContain('zh');
  });
});

/** Render a page under a fixed locale (storage-driven, like the real site). */
function renderAt(element: React.ReactElement, locale: 'en' | 'zh') {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  return render(<SiteLocaleProvider>{element}</SiteLocaleProvider>);
}

describe('guide pages locale smoke', () => {
  afterEach(() => {
    localStorage.clear();
  });

  describe('A11y', () => {
    it('renders the English source verbatim', () => {
      renderAt(<A11yGuide />, 'en');
      expect(screen.getByRole('heading', { level: 1, name: 'Accessibility' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Verification layers' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'What unit tests cannot vouch for' })).toBeInTheDocument();
      expect(screen.getByText(/set of engineering contracts/)).toBeInTheDocument();
    });

    it('renders the Chinese translation under zh', () => {
      renderAt(<A11yGuide />, 'zh');
      expect(screen.getByRole('heading', { level: 1, name: '无障碍' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '验证层级' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '减少动效' })).toBeInTheDocument();
      expect(screen.getByText(/一组工程契约/)).toBeInTheDocument();
      // Measured table data survives translation.
      expect(screen.getByText('Unit (jsdom)')).toBeInTheDocument();
    });
  });

  describe('A11yContracts', () => {
    const renderPage = (locale: 'en' | 'zh') =>
      renderAt(
        <MemoryRouter routes={[{ path: '/' }]} initialEntries={['/']}>
          <A11yContracts />
        </MemoryRouter>,
        locale
      );

    it('renders the English source verbatim', () => {
      renderPage('en');
      expect(screen.getByRole('heading', { level: 1, name: 'Keyboard & ARIA contracts' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Filter contracts' })).toBeInTheDocument();
      // One header column per generated group table.
      expect(screen.getAllByRole('columnheader', { name: 'ARIA attributes' }).length).toBeGreaterThan(0);
    });

    it('renders the Chinese translation under zh', () => {
      renderPage('zh');
      expect(screen.getByRole('heading', { level: 1, name: '键盘与 ARIA 契约' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: '过滤契约' })).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader', { name: 'ARIA 属性' }).length).toBeGreaterThan(0);
      expect(screen.getByText(/真值来源/)).toBeInTheDocument();
    });
  });

  describe('DarkMode', () => {
    it('renders the English source verbatim', () => {
      renderAt(<DarkModeGuide />, 'en');
      expect(screen.getByRole('heading', { level: 1, name: 'Dark mode' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'The theme classes' })).toBeInTheDocument();
      expect(screen.getByText(/Tokens resolve to the light palette/)).toBeInTheDocument();
      expect(screen.getByText(/npx haze-ui-theme/)).toBeInTheDocument();
    });

    it('renders the Chinese translation under zh', () => {
      renderAt(<DarkModeGuide />, 'zh');
      expect(screen.getByRole('heading', { level: 1, name: '深色模式' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '两个主题类' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '与 next-themes 互操作' })).toBeInTheDocument();
      expect(screen.getByText(/内部所有 token 都解析为浅色色板/)).toBeInTheDocument();
      // Code samples stay in English.
      expect(screen.getByText(/npx haze-ui-theme/)).toBeInTheDocument();
    });
  });

  describe('Density', () => {
    it('renders the English source verbatim', () => {
      renderAt(<DensityGuide />, 'en');
      expect(screen.getByRole('heading', { level: 1, name: 'Density (compact)' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'The compact scale' })).toBeInTheDocument();
      expect(screen.getByText(/compact: off/)).toBeInTheDocument();
    });

    it('renders the Chinese translation under zh', () => {
      renderAt(<DensityGuide />, 'zh');
      expect(screen.getByRole('heading', { level: 1, name: '密度（紧凑）' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '紧凑标度' })).toBeInTheDocument();
      expect(screen.getByText(/compact：关/)).toBeInTheDocument();
      // Scale table is data-driven and locale-free.
      expect(screen.getByText('--haze-space-1')).toBeInTheDocument();
    });
  });

  describe('Migration', () => {
    it('renders the English source verbatim', () => {
      renderAt(<MigrationGuide />, 'en');
      expect(screen.getByRole('heading', { level: 1, name: 'Migrating from AntD / shadcn' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Component map' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Select → Select / Combobox — the onChange trap' })).toBeInTheDocument();
      // Component map table renders with its 13 mapped rows.
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('DatePicker / RangePicker')).toBeInTheDocument();
      // Before/after pairs stay page-owned and verbatim.
      expect(screen.getAllByText(/zodResolver/).length).toBeGreaterThan(0);
      expect(screen.getByText(/Migration trap/)).toBeInTheDocument();
    });

    it('renders the Chinese translation under zh', () => {
      renderAt(<MigrationGuide />, 'zh');
      expect(screen.getByRole('heading', { level: 1, name: '从 AntD / shadcn 迁移' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '组件对照表' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /onChange 陷阱/ })).toBeInTheDocument();
      expect(screen.getByText(/最大的心智模型转变/)).toBeInTheDocument();
      // Table headers localize; component names and code stay English.
      expect(screen.getByRole('columnheader', { name: '说明' })).toBeInTheDocument();
      expect(screen.getByText('DatePicker / RangePicker')).toBeInTheDocument();
      expect(screen.getAllByText(/zodResolver/).length).toBeGreaterThan(0);
    });
  });

  describe('Motion', () => {
    it('renders the English source verbatim', () => {
      renderAt(<MotionGuide />, 'en');
      expect(screen.getByRole('heading', { level: 1, name: 'Motion presets' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'The preset gallery' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Reduced motion is built in' })).toBeInTheDocument();
      // Live playground chrome keeps its aria-label.
      expect(screen.getByRole('switch', { name: 'Toggle the animated card' })).toBeInTheDocument();
      // Preset name appears both as a playground button and in the gallery table.
      expect(screen.getAllByText('slideRight').length).toBeGreaterThan(1);
    });

    it('renders the Chinese translation under zh', () => {
      renderAt(<MotionGuide />, 'zh');
      expect(screen.getByRole('heading', { level: 1, name: '动效预设' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '预设一览' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '减少动效是内建的' })).toBeInTheDocument();
      expect(screen.getByText(/退场动画的难点在 React 本身/)).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: '切换动画卡片' })).toBeInTheDocument();
      // Preset names are code identifiers and stay English.
      expect(screen.getAllByText('slideRight').length).toBeGreaterThan(1);
    });
  });

  describe('StreamingA11y', () => {
    it('renders the English source verbatim', () => {
      renderAt(<StreamingA11yGuide />, 'en');
      expect(screen.getByRole('heading', { level: 1, name: 'Screen readers & streaming AI output' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'The haze pattern' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Rolling your own' })).toBeInTheDocument();
      // Demo chrome: replay button, generate button and the idle chat state.
      expect(screen.getByRole('button', { name: 'Replay stream' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Generate reply' })).toBeInTheDocument();
      expect(screen.getByText('waiting…')).toBeInTheDocument();
      expect(screen.getByText(/aria-required-children/)).toBeInTheDocument();
    });

    it('renders the Chinese translation under zh', () => {
      renderAt(<StreamingA11yGuide />, 'zh');
      expect(screen.getByRole('heading', { level: 1, name: '屏幕阅读器与流式 AI 输出' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'haze 的模式' })).toBeInTheDocument();
      expect(screen.getByText(/天真的修法/)).toBeInTheDocument();
      // Demo chrome localizes; code stays verbatim.
      expect(screen.getByRole('button', { name: '重放流' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '生成回复' })).toBeInTheDocument();
      expect(screen.getByText(/aria-required-children/)).toBeInTheDocument();
    });
  });

  describe('ServerActions', () => {
    it('renders the English source verbatim', () => {
      renderAt(<ServerActionsGuide />, 'en');
      expect(screen.getByRole('heading', { level: 1, name: 'React 19 Actions × haze-ui' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Server actions over native FormData' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'useActionState: pending and server errors' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'useOptimistic: optimistic edits with rollback' })).toBeInTheDocument();
      // Demo chrome: the three live demos render with their ui strings.
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save settings' })).toBeInTheDocument();
      expect(screen.getByText('What the server receives')).toBeInTheDocument();
      expect(screen.getByText(/End the address with @taken.dev/)).toBeInTheDocument();
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });

    it('renders the Chinese translation under zh', () => {
      renderAt(<ServerActionsGuide />, 'zh');
      expect(screen.getByRole('heading', { level: 1, name: 'React 19 Actions × haze-ui 实战' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Server action 走原生 FormData' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'useOptimistic：乐观更新与回滚' })).toBeInTheDocument();
      // Demo chrome localizes; component names and code stay English.
      expect(screen.getByRole('button', { name: '提交' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '保存设置' })).toBeInTheDocument();
      expect(screen.getByText('服务端将收到')).toBeInTheDocument();
      expect(screen.getByText(/以 @taken.dev 结尾/)).toBeInTheDocument();
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });
  });
});
