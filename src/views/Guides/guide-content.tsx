/* eslint-disable react-refresh/only-export-components */
/*
 * Structured, localizable content for the guide pages.
 *
 * Guide bodies live here — NOT in the i18n packs (src/views/i18n/*.ts): a
 * full guide is dozens of RichText paragraphs, tables and code blocks, and
 * duplicating that across five locale packs would balloon them for zero
 * benefit. Instead each guide carries an `en` doc (the source of truth,
 * previously hand-written JSX in the page) plus translated docs keyed by
 * locale; `getGuideDoc` resolves the active locale and falls back to `en`
 * for locales that have not been translated yet (ja/de/fr today). Only
 * nav-level guide strings (labels shown in the sidebar) live in the packs.
 *
 * Content model (per guide):
 *   GuideDoc { title, intro, sections[], ui? }
 *   - title  — the page <h1> (en must stay byte-identical to the former
 *     hand-written JSX so existing tests and snapshots do not drift);
 *   - intro  — the lead paragraph under the h1 (RichText);
 *   - sections — ordered <h2> blocks; each block is one of:
 *       p / note / list / code / caption / table / h3 / slot;
 *   - ui — short page-chrome strings (placeholders, aria-labels, table
 *     headers, `{token}` templates expanded via fill()) handed to the
 *     page\'s own interactive chrome and demo components.
 *   `code` blocks keep the原文 verbatim — code and commands are never
 *   translated. `slot` blocks render a page-owned ReactNode (live demos,
 *   data-driven tables) so interactive JSX stays in the page component
 *   while all prose stays here.
 *
 * D1 接入指南（剩余一篇 FigmaTokens）：
 *   1. 把该页 index.tsx 的正文按上述模型誊入本文件：en 值 = 现有英文原文
 *      逐段对齐（含 <code>/<strong>/<em>/<a> 内联运行 → RichSeg；代码块
 *      → code block，模板字面量转义原样照搬）；zh 值 = 翻译（API 名、
 *      类名、token、代码引用保留英文）。
 *   2. 页面里的交互演示/数据表保留在 index.tsx，在对应位置放
 *      { type: 'slot', name: '…' }，渲染时经 <GuideDocView slots={{…}}> 注入；
 *      演示需要的短文案（标题、占位符、caption 以外的状态行）走 doc.ui，
 *      富文本 caption（含内联 code）用 caption block。
 *   3. index.tsx 收敛为：
 *        const doc = useGuideDoc('<id>');
 *        return (
 *          <div className={page}>
 *            <h1>{doc.title}</h1>
 *            <GuideDocView doc={doc} slots={{…}} />
 *          </div>
 *        );
 *      并删除页面里与 guide-content 重复的 paragraph/inlineCode/note/
 *      codeMargin/tableWrap 等样式（保留演示专属样式）。
 *   4. 在 guide-content.test.tsx 的 zh 冒烟用例里补一行断言（中文标题/
 *      段落出现），en 断言原文仍在。
 */

import type { ReactNode } from 'react';
import type { RichText } from '@/views/i18n/en';
import type { SiteLocale } from '@/views/i18n';

import { Fragment } from 'react';
import { css } from '@linaria/core';

import { CodeBlock } from '@/lib';
import { intro, section } from '@/views/ComponentDetail/styles';
import { Rich, useSiteLocale } from '@/views/i18n';

/** Guides whose bodies are migrated into this structure. */
export type GuideId =
  | 'a11y'
  | 'a11yContracts'
  | 'darkMode'
  | 'density'
  | 'migration'
  | 'motion'
  | 'serverActions'
  | 'streamingA11y';

/** One block of a guide section body. */
export type GuideBlock =
  | { type: 'p'; text: RichText }
  | { type: 'note'; text: RichText }
  | { type: 'list'; items: readonly RichText[] }
  | { type: 'code'; language: string; code: string }
  | { type: 'caption'; text: RichText }
  | { type: 'table'; headers: readonly RichText[]; rows: readonly (readonly RichText[])[] }
  | { type: 'h3'; text: string }
  | { type: 'slot'; name: string };

/** A localized <h2> section: heading plus ordered body blocks. */
export type GuideSection = {
  id: string;
  heading: string;
  blocks: readonly GuideBlock[];
};

/**
 * A full localized guide body. `ui` holds short chrome strings for the
 * page\'s own interactive pieces (placeholders, aria-labels, table
 * headers, `{token}` templates) — RichText content belongs in blocks.
 */
export type GuideDoc = {
  title: string;
  intro: RichText;
  sections: readonly GuideSection[];
  ui?: Record<string, string>;
};

/** en is mandatory; any other locale may be added incrementally. */
export type GuideLocaleDocs = { en: GuideDoc } & Partial<
  Record<Exclude<SiteLocale, 'en'>, GuideDoc>
>;

/** Page-owned interactive pieces, injected where a `slot` block sits. */
export type GuideSlots = Record<string, ReactNode>;

/* ---------------------------------------------------------------------------
 * Shared guide styles — previously duplicated per page, byte-identical.
 * ------------------------------------------------------------------------- */

const gParagraph = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-base);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-relaxed);
  margin: 0 0 var(--haze-space-4);
`;

const gInlineCode = css`
  background: var(--haze-color-bg-muted);
  border-radius: var(--haze-radius-sm);
  padding: 0.15em 0.4em;
  font-family: var(--haze-font-mono);
  font-size: 0.9em;
`;

const gCodeMargin = css`
  margin: var(--haze-space-2) 0 var(--haze-space-4);
`;

const gNote = css`
  background: var(--haze-color-primary-subtle);
  border-left: 3px solid var(--haze-color-primary);
  border-radius: 0 var(--haze-radius-md) var(--haze-radius-md) 0;
  padding: var(--haze-space-3) var(--haze-space-4);
  margin: var(--haze-space-4) 0;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-normal);
`;

const gCaption = css`
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-muted);
  margin: 0 0 var(--haze-space-6);
`;

const gList = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-base);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-relaxed);
  margin: 0 0 var(--haze-space-4);
`;

const gTableWrap = css`
  overflow-x: auto;
  margin: var(--haze-space-2) 0 var(--haze-space-4);
`;

const gTable = css`
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

/* ---------------------------------------------------------------------------
 * Data-authoring helpers (keep GUIDE_CONTENT compact and reviewable).
 * ------------------------------------------------------------------------- */

const code = (text: string) => ({ code: text });
const strong = (text: string) => ({ strong: text });
const em = (text: string) => ({ em: text });
const link = (text: string, href: string) => ({ link: text, href });

/* A bare string is a one-segment RichText — normalize so table data can
 * stay readable ('Layer' instead of ['Layer']). */
const asRich = (value: string | RichText): RichText =>
  typeof value === 'string' ? [value] : value;

const p = (text: RichText): GuideBlock => ({ type: 'p', text });
const note = (text: RichText): GuideBlock => ({ type: 'note', text });
const list = (...items: readonly RichText[]): GuideBlock => ({
  type: 'list',
  items,
});
const codeBlock = (language: string, source: string): GuideBlock => ({
  type: 'code',
  language,
  code: source,
});
const caption = (text: RichText): GuideBlock => ({ type: 'caption', text });
const table = (
  headers: readonly (string | RichText)[],
  rows: readonly (readonly (string | RichText)[])[]
): GuideBlock => ({
  type: 'table',
  headers: headers.map(asRich),
  rows: rows.map((row) => row.map(asRich)),
});
const h3 = (text: string): GuideBlock => ({ type: 'h3', text });
const slot = (name: string): GuideBlock => ({ type: 'slot', name });
const sec = (
  id: string,
  heading: string,
  ...blocks: readonly GuideBlock[]
): GuideSection => ({ id, heading, blocks });

/* ---------------------------------------------------------------------------
 * A11y guide — every number below is measured from the repo (2026-09
 * snapshot); re-run these before editing the constants:
 *   AXE_COMPONENT_FILES  grep -rl "axe(" src/lib/components --include='*.test.tsx' | wc -l
 *   (all component test  find src/lib/components -name '*.test.tsx' | wc -l
 *    files have scans)
 *   AXE_LIB_FILES        grep -rl "axe(" src/lib --include='*.test.tsx' | wc -l
 *   E2E_SPEC_FILES       ls e2e/*.spec.ts | wc -l
 *   E2E_CHROMIUM_TESTS   sum of test() per spec + the 29-iteration static
 *                        snapshots loop (16 source tests → 44 executed)
 *   ENGINE_SENSITIVE     e2e/playwright.config.ts firefox/webkit testMatch
 *   VISUAL_BASELINES     find e2e/__snapshots__ -name '*.png' | wc -l
 *   FOCUS_RING_FILES     grep -rl focus-ring src/lib/components --include='*.tsx'
 *                        | grep -v test | wc -l
 *   REDUCED_MOTION_TESTS grep -c '^\s*test(' e2e/reduced-motion.spec.ts
 * The APG pattern names follow https://www.w3.org/WAI/ARIA/apg/patterns/.
 * ------------------------------------------------------------------------- */

const AXE_COMPONENT_FILES = 122;
const AXE_LIB_FILES = 127;
const E2E_SPEC_FILES = 12;
const E2E_CHROMIUM_TESTS = 101;
const ENGINE_SENSITIVE_SPECS = 6;
const VISUAL_BASELINES = 45;
const FOCUS_RING_FILES = 53;
const REDUCED_MOTION_TESTS = 13;

const a11yEn: GuideDoc = {
  title: 'Accessibility',
  intro: [
    'Accessibility in haze-ui is a set of engineering contracts, not a checklist: every interactive component ships an axe scan in its unit tests, keyboard behavior runs against real browser engines, focus is trapped and restored by shared primitives, and all motion collapses to zero when the user opts out. This page states what the library guarantees and where each guarantee is enforced — every number below is measured from this repository.',
  ],
  sections: [
    sec(
      'verification-layers',
      'Verification layers',
      p([
        'Four layers, each covering what the previous one cannot. The unit layer vouches for ARIA markup and interaction logic; the e2e layers vouch for behavior on real engines.',
      ]),
      table(
        ['Layer', 'Tooling', 'Scope and contract'],
        [
          [
            'Unit (jsdom)',
            [code('jest-axe')],
            `All ${AXE_COMPONENT_FILES} component test files — every component directory ships at least one, and each file renders its component and asserts zero axe violations on the WCAG-tagged rules. The best-practice-only region rule is disabled because a test harness is not a real document. Lib-wide, form, RTL and floating-primitive suites bring the total to ${AXE_LIB_FILES} scanning files.`,
          ],
          [
            'E2E axe',
            [code('@axe-core/playwright')],
            'The demo harness scanned with the WCAG tags (wcag2a through wcag22aa) in closed and open states: open Popover and dropdown-menu panels, a shown toast, and FormItem with and without a validation error — 5 scans. Open panels are where the aria wiring lives (aria-controls, aria-activedescendant, panel-internal roles), so panels are scanned, not just triggers.',
          ],
          [
            'Real-engine behavior',
            [code('Playwright, 3 engines')],
            `${E2E_SPEC_FILES} spec files, ${E2E_CHROMIUM_TESTS} tests on the chromium projects. The ${ENGINE_SENSITIVE_SPECS} engine-sensitive specs — floating collision, popover, dialog, dropdown menu, rtl and keyboard-critical — run on chromium, firefox and webkit alike: real focus navigation, top-layer popover behavior and key dispatch are things jsdom cannot vouch for, so the same assertions must pass on every engine. A fourth project pins phone-viewport contracts (412×839, touch).`,
          ],
          [
            'Visual baselines',
            [code('Playwright screenshots')],
            `${VISUAL_BASELINES} pixel baselines: 29 static component sections plus 16 interaction frames (open panels, a dark-theme dialog, RTL mirrors). Layout regressions and color/contrast drift move pixels; a 2% diff ratio absorbs only platform rasterization noise.`,
          ],
        ]
      )
    ),
    sec(
      'patterns',
      'Component ARIA patterns',
      p([
        'Interactive components map to ',
        link('WAI-ARIA APG patterns', 'https://www.w3.org/WAI/ARIA/apg/patterns/'),
        '. Where the platform already provides the semantics — ',
        code('details/summary'),
        ', ',
        code('input[type=range]'),
        ', the native ',
        code('dialog'),
        ' element — the library uses the native element and adds ARIA only where native semantics stop. Fewer overrides means fewer ways to be wrong.',
      ]),
      table(
        ['Component', 'APG pattern', 'Keyboard behavior'],
        [
          ['Switch', 'Switch Pattern', 'Native button with role="switch" and aria-checked; Space/Enter toggle.'],
          ['Checkbox, Radio', 'Checkbox / Radio (native)', 'Native inputs wrapped in labels — native activation keys and grouping for free.'],
          ['Accordion, Disclosure', 'Disclosure (native details/summary)', 'Native summary activation; zero ARIA overrides needed — the platform already owns the semantics.'],
          ['Dialog, Drawer, BottomSheet, Image Preview, Command dialog, Tour', 'Dialog (Modal)', 'Native dialog element in the top layer; Esc cancels, Tab cycles inside the trapped scope, focus returns to the trigger on close, and the title is wired via aria-labelledby.'],
          ['Popover', 'Non-modal disclosure', 'popover=auto gives Esc and outside-pointer light dismissal; the trigger span carries an honest role="button".'],
          ['Dropdown Menu, Context Menu, Menu', 'Menu Button / Menu', 'Roving tabindex; arrows wrap skipping disabled items; Home/End jump; Escape and Tab close and return focus to the trigger; printable characters run typeahead (500 ms buffer); submenu arrows mirror under dir="rtl".'],
          ['Select', 'Listbox (Combobox when filterable)', 'Enter/Space toggle the panel; arrows highlight via aria-activedescendant; Enter picks; Escape closes; Home/End jump; typing filters; Backspace drops the last chip in multiple mode.'],
          ['Combobox', 'Combobox', 'Typing filters; ArrowDown/ArrowUp open the panel and move the highlight; Enter picks or toggles a chip; Backspace drops the last chip; Escape closes.'],
          ['Mentions, Prompt Input', 'Combobox (inline popup)', 'The textarea/input owns aria-activedescendant into the open listbox only — a closed listbox never owns it.'],
          ['Tree, Tree Select', 'Tree View', 'A single roving tab stop (tabindex 0/-1); arrows move, ArrowRight expands or descends, ArrowLeft collapses, Enter commits the selection.'],
          ['Tabs', 'Tabs Pattern', 'Left/Right arrows with selection following focus; Home/End jump to the ends; keys mirror under dir="rtl".'],
          ['Calendar', 'Grid (roving tabindex)', 'Arrows rove the day/month grid; PageUp/PageDown hop by month or year; Enter commits.'],
          ['Slider', 'Slider (native range)', 'Native input[type=range] — arrows, Home/End and page keys come from the platform.'],
          ['Rating', 'Radio group (roving)', 'Up/Down step the value (half steps with allowHalf); Left/Right mirror under dir="rtl"; Home/End jump; Space/Enter commit.'],
          ['Toolbar', 'Toolbar', 'Roving tabindex across its buttons and separators.'],
          ['Progress', 'Progressbar', 'role="progressbar" with aria-valuenow/min/max; non-interactive by design.'],
          ['Alert, Toast', 'Alert / Status', 'Danger toasts assert via role="alert"; everything else announces politely via role="status".'],
        ]
      )
    ),
    sec(
      'keyboard-conventions',
      'Keyboard conventions',
      p([
        'The contracts below are implemented once, as shared primitives, and consumed by every relevant component — so keyboard behavior cannot drift between components.',
      ]),
      note([
        strong('Focus containment.'),
        ' ',
        code('useFocusScope'),
        ' traps the Tab cycle inside a scope (document-level Tab interception plus a focusout pull-back), supports initial autofocus and restores focus to the trigger on close. It backs every modal — Dialog, Drawer, BottomSheet, Confirm Dialog, the Command dialog, Image Preview — and the menu family.',
      ]),
      note([
        strong('Roving tabindex as machinery.'),
        ' ',
        code('useRovingTabindex'),
        ' and ',
        code('useMenuKeyboard'),
        ' implement the APG roving contract a single time: one tab stop per container, main-axis arrows wrapping past disabled items, Home/End, typeahead, Escape/Tab-close with focus return, and orientation-aware keys that mirror under ',
        code('dir="rtl"'),
        '. Tree, Tabs, Menu, the context/dropdown menus, Rating, Calendar, Toolbar, Command and Cascader all consume them.',
      ]),
      note([
        strong('The keyboard open path.'),
        ' Floating panels never open on pointer-driven focus: focus fires synchronously inside pointerdown, and a panel shown mid-gesture gets light-dismissed by the same click. Triggers toggle with Enter/Space, and panels open from the keyboard via ArrowDown or typing — Combobox enforces this with a regression test.',
      ]),
      note([
        strong('Escape is universal.'),
        ' The ',
        code('popover=auto'),
        ' attribute gives Esc and outside-click light dismissal to every floating panel, and fourteen components additionally handle Escape explicitly in their own keymaps (BottomSheet, Calendar, Cascader, Combobox, ConfirmDialog, the DataTable cell editor, FloatButton, InlineCompletion, InlineEdit, Mentions, Prompt Input, Select, Tour and Tree Select).',
      ]),
      note([
        strong('Focus is visible.'),
        ` ${FOCUS_RING_FILES} component files style `,
        code(':focus-visible'),
        ' through the ',
        code('--haze-color-focus-ring'),
        ' token — an outline is never removed without a replacement.',
      ])
    ),
    sec(
      'reduced-motion',
      'Reduced motion',
      p([
        'The ',
        code('motion'),
        ' token class declares ',
        code('--haze-duration-fast/normal/slow'),
        ' (120/200/300 ms) and the easing curves; every transition and enter/exit animation in the library resolves through them. Inside ',
        code('@media (prefers-reduced-motion: reduce)'),
        ' all three durations collapse to 0 ms, so token-driven motion completes within a single frame — easing is left untouched because it is irrelevant at 0 ms. Custom properties inherit, so the media query covers every descendant of the token class and re-evaluates live when the OS preference flips.',
      ]),
      p([
        'The opt-in modal View Transitions (Dialog, Drawer, BottomSheet) skip ',
        code('startViewTransition'),
        ' entirely when the user prefers reduced motion or the engine lacks the API. ',
        `${REDUCED_MOTION_TESTS} e2e tests pin the contract: under `,
        code('emulateMedia'),
        ' reduce, every computed duration resolves to 0 s and stays non-zero under no-preference — including after a live preference flip without a reload.',
      ])
    ),
    sec(
      'unit-limits',
      'What unit tests cannot vouch for',
      p([
        `jsdom has no layout engine, no top layer and no real focus navigation — a unit suite can assert that the right attributes exist, not that a Tab keypress actually moves focus or that a popover survives engine-specific light-dismiss quirks. That is precisely the split this repo makes: jsdom vouches for ARIA markup and logic; the ${ENGINE_SENSITIVE_SPECS} engine-sensitive e2e specs vouch for real focus movement, top-layer behavior, key dispatch and collision containment on chromium, firefox and webkit; pixel baselines (chromium only) vouch for visual regressions.`,
      ]),
      p([
        'WCAG-tagged axe rules run at both the unit and e2e layers. The guarantee is scoped to what those rules and specs cover: full WCAG conformance of your application also depends on your content, labels and page structure.',
      ])
    ),
  ],
};

const a11yZh: GuideDoc = {
  title: '无障碍',
  intro: [
    'haze-ui 的无障碍是一组工程契约，而不是一份检查清单：每个交互组件的单测都内置 axe 扫描，键盘行为在真实浏览器引擎上验证，焦点由共享原语负责困住与恢复，用户选择减少动效时所有动画一律归零。本页说明库承诺了什么、每条承诺在哪里被强制执行——下方所有数字均实测自本仓库。',
  ],
  sections: [
    sec(
      'verification-layers',
      '验证层级',
      p(['四层验证，每层覆盖上一层无法覆盖的部分。单测层为 ARIA 标记与交互逻辑背书；e2e 层为真实引擎上的行为背书。']),
      table(
        ['层级', '工具', '范围与契约'],
        [
          [
            'Unit (jsdom)',
            [code('jest-axe')],
            `全部 ${AXE_COMPONENT_FILES} 个组件测试文件——每个组件目录至少自带一个，每个文件都会渲染其组件并断言 WCAG 标记规则下 axe 违规为零。仅限 best-practice 的 region 规则被禁用，因为测试画布不是真实文档。全库、表单、RTL 与浮层原语套件使扫描文件总数达到 ${AXE_LIB_FILES} 个。`,
          ],
          [
            'E2E axe',
            [code('@axe-core/playwright')],
            '以 WCAG 标签（wcag2a 到 wcag22aa）在关闭与打开两种状态下扫描演示站：打开的 Popover 与 dropdown-menu 面板、一条已显示的 toast、带与不带校验错误的 FormItem——共 5 次扫描。aria 接线（aria-controls、aria-activedescendant、面板内部 role）都在打开的面板里，所以扫描的是面板而不只是触发器。',
          ],
          [
            'Real-engine behavior',
            [code('Playwright, 3 engines')],
            `${E2E_SPEC_FILES} 个 spec 文件，chromium 项目上 ${E2E_CHROMIUM_TESTS} 个测试。${ENGINE_SENSITIVE_SPECS} 个引擎敏感 spec——浮动碰撞、popover、dialog、dropdown menu、rtl 与键盘关键路径——在 chromium、firefox 和 webkit 上一致运行：真实焦点导航、顶层 popover 行为与按键派发是 jsdom 无法背书的，因此同样的断言必须在每个引擎上通过。第四个项目钉住手机视口契约（412×839、触摸）。`,
          ],
          [
            'Visual baselines',
            [code('Playwright screenshots')],
            `${VISUAL_BASELINES} 张像素基线：29 个静态组件区块加 16 个交互帧（打开的面板、暗色主题 dialog、RTL 镜像）。布局回归与颜色/对比度漂移都会移动像素；2% 的差异比只吸收平台光栅化噪声。`,
          ],
        ]
      )
    ),
    sec(
      'patterns',
      '组件 ARIA 模式',
      p([
        '交互组件映射到 ',
        link('WAI-ARIA APG patterns', 'https://www.w3.org/WAI/ARIA/apg/patterns/'),
        '。凡是平台已提供语义的地方——',
        code('details/summary'),
        '、',
        code('input[type=range]'),
        '、原生 ',
        code('dialog'),
        ' 元素——库就使用原生元素，只在原生语义止步处补充 ARIA。更少的覆盖意味着更少的出错方式。',
      ]),
      table(
        ['组件', 'APG 模式', '键盘行为'],
        [
          ['Switch', 'Switch Pattern', '原生 button，带 role="switch" 与 aria-checked；Space/Enter 切换。'],
          ['Checkbox, Radio', 'Checkbox / Radio (native)', '原生 input 包裹在 label 中——原生活化键与分组免费获得。'],
          ['Accordion, Disclosure', 'Disclosure (native details/summary)', '原生 summary 活化；零 ARIA 覆盖——平台已经拥有这些语义。'],
          ['Dialog, Drawer, BottomSheet, Image Preview, Command dialog, Tour', 'Dialog (Modal)', '顶层中的原生 dialog 元素；Esc 取消，Tab 在被困焦点域内循环，关闭时焦点返回触发器，标题经 aria-labelledby 接线。'],
          ['Popover', 'Non-modal disclosure', 'popover=auto 提供 Esc 与指针外按的轻量关闭；触发器 span 诚实地携带 role="button"。'],
          ['Dropdown Menu, Context Menu, Menu', 'Menu Button / Menu', 'Roving tabindex；方向键环绕并跳过禁用项；Home/End 跳转；Escape 与 Tab 关闭并把焦点还给触发器；可打印字符运行 typeahead（500 ms 缓冲）；子菜单方向键在 dir="rtl" 下镜像。'],
          ['Select', 'Listbox (Combobox when filterable)', 'Enter/Space 开关面板；方向键经 aria-activedescendant 高亮；Enter 选中；Escape 关闭；Home/End 跳转；输入即过滤；多选模式下 Backspace 删除最后一个 chip。'],
          ['Combobox', 'Combobox', '输入即过滤；ArrowDown/ArrowUp 打开面板并移动高亮；Enter 选中或切换 chip；Backspace 删除最后一个 chip；Escape 关闭。'],
          ['Mentions, Prompt Input', 'Combobox (inline popup)', 'textarea/input 只在 listbox 打开时持有 aria-activedescendant——关闭的 listbox 永不持有。'],
          ['Tree, Tree Select', 'Tree View', '单一 roving tab 停靠点（tabindex 0/-1）；方向键移动，ArrowRight 展开或下潜，ArrowLeft 折叠，Enter 提交选择。'],
          ['Tabs', 'Tabs Pattern', 'Left/Right 方向键、选择跟随焦点；Home/End 跳到两端；按键在 dir="rtl" 下镜像。'],
          ['Calendar', 'Grid (roving tabindex)', '方向键在日/月网格中漫游；PageUp/PageDown 按月或年跳转；Enter 提交。'],
          ['Slider', 'Slider (native range)', '原生 input[type=range]——方向键、Home/End 与 page 键来自平台。'],
          ['Rating', 'Radio group (roving)', 'Up/Down 步进值（allowHalf 时半步）；Left/Right 在 dir="rtl" 下镜像；Home/End 跳转；Space/Enter 提交。'],
          ['Toolbar', 'Toolbar', '在其按钮与分隔符之间使用 roving tabindex。'],
          ['Progress', 'Progressbar', 'role="progressbar" 配 aria-valuenow/min/max；设计上不可交互。'],
          ['Alert, Toast', 'Alert / Status', '危险 toast 经 role="alert" 断言播报；其余经 role="status" 礼貌播报。'],
        ]
      )
    ),
    sec(
      'keyboard-conventions',
      '键盘约定',
      p(['下列契约只实现一次——作为共享原语——被所有相关组件消费，因此键盘行为不会在组件之间漂移。']),
      note([
        strong('焦点困限。'),
        ' ',
        code('useFocusScope'),
        ' 把 Tab 循环困在作用域内（document 级 Tab 拦截加 focusout 拉回），支持初始 autofocus，关闭时把焦点还给触发器。它支撑每一个模态——Dialog、Drawer、BottomSheet、Confirm Dialog、Command dialog、Image Preview——以及菜单家族。',
      ]),
      note([
        strong('Roving tabindex 作为机制。'),
        ' ',
        code('useRovingTabindex'),
        ' 与 ',
        code('useMenuKeyboard'),
        ' 只实现一次 APG roving 契约：每个容器一个 tab 停靠点、主轴方向键环绕并跳过禁用项、Home/End、typeahead、Escape/Tab 关闭并返还焦点、方向键在 ',
        code('dir="rtl"'),
        ' 下镜像。Tree、Tabs、Menu、context/dropdown 菜单、Rating、Calendar、Toolbar、Command 与 Cascader 都在消费它们。',
      ]),
      note([
        strong('键盘打开路径。'),
        ' 浮层面板绝不因指针驱动的聚焦而打开：focus 在 pointerdown 内同步触发，手势中途显示的面板会被同一次点击轻量关闭。触发器用 Enter/Space 切换，面板经 ArrowDown 或输入从键盘打开——Combobox 用一条回归测试强制这一点。',
      ]),
      note([
        strong('Escape 是通用的。'),
        ' ',
        code('popover=auto'),
        ' 属性为每个浮层面板提供 Esc 与外击轻量关闭，另有十四个组件在自己的键位表里显式处理 Escape（BottomSheet、Calendar、Cascader、Combobox、ConfirmDialog、DataTable 单元格编辑器、FloatButton、InlineCompletion、InlineEdit、Mentions、Prompt Input、Select、Tour 与 Tree Select）。',
      ]),
      note([
        strong('焦点可见。'),
        ` ${FOCUS_RING_FILES} 个组件文件通过 `,
        code('--haze-color-focus-ring'),
        ' token 为 ',
        code(':focus-visible'),
        ' 设定样式——outline 从不会被移除而不提供替代。',
      ])
    ),
    sec(
      'reduced-motion',
      '减少动效',
      p([
        code('motion'),
        ' token 类声明 ',
        code('--haze-duration-fast/normal/slow'),
        '（120/200/300 ms）与缓动曲线；库中每个过渡与进出场动画都经由它们解析。在 ',
        code('@media (prefers-reduced-motion: reduce)'),
        ' 内，三个时长一律塌缩为 0 ms，token 驱动的动效在一帧内完成——缓动保持不动，因为在 0 ms 时无关紧要。自定义属性可继承，因此该媒体查询覆盖 token 类的每个后代，并在系统偏好切换时实时重新求值。',
      ]),
      p([
        '可选开启的模态 View Transitions（Dialog、Drawer、BottomSheet）在用户偏好减少动效或引擎缺少该 API 时完全跳过 ',
        code('startViewTransition'),
        `。${REDUCED_MOTION_TESTS} 条 e2e 测试钉住该契约：在 `,
        code('emulateMedia'),
        ' reduce 下，每个计算时长都解析为 0 s，而在无偏好下保持非零——包括不重载的情况下实时切换偏好之后。',
      ])
    ),
    sec(
      'unit-limits',
      '单测无法背书的部分',
      p([
        `jsdom 没有布局引擎、没有顶层、也没有真实焦点导航——单测套件能断言正确的属性存在，却不能断言 Tab 按键真的移动了焦点、或 popover 能在各引擎特有的轻量关闭怪癖下幸存。这正是本仓库的分工：jsdom 为 ARIA 标记与逻辑背书；${ENGINE_SENSITIVE_SPECS} 条引擎敏感 e2e spec 为 chromium、firefox 与 webkit 上的真实焦点移动、顶层行为、按键派发与碰撞包含背书；像素基线（仅 chromium）为视觉回归背书。`,
      ]),
      p([
        '带 WCAG 标签的 axe 规则在单测与 e2e 两层都运行。该保证的范围以这些规则与 spec 覆盖的为准：你的应用要完全符合 WCAG，还取决于你的内容、标签与页面结构。',
      ])
    ),
  ],
};

/* ---------------------------------------------------------------------------
 * A11yContracts guide — the contract table itself is generated data rendered
 * by the page (slot-free: the page owns the filter UI); only prose and
 * chrome strings live here.
 * ------------------------------------------------------------------------- */

const a11yContractsEn: GuideDoc = {
  title: 'Keyboard & ARIA contracts',
  intro: [
    'Every interactive component in Haze UI pins its accessibility surface in its own test suite: the roles it renders, the ',
    code('aria-*'),
    ' attributes it asserts, and the keys it handles. This page is a generated view of those suites — ',
    code('scripts/generate-a11y-contracts.mjs'),
    ' extracts each table row from the component’s co-located tests, so the contract shown here can never drift from the contract that is actually enforced. An empty cell (—) means the suite does not pin that facet yet, not that the component lacks it; the tests remain the source of truth.',
  ],
  sections: [],
  ui: {
    filterPlaceholder: 'Filter by component, role, aria attribute or key…',
    filterLabel: 'Filter contracts',
    countTemplate: '{matched} / {total} components',
    extractedTemplate: 'extracted {date} · {tests} tests',
    noMatchTemplate: 'No components match “{query}”.',
    headerComponent: 'Component',
    headerRoles: 'Roles',
    headerAria: 'ARIA attributes',
    headerKeys: 'Keys',
    headerTests: 'Tests',
  },
};

const a11yContractsZh: GuideDoc = {
  title: '键盘与 ARIA 契约',
  intro: [
    'Haze UI 的每个交互组件都在自己的测试套件里钉住其无障碍面：渲染的 role、断言的 ',
    code('aria-*'),
    ' 属性、处理的按键。本页是这些套件的生成视图——',
    code('scripts/generate-a11y-contracts.mjs'),
    ' 从组件的同址测试中提取每一行，因此这里展示的契约永远不会与实际强制的契约漂移。空单元格（—）表示该套件尚未钉住这一面，而不是组件缺少该行为；测试始终是真值来源。',
  ],
  sections: [],
  ui: {
    filterPlaceholder: '按组件、role、aria 属性或按键过滤…',
    filterLabel: '过滤契约',
    countTemplate: '{matched} / {total} 个组件',
    extractedTemplate: '提取于 {date} · {tests} 条测试',
    noMatchTemplate: '没有组件匹配「{query}」。',
    headerComponent: '组件',
    headerRoles: 'Role',
    headerAria: 'ARIA 属性',
    headerKeys: '按键',
    headerTests: '测试',
  },
};

/* ---------------------------------------------------------------------------
 * Dark mode guide. The three live demos stay in the page and are injected
 * via slots; their prose captions and island copy come from blocks/ui.
 * ------------------------------------------------------------------------- */

const darkModeEn: GuideDoc = {
  title: 'Dark mode',
  intro: [
    'Every haze-ui color is a ',
    code('--haze-*'),
    ' custom property defined by one of two theme classes — ',
    code('lightTheme'),
    ' / ',
    code('darkTheme'),
    '. Dark mode is therefore just “which class is on the container”: put ',
    code('darkTheme'),
    ' on ',
    code('<html>'),
    ' for the app, on any subtree for a dark island, or let ',
    code('useDarkMode'),
    ' manage it with persistence and system-preference following.',
  ],
  sections: [
    sec(
      'theme-classes',
      'The theme classes',
      p([
        'The classes are plain strings exported from the package. They work on any element, compose with your own class names, and cascade — a nested ',
        code('lightTheme'),
        ' inside a dark page is a light island. Both cards below are rendered by the same components; only the container\'s class differs:',
      ]),
      codeBlock(
        'tsx',
        `import { lightTheme, darkTheme, spacing, typography } from 'haze-ui';

// app root — one class flips the whole tree
<div className={\`\${darkTheme} \${spacing} \${typography}\`}>
  <App />
</div>

// or a dark island inside a light page — nesting wins by proximity
<div className={darkTheme}>
  <Card>…</Card>
</div>`
      ),
      slot('theme-islands'),
      note([
        'Because theme classes carry ',
        em('token definitions'),
        ', not styles, they never fight your CSS: your rules keep their specificity, they just re-resolve ',
        code('var(--haze-*)'),
        ' references inside the subtree. Inheriting custom properties from a dark ancestor is exactly how the islands above work with zero per-component dark-mode code.',
      ])
    ),
    sec(
      'brand-presets',
      'Brand presets',
      p([
        'Five preset brand themes ship alongside the default blue: ',
        code('violetTheme'),
        ', ',
        code('tealTheme'),
        ', ',
        code('cyanTheme'),
        ', ',
        code('orangeTheme'),
        ' and ',
        code('roseTheme'),
        ', each exposing a ',
        code('light'),
        ' and a ',
        code('dark'),
        ' class. A brand class is a ',
        strong('complete replacement'),
        ' for ',
        code('lightTheme'),
        '/',
        code('darkTheme'),
        ' — never stack the two on the same element. Primary, info and focus-ring re-resolve to the brand\'s scale; neutrals and success/warning/danger stay put:',
      ]),
      codeBlock(
        'tsx',
        `import { violetTheme, spacing, typography } from 'haze-ui';

// violetTheme.light REPLACES lightTheme — it carries the full token set
// (primitive scales + semantic aliases + interaction states)
<div className={\`\${violetTheme.light} \${spacing} \${typography}\`}>
  <App />
</div>

// dark works the same way against darkTheme
<div className={\`\${violetTheme.dark} \${spacing} \${typography}\`}>
  <App />
</div>`
      ),
      note([
        'Why replacement instead of an overlay: a brand class and ',
        code('lightTheme'),
        ' would declare the same custom properties at the same specificity, leaving the winner to stylesheet emission order. Custom-property overrides must land on the very element that declares them — so the brand classes restate the entire theme (every token the default themes carry) rather than shipping a diff that only works when stacked.',
      ])
    ),
    sec(
      'runtime-brand',
      'Custom brand themes at runtime',
      p([
        'When none of the presets match, ',
        code('createBrandTheme'),
        ' builds the same complete theme from your own seed color — one hex for light mode, an optional second for dark. It runs the preset pipeline (primitive 12-step scales, primary/info/focus-ring rerouting, relative-color interaction states), so the result is indistinguishable from a shipped preset:',
      ]),
      codeBlock(
        'tsx',
        `import { createBrandTheme } from 'haze-ui/tokens';

const brand = createBrandTheme({
  name: 'acme',        // → --haze-acme-1…12 (lowercase kebab)
  light: '#0066ff',    // light-mode primary seed
  // dark: '#0a3d99',  // optional — derived from light (oklch l +0.2) if omitted
  // overrides: {light: {10: '#…'}, dark: {8: '#…'}},  // pin extra anchors
});

// bare declaration blocks — wrap them in classes once:
const style = document.createElement('style');
style.textContent = \`.acme-light { \\\${brand.light} }\\n.acme-dark { \\\${brand.dark} }\`;
document.head.append(style);`
      ),
      slot('runtime-brand'),
      caption([
        'Try ',
        code("'#0066ff'"),
        ', ',
        code("'#0f766e'"),
        ' or ',
        code("'#c2410c'"),
        ' — the hover, active and subtle states re-resolve with it because they are CSS relative-color formulas over the generated primitives.',
      ]),
      note([
        'Two rules carry over from the presets: the blocks are ',
        strong('replacements'),
        ' for ',
        code('lightTheme'),
        '/',
        code('darkTheme'),
        ' (never stack), and you own contrast — pick a light-mode seed dark enough for white text (the presets’ step-9 anchors sit near Tailwind’s 600/700 range for exactly that reason).',
      ]),
      p([
        'Outside React, the ',
        code('haze-ui-theme'),
        ' CLI emits the identical CSS as a file — handy for design handoff or static sites. Brand presets are also exported as W3C design-token JSON via ',
        code('haze-ui/design-tokens/{brand}/{mode}.json'),
        '.',
      ]),
      codeBlock(
        'bash',
        `npx haze-ui-theme --primary '#0066ff' --name acme --out acme-theme.css
# → .haze-acme-light / .haze-acme-dark classes, complete token set`
      )
    ),
    sec(
      'use-dark-mode',
      'useDarkMode — persistence & system following',
      p([
        code('useDarkMode'),
        ' is the stateful half: it persists the chosen mode to ',
        code('localStorage'),
        ' (cross-tab synced via the ',
        code('storage'),
        ' event), resolves ',
        code("mode === 'system'"),
        ' against ',
        code('prefers-color-scheme'),
        ' live, and toggles the right theme class on a target element — ',
        code('document.documentElement'),
        ' by default, or any element/ref for a scoped container. The card below runs scoped, with its own storage key:',
      ]),
      slot('scoped-demo'),
      caption([
        'Flip your OS appearance while ',
        code('System'),
        ' is active — the card follows live. Any explicit choice (Light, Dark, or the toggle) pins the card and stops the following until you pick ',
        code('System'),
        ' again.',
      ]),
      p(['The full return value and options:']),
      codeBlock(
        'tsx',
        `import { useDarkMode } from 'haze-ui';

const [isDark, setIsDark, mode, setMode] = useDarkMode({
  storageKey: 'my-app-color-mode', // default 'haze-ui-color-mode'
  defaultMode: 'system',           // 'light' | 'dark' | 'system' (default 'system')
  target: rootRef,                 // element or ref; default document.documentElement
});

setMode('system');           // follow the OS preference again
setIsDark(true);             // shorthand for setMode('dark')
setIsDark((prev) => !prev);  // functional — flips the current resolution`
      ),
      p([
        'Call it once near the root of the app and pass the values down (or through your own context) — the class toggling is idempotent, so a second call site is harmless, but one owner keeps the mode single sourced. Two behaviors are deliberate:',
      ]),
      list(
        [
          strong('Unmounting never removes the class.'),
          ' A theme is a page-level fact — stripping ',
          code('darkTheme'),
          ' on unmount would flash the page white.',
        ],
        [
          strong('SSR-safe by construction.'),
          ' Nothing touches ',
          code('document'),
          ' during render and the effect only runs on the client, so server HTML and the first client render agree. The class lands right after hydration; if you need it before first paint in a plain SPA, add a tiny inline script in ',
          code('index.html'),
          ' that reads the storage key — the Next.js section below shows the framework-managed equivalent.',
        ]
      ),
      h3('Mode persistence compared'),
      table(
        ['mode', 'persisted value', 'resolved isDark', 'follows OS changes'],
        [
          [[code("'light'")], [code("'light'")], [code('false'), ' — always'], ['No']],
          [[code("'dark'")], [code("'dark'")], [code('true'), ' — always'], ['No']],
          [
            [code("'system'")],
            [code("'system'"), ' (the choice, not the resolution)'],
            [code("matchMedia('(prefers-color-scheme: dark)')")],
            ['Yes — live, via the matchMedia listener (no reload needed)'],
          ],
        ]
      ),
      p([
        'Note the third row stores the ',
        em('choice'),
        ', not the resolved value: a user on \'system\' whose OS is light now will still get dark automatically when the OS switches. Any explicit ',
        code('setIsDark(…)'),
        ' or ',
        code("setMode('light' | 'dark')"),
        ' pins the mode and stops the following until ',
        code("setMode('system')"),
        ' re-enables it — mirroring the Light/Dark/Auto pattern in this site\'s own header.',
      ])
    ),
    sec(
      'next-themes',
      'Interoperating with next-themes',
      p([
        'next-themes stays the theme owner; haze only needs the right token class on an ancestor. The classes are build-time strings, so hand them to next-themes directly and it writes exactly these class names on ',
        code('<html>'),
        ' — no sync effect, no flash handling of your own:',
      ]),
      codeBlock(
        'tsx',
        `// app/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { darkTheme, lightTheme } from 'haze-ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute='class'
      enableSystem
      // maps next-themes' resolved names onto haze's token classes;
      // suppressHydrationWarning on <html> stays recommended by next-themes
      value={{ light: lightTheme, dark: darkTheme }}
    >
      {children}
    </ThemeProvider>
  );
}`
      ),
      p([
        'Already locked into a provider config you cannot change? A small sync effect does the same job — it reads ',
        code('resolvedTheme'),
        ' (never ',
        code('theme'),
        ', which can be ',
        code("'system'"),
        ') and mirrors it onto the class list:',
      ]),
      codeBlock(
        'tsx',
        `// app/haze-theme-sync.tsx
'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { darkTheme, lightTheme } from 'haze-ui';

export function HazeThemeSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(lightTheme, resolvedTheme !== 'dark');
    root.classList.toggle(darkTheme, resolvedTheme === 'dark');
  }, [resolvedTheme]);

  return null;
}`
      ),
      note([
        'Pick ',
        strong('one'),
        ' writer for the theme classes. When next-themes (or any manager) owns them, do not also mount ',
        code('useDarkMode'),
        ' — two writers on the same class list fight, and persistence belongs to whoever owns the switch (next-themes\' own ',
        code('storageKey'),
        ' in that setup). Tailwind\'s ',
        code('dark:'),
        ' variants coexist fine: next-themes can write both a ',
        code('dark'),
        ' utility class and haze\'s token classes if you list them together in ',
        code('value'),
        '.',
      ])
    ),
  ],
  ui: {
    islandLightTitle: 'lightTheme (page default)',
    islandLightText: 'Tokens resolve to the light palette everywhere inside.',
    islandDarkTitle: 'darkTheme',
    islandDarkText: 'One class on the container — every descendant re-resolves.',
    runtimeIslandLightText: 'Generated at runtime from the seed above.',
    runtimeIslandDarkText: 'Derived dark: same hue, lifted lightness.',
    runtimeValidHint: 'dark mode derived automatically (oklch l +0.2)',
    runtimeInvalidHint: 'enter a #rgb or #rrggbb hex',
  },
};

const darkModeZh: GuideDoc = {
  title: '深色模式',
  intro: [
    'haze-ui 的每种颜色都是一个 ',
    code('--haze-*'),
    ' 自定义属性，由两个主题类之一定义——',
    code('lightTheme'),
    ' / ',
    code('darkTheme'),
    '。因此深色模式只是「容器上挂的是哪个类」：把 ',
    code('darkTheme'),
    ' 挂在应用的 ',
    code('<html>'),
    ' 上，挂在任意子树上得到一块深色孤岛，或交给 ',
    code('useDarkMode'),
    ' 管理——自带持久化与系统偏好跟随。',
  ],
  sections: [
    sec(
      'theme-classes',
      '两个主题类',
      p([
        '这些类是从包里导出的普通字符串。它们可用于任意元素、与你的类名组合、并参与层叠——深色页面里嵌套的 ',
        code('lightTheme'),
        ' 就是一块浅色孤岛。下面两张卡片由相同的组件渲染；只有容器的类不同：',
      ]),
      codeBlock(
        'tsx',
        `import { lightTheme, darkTheme, spacing, typography } from 'haze-ui';

// app root — one class flips the whole tree
<div className={\`\${darkTheme} \${spacing} \${typography}\`}>
  <App />
</div>

// or a dark island inside a light page — nesting wins by proximity
<div className={darkTheme}>
  <Card>…</Card>
</div>`
      ),
      slot('theme-islands'),
      note([
        '由于主题类承载的是',
        em('token 定义'),
        '而非样式，它们绝不与你的 CSS 打架：你的规则保持其特异性，只是在子树内重新解析 ',
        code('var(--haze-*)'),
        ' 引用。从深色祖先继承自定义属性，正是上面的孤岛零逐组件深色模式代码的运作方式。',
      ])
    ),
    sec(
      'brand-presets',
      '品牌预设',
      p([
        '五个预设品牌主题随默认蓝色一同发布：',
        code('violetTheme'),
        '、',
        code('tealTheme'),
        '、',
        code('cyanTheme'),
        '、',
        code('orangeTheme'),
        ' 与 ',
        code('roseTheme'),
        '，各自暴露 ',
        code('light'),
        ' 与 ',
        code('dark'),
        ' 两个类。品牌类是 ',
        code('lightTheme'),
        '/',
        code('darkTheme'),
        ' 的',
        strong('完整替代'),
        '——绝不在同一元素上叠加两者。Primary、info 与 focus-ring 重新解析到品牌色阶；中性色与 success/warning/danger 保持不变：',
      ]),
      codeBlock(
        'tsx',
        `import { violetTheme, spacing, typography } from 'haze-ui';

// violetTheme.light REPLACES lightTheme — it carries the full token set
// (primitive scales + semantic aliases + interaction states)
<div className={\`\${violetTheme.light} \${spacing} \${typography}\`}>
  <App />
</div>

// dark works the same way against darkTheme
<div className={\`\${violetTheme.dark} \${spacing} \${typography}\`}>
  <App />
</div>`
      ),
      note([
        '为什么是整体替代而非叠加：品牌类与 ',
        code('lightTheme'),
        ' 会在相同特异性上声明相同的自定义属性，胜负交给样式表发射顺序。自定义属性覆盖必须落在声明它的那个元素上——因此品牌类重述整个主题（默认主题携带的每个 token），而不是发布一份只在叠加时才生效的差量。',
      ])
    ),
    sec(
      'runtime-brand',
      '运行时自定义品牌主题',
      p([
        '当预设都不匹配时，',
        code('createBrandTheme'),
        ' 用你自己的种子色构建同样的完整主题——浅色模式一个 hex，深色可选第二个。它运行与预设相同的流水线（原语 12 档色阶、primary/info/focus-ring 重路由、相对色交互态），因此结果与已发布的预设无从区分：',
      ]),
      codeBlock(
        'tsx',
        `import { createBrandTheme } from 'haze-ui/tokens';

const brand = createBrandTheme({
  name: 'acme',        // → --haze-acme-1…12 (lowercase kebab)
  light: '#0066ff',    // light-mode primary seed
  // dark: '#0a3d99',  // optional — derived from light (oklch l +0.2) if omitted
  // overrides: {light: {10: '#…'}, dark: {8: '#…'}},  // pin extra anchors
});

// bare declaration blocks — wrap them in classes once:
const style = document.createElement('style');
style.textContent = \`.acme-light { \\\${brand.light} }\\n.acme-dark { \\\${brand.dark} }\`;
document.head.append(style);`
      ),
      slot('runtime-brand'),
      caption([
        '试试 ',
        code("'#0066ff'"),
        '、',
        code("'#0f766e'"),
        ' 或 ',
        code("'#c2410c'"),
        '——hover、active 与 subtle 状态随之一并重新解析，因为它们是构建在生成原语之上的 CSS 相对色公式。',
      ]),
      note([
        '两条规则从预设延续而来：这些声明块是 ',
        code('lightTheme'),
        '/',
        code('darkTheme'),
        ' 的',
        strong('替代品'),
        '（绝不叠加），且对比度由你负责——选一个足够深、能承载白字的浅色模式种子（预设的 step-9 锚点恰因这个原因落在 Tailwind 的 600/700 区间附近）。',
      ]),
      p([
        '在 React 之外，',
        code('haze-ui-theme'),
        ' CLI 把相同的 CSS 输出为文件——适合设计交接或静态站点。品牌预设还以 W3C design-token JSON 形式经 ',
        code('haze-ui/design-tokens/{brand}/{mode}.json'),
        ' 导出。',
      ]),
      codeBlock(
        'bash',
        `npx haze-ui-theme --primary '#0066ff' --name acme --out acme-theme.css
# → .haze-acme-light / .haze-acme-dark classes, complete token set`
      )
    ),
    sec(
      'use-dark-mode',
      'useDarkMode——持久化与系统跟随',
      p([
        code('useDarkMode'),
        ' 是有状态的那一半：它把选择的模式持久化到 ',
        code('localStorage'),
        '（经 ',
        code('storage'),
        ' 事件跨标签页同步），把 ',
        code("mode === 'system'"),
        ' 对照 ',
        code('prefers-color-scheme'),
        ' 实时解析，并在目标元素上切换正确的主题类——默认 ',
        code('document.documentElement'),
        '，或任意元素/ref 作为作用域容器。下面的卡片以作用域模式运行，有自己的存储键：',
      ]),
      slot('scoped-demo'),
      caption([
        '在 ',
        code('System'),
        ' 激活时切换你的系统外观——卡片会实时跟随。任何显式选择（Light、Dark 或切换按钮）都会钉住卡片并停止跟随，直到你重新选择 ',
        code('System'),
        '。',
      ]),
      p(['完整的返回值与选项：']),
      codeBlock(
        'tsx',
        `import { useDarkMode } from 'haze-ui';

const [isDark, setIsDark, mode, setMode] = useDarkMode({
  storageKey: 'my-app-color-mode', // default 'haze-ui-color-mode'
  defaultMode: 'system',           // 'light' | 'dark' | 'system' (default 'system')
  target: rootRef,                 // element or ref; default document.documentElement
});

setMode('system');           // follow the OS preference again
setIsDark(true);             // shorthand for setMode('dark')
setIsDark((prev) => !prev);  // functional — flips the current resolution`
      ),
      p([
        '在应用根部附近调用一次并把值向下传递（或经由你自己的 context）——类切换是幂等的，第二个调用点无害，但单一 owner 让模式保持单一来源。有两个行为是刻意的：',
      ]),
      list(
        [
          strong('卸载绝不移除类。'),
          '主题是页面级事实——卸载时剥掉 ',
          code('darkTheme'),
          ' 会让页面白闪。',
        ],
        [
          strong('构造上 SSR 安全。'),
          '渲染期间不碰 ',
          code('document'),
          '，effect 只在客户端运行，因此服务端 HTML 与首次客户端渲染一致。类在 hydration 之后立即落位；若在纯 SPA 中需要它在首绘之前，可在 ',
          code('index.html'),
          ' 里加一段读取存储键的内联脚本——下文的 Next.js 小节展示框架托管的等价做法。',
        ]
      ),
      h3('模式持久化对比'),
      table(
        ['模式', '持久化值', '解析出的 isDark', '跟随系统变化'],
        [
          [[code("'light'")], [code("'light'")], [code('false'), ' —— 恒定'], ['否']],
          [[code("'dark'")], [code("'dark'")], [code('true'), ' —— 恒定'], ['否']],
          [
            [code("'system'")],
            [code("'system'"), '（存的是选择，不是解析结果）'],
            [code("matchMedia('(prefers-color-scheme: dark)')")],
            ['是——实时，经 matchMedia 监听器（无需重载）'],
          ],
        ]
      ),
      p([
        '注意第三行存的是',
        em('选择'),
        '而非解析结果：现在系统为浅色的 ‘system’ 用户，在系统切换时仍会自动得到深色。任何显式的 ',
        code('setIsDark(…)'),
        ' 或 ',
        code("setMode('light' | 'dark')"),
        ' 都会钉住模式并停止跟随，直到 ',
        code("setMode('system')"),
        ' 重新启用——与本站页眉的 Light/Dark/Auto 模式如出一辙。',
      ])
    ),
    sec(
      'next-themes',
      '与 next-themes 互操作',
      p([
        'next-themes 仍是主题 owner；haze 只需在某个祖先上挂对 token 类。这些类是构建期字符串，直接交给 next-themes，它就会在 ',
        code('<html>'),
        ' 上写入恰好这些类名——不需要同步 effect，也不需要你自己处理闪白：',
      ]),
      codeBlock(
        'tsx',
        `// app/providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { darkTheme, lightTheme } from 'haze-ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute='class'
      enableSystem
      // maps next-themes' resolved names onto haze's token classes;
      // suppressHydrationWarning on <html> stays recommended by next-themes
      value={{ light: lightTheme, dark: darkTheme }}
    >
      {children}
    </ThemeProvider>
  );
}`
      ),
      p([
        '已经锁死在无法更改的 provider 配置里？一个小的同步 effect 也能胜任——它读取 ',
        code('resolvedTheme'),
        '（绝不读 ',
        code('theme'),
        '，它可能是 ',
        code("'system'"),
        '）并镜像到类列表：',
      ]),
      codeBlock(
        'tsx',
        `// app/haze-theme-sync.tsx
'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { darkTheme, lightTheme } from 'haze-ui';

export function HazeThemeSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(lightTheme, resolvedTheme !== 'dark');
    root.classList.toggle(darkTheme, resolvedTheme === 'dark');
  }, [resolvedTheme]);

  return null;
}`
      ),
      note([
        '为主题类选定',
        strong('唯一'),
        '写入者。当 next-themes（或任何管理器）拥有它们时，就不要再挂 ',
        code('useDarkMode'),
        '——同一类列表上的两个写入者会打架，持久化属于开关的 owner（该配置下是 next-themes 自己的 ',
        code('storageKey'),
        '）。Tailwind 的 ',
        code('dark:'),
        ' 变体可以共存：只要在 ',
        code('value'),
        ' 里把它们列在一起，next-themes 可以同时写入 ',
        code('dark'),
        ' 工具类与 haze 的 token 类。',
      ])
    ),
  ],
  ui: {
    islandLightTitle: 'lightTheme（页面默认）',
    islandLightText: '内部所有 token 都解析为浅色色板。',
    islandDarkTitle: 'darkTheme',
    islandDarkText: '容器上一个类——所有后代重新解析。',
    runtimeIslandLightText: '在运行时由上面的种子生成。',
    runtimeIslandDarkText: '派生的深色：同色相、提升亮度。',
    runtimeValidHint: '深色模式自动派生（oklch l +0.2）',
    runtimeInvalidHint: '请输入 #rgb 或 #rrggbb 十六进制值',
  },
};

/* ---------------------------------------------------------------------------
 * Density guide. The scale table and the live comparison are page-owned
 * (data-driven / stateful) and arrive via slots.
 * ------------------------------------------------------------------------- */

const densityEn: GuideDoc = {
  title: 'Density (compact)',
  intro: [
    'haze-ui\'s spacing scale is a set of ',
    code('--haze-space-*'),
    ' custom properties declared by the ',
    code('spacing'),
    ' class. Density is a second dimension on top: ',
    code('compact'),
    ' shrinks the whole scale to 75% — denser paddings, tighter rows, smaller panels — with zero per-component code. Add one class next to your token classes and every component re-resolves.',
  ],
  sections: [
    sec(
      'compact-scale',
      'The compact scale',
      p([
        'Every step of the default scale is on a 4px grid, so 75% of each step lands on an exact pixel — no fractional values, nothing rounds. The zero step has no compact form: zero is zero at any density. Radius, shadow and typography are deliberately not density-scaled — ',
        code('compact'),
        ' answers the spacing indirection only.',
      ]),
      slot('scale-table')
    ),
    sec(
      'using-compact',
      'Using compact',
      p([
        'Put ',
        code('compact'),
        ' on the same element that carries ',
        code('spacing'),
        ' — your app root next to the theme classes, or any subtree for a scoped island. The order of class names in the string does not matter:',
      ]),
      codeBlock(
        'tsx',
        `import { lightTheme, compact, spacing, typography } from 'haze-ui';

// app root — compact sits next to spacing; any class order works
<div className={\`\${lightTheme} \${compact} \${spacing} \${typography}\`}>
  <App />
</div>

// a compact island inside a default-density page: re-declare spacing
// on the subtree so the scale re-resolves there
<section className={\`\${spacing} \${compact}\`}>
  <DataTable … />
</section>`
      ),
      note([
        strong('Why order never matters.'),
        ' A density class that re-declared ',
        code('--haze-space-3'),
        ' directly would collide with the ',
        code('spacing'),
        ' class at the same specificity, leaving the winner to stylesheet emission order — which differs between per-component css bundles and consumer setups. Instead, ',
        code('spacing'),
        ' declares ',
        code('--haze-space-3: var(--haze-density-space-3, 12px)'),
        ' and ',
        code('compact'),
        ' only ever declares ',
        code('--haze-density-space-3'),
        '. The two classes never write the same property name, so there is nothing to win or lose: the var() reference is substituted eagerly on the element that declares it, picking up whatever ',
        code('--haze-density-space-3'),
        ' value that same element carries — 12px without ',
        code('compact'),
        ', 9px with it. That is also why compact must land on (or re-declare ',
        code('spacing'),
        ' at) the element you want densified: a ',
        code('--haze-density-*'),
        ' value on a descendant cannot retroactively change the already substituted value it inherits.',
      ]),
      note([
        strong('Composability.'),
        ' ',
        code('compact'),
        ' touches only the density indirection, so it stacks freely with ',
        code('lightTheme'),
        ', ',
        code('darkTheme'),
        ' and the brand preset themes — dark compact, violet compact, any combination, in any class order.',
      ])
    ),
    sec(
      'live-comparison',
      'Live comparison',
      p([
        'The same Button, Input, Select, Table and List rendered twice — the right column adds ',
        code('compact'),
        '. Flip the switch:',
      ]),
      slot('density-compare'),
      caption([
        'Identical components, identical markup — the right column only adds ',
        code('compact'),
        ' next to a local ',
        code('spacing'),
        '. Every ',
        code('--haze-space-*'),
        ' reference inside (button padding, table cells, list rhythm, the island\'s own gap) re-resolves to 75%.',
      ])
    ),
  ],
  ui: {
    scaleHeaderToken: 'token',
    scaleHeaderDefault: 'default',
    scaleHeaderCompact: 'compact',
    compareStatusOn: 'compact: on (right column)',
    compareStatusOff: 'compact: off',
    compareDefaultTitle: 'Default',
    compareCompactTitle: 'Compact (spacing + compact)',
    compareSwitchLabel: 'Toggle compact density',
  },
};

const densityZh: GuideDoc = {
  title: '密度（紧凑）',
  intro: [
    'haze-ui 的间距标度是一组由 ',
    code('spacing'),
    ' 类声明的 ',
    code('--haze-space-*'),
    ' 自定义属性。密度是叠加其上的第二个维度：',
    code('compact'),
    ' 把整个标度缩到 75%——更密的内边距、更紧的行、更小的面板——零逐组件代码。在你的 token 类旁边加一个类，每个组件都会重新解析。',
  ],
  sections: [
    sec(
      'compact-scale',
      '紧凑标度',
      p([
        '默认标度的每一档都在 4px 网格上，因此每档的 75% 都落在精确像素上——没有小数值，无需取整。零档没有紧凑形态：任何密度下零都是零。圆角、阴影与排版刻意不做密度缩放——',
        code('compact'),
        ' 只回应间距间接寻址。',
      ]),
      slot('scale-table')
    ),
    sec(
      'using-compact',
      '使用 compact',
      p([
        '把 ',
        code('compact'),
        ' 放在承载 ',
        code('spacing'),
        ' 的同一元素上——应用根部与主题类并列，或任意子树作为作用域孤岛。字符串里类名的先后顺序无关紧要：',
      ]),
      codeBlock(
        'tsx',
        `import { lightTheme, compact, spacing, typography } from 'haze-ui';

// app root — compact sits next to spacing; any class order works
<div className={\`\${lightTheme} \${compact} \${spacing} \${typography}\`}>
  <App />
</div>

// a compact island inside a default-density page: re-declare spacing
// on the subtree so the scale re-resolves there
<section className={\`\${spacing} \${compact}\`}>
  <DataTable … />
</section>`
      ),
      note([
        strong('为什么顺序无关。'),
        '若密度类直接重新声明 ',
        code('--haze-space-3'),
        '，就会与 ',
        code('spacing'),
        ' 类在相同特异性上碰撞，胜负交给样式表发射顺序——而它在组件级 css 包与消费方配置之间并不一致。相反，',
        code('spacing'),
        ' 声明 ',
        code('--haze-space-3: var(--haze-density-space-3, 12px)'),
        '，而 ',
        code('compact'),
        ' 只声明 ',
        code('--haze-density-space-3'),
        '。两个类从不写同名属性，因此没有输赢：var() 引用在声明它的元素上被急切替换，取该元素携带的 ',
        code('--haze-density-space-3'),
        ' 值——没有 ',
        code('compact'),
        ' 是 12px，有则是 9px。这也解释了为什么 compact 必须落在（或在其上重新声明 ',
        code('spacing'),
        '）你要致密化的元素上：后代上的 ',
        code('--haze-density-*'),
        ' 值无法追溯改变它已继承的替换结果。',
      ]),
      note([
        strong('可组合性。'),
        code('compact'),
        ' 只触碰密度间接寻址，因此与 ',
        code('lightTheme'),
        '、',
        code('darkTheme'),
        ' 及品牌预设主题自由叠加——深色紧凑、紫色紧凑，任意组合、任意类顺序。',
      ])
    ),
    sec(
      'live-comparison',
      '实时对比',
      p([
        '同样的 Button、Input、Select、Table 与 List 渲染两次——右列只加了 ',
        code('compact'),
        '。拨动开关：',
      ]),
      slot('density-compare'),
      caption([
        '相同组件、相同标记——右列只是在本地的 ',
        code('spacing'),
        ' 旁边加了 ',
        code('compact'),
        '。内部每个 ',
        code('--haze-space-*'),
        ' 引用（按钮内边距、表格单元格、列表节奏、孤岛自身的 gap）都重新解析为 75%。',
      ])
    ),
  ],
  ui: {
    scaleHeaderToken: 'token',
    scaleHeaderDefault: '默认',
    scaleHeaderCompact: '紧凑',
    compareStatusOn: 'compact：开（右列）',
    compareStatusOff: 'compact：关',
    compareDefaultTitle: '默认',
    compareCompactTitle: 'Compact（spacing + compact）',
    compareSwitchLabel: '切换紧凑密度',
  },
};

/* ---------------------------------------------------------------------------
 * Migration guide. The six before/after code pairs stay in the page
 * (page-owned Compare layout) and arrive via slots; prose, the component
 * map table and the trap callouts live here.
 * ------------------------------------------------------------------------- */

const migrationEn: GuideDoc = {
  title: 'Migrating from AntD / shadcn',
  intro: [
    'haze-ui borrows the best conventions from both worlds — AntD-grade compound components on a token system — but three core mechanisms differ: ',
    strong('state is ControlOrValue'),
    ' (not controlled/uncontrolled prop pairs), ',
    strong('sugar '),
    code('onChange'),
    strong(' is the native event handler'),
    ' (values flow through Controls or dedicated value callbacks), and ',
    strong('forms run on react-f0rm with schema validators'),
    ' (not ',
    code('rules'),
    ' arrays or react-hook-form). This page maps the concepts and calls out every trap.',
  ],
  sections: [
    sec(
      'component-map',
      'Component map',
      table(
        ['AntD', 'shadcn/ui', 'haze-ui', 'Notes'],
        [
          [
            [code('Button')],
            [code('Button')],
            [code('Button')],
            'solid / outline / ghost variants, token-driven colors',
          ],
          [
            [code('Input, Textarea')],
            [code('Input, Textarea')],
            [code('Input, Textarea')],
            'ControlOrValue value; onChange is the native event',
          ],
          [
            [code('Select')],
            [code('Select')],
            [code('Select / Combobox')],
            'plain single = Select (add searchable for filtering); type-ahead = Combobox',
          ],
          [
            [code('DatePicker / RangePicker')],
            [code('Calendar + Popover')],
            [code('Datepicker / DateRangePicker')],
            'Datepicker has showTime; DateRangePicker has presets',
          ],
          [
            [code('Table')],
            [code('Table')],
            [code('Table / DataTable')],
            'static markup → Table; sort / select / paginate / edit → DataTable (TanStack) with a manual server mode',
          ],
          [
            [code('Modal')],
            [code('Dialog')],
            [code('Dialog')],
            'native <dialog> + showModal',
          ],
          [
            [code('Drawer')],
            [code('Sheet')],
            [code('Drawer')],
            'same placement names — see below',
          ],
          [
            [code('Menu / Dropdown')],
            [code('DropdownMenu')],
            [code('DropdownMenu')],
            'compound parts — see below',
          ],
          [
            [code('Popconfirm')],
            [code('AlertDialog')],
            [code('ConfirmDialog')],
            "confirmText / cancelText / variant='danger'",
          ],
          [
            [code('message / notification')],
            [code('Toast (sonner)')],
            [code('useToast / toast')],
            'fire-and-report inside a ToastContainer',
          ],
          [
            [code('Form / Form.Item')],
            [code('Form (react-hook-form)')],
            [code('Form / FormItem (react-f0rm)')],
            'schema validators — see below',
          ],
          [
            [code('Tooltip, Tabs, Tag, Tree, Upload, Switch')],
            [code('same names')],
            [code('same names')],
            '1:1 surface, ControlOrValue state',
          ],
          [
            [code('Layout / Sider')],
            '—',
            [code('AppShell / Sidebar')],
            'composable shells',
          ],
        ]
      )
    ),
    sec(
      'form-item',
      'Form.Item → FormItem',
      p([
        'AntD puts validation ',
        em('rules'),
        ' on the item; haze-ui puts a ',
        code('validate'),
        ' callback there — ',
        code('(value, meta) => error | undefined'),
        ', sync or async. Schemas slot in through ',
        code('zodResolver'),
        ' (shipped with haze-ui): one adapter per schema, declared once at module scope. The rules-to-schema translation is mechanical — ',
        code('required'),
        ' becomes ',
        code(".min(1, '…')"),
        ', ',
        code("type: 'email'"),
        ' becomes ',
        code("z.email('…')"),
        ', custom validators become plain functions returning a message or ',
        code('undefined'),
        ':',
      ]),
      slot('form-item-compare'),
      p([
        'Prefer one object schema? Declare a ',
        code('z.object'),
        ' and derive per-field validators from it: ',
        code('zodResolver(schema.shape.email)'),
        ' — the field path stays the source of truth. Non-zod validation works through ',
        code('standardSchemaResolver'),
        ' (any Standard Schema v1 implementation) or a hand-written ',
        code('(value) => message | undefined'),
        '. The Recipes page shows all three live, including async availability checks with ',
        code('meta.signal'),
        ' cancellation.',
      ]),
      note([
        "AntD's ",
        code('Form'),
        " instance maps to react-f0rm's ",
        code('useForm'),
        ' (re-exported from ',
        code('haze-ui'),
        '): ',
        code('form.setFieldsValue'),
        ' → per-field ',
        code('setValue(form, path, value)'),
        ' (or ',
        code('reset(form, values)'),
        ' for a full load — the pattern the CRUD recipe uses to open an edit dialog), ',
        code('form.resetFields'),
        ' → ',
        code('reset(form, initialValues)'),
        ', ',
        code('form.validateFields'),
        ' → the submit flow you already drive via ',
        code('onValidSubmit'),
        ' / ',
        code('onInvalidSubmit'),
        ". shadcn's react-hook-form migration is the same shape — ",
        code('register'),
        '/',
        code('Controller'),
        ' collapses into the ',
        code('input'),
        ' channel or the ',
        code('children'),
        ' render-prop, which hands you ',
        code('{value, onChange}'),
        ' plus the id/aria wiring.',
      ])
    ),
    sec(
      'default-value',
      'defaultValue → “the value is the uncontrolled initial”',
      p([
        'The biggest mental-model shift: haze stateful components take ',
        code('ControlOrValue<T>'),
        ' — the same prop is the uncontrolled initial value ',
        em('or'),
        ' the controlled channel, distinguished by type, not by prop name:',
      ]),
      slot('default-value-compare'),
      note([
        'Migration trap: porting ',
        code('value={x}'),
        ' verbatim from a controlled AntD/shadcn component compiles and renders — but a plain value is the uncontrolled ',
        em('initial'),
        " value, so later prop changes are silently ignored. To stay controlled, pass the third element of ",
        code('useControl'),
        "'s return (the Control). There is no ",
        code('defaultValue'),
        ' prop to fall back on — ',
        code('checked'),
        ', ',
        code('open'),
        ', ',
        code('expanded'),
        ', ',
        code('activeKey'),
        '… all migrate the same way.',
      ])
    ),
    sec(
      'open-control',
      'open / onOpenChange → open ControlOrValue',
      p([
        'AntD modals and shadcn/Radix dialogs are controlled boolean pairs: ',
        code('open'),
        ' + ',
        code('onOpenChange'),
        ' / ',
        code('onClose'),
        '. haze keeps ',
        code('open'),
        ' but it is ControlOrValue, and there is only one callback — ',
        code('onClose'),
        ', fired once per close from every exit path (ESC, backdrop, your own buttons drive the state themselves):',
      ]),
      slot('open-compare'),
      p([
        'The same trap as values applies: ',
        code('open={condition}'),
        ' with a plain boolean is an ',
        em('initial'),
        ' value — the dialog opens on the first true and then manages itself. Drive it with a Control from ',
        code('useControl'),
        ' and it behaves like the boolean pair you are used to. Drawer, Popover, Tooltip, ConfirmDialog and the rest share the contract.',
      ])
    ),
    sec(
      'select-onchange',
      'Select → Select / Combobox — the onChange trap',
      note([
        strong('Read this before porting any Select.'),
        ' In AntD and shadcn/Radix, ',
        code('onChange'),
        ' / ',
        code('onValueChange'),
        ' receives the selected ',
        strong('value'),
        '. In haze-ui, the sugar ',
        code('onChange'),
        ' is forwarded to the underlying native element — it receives the ',
        strong('DOM event'),
        ' (and only exists where a native element does). The value callback is ',
        code('onValuesChange'),
        '. Porting ',
        code('onChange={(value) => …}'),
        ' verbatim compiles in single mode and then breaks: ',
        code('value'),
        ' is an event, not a string.',
      ]),
      slot('select-compare'),
      p([
        'Choosing the component: a plain single select (with or without ',
        code('searchable'),
        ' filtering) is ',
        code('Select'),
        '; a free-typing input that completes against options — AntD\'s ',
        code('AutoComplete'),
        ' or a searchable multi-select — is ',
        code('Combobox'),
        ', which adds ',
        code('creatable'),
        ', ',
        code('onCreate'),
        ', highlight-as-you-type and the same ',
        code('onSearch'),
        ' remote mode. Multiple selection lives on both (',
        code('multiple'),
        '), renders Chips, and reports through the same ',
        code('onValuesChange'),
        ' with ',
        code('string[]'),
        '. One more AntD difference: options are always JSX children (',
        code('Option'),
        ' / ',
        code('OptionGroup'),
        ') or — on Combobox — a plain ',
        code('options'),
        ' array; there is no ',
        code('labelInValue'),
        ' (compare against your own option source instead).',
      ])
    ),
    sec(
      'dropdown-menu',
      'Menu / Dropdown → DropdownMenu',
      p([
        'AntD\'s config-driven ',
        code('items'),
        ' array becomes the shadcn-style compound tree — the structure you write is the structure you get, and submenus nest arbitrarily:',
      ]),
      slot('dropdown-compare'),
      p([
        'The ',
        code('key'),
        ' → handler indirection disappears: each item carries its own ',
        code('onClick'),
        '. Context menus use the same item tree behind ',
        code('ContextMenu'),
        ' + ',
        code('ContextMenuTrigger'),
        ' wrapping whatever element should react to right-clicks. Keyboard parity (arrows, type-ahead, Esc one level at a time) and RTL mirroring are built in.',
      ])
    ),
    sec(
      'drawer',
      'Drawer / Sheet → Drawer',
      p([
        'AntD\'s ',
        code('Drawer'),
        ' and shadcn\'s ',
        code('Sheet'),
        ' map directly — haze keeps the four edge names AntD uses, and shadcn\'s ',
        code('side'),
        ' values translate mechanically:',
      ]),
      slot('drawer-compare'),
      p([
        'Defaults match AntD (',
        code('right'),
        '). Sizing is CSS, not props: each placement ships a sensible panel size (320px on the long axis, clamped to the viewport) — pass a ',
        code('className'),
        ' with your own ',
        code('width'),
        '/',
        code('height'),
        ' to resize one drawer. Mobile bottom sheets are the sibling ',
        code('BottomSheet'),
        ' component.',
      ])
    ),
    sec(
      'shadcn-specifics',
      'shadcn specifics',
      p(['Beyond the pieces already covered, three conventions replace the shadcn stack:']),
      list(
        [
          strong('No '),
          code('cn()'),
          strong(' / Tailwind glue.'),
          ' Components ship their own token-driven styles; customize with the ',
          code('--haze-<component>-*'),
          ' custom properties (see each component page\'s CSS variables section) instead of utility-class overrides. Your Tailwind utilities still compose around them — the Getting Started page covers the ',
          code('@theme inline'),
          ' bridge and layer interactions.',
        ],
        [
          strong('No copy-paste ownership.'),
          ' shadcn drops source files into your repo; haze-ui is an installed dependency — updates arrive with the package, and per-component CSS subpaths (',
          code('haze-ui/css/*.css'),
          ') keep payloads pay-per-use.',
        ],
        [
          strong('Copy is localizable.'),
          ' Every built-in literal flows through ',
          code('useStrings'),
          ' — mount ',
          code('LocaleProvider'),
          ' with a pack (zh-CN and ja-JP ship in the box) or partial overrides, instead of forking components to reword a button.',
        ]
      )
    ),
    sec(
      'where-next',
      'Where to go next',
      list(
        [
          strong('Recipes'),
          ' — the CRUD recipe assembles the exact admin screen most AntD apps start from (server-paginated DataTable + dialog form + confirm + toasts); the zod recipe covers schema validation in depth.',
        ],
        [
          strong('Dark mode guide'),
          ' — if you are leaving next-themes\'s ',
          code('class'),
          ' attribute behind, the guide shows the two haze token classes and their interop.',
        ],
        [
          strong('Component pages'),
          ' — every component documents its props, CSS variable slots and accessibility notes; DataTable, Select and FormItem have the deepest migration surfaces.',
        ]
      )
    ),
  ],
};

const migrationZh: GuideDoc = {
  title: '从 AntD / shadcn 迁移',
  intro: [
    'haze-ui 汲取了两个世界的最佳惯例——token 体系上的 AntD 级复合组件——但有三个核心机制不同：',
    strong('状态是 ControlOrValue'),
    '（而不是 controlled/uncontrolled 的 prop 成对组合）、',
    strong('语法糖 '),
    code('onChange'),
    strong(' 是原生事件处理器'),
    '（值经 Control 或专门的值回调流动）、以及 ',
    strong('表单运行在 react-f0rm 与 schema 校验器上'),
    '（不是 ',
    code('rules'),
    ' 数组，也不是 react-hook-form）。本页给出概念对照，并逐一指出每个陷阱。',
  ],
  sections: [
    sec(
      'component-map',
      '组件对照表',
      table(
        ['AntD', 'shadcn/ui', 'haze-ui', '说明'],
        [
          [
            [code('Button')],
            [code('Button')],
            [code('Button')],
            'solid / outline / ghost 变体，颜色由 token 驱动',
          ],
          [
            [code('Input, Textarea')],
            [code('Input, Textarea')],
            [code('Input, Textarea')],
            'ControlOrValue 值；onChange 是原生事件',
          ],
          [
            [code('Select')],
            [code('Select')],
            [code('Select / Combobox')],
            '普通单选 = Select（加 searchable 做过滤）；输入即补全 = Combobox',
          ],
          [
            [code('DatePicker / RangePicker')],
            [code('Calendar + Popover')],
            [code('Datepicker / DateRangePicker')],
            'Datepicker 有 showTime；DateRangePicker 有预设',
          ],
          [
            [code('Table')],
            [code('Table')],
            [code('Table / DataTable')],
            '静态标记 → Table；排序 / 选择 / 分页 / 编辑 → DataTable（TanStack），另配手动服务端模式',
          ],
          [
            [code('Modal')],
            [code('Dialog')],
            [code('Dialog')],
            '原生 <dialog> + showModal',
          ],
          [
            [code('Drawer')],
            [code('Sheet')],
            [code('Drawer')],
            'placement 同名——见下文',
          ],
          [
            [code('Menu / Dropdown')],
            [code('DropdownMenu')],
            [code('DropdownMenu')],
            '复合部件——见下文',
          ],
          [
            [code('Popconfirm')],
            [code('AlertDialog')],
            [code('ConfirmDialog')],
            "confirmText / cancelText / variant='danger'",
          ],
          [
            [code('message / notification')],
            [code('Toast (sonner)')],
            [code('useToast / toast')],
            '在 ToastContainer 内即发即报',
          ],
          [
            [code('Form / Form.Item')],
            [code('Form (react-hook-form)')],
            [code('Form / FormItem (react-f0rm)')],
            'schema 校验器——见下文',
          ],
          [
            [code('Tooltip, Tabs, Tag, Tree, Upload, Switch')],
            [code('同名')],
            [code('同名')],
            '1:1 对应面，ControlOrValue 状态',
          ],
          [
            [code('Layout / Sider')],
            '—',
            [code('AppShell / Sidebar')],
            '可组合的外壳',
          ],
        ]
      )
    ),
    sec(
      'form-item',
      '从 Form.Item 到 FormItem',
      p([
        'AntD 把校验',
        em('规则'),
        '放在 item 上；haze-ui 在同一位置放的是一个 ',
        code('validate'),
        ' 回调——',
        code('(value, meta) => error | undefined'),
        '，同步或异步皆可。schema 经 ',
        code('zodResolver'),
        '（随 haze-ui 发布）接入：每个 schema 一个适配器，在模块作用域声明一次。rules 到 schema 的翻译是机械的——',
        code('required'),
        ' 变成 ',
        code(".min(1, '…')"),
        '，',
        code("type: 'email'"),
        ' 变成 ',
        code("z.email('…')"),
        '，自定义校验器变成返回 message 或 ',
        code('undefined'),
        ' 的普通函数：',
      ]),
      slot('form-item-compare'),
      p([
        '更想要一个对象 schema？声明一个 ',
        code('z.object'),
        '，再从中派生逐字段校验器：',
        code('zodResolver(schema.shape.email)'),
        '——字段路径仍是唯一真值来源。非 zod 校验经 ',
        code('standardSchemaResolver'),
        '（任何 Standard Schema v1 实现）或手写的 ',
        code('(value) => message | undefined'),
        ' 接入。Recipes 页展示三者的 live 用法，包括用 ',
        code('meta.signal'),
        ' 取消的异步可用性检查。',
      ]),
      note([
        'AntD 的 ',
        code('Form'),
        ' 实例对应 react-f0rm 的 ',
        code('useForm'),
        '（从 ',
        code('haze-ui'),
        ' 重新导出）：',
        code('form.setFieldsValue'),
        ' → 逐字段 ',
        code('setValue(form, path, value)'),
        '（或整批 ',
        code('reset(form, values)'),
        '——CRUD recipe 打开编辑对话框用的正是这个模式），',
        code('form.resetFields'),
        ' → ',
        code('reset(form, initialValues)'),
        '，',
        code('form.validateFields'),
        ' → 你已经在经 ',
        code('onValidSubmit'),
        ' / ',
        code('onInvalidSubmit'),
        ' 驱动的提交流程。shadcn 的 react-hook-form 迁移是同一个形状——',
        code('register'),
        '/',
        code('Controller'),
        ' 收拢进 ',
        code('input'),
        ' 通道或 ',
        code('children'),
        ' render-prop，后者把 ',
        code('{value, onChange}'),
        ' 连同 id/aria 接线一并交给你。',
      ])
    ),
    sec(
      'default-value',
      'defaultValue →「值即非受控初值」',
      p([
        '最大的心智模型转变：haze 有状态组件接受 ',
        code('ControlOrValue<T>'),
        '——同一个 prop 既是非受控初值',
        em('又'),
        '是受控通道，靠类型而非 prop 名区分：',
      ]),
      slot('default-value-compare'),
      note([
        '迁移陷阱：把受控 AntD/shadcn 组件的 ',
        code('value={x}'),
        ' 原样搬过来能编译也能渲染——但普通值是非受控',
        em('初值'),
        '，后续 prop 变化会被静默忽略。要保持受控，请传 ',
        code('useControl'),
        ' 返回值的第三个元素（Control）。没有 ',
        code('defaultValue'),
        ' prop 可以退回——',
        code('checked'),
        '、',
        code('open'),
        '、',
        code('expanded'),
        '、',
        code('activeKey'),
        '……全都按同样的方式迁移。',
      ])
    ),
    sec(
      'open-control',
      '从 open / onOpenChange 到 open ControlOrValue',
      p([
        'AntD 的 Modal 与 shadcn/Radix 的 Dialog 是受控布尔对：',
        code('open'),
        ' + ',
        code('onOpenChange'),
        ' / ',
        code('onClose'),
        '。haze 保留 ',
        code('open'),
        '，但它是 ControlOrValue，且回调只有一个——',
        code('onClose'),
        '，每条退出路径（ESC、遮罩、你自己的按钮驱动状态）都只触发它一次：',
      ]),
      slot('open-compare'),
      p([
        '与值相同的陷阱在这里同样适用：',
        code('open={condition}'),
        ' 传普通布尔是一个',
        em('初值'),
        '——对话框在第一次为 true 时打开，此后自管理。用 ',
        code('useControl'),
        ' 派生的 Control 驱动它，行为就与你熟悉的布尔对一致。Drawer、Popover、Tooltip、ConfirmDialog 及其余组件共享同一契约。',
      ])
    ),
    sec(
      'select-onchange',
      'Select → Select / Combobox——onChange 陷阱',
      note([
        strong('移植任何 Select 之前先读这段。'),
        '在 AntD 和 shadcn/Radix 里，',
        code('onChange'),
        ' / ',
        code('onValueChange'),
        ' 收到的是选中的',
        strong('值'),
        '。在 haze-ui 里，语法糖 ',
        code('onChange'),
        ' 直接透传给底层原生元素——它收到的是',
        strong('DOM 事件'),
        '（且只存在于有原生元素的地方）。值回调是 ',
        code('onValuesChange'),
        '。把 ',
        code('onChange={(value) => …}'),
        ' 原样搬来在单选模式下能编译，随后出问题：',
        code('value'),
        ' 是事件，不是字符串。',
      ]),
      slot('select-compare'),
      p([
        '组件选择：普通单选 select（带或不带 ',
        code('searchable'),
        ' 过滤）用 ',
        code('Select'),
        '；自由输入并对照选项补全——AntD 的 ',
        code('AutoComplete'),
        ' 或可搜索多选——用 ',
        code('Combobox'),
        '，它额外提供 ',
        code('creatable'),
        '、',
        code('onCreate'),
        '、输入高亮与同样的 ',
        code('onSearch'),
        ' 远程模式。多选在两者上都有（',
        code('multiple'),
        '），渲染 Chips，并经同一个 ',
        code('onValuesChange'),
        ' 以 ',
        code('string[]'),
        ' 上报。还有一条 AntD 差异：选项永远是 JSX 子元素（',
        code('Option'),
        ' / ',
        code('OptionGroup'),
        '）或——仅 Combobox——一个普通 ',
        code('options'),
        ' 数组；没有 ',
        code('labelInValue'),
        '（改为对照你自己的选项源）。',
      ])
    ),
    sec(
      'dropdown-menu',
      '从 Menu / Dropdown 到 DropdownMenu',
      p([
        'AntD 配置驱动的 ',
        code('items'),
        ' 数组换成 shadcn 式复合树——你写的结构就是得到的结构，子菜单可以任意嵌套：',
      ]),
      slot('dropdown-compare'),
      p([
        code('key'),
        ' → 处理器的间层消失了：每个 item 自带 ',
        code('onClick'),
        '。右键菜单用同一套 item 树，挂在 ',
        code('ContextMenu'),
        ' + ',
        code('ContextMenuTrigger'),
        ' 里包住任何该响应右键的元素。键盘对等（方向键、type-ahead、Esc 逐级退出）与 RTL 镜像都是内建的。',
      ])
    ),
    sec(
      'drawer',
      '从 Drawer / Sheet 到 Drawer',
      p([
        'AntD 的 ',
        code('Drawer'),
        ' 与 shadcn 的 ',
        code('Sheet'),
        ' 直接对应——haze 保留 AntD 的四个边名，shadcn 的 ',
        code('side'),
        ' 值机械翻译即可：',
      ]),
      slot('drawer-compare'),
      p([
        '默认值与 AntD 一致（',
        code('right'),
        '）。尺寸走 CSS 而非 prop：每个 placement 自带合理的面板尺寸（长轴 320px，钳制在视口内）——传一个带自定义 ',
        code('width'),
        '/',
        code('height'),
        ' 的 ',
        code('className'),
        ' 来调整单个 drawer。移动端底部抽屉是兄弟组件 ',
        code('BottomSheet'),
        '。',
      ])
    ),
    sec(
      'shadcn-specifics',
      'shadcn 特有事项',
      p(['除已覆盖的部分外，三条约定取代 shadcn 技术栈：']),
      list(
        [
          strong('没有 '),
          code('cn()'),
          strong(' / Tailwind 胶水。'),
          '组件自带 token 驱动的样式；用 ',
          code('--haze-<component>-*'),
          ' 自定义属性（见各组件页的 CSS variables 一节）定制，而不是 utility 类覆写。你的 Tailwind utility 仍可在外层组合——Getting Started 页讲了 ',
          code('@theme inline'),
          ' 桥接与层交互。',
        ],
        [
          strong('没有复制粘贴式所有权。'),
          'shadcn 把源码文件丢进你的仓库；haze-ui 是一个安装依赖——更新随包到达，按组件拆分的 CSS 子路径（',
          code('haze-ui/css/*.css'),
          '）让载荷按需付费。',
        ],
        [
          strong('文案可本地化。'),
          '每个内置字面量都流经 ',
          code('useStrings'),
          '——挂一个带 pack 的 ',
          code('LocaleProvider'),
          '（zh-CN 与 ja-JP 内置）或做部分覆写，而不必 fork 组件去改一个按钮的措辞。',
        ]
      )
    ),
    sec(
      'where-next',
      '接下来去哪',
      list(
        [
          strong('Recipes'),
          '——CRUD recipe 拼装了大多数 AntD 应用起步时的那个管理界面（服务端分页 DataTable + 对话框表单 + confirm + toasts）；zod recipe 深入讲 schema 校验。',
        ],
        [
          strong('深色模式指南'),
          '——如果你正在告别 next-themes 的 ',
          code('class'),
          ' 属性，该指南展示 haze 的两个 token 类及互操作。',
        ],
        [
          strong('组件页'),
          '——每个组件都记载 props、CSS variable 槽位与无障碍说明；DataTable、Select 和 FormItem 的迁移面最深。',
        ]
      )
    ),
  ],
};

/* ---------------------------------------------------------------------------
 * Motion guide. The preset playground stays in the page (stateful demo)
 * and arrives via a slot; its caption and aria-label chrome come from
 * blocks/ui.
 * ------------------------------------------------------------------------- */

const motionEn: GuideDoc = {
  title: 'Motion presets',
  intro: [
    'haze-ui animates mount and unmount with plain CSS: one class from ',
    code('motionPresets'),
    ' on the element, and a ',
    code('data-state'),
    ' attribute that flips between ',
    code("'open'"),
    ' and ',
    code("'closed'"),
    '. The open state plays the enter keyframes, the closed state plays the exit keyframes, and the ',
    code('Presence'),
    ' primitive from ',
    code('haze-ui/headless'),
    ' keeps the element mounted until the exit finishes. No animation library, no JS touching ',
    code('style'),
    '.',
  ],
  sections: [
    sec(
      'pattern',
      'The pattern: one class plus data-state',
      p([
        'A preset is a single Linaria class that targets its own host element through the attribute selectors ',
        code("&[data-state='open']"),
        ' and ',
        code("&[data-state='closed']"),
        '. Because the selectors match on the element itself, the class works anywhere — your own components, haze-ui components that mirror their open state as ',
        code('data-state'),
        ' (animated floating panels do exactly this), or a bare ',
        code('<div>'),
        ':',
      ]),
      codeBlock(
        'tsx',
        `import { motionPresets } from 'haze-ui';
// or: from 'haze-ui/tokens'

// Statically mounted: flips data-state itself
<div className={motionPresets.fadeScale} data-state={open ? 'open' : 'closed'}>
  Card content
</div>`
      ),
      p([
        'The exit rule carries ',
        code('animation-fill-mode: forwards'),
        ', so a finished exit holds its end state (opacity 0, offset transform) instead of flashing back to the resting look for the frames between “closed” and the actual unmount.',
      ])
    ),
    sec(
      'presence',
      'Animating the unmount with Presence',
      p([
        'The catch with exit animations is React itself: the moment a conditional render flips, the element is gone — the exit keyframes never get a frame to play. ',
        code('Presence'),
        ' bridges that gap. It injects ',
        code('data-state'),
        ' (',
        code("'open'"),
        ' when present, ',
        code("'closed'"),
        ' the instant ',
        code('present'),
        ' turns false) and keeps the child mounted until ',
        code('whenExitSettles'),
        ' observes the closing animation finish:',
      ]),
      codeBlock(
        'tsx',
        `import { useControl } from 'react-use-control';
import { Switch } from 'haze-ui';
import { Presence } from 'haze-ui/headless';
import { motionPresets } from 'haze-ui';

function AnimatedCard() {
  // One control, two consumers: the Switch writes it, Presence reads it
  const [shown, , shownControl] = useControl(undefined, true);

  return (
    <>
      <Switch checked={shownControl} aria-label='Toggle the card' />
      <Presence present={shown}>
        <div className={motionPresets.slideUp}>
          Rises in from just below, sinks back out on exit.
        </div>
      </Presence>
    </>
  );
}`
      ),
      note([
        'Everything is coordinating through the one boolean: the Switch writes the control, ',
        code('Presence'),
        ' reads the resolved value. That is the same ControlOrValue contract every stateful haze-ui component offers — the demo above is your component with different names. Re-presenting mid-exit is handled: Presence flips the attribute back to ',
        code("'open'"),
        ' and the abandoned settle cannot unmount a card that is open again.',
      ]),
      slot('preset-playground'),
      caption([
        "Flip the switch off and watch the card leave with the preset's exit animation instead of vanishing — then flip it back on mid-exit: Presence cancels the unmount and re-enters from the start. Enable your OS “reduce motion” preference and every preset collapses to an instant swap.",
      ])
    ),
    sec(
      'preset-gallery',
      'The preset gallery',
      p([
        'Slide names describe the direction the element ',
        em('travels on enter'),
        '; the exit reverses it, so the element always leaves toward the side it arrived from. Slides fade as they travel (a pure translate reads as sliding glass over content), and the travel distance is a spacing token — a ',
        link('compacted', '/guides/density'),
        ' subtree slides shorter.',
      ]),
      table(
        ['Preset', 'Enter', 'Exit', 'Reaches for'],
        [
          [
            [code('fade')],
            'opacity 0 → 1',
            'opacity 1 → 0',
            'The safe default, and the only transform-free preset — this is what animated floating panels (Popover, DropdownMenu, Select, Tooltip) use.',
          ],
          [
            [code('fadeScale')],
            'opacity 0 + scale 0.97 → 1',
            '1 → opacity 0 + scale 0.97',
            'Centered surfaces that own the viewport focus: dialogs, image previews, cards stepping in.',
          ],
          [
            [code('slideUp')],
            ['rises from ', code('--haze-space-4'), ' below'],
            'sinks back down',
            'Bottom-anchored things: bottom sheets, snackbars, menus opening under a trigger.',
          ],
          [
            [code('slideDown')],
            ['descends from ', code('--haze-space-4'), ' above'],
            'rises back up',
            'Top-anchored things: banners, dropdown rows opening downward from a header bar.',
          ],
          [
            [code('slideLeft')],
            ['arrives from ', code('--haze-space-4'), ' right'],
            'leaves back right',
            'Panels that belong to the right edge, or content moving leftward through a carousel step.',
          ],
          [
            [code('slideRight')],
            ['arrives from ', code('--haze-space-4'), ' left'],
            'leaves back left',
            'Panels that belong to the left edge (drawers, sidebars), or content moving rightward.',
          ],
        ]
      ),
      p([
        'Enter runs at ',
        code('--haze-duration-normal'),
        ' (200ms), exit at ',
        code('--haze-duration-fast'),
        ' (120ms) — exits read snappier at the same perceived responsiveness. Both ease with ',
        code('--haze-ease'),
        '.',
      ])
    ),
    sec(
      'motion-token',
      'The motion token class',
      p([
        'Presets read their timing from the motion tokens — duration and easing custom properties declared by the ',
        code('motion'),
        ' class, the same way colors come from ',
        code('lightTheme'),
        '/',
        code('darkTheme'),
        ' and spacing from ',
        code('spacing'),
        '. Put it on your theme root next to the other token classes:',
      ]),
      codeBlock(
        'tsx',
        `import { lightTheme, spacing, typography, motion } from 'haze-ui';

<div className={\`\${lightTheme} \${spacing} \${typography} \${motion}\`}>
  <App />
</div>`
      ),
      p([
        'The class declares ',
        code('--haze-duration-fast/normal/slow'),
        ' and ',
        code('--haze-ease'),
        '/',
        code('--haze-ease-in-out'),
        ' — write your own transitions against them and every duration in the tree moves together when you retune the scale.',
      ])
    ),
    sec(
      'reduced-motion',
      'Reduced motion is built in',
      p([
        'Users who enable “reduce motion” get no enter/exit animation from these presets, on two independent levels. Every preset embeds its own ',
        code('prefers-reduced-motion: reduce'),
        ' block that sets ',
        code('animation: none'),
        ' — self-sufficient, with no requirement that the ',
        code('motion'),
        ' class is on any ancestor. And when it is, that class additionally collapses every ',
        code('--haze-duration-*'),
        ' to 0ms, which zeroes any custom token-driven animation you wrote by hand. Both paths agree; neither depends on the other.',
      ]),
      codeBlock(
        'css',
        `/* Inside every preset class: */
@media (prefers-reduced-motion: reduce) {
  &[data-state='open'],
  &[data-state='closed'] {
    animation: none;
  }
}`
      ),
      note([
        'The unmount still waits for the settle — with the animation disabled, ',
        code('whenExitSettles'),
        ' sees no positive duration and resolves immediately, so ',
        code('Presence'),
        ' unmounts on the next frame. Reduced motion degrades to an instant swap, never a hang.',
      ])
    ),
    sec(
      'rolling-your-own',
      'Rolling your own',
      p([
        'One preset per element — ',
        code('animation'),
        ' is a single CSS property, so two preset classes on the same element cannot merge their keyframes; the later class in stylesheet order wins outright. For a bespoke motion, follow the preset shape in your own Linaria class: both attribute selectors, forwards on the exit, a ',
        code('haze-motion-'),
        '-prefixed keyframe pair (keyframe names share the global CSS namespace once emitted), tokens for every duration and easing, and the embedded reduced-motion collapse.',
      ]),
      note([
        'Keep transform-bearing presets — ',
        code('fadeScale'),
        ' and the slides — off JS-positioned floating panels. Both positioning tiers behind Popover/DropdownMenu/Tooltip measure the panel with ',
        code('getBoundingClientRect'),
        ', and that rect includes transforms: an animating panel poisons its own placement math. Floating surfaces fade; that is why ',
        code('fade'),
        ' is transform-free.',
      ])
    ),
  ],
  ui: {
    switchLabel: 'Toggle the animated card',
  },
};

const motionZh: GuideDoc = {
  title: '动效预设',
  intro: [
    'haze-ui 用纯 CSS 动画挂载与卸载：在元素上放一个来自 ',
    code('motionPresets'),
    ' 的类，加一个在 ',
    code("'open'"),
    ' 与 ',
    code("'closed'"),
    ' 之间翻转的 ',
    code('data-state'),
    ' 属性。open 态播放进场关键帧，closed 态播放退场关键帧，来自 ',
    code('haze-ui/headless'),
    ' 的 ',
    code('Presence'),
    ' 原语让元素保持挂载直到退场结束。没有动画库，没有 JS 去碰 ',
    code('style'),
    '。',
  ],
  sections: [
    sec(
      'pattern',
      '模式：一个类加 data-state',
      p([
        '预设是一个单独的 Linaria 类，通过属性选择器 ',
        code("&[data-state='open']"),
        ' 与 ',
        code("&[data-state='closed']"),
        ' 作用于自己的宿主元素。选择器匹配元素本身，因此这个类在任何地方都可用——你自己的组件、把 open 态镜像为 ',
        code('data-state'),
        ' 的 haze-ui 组件（带动画的浮层面板正是这么做的）、或一个裸 ',
        code('<div>'),
        '：',
      ]),
      codeBlock(
        'tsx',
        `import { motionPresets } from 'haze-ui';
// or: from 'haze-ui/tokens'

// Statically mounted: flips data-state itself
<div className={motionPresets.fadeScale} data-state={open ? 'open' : 'closed'}>
  Card content
</div>`
      ),
      p([
        '退场规则携带 ',
        code('animation-fill-mode: forwards'),
        '，因此已结束的退场保持其终态（opacity 0、位移 transform），而不是在「closed」到真正卸载之间的若干帧里闪回静止外观。',
      ])
    ),
    sec(
      'presence',
      '用 Presence 动画卸载',
      p([
        '退场动画的难点在 React 本身：条件渲染一翻转，元素就没了——退场关键帧一帧都轮不到播。',
        code('Presence'),
        ' 补上这段空隙。它注入 ',
        code('data-state'),
        '（present 时为 ',
        code("'open'"),
        '，',
        code('present'),
        ' 变 false 的瞬间为 ',
        code("'closed'"),
        '），并让子元素保持挂载，直到 ',
        code('whenExitSettles'),
        ' 观察到关闭动画完成：',
      ]),
      codeBlock(
        'tsx',
        `import { useControl } from 'react-use-control';
import { Switch } from 'haze-ui';
import { Presence } from 'haze-ui/headless';
import { motionPresets } from 'haze-ui';

function AnimatedCard() {
  // One control, two consumers: the Switch writes it, Presence reads it
  const [shown, , shownControl] = useControl(undefined, true);

  return (
    <>
      <Switch checked={shownControl} aria-label='Toggle the card' />
      <Presence present={shown}>
        <div className={motionPresets.slideUp}>
          Rises in from just below, sinks back out on exit.
        </div>
      </Presence>
    </>
  );
}`
      ),
      note([
        '一切都经由同一个布尔值协调：Switch 写入 control，',
        code('Presence'),
        ' 读取解析后的值。这与每个 haze-ui 有状态组件提供的 ControlOrValue 契约相同——上面的演示就是你的组件换个名字。中途重新 present 也有处理：Presence 把属性翻回 ',
        code("'open'"),
        '，被放弃的 settle 无法卸载一张重新打开的卡片。',
      ]),
      slot('preset-playground'),
      caption([
        '关掉开关，看卡片带着预设的退场动画离开而不是凭空消失——再在退场中途打开：Presence 取消卸载并从头重新进场。打开系统的「减少动效」偏好，每个预设都塌缩为即时切换。',
      ])
    ),
    sec(
      'preset-gallery',
      '预设一览',
      p([
        'Slide 系名字描述元素',
        em('进场时'),
        '行进的方向；退场将其反转，元素总是从哪来回哪去。滑动的行程中伴随淡入淡出（纯位移读起来像玻璃滑过内容），行程距离是一个 spacing token——经过 ',
        link('紧凑化', '/guides/density'),
        '的子树滑得更短。',
      ]),
      table(
        ['预设', '进场', '退场', '适用场景'],
        [
          [
            [code('fade')],
            'opacity 0 → 1',
            'opacity 1 → 0',
            '稳妥的默认值，也是唯一不含 transform 的预设——带动画的浮层面板（Popover、DropdownMenu、Select、Tooltip）用的正是它。',
          ],
          [
            [code('fadeScale')],
            'opacity 0 + scale 0.97 → 1',
            '1 → opacity 0 + scale 0.97',
            '独占视焦的居中表面：对话框、图片预览、步入的卡片。',
          ],
          [
            [code('slideUp')],
            ['自下方 ', code('--haze-space-4'), ' 升起'],
            '沉回下方',
            '锚在底部的东西：底部抽屉、snackbar、在触发器下方展开的菜单。',
          ],
          [
            [code('slideDown')],
            ['自上方 ', code('--haze-space-4'), ' 降落'],
            '升回上方',
            '锚在顶部的东西：横幅、从页头栏向下展开的下拉行。',
          ],
          [
            [code('slideLeft')],
            ['自右侧 ', code('--haze-space-4'), ' 抵达'],
            '向右离开',
            '属于右缘的面板，或经轮播步骤向左移动的内容。',
          ],
          [
            [code('slideRight')],
            ['自左侧 ', code('--haze-space-4'), ' 抵达'],
            '向左离开',
            '属于左缘的面板（drawer、侧边栏），或向右移动的内容。',
          ],
        ]
      ),
      p([
        '进场跑在 ',
        code('--haze-duration-normal'),
        '（200ms），退场跑在 ',
        code('--haze-duration-fast'),
        '（120ms）——同样的感知响应度下，退场读起来更利落。两者都用 ',
        code('--haze-ease'),
        ' 缓动。',
      ])
    ),
    sec(
      'motion-token',
      '动效 token 类',
      p([
        '预设的时序读自动效 token——由 ',
        code('motion'),
        ' 类声明的时长与缓动自定义属性，正如颜色来自 ',
        code('lightTheme'),
        '/',
        code('darkTheme'),
        '、间距来自 ',
        code('spacing'),
        '。把它与其他 token 类并排放在主题根上：',
      ]),
      codeBlock(
        'tsx',
        `import { lightTheme, spacing, typography, motion } from 'haze-ui';

<div className={\`\${lightTheme} \${spacing} \${typography} \${motion}\`}>
  <App />
</div>`
      ),
      p([
        '这个类声明 ',
        code('--haze-duration-fast/normal/slow'),
        ' 与 ',
        code('--haze-ease'),
        '/',
        code('--haze-ease-in-out'),
        '——照着它们写你自己的过渡，重新调标度时树里每个时长都一起动。',
      ])
    ),
    sec(
      'reduced-motion',
      '减少动效是内建的',
      p([
        '开启「减少动效」的用户从这些预设得不到任何进场/退场动画，且是在两个相互独立的层面上。每个预设内嵌自己的 ',
        code('prefers-reduced-motion: reduce'),
        ' 块，置 ',
        code('animation: none'),
        '——自给自足，不要求任何祖先挂 ',
        code('motion'),
        ' 类。而一旦挂了，该类还会把每个 ',
        code('--haze-duration-*'),
        ' 塌缩为 0ms，把你手写的自定义 token 驱动动画一并归零。两条路径殊途同归；互不依赖。',
      ]),
      codeBlock(
        'css',
        `/* Inside every preset class: */
@media (prefers-reduced-motion: reduce) {
  &[data-state='open'],
  &[data-state='closed'] {
    animation: none;
  }
}`
      ),
      note([
        '卸载仍会等 settle——动画被禁用后，',
        code('whenExitSettles'),
        ' 看不到正时长便立即 resolve，于是 ',
        code('Presence'),
        ' 下一帧卸载。减少动效退化为即时切换，绝不会卡死。',
      ])
    ),
    sec(
      'rolling-your-own',
      '自己动手写预设',
      p([
        '每个元素一个预设——',
        code('animation'),
        ' 是单个 CSS 属性，同一元素上两个预设类无法合并关键帧；样式表顺序靠后的类整体获胜。要定制动效，请在自己的 Linaria 类里遵循预设形状：两个属性选择器、退场 forwards、一对 ',
        code('haze-motion-'),
        ' 前缀的关键帧（关键帧名一旦发射就共享全局 CSS 命名空间）、所有时长与缓动用 token、以及内嵌的减少动效塌缩。',
      ]),
      note([
        '让带 transform 的预设——',
        code('fadeScale'),
        ' 与 slide 系——远离 JS 定位的浮层面板。Popover/DropdownMenu/Tooltip 背后的两个定位层都用 ',
        code('getBoundingClientRect'),
        ' 测量面板，而那个矩形包含 transform：动画中的面板会毒化自己的定位数学。浮层表面用淡入；这就是 ',
        code('fade'),
        ' 不含 transform 的原因。',
      ])
    ),
  ],
  ui: {
    switchLabel: '切换动画卡片',
  },
};

/* ---------------------------------------------------------------------------
 * StreamingA11y guide. The two live demos (StreamingText replay, markdown
 * ChatMessage) stay in the page and arrive via slots; their captions,
 * demo copy and button labels come from blocks/ui.
 * ------------------------------------------------------------------------- */

const streamingA11yEn: GuideDoc = {
  title: 'Screen readers & streaming AI output',
  intro: [
    'Streaming answers arrive token by token: the DOM text grows dozens of times per second. Sighted users perceive that as text being typed. To a screen reader it is ',
    strong('silence'),
    ' — and this guide is about why, and about the announcement pattern haze-ui ships in ',
    code('StreamingText'),
    ' and ',
    code('ChatMessage'),
    ' to fix it. The same live-region semantics govern every transient state — toasts, async-loaded option lists, lazily expanding tree nodes — and the later sections collect those patterns too.',
  ],
  sections: [
    sec(
      'why-silent',
      'Why streaming output is silent',
      p([
        'Screen readers announce what they are made aware of. Editing text inside a normal element is not something they are made aware of: there is no event, no semantic difference between “the author wrote more” and “a script is mutating this node”. Browsers only forward text changes to assistive technology when the element declares itself a ',
        strong('live region'),
        ' — ',
        code('aria-live'),
        ' or a role that implies it, such as ',
        code('role="status"'),
        ' (polite) or ',
        code('role="alert"'),
        ' (assertive). Three rules matter for streaming:',
      ]),
      list(
        [
          strong('Only changes announce.'),
          ' Content that is already inside the region when it appears is treated as page content, not as news. The region must exist ',
          em('before'),
          ' the text starts growing — mounting it pre-filled announces nothing reliably.',
        ],
        [
          strong('Every mutation is an utterance.'),
          ' Appending one character restarts what the reader is saying. A 300-token answer streamed per-token into a live region is 300 interruptions, each starting the utterance over from wherever the reader\'s heuristics decide.',
        ],
        [
          strong('Politeness queues.'),
          ' ',
          code('role="status"'),
          ' waits for the current utterance; ',
          code('role="alert"'),
          ' barges in. Generated prose is never urgent enough to barge — assertive live regions are for “your session expired”, not for paragraphs.',
        ]
      ),
      p([
        'So the requirements pull in opposite directions: the reader must hear the stream (needs a live region) but must not be interrupted per token (needs restraint in how often the region changes).',
      ])
    ),
    sec(
      'haze-pattern',
      'The haze pattern',
      p([
        code('StreamingText'),
        ' renders exactly what it always did — memoized chunk spans and a blinking caret — and adds a visually hidden ',
        code('role="status"'),
        ' region that mirrors the stream on a ',
        strong('throttle'),
        ':',
      ]),
      codeBlock(
        'tsx',
        `<StreamingText
  text={answer}            // the full (still growing) answer
  speed={20}               // ms per visible character — unchanged
  announceInterval={1200}  // live-region cadence (default 1200ms)
/>`
      ),
      p([
        'The announcement lifecycle has three stages. On stream start the region receives a ',
        em('Generating'),
        ' cue (a real mutation, so it is announced — the region mounts empty). While the text grows, a snapshot of the current text replaces the region\'s content at most once per ',
        code('announceInterval'),
        ' — the reader hears the answer so far, as a whole utterance, about once per second. When the stream completes, the pending snapshot is cancelled and the complete final text is announced once; the region then settles and stays silent. Tune the cadence with ',
        code('announceInterval'),
        ': shorter means fresher progress and more interruptions, longer the reverse. The default of 1200\u00a0ms sits where most readers finish a sentence.',
      ]),
      slot('streaming-demo'),
      caption([
        'With a screen reader running you hear: the ',
        em('Generating'),
        ' cue, a fresh snapshot of the text roughly every 1.2\u00a0seconds while it grows, and the complete sentence once when the stream ends. Sighted users see the same text appear character by character — the announcements are a parallel channel, not a replacement.',
      ]),
      note([
        strong('aria-busy marks the content, not the root.'),
        ' While streaming, the content area carries ',
        code('aria-busy="true"'),
        ' so assistive tech knows the subtree is still mutating. The live region deliberately lives ',
        em('outside'),
        ' that subtree: announcements coming from inside an aria-busy element may be deferred until the flag clears, which would silence the very snapshots the region exists to deliver. Busy marks what is changing; the announcer sits beside it.',
      ])
    ),
    sec(
      'why-not-every-char',
      'Why not announce every character',
      p([
        'The naive fix — pouring the stream into a live region as it arrives — is worse than the silence it replaces. Each mutation makes the reader stop and restart; users hear fragments of beginnings (“The an… The ans… The answer is…”), lose their place, and often disable live regions for the site altogether. The strategies compare like this:',
      ]),
      table(
        ['strategy', 'what the reader hears', 'verdict'],
        [
          [
            'per-token mutation of a live region',
            'hundreds of restarted fragments',
            'harmful — interruption churn',
          ],
          [
            [code('role="status"'), ' + throttled snapshots'],
            'cue, then the text so far ~once per interval, then the finished answer',
            "haze's default",
          ],
          [
            'announce only on completion',
            'one long utterance at the end',
            [
              'calm, but a 30\u00a0s stream is 30\u00a0s of silence first — set a large ',
              code('announceInterval'),
              ' if your users prefer this',
            ],
          ],
        ]
      ),
      p([
        'A detail that makes snapshots usable: the region re-announces the ',
        em('whole'),
        ' text so far, not the delta (the ',
        code('status'),
        ' role implies ',
        code('aria-atomic'),
        '). The reader never has to reconstruct “what came before the last 30 characters”.',
      ])
    ),
    sec(
      'chat-message',
      'ChatMessage: streaming with your own renderer',
      p([
        code('StreamingText'),
        ' owns its typewriter effect. When you render the growing content yourself — plain text state, your own markdown pipeline — pass ',
        code('streaming'),
        ' to ',
        code('ChatMessage'),
        ' and it applies the same pattern to whatever the bubble contains: the bubble is marked ',
        code('aria-busy'),
        ', and a hidden status region snapshots the ',
        em('rendered'),
        ' text on the same 1200\u00a0ms cadence, announcing the complete message when you flip the flag off. User and system messages never get a region.',
      ]),
      slot('chat-demo'),
      caption([
        'The bubble carries ',
        code('aria-busy'),
        ' while ',
        code('streaming'),
        ' is set; the hidden live region snapshots the rendered markdown text (headers, emphasis and list markers become plain announced text) and speaks the finished message when the flag clears.',
      ]),
      note([
        strong('Do not double up.'),
        ' If the bubble\'s children already announce themselves — ',
        code('StreamingText'),
        ' inside a ',
        code('ChatMessage'),
        ' — leave ',
        code('streaming'),
        ' false. Two live regions saying the same text twice is its own kind of interruption churn. Pick exactly one announcer per message.',
      ]),
      p([
        'One contract rides along: the copy action and the snapshots read the bubble\'s ',
        em('visible'),
        ' text. Any descendant marked ',
        code('data-slot="live-region"'),
        ' is excluded, so announcements never leak into the clipboard and copied text is never doubled. Mark your own mirrors with the same attribute to opt into the exclusion.',
      ])
    ),
    sec(
      'markdown',
      'Markdown + streaming',
      p([
        code('MarkdownRenderer'),
        ' is a pure renderer — no timers, no announcement logic of its own; it stays silent and fast (blocks are memoized, so streaming re-parses only the growing tail block). Compose it under an announcer:',
      ]),
      codeBlock(
        'tsx',
        `// streaming markdown: the renderer re-parses only the tail
// block while ChatMessage handles aria-busy + announcements
<ChatMessage role="assistant" streaming={isGenerating}>
  <MarkdownRenderer content={partialMarkdown} />
</ChatMessage>

// typewriter-then-markdown: plain text streams in (announced by
// StreamingText), the formatted view replaces it once complete
{done
  ? <MarkdownRenderer content={answer} />
  : <StreamingText text={answer} speed={20} onComplete={() => setDone(true)} />}`
      ),
      p([
        'Either shape works. The first announces snapshots of the rendered text (headers and emphasis flatten to plain speech); the second announces the raw text while streaming and swaps in formatting silently at the end.',
      ])
    ),
    sec(
      'interruption-tiers',
      'Interruption tiers: status vs alert (Toast)',
      p([
        'Streaming prose is never urgent — but not every transient message is so polite, and an error toast may legitimately need to interrupt. The distinction is mechanical, not a matter of taste: ',
        code('role="status"'),
        ' is implicitly ',
        code('aria-live="polite"'),
        ' (it queues behind whatever is being said), while ',
        code('role="alert"'),
        ' is implicitly assertive (it barges in). haze-ui draws that line at exactly one variant: ',
        code('Toast'),
        ' maps every variant to ',
        code('status'),
        ' except ',
        code('danger'),
        ', which becomes ',
        code('alert'),
        ' — the only tier allowed to interrupt the reader.',
      ]),
      codeBlock(
        'tsx',
        `const liveRoles = {
  info: 'status',
  success: 'status',
  warning: 'status',
  danger: 'alert',   // the only assertive tier
  loading: 'status',
} as const;

// the toast root carries the role — each toast is its own live region
<div role={liveRoles[variant]} data-slot="toast">…</div>`
      ),
      p([
        'Two structural rules keep announcements single. First, each toast element is its own live region, so the fixed stack ',
        code('ToastContainer'),
        ' renders must not add ',
        code('aria-live'),
        ' or a live role of its own — a region wrapping a region announces the same toast twice, once per mutation. Second, the ',
        code('loading'),
        ' variant\u2019s spinner glyph is ',
        code('aria-hidden'),
        ' art: the toast root already speaks, so a nested ',
        code('role="status"'),
        ' glyph would add a second voice saying “loading” on top of the message. The Accessibility guide\u2019s ARIA pattern table summarizes this family as its Alert / Status row.',
      ])
    ),
    sec(
      'async-loading',
      'Async option loading: busy, never a lie (Select, Combobox, Cascader)',
      p([
        'Remote option lists put a picker panel in the same transient state a stream does: the data is not there yet and what is on screen is stale. The contract haze-ui applies across the three remote-capable pickers: the mutating surface carries ',
        code('aria-busy'),
        ', a ',
        code('Spinner'),
        ' (itself ',
        code('role="status"'),
        ') stands in for the list, and local filtering is ',
        em('suspended'),
        ' while loading — filtering the stale options against the just-typed query and showing “no results” would be a lie. The honest answer is “not here yet”.',
      ]),
      codeBlock(
        'tsx',
        `<Select loading={isSearching} onSearch={(q) => search(q)}>
  {remoteOptions.map((o) => (
    <Option key={o.value} value={o.value}>{o.label}</Option>
  ))}
</Select>

// while loading: panel is busy, the spinner replaces the list, and the
// list's semantic role is suppressed — a Spinner block inside a
// role="listbox" would be an aria-required-children violation
<FloatingPanel aria-busy={loading || undefined}>
  {hasVisibleOptions ? optionsList : <Spinner size="sm" />}
</FloatingPanel>`
      ),
      p([
        'Where ',
        code('aria-busy'),
        ' lands is per-component honesty: ',
        code('Combobox'),
        ' puts it on the combobox input itself (the input\u2019s list is what is pending); ',
        code('Select'),
        ' and ',
        code('Cascader'),
        ' put it on the floating panel, and while it is set the list\u2019s semantic role is suppressed so the panel says “busy”, not “here is a list of one spinner”. Keyboard navigation stays inert until loading clears — there is nothing to navigate yet, and arrow keys waking a half-populated list read as a bug, not progress.',
      ])
    ),
    sec(
      'lazy-tree',
      'Lazy tree nodes: busy at the node (Tree)',
      p([
        'A lazily loaded tree node is the same pattern at its smallest unit. When ',
        code('loadData'),
        ' is fetching a node\u2019s children, the ',
        code('aria-busy'),
        ' flag goes on that node\u2019s ',
        code('treeitem'),
        ' — not on the tree — so the rest of the tree stays readable and navigable while the one expanding node waits. ',
        code('aria-expanded'),
        ' already reports the requested state; ',
        code('aria-busy'),
        ' adds “and the children are not there yet”.',
      ]),
      codeBlock(
        'tsx',
        `<Tree
  loadData={(node) => fetchChildren(node.key)}
  treeData={lazyRoot}
/>

// the expanding treeitem while its children are in flight
<div
  role="treeitem"
  aria-expanded={expanded}
  aria-busy={loading || undefined}
/>`
      ),
      note([
        strong('Busy marks the smallest mutating scope.'),
        ' That is the shared shape of all five patterns: aria-busy on the thing that is actually changing (the content area, the toast, the panel, the node), never on a container large enough to silence siblings that are already fine.',
      ])
    ),
    sec(
      'rolling-your-own',
      'Rolling your own',
      p([
        'The pattern is four moves and works in any stack — a hidden status region mounted empty before the stream starts, a throttled mirror of the visible text, aria-busy on the changing content only, and a final full announcement:',
      ]),
      codeBlock(
        'tsx',
        `const srOnly = \`position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0, 0, 0, 0); clip-path: inset(50%);
  white-space: nowrap; border: 0;\`;

function StreamedAnswer({ text, done }: { text: string; done: boolean }) {
  const [announced, setAnnounced] = useState('');

  useEffect(() => {
    if (done) {
      // final utterance: the complete text, exactly once
      setAnnounced(text);
      return;
    }
    setAnnounced('Generating');               // cue = a real mutation
    const id = setInterval(                   // trailing-edge throttle
      () => setAnnounced(text),
      1200,
    );
    return () => clearInterval(id);
  }, [done, text]);

  return (
    <>
      <span role="status" data-slot="live-region" style={srOnly}>
        {announced}
      </span>
      <div aria-busy={done ? undefined : true}>{text}</div>
    </>
  );
}`
      ),
      p([
        'The details that separate a working version from a broken one: the region exists before the first token (never mounted pre-filled), its mutations happen ',
        em('outside'),
        ' the ',
        code('aria-busy'),
        ' subtree, the cue and the snapshots are separate mutations so both are spoken, and the completion write cancels any pending snapshot so nothing is said twice. Mirror the ',
        code('data-slot="live-region"'),
        ' attribute so text-extraction helpers can skip your announcer.',
      ])
    ),
    sec(
      'edge-notes',
      'Edge notes',
      list(
        [
          strong('Reduced motion does not apply — but check it anyway.'),
          ' ',
          code('prefers-reduced-motion'),
          ' governs animation; speech cadence is not motion, and StreamingText announces identically with it set (the blinking caret itself already collapses under reduced motion). What reduced-motion users may still want is a ',
          em('calmer'),
          ' cadence — expose your ',
          code('announceInterval'),
          ' and let app code widen it from a ',
          code('matchMedia'),
          ' check if you like.',
        ],
        [
          strong('Spoilers.'),
          ' A live region reads text the moment it arrives — glanceable UIs (quiz answers, surprise reveals, spoiler-tagged chat) should not stream into announcements at all. Announce a neutral summary on completion instead, and keep the revealing text out of live regions entirely.',
        ],
        [
          strong('The cue is localized.'),
          ' The ',
          em('Generating'),
          ' hint comes from the ',
          code('streamingText'),
          ' section of the locale packs — override or translate it like any other copy:',
        ]
      ),
      codeBlock(
        'tsx',
        `<LocaleProvider
  locale="fr-FR"
  strings={{ streamingText: { generating: 'Réponse en préparation' } }}
/>`
      )
    ),
  ],
  ui: {
    replayLabel: 'Replay stream',
    generateLabel: 'Generate reply',
    waitingHint: 'waiting…',
    streamText:
      'A live region is a plain element you promise to update. Screen readers do not watch DOM text by default, so a growing answer is just pixels moving — unless the element says otherwise.',
    markdownSource: [
      '### Markdown while streaming',
      '',
      'Blocks finalize at **blank lines**, so only the tail block re-renders as tokens arrive.',
      '',
      '- the parser is memoized per block',
      '- code and lists stream in like any other block',
    ].join('\n'),
  },
};

const streamingA11yZh: GuideDoc = {
  title: '屏幕阅读器与流式 AI 输出',
  intro: [
    '流式回答逐 token 到达：DOM 文本每秒增长几十次。明眼用户感知为文字正在被打出来。对屏幕阅读器而言这是',
    strong('沉默'),
    '——本指南讲清原委，也讲 haze-ui 在 ',
    code('StreamingText'),
    ' 与 ',
    code('ChatMessage'),
    ' 里内置的播报模式如何修复它。同一套 live-region 语义管辖一切瞬态——toast、异步加载的选项列表、懒展开的树节点——后面的小节也收录这些模式。',
  ],
  sections: [
    sec(
      'why-silent',
      '为什么流式输出是沉默的',
      p([
        '屏幕阅读器只播报它被告知的东西。在普通元素里编辑文本不在被告知之列：没有事件，「作者又写了」与「脚本正在改这个节点」之间没有语义差别。浏览器只在元素声明自己是',
        strong('live region'),
        '时才把文本变化转发给辅助技术——',
        code('aria-live'),
        '，或一个隐含它的 role，比如 ',
        code('role="status"'),
        '（polite）或 ',
        code('role="alert"'),
        '（assertive）。对流式而言有三条规则要紧：',
      ]),
      list(
        [
          strong('只有变化会被播报。'),
          '区域出现时就已在其中的内容被当作页面内容而非新闻。区域必须在文本开始增长',
          em('之前'),
          '存在——预填充地挂载它什么也可靠地播报不了。',
        ],
        [
          strong('每次变更都是一次话语。'),
          '追加一个字符都会打断阅读器正在说的话。300 token 的回答按 token 流进 live region 是 300 次打断，每次都从阅读器启发式决定的任意位置重新开始这句话。',
        ],
        [
          strong('礼貌级别排队。'),
          code('role="status"'),
          ' 等当前话语说完；',
          code('role="alert"'),
          ' 插队打断。生成的散文永远没有急到要插队——assertive live region 是给「你的会话已过期」用的，不是给段落用的。',
        ]
      ),
      p([
        '于是需求互相拉扯：阅读器必须听得到流（需要 live region），又不能逐 token 被打断（需要克制区域变化的频率）。',
      ])
    ),
    sec(
      'haze-pattern',
      'haze 的模式',
      p([
        code('StreamingText'),
        ' 的渲染一如既往——记忆化的分块 span 与闪烁光标——并追加一个视觉隐藏的 ',
        code('role="status"'),
        ' 区域，以',
        strong('节流'),
        '方式镜像流：',
      ]),
      codeBlock(
        'tsx',
        `<StreamingText
  text={answer}            // the full (still growing) answer
  speed={20}               // ms per visible character — unchanged
  announceInterval={1200}  // live-region cadence (default 1200ms)
/>`
      ),
      p([
        '播报生命周期分三阶段。流开始时区域收到 ',
        em('Generating'),
        ' 提示（一次真实变更，所以会被播报——区域挂载时为空）。文本增长期间，当前文本的快照至多每 ',
        code('announceInterval'),
        ' 一次替换区域内容——阅读器大约每秒一次、以完整话语听到目前为止的回答。流完成时，待发快照被取消，完整终文被播报一次；区域随即安定并保持沉默。用 ',
        code('announceInterval'),
        ' 调节节奏：更短意味着更新的进度与更多的打断，更长则相反。默认的 1200ms 落在多数阅读器读完一句话的位置。',
      ]),
      slot('streaming-demo'),
      caption([
        '开着屏幕阅读器时你会听到：',
        em('Generating'),
        ' 提示、流增长期间大约每 1.2 秒一次的最新文本快照、以及流结束时完整句子的一次播报。明眼用户看到的是同样的文本逐字出现——播报是一条并行通道，不是替代。',
      ]),
      note([
        strong('aria-busy 标在内容上，不标在根上。'),
        '流式进行中，内容区域携带 ',
        code('aria-busy="true"'),
        '，辅助技术由此知道子树仍在变化。live region 刻意住在该子树',
        em('之外'),
        '：来自 aria-busy 元素内部的播报可能被推迟到标志清除，那会恰恰噤声区域存在的意义所在的那些快照。busy 标记正在变化的东西；播报器坐在它旁边。',
      ])
    ),
    sec(
      'why-not-every-char',
      '为什么不能逐字符播报',
      p([
        '天真的修法——把流原样倒进 live region——比它取代的沉默更糟。每次变更都让阅读器停下重来；用户听到支离的开头（“The an… The ans… The answer is…”），找不到自己的位置，还常常干脆为整站关掉 live region。各策略对比如下：',
      ]),
      table(
        ['策略', '读者听到', '结论'],
        [
          [
            '逐 token 变更 live region',
            '几百次从头再来的碎片',
            '有害——打断扰动',
          ],
          [
            [code('role="status"'), ' + 节流快照'],
            '提示，随后约每间隔一次的当前文本，最后是完整回答',
            'haze 的默认值',
          ],
          [
            '仅在完成时播报',
            '结尾一次长话语',
            [
              '平静，但 30 秒的流先要 30 秒的沉默——若你的用户偏好如此，设一个大的 ',
              code('announceInterval'),
            ],
          ],
        ]
      ),
      p([
        '一个让快照可用的细节：区域重新播报到目前为止的',
        em('全部'),
        '文本而非增量（',
        code('status'),
        ' role 隐含 ',
        code('aria-atomic'),
        '）。阅读器永远不必重建「最后 30 个字符之前是什么」。',
      ])
    ),
    sec(
      'chat-message',
      'ChatMessage：用你自己的渲染器流式',
      p([
        code('StreamingText'),
        ' 自带打字机效果。当你自己渲染增长的内容——纯文本 state、你自己的 markdown 管线——把 ',
        code('streaming'),
        ' 传给 ',
        code('ChatMessage'),
        '，它对气泡里的任何内容套用同一模式：气泡标上 ',
        code('aria-busy'),
        '，一个隐藏的 status 区域按同样的 1200ms 节奏快照',
        em('渲染后'),
        '的文本，并在你翻转标志关闭时播报完整消息。用户与系统消息永远没有区域。',
      ]),
      slot('chat-demo'),
      caption([
        '设置 ',
        code('streaming'),
        ' 期间气泡携带 ',
        code('aria-busy'),
        '；隐藏的 live region 对渲染后的 markdown 文本做快照（标题、强调与列表标记变成普通的播报文本），并在标志清除时说出完成的消息。',
      ]),
      note([
        strong('不要叠加。'),
        '若气泡的 children 已能自行播报——',
        code('ChatMessage'),
        ' 里的 ',
        code('StreamingText'),
        '——就让 ',
        code('streaming'),
        ' 保持 false。两个 live region 把同一段文本说两遍是另一种打断扰动。每条消息只选一个播报器。',
      ]),
      p([
        '还有一条契约随行：复制动作与快照读取的是气泡的',
        em('可见'),
        '文本。任何标了 ',
        code('data-slot="live-region"'),
        ' 的后代都被排除，播报不泄漏进剪贴板，复制文本不加倍。给你自己的镜像标同一属性即可加入排除。',
      ])
    ),
    sec(
      'markdown',
      'Markdown + 流式',
      p([
        code('MarkdownRenderer'),
        ' 是纯渲染器——没有计时器、没有自己的播报逻辑；它保持沉默与快速（分块记忆化，流式只重解析增长中的尾部块）。把它组合在播报器之下：',
      ]),
      codeBlock(
        'tsx',
        `// streaming markdown: the renderer re-parses only the tail
// block while ChatMessage handles aria-busy + announcements
<ChatMessage role="assistant" streaming={isGenerating}>
  <MarkdownRenderer content={partialMarkdown} />
</ChatMessage>

// typewriter-then-markdown: plain text streams in (announced by
// StreamingText), the formatted view replaces it once complete
{done
  ? <MarkdownRenderer content={answer} />
  : <StreamingText text={answer} speed={20} onComplete={() => setDone(true)} />}`
      ),
      p([
        '两种形状都可行。第一种播报渲染后文本的快照（标题与强调摊平为普通语音）；第二种在流式期间播报原始文本，结尾静默换上排版。',
      ])
    ),
    sec(
      'interruption-tiers',
      '打断分级：status 对 alert（Toast）',
      p([
        '流式散文永远不急——但并非所有瞬态消息都这么客气，错误 toast 可能正当需要打断。这个区分是机械的而非品味问题：',
        code('role="status"'),
        ' 隐含 ',
        code('aria-live="polite"'),
        '（排在正被说的话后面），而 ',
        code('role="alert"'),
        ' 隐含 assertive（插队）。haze-ui 恰好在一个变体上划这条线：',
        code('Toast'),
        ' 把每个变体映射到 ',
        code('status'),
        '，唯独 ',
        code('danger'),
        ' 成为 ',
        code('alert'),
        '——唯一被允许打断阅读器的层级。',
      ]),
      codeBlock(
        'tsx',
        `const liveRoles = {
  info: 'status',
  success: 'status',
  warning: 'status',
  danger: 'alert',   // the only assertive tier
  loading: 'status',
} as const;

// the toast root carries the role — each toast is its own live region
<div role={liveRoles[variant]} data-slot="toast">…</div>`
      ),
      p([
        '两条结构规则保证播报单一。其一，每个 toast 元素自己是 live region，因此固定的 ',
        code('ToastContainer'),
        ' 渲染的堆栈绝不能再加自己的 ',
        code('aria-live'),
        ' 或 live role——区域包区域会把同一个 toast 播报两遍，每次变更一遍。其二，',
        code('loading'),
        ' 变体的 spinner 字形是 ',
        code('aria-hidden'),
        ' 的装饰：toast 根自己会说话，嵌套的 ',
        code('role="status"'),
        ' 字形会在消息之上加第二嗓子说「loading」。无障碍指南的 ARIA 模式表以 Alert / Status 行归纳这一族。',
      ])
    ),
    sec(
      'async-loading',
      '异步选项加载：busy，绝不撒谎（Select、Combobox、Cascader）',
      p([
        '远程选项列表把选择面板放进与流相同的瞬态：数据未到，屏幕上是陈旧的。haze-ui 对三个可远程选择器统一契约：变化中的表面携带 ',
        code('aria-busy'),
        '，一个 ',
        code('Spinner'),
        '（本身是 ',
        code('role="status"'),
        '）顶替列表，且加载期间本地过滤被',
        em('挂起'),
        '——拿刚输入的查询过滤陈旧选项再显示「无结果」是在撒谎。诚实的答案是「还没到」。',
      ]),
      codeBlock(
        'tsx',
        `<Select loading={isSearching} onSearch={(q) => search(q)}>
  {remoteOptions.map((o) => (
    <Option key={o.value} value={o.value}>{o.label}</Option>
  ))}
</Select>

// while loading: panel is busy, the spinner replaces the list, and the
// list's semantic role is suppressed — a Spinner block inside a
// role="listbox" would be an aria-required-children violation
<FloatingPanel aria-busy={loading || undefined}>
  {hasVisibleOptions ? optionsList : <Spinner size="sm" />}
</FloatingPanel>`
      ),
      p([
        code('aria-busy'),
        ' 落在哪里是逐组件的诚实：',
        code('Combobox'),
        ' 放在 combobox 输入框本身（输入框的列表才是待定的东西）；',
        code('Select'),
        ' 与 ',
        code('Cascader'),
        ' 放在浮层面板上，且在其置位期间列表的语义 role 被抑制，让面板说「忙」而不是「这是一列只有一个 spinner」。键盘导航在加载清除前保持惰性——还没什么可导航的，方向键唤醒半满列表读起来像 bug 而非进展。',
      ])
    ),
    sec(
      'lazy-tree',
      '懒加载树节点：忙在节点上（Tree）',
      p([
        '懒加载的树节点是同一模式的最小单元。当 ',
        code('loadData'),
        ' 拉取某节点的子级时，',
        code('aria-busy'),
        ' 标志落在那个节点的 ',
        code('treeitem'),
        ' 上——而不是树上——于是其余部分保持可读可导航，只有一个展开中的节点在等。',
        code('aria-expanded'),
        ' 已报告请求的状态；',
        code('aria-busy'),
        ' 补上「子级还没到」。',
      ]),
      codeBlock(
        'tsx',
        `<Tree
  loadData={(node) => fetchChildren(node.key)}
  treeData={lazyRoot}
/>

// the expanding treeitem while its children are in flight
<div
  role="treeitem"
  aria-expanded={expanded}
  aria-busy={loading || undefined}
/>`
      ),
      note([
        strong('busy 标记最小的变化范围。'),
        '这是全部五个模式的共同形状：aria-busy 标在真正变化的东西上（内容区、toast、面板、节点），绝不标在大到会噤声本已无恙的兄弟节点的容器上。',
      ])
    ),
    sec(
      'rolling-your-own',
      '自己动手写',
      p([
        '这个模式是四个动作，适用于任何技术栈——流开始前挂载一个空的隐藏 status 区域、可见文本的节流镜像、只在变化的内容上标 aria-busy、以及一次完整的终局播报：',
      ]),
      codeBlock(
        'tsx',
        `const srOnly = \`position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0, 0, 0, 0); clip-path: inset(50%);
  white-space: nowrap; border: 0;\`;

function StreamedAnswer({ text, done }: { text: string; done: boolean }) {
  const [announced, setAnnounced] = useState('');

  useEffect(() => {
    if (done) {
      // final utterance: the complete text, exactly once
      setAnnounced(text);
      return;
    }
    setAnnounced('Generating');               // cue = a real mutation
    const id = setInterval(                   // trailing-edge throttle
      () => setAnnounced(text),
      1200,
    );
    return () => clearInterval(id);
  }, [done, text]);

  return (
    <>
      <span role="status" data-slot="live-region" style={srOnly}>
        {announced}
      </span>
      <div aria-busy={done ? undefined : true}>{text}</div>
    </>
  );
}`
      ),
      p([
        '区分可用与破损版本的细节：区域在第一个 token 之前就存在（绝不预填充挂载）、它的变更发生在 ',
        code('aria-busy'),
        ' 子树',
        em('之外'),
        '、提示与快照是分开的变更所以都会被说出、完成时的写入取消一切待发快照所以没有话被说两遍。镜像 ',
        code('data-slot="live-region"'),
        ' 属性，文本提取助手就能跳过你的播报器。',
      ])
    ),
    sec(
      'edge-notes',
      '边角备注',
      list(
        [
          strong('减少动效不适用——但还是检查一下。'),
          code('prefers-reduced-motion'),
          ' 管动画；语音节奏不是动效，StreamingText 在其置位时播报完全相同（闪烁光标本身已在减少动效下塌缩）。减少动效用户可能仍想要更平静的节奏——暴露你的 ',
          code('announceInterval'),
          '，让应用代码酌情从 ',
          code('matchMedia'),
          ' 检查放宽它。',
        ],
        [
          strong('剧透。'),
          'live region 在文本到达的瞬间就读出来——可扫读的 UI（测验答案、惊喜揭晓、剧透标记的聊天）根本不该流进播报。改为完成时播报一段中性摘要，并把揭示性文本完全排除在 live region 之外。',
        ],
        [
          strong('提示是本地化的。'),
          em('Generating'),
          ' 提示来自 locale pack 的 ',
          code('streamingText'),
          ' 一节——像任何其他文案一样覆写或翻译它：',
        ]
      ),
      codeBlock(
        'tsx',
        `<LocaleProvider
  locale="fr-FR"
  strings={{ streamingText: { generating: 'Réponse en préparation' } }}
/>`
      )
    ),
  ],
  ui: {
    replayLabel: '重放流',
    generateLabel: '生成回复',
    waitingHint: '等待中…',
    streamText:
      '实时区域是一个你承诺会更新的普通元素。屏幕阅读器默认不监视 DOM 文本，所以一个不断变长的回答只是像素在动——除非元素自己另有声明。',
    markdownSource: [
      '### 流式中的 Markdown',
      '',
      '分块在**空行**处定稿，因此 token 到达时只有尾部块在重渲染。',
      '',
      '- 解析器按块记忆化',
      '- 代码与列表像其他块一样流入',
    ].join('\n'),
  },
};

/* ---------------------------------------------------------------------------
 * Server-actions guide — React 19 <form action> / useActionState /
 * useOptimistic over haze-ui's native-form bridge. Every claim is
 * verified against src/lib/utils/native-form.tsx (the hidden/clipped
 * input bridges) and the form layer's action channel (react-f0rm's
 * <Form action> + ActionErrorResult); examples/nextjs/app/actions-demo
 * runs the same wiring against a real 'use server' module.
 * ------------------------------------------------------------------------- */

const serverActionsEn: GuideDoc = {
  title: 'React 19 Actions × haze-ui',
  intro: [
    'React 19 turns the ',
    code('<form>'),
    ' element into an async state machine: ',
    code('action'),
    ' props accept server functions, ',
    code('useActionState'),
    ' wraps them with pending and error state, and ',
    code('useOptimistic'),
    ' paints the next value before the round trip lands. haze-ui is built to sit inside that machine: every value-holding component ships a native FormData bridge, the form layer speaks server-action results natively, and the controllable-state pattern gives optimistic UI a single write channel. The three sections below wire it all together — the ',
    link(
      'examples/nextjs actions-demo route',
      'https://github.com/wmzy/haze-ui/tree/main/examples/nextjs/app/actions-demo'
    ),
    ' runs the same code against a real ',
    code("'use server'"),
    ' module.',
  ],
  sections: [
    sec(
      'native-form-actions',
      'Server actions over native FormData',
      p([
        'A React 19 form action is the most vanilla thing in the world: ',
        code('<form action={createProfile}>'),
        ' where ',
        code('createProfile'),
        ' is a ',
        code("'use server'"),
        ' function receiving the ',
        code('FormData'),
        ' the browser built from the form’s successful controls. No serialization layer, no client state mirror — and since the form still works as a plain POST, it submits even before hydration.',
      ]),
      p([
        'That contract is native, and haze-ui meets it natively. Components that already render a real field element — ',
        code('Input'),
        ', ',
        code('Checkbox'),
        ', ',
        code('Radio'),
        ', ',
        code('Slider'),
        '’s ',
        code("input[type='range']"),
        ', ',
        code('FileInput'),
        ' — submit through it directly: give them a ',
        code('name'),
        ' and they are done. Components whose visual control is not a field (',
        code('Switch'),
        ' renders a ',
        code('<button>'),
        ', ',
        code('Rating'),
        ' renders stars, ',
        code('Select'),
        ' floats its options) cannot rely on that — so when given a ',
        code('name'),
        ' they render a bridge: a hidden or clipped native input carrying the same name, kept in sync with the component value (',
        code('src/lib/utils/native-form.tsx'),
        ').',
      ]),
      table(
        ['Component', 'What FormData sees'],
        [
          [
            [code('Input'), ', ', code('Checkbox'), ', ', code('Radio'), ', ', code('Slider'), ', ', code('FileInput')],
            ['A real field element carries ', code('name'), ' — nothing extra to wire.'],
          ],
          [
            [code('Switch')],
            ['Clipped checkbox bridge: submits ', code('on'), ' while checked, nothing while unchecked (the native successful-control rule).'],
          ],
          [
            [code('Rating')],
            ['Hidden field with ', code('String(value)'), '; the ', code('0'), '-star sentinel submits nothing.'],
          ],
          [
            [code('Select'), ' (single)'],
            ['Hidden field with the value; the ', code("''"), ' no-selection sentinel submits nothing.'],
          ],
          [
            [code('Select'), ' (multiple / tags), ', code('TagInput')],
            ['One hidden input per value under the same name — read with ', code('formData.getAll(name)'), '.'],
          ],
          [
            [code('Segmented'), ', ', code('ColorPicker'), ', ', code('OTPInput'), ', ', code('RichTextEditor')],
            ['The same hidden-field bridge — every value component without a native field.'],
          ],
        ]
      ),
      codeBlock(
        'tsx',
        `// app/actions.ts
'use server';

export async function createProfile(formData: FormData) {
  const title = String(formData.get('title') ?? '');
  const role = String(formData.get('role') ?? '');         // '' — nothing picked
  const subscribe = formData.get('subscribe') === 'on';    // absent when off
  const rating = Number(formData.get('rating') ?? 0) || 0; // absent at 0 stars
  const tags = formData.getAll('tags').map(String);        // repeated field

  await saveProfile({ title, role, subscribe, rating, tags });
}`
      ),
      codeBlock(
        'tsx',
        `import { Button, Input, Option, Rating, Select, Switch, TagInput } from 'haze-ui';

export function ProfileForm({
  createProfile,
}: {
  createProfile: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={createProfile}>
      <Input name='title' required placeholder='Project title' />
      <Select name='role' value=''>
        <Option value=''>Pick a role…</Option>
        <Option value='admin'>Admin</Option>
        <Option value='editor'>Editor</Option>
      </Select>
      <label>
        <Switch name='subscribe' /> Email updates
      </label>
      <Rating name='rating' value={0} />
      <TagInput name='tags' value={[]} placeholder='Add tag…' />
      <Button onClick={(e) => e.currentTarget.form?.requestSubmit()}>
        Create profile
      </Button>
    </form>
  );
}`
      ),
      caption([
        code('value={…}'),
        ' with a plain value is the uncontrolled ',
        em('initial'),
        ' — the ControlOrValue convention. That is exactly what a form-action form wants: the DOM owns the field state, the action reads it once, on submit. (haze ',
        code('Button'),
        ' always renders ',
        code("type='button'"),
        ' — drive the form with ',
        code("onClick={(e) => e.currentTarget.form?.requestSubmit()}"),
        ': ',
        code('requestSubmit()'),
        ' runs native constraint validation and the action pipeline, unlike ',
        code('form.submit()'),
        '.)',
      ]),
      slot('native-demo'),
      note([
        strong('The bridge is invisible and non-interactive.'),
        ' Bridge inputs are ',
        code('readOnly'),
        ' + ',
        code('tabIndex={-1}'),
        ' + ',
        code('aria-hidden'),
        ' — they never join the tab order or the accessibility tree; only FormData sees them. Read the absences, not just the values: an unchecked ',
        code('Switch'),
        ' is ',
        em('missing'),
        ' from the payload (never ',
        code("'off'"),
        '), and so are an empty ',
        code('Select'),
        ', a 0-star ',
        code('Rating'),
        ' and an empty ',
        code('TagInput'),
        '.',
      ])
    ),
    sec(
      'use-action-state',
      'useActionState: pending and server errors',
      p([
        code('useActionState'),
        ' wraps a form action with the previous result, a dispatch function and a pending flag: ',
        code('const [state, formAction, pending] = useActionState(action, initialState)'),
        '. Point it at a server action that returns a result object and the whole submit lifecycle — dispatch, awaited flight, state commit — is React’s. Because ',
        code('formAction'),
        ' is passed straight to ',
        code("action"),
        ', a ',
        code("'use server'"),
        ' action keeps submitting before hydration here too.',
      ]),
      codeBlock(
        'tsx',
        `import { useActionState } from 'react';
import { Button, Input } from 'haze-ui';

type State = { error?: string; saved?: string };

export function SettingsForm() {
  const [state, formAction, pending] = useActionState(saveSettings, {});

  return (
    <form action={formAction}>
      <Input name='email' required placeholder='you@work.dev' />
      {state.error && (
        <p role='alert' aria-live='polite'>
          {state.error}
        </p>
      )}
      <Button
        loading={pending}
        onClick={(e) => e.currentTarget.form?.requestSubmit()}
      >
        Save settings
      </Button>
      {state.saved && <p>{state.saved}</p>}
    </form>
  );
}

// app/actions.ts
'use server';

export async function saveSettings(
  _prev: State,
  formData: FormData
): Promise<State> {
  const email = String(formData.get('email') ?? '');
  await new Promise((resolve) => setTimeout(resolve, 600)); // fake latency
  if (email.endsWith('@taken.dev')) {
    return { error: 'That address is already registered.' };
  }
  return { saved: 'Saved ' + email };
}`
      ),
      p([
        code('Button'),
        '’s ',
        code('loading'),
        ' prop is the pending surface: pass the flag straight through and the control disables itself, sets ',
        code('aria-busy'),
        ' and swaps in a spinner. Errors ride the state object — render them with ',
        code("role='alert'"),
        ' so assistive tech hears the rejection.',
      ]),
      h3('The react-f0rm channel'),
      p([
        'When a form outgrows a handful of fields, haze-ui’s form layer takes the plumbing: ',
        code('Form'),
        ' and ',
        code('FormItem'),
        ', re-exported from ',
        code("'haze-ui'"),
        '. ',
        code('Form'),
        ' has its own ',
        code('action'),
        ' prop that speaks server actions natively — it hands the action ',
        em('validated'),
        ' FormData built from the form’s values (files, arrays and nested objects included), and it understands rejection: return ',
        code('{ errors: { email: "…" } }'),
        ' from the action and the record lands as per-field ',
        code("type: 'server'"),
        ' errors, rendered by the matching ',
        code('FormItem'),
        '’s error span exactly like failed client validation.',
      ]),
      codeBlock(
        'tsx',
        `import {
  Button,
  Form,
  FormItem,
  InputCore,
  Option,
  SelectCore,
  useForm,
} from 'haze-ui';
import { useIsSubmitting } from 'react-f0rm';

type MemberValues = { email: string; role: string };

// app/actions.ts
// 'use server';
// export async function saveMember(formData: FormData) {
//   const email = String(formData.get('email') ?? '');
//   if (email.endsWith('@taken.dev')) {
//     return { errors: { email: 'That address is already registered.' } };
//   }
//   await db.members.save({
//     email,
//     role: String(formData.get('role') ?? ''),
//   });
// }

export function MemberForm({
  saveMember,
}: {
  saveMember: (
    formData: FormData
  ) => Promise<{ errors?: Record<string, string | string[]> } | void>;
}) {
  const form = useForm<MemberValues>({
    initialValues: { email: '', role: 'admin' },
  });
  const submitting = useIsSubmitting(form);

  // @types/react's own 'action' typing demands a void return; f0rm reads
  // the '{ errors }' rejection off the resolved value - one cast at the seam
  const memberAction = saveMember as unknown as (
    formData: FormData
  ) => Promise<void>;

  return (
    <Form form={form} action={memberAction}>
      <FormItem
        form={form}
        name='email'
        label='Email'
        rules={{ required: 'Email is required' }}
        mode='onBlur'
        input={InputCore}
      />
      <FormItem form={form} name='role' label='Role' input={SelectCore}>
        <Option value='admin'>Admin</Option>
        <Option value='editor'>Editor</Option>
      </FormItem>
      <Button
        loading={submitting}
        onClick={(e) => e.currentTarget.form?.requestSubmit()}
      >
        Save member
      </Button>
    </Form>
  );
}`
      ),
      note([
        code('setServerErrors'),
        ' (re-exported from ',
        code("'haze-ui'"),
        ') lands plain REST responses the same way — ',
        code('setServerErrors(form, { email: ["already taken"] })'),
        ' — and a retry clears the previous round automatically, so each attempt is judged fresh. ',
        code('useIsSubmitting'),
        ' is the subscription hook behind ',
        code('form.isSubmitting'),
        '; it comes from ',
        code('react-f0rm'),
        ', haze-ui’s form engine, which form users already depend on.',
      ]),
      slot('action-state-demo')
    ),
    sec(
      'use-optimistic',
      'useOptimistic: optimistic edits with rollback',
      p([
        code('useOptimistic'),
        ' holds a shadow of the server’s state. While no transition is in flight the shadow ',
        em('is'),
        ' the state you passed (React returns your own argument); inside one, calling the optimistic setter swaps in whatever your reducer computed, until the transition settles — then React discards the shadow and re-renders from the source. Rollback is not code you write: it is what happens when the action ends without updating the source.',
      ]),
      p([
        'The haze-ui side is the controllable-state pattern. The component must ',
        em('track'),
        ' the shadow, and a plain value cannot — plain values are uncontrolled ',
        em('initials'),
        ', later prop changes are ignored. So hold the durable state with ',
        code('useControl'),
        ' (the control it returns is identity-stable), then point its read at the shadow and its write at the flight with ',
        code('useThru'),
        ': the component now reads optimistic values, and its own edits start the transition — without knowing anything is optimistic.',
      ]),
      h3('InlineEdit'),
      codeBlock(
        'tsx',
        `import { startTransition, useOptimistic } from 'react';
import type { SetStateAction } from 'react';
import { useControl, useThru } from 'react-use-control';
import { InlineEdit } from 'haze-ui';

export function DisplayName({ initial }: { initial: string }) {
  const [name, setName, nameCtrl] = useControl(undefined, initial);
  const [shown, markRenamed] = useOptimistic(
    name,
    (_committed, next: string) => next
  );

  function commitRename(next: SetStateAction<string>) {
    const value = typeof next === 'function' ? next(name) : next;
    startTransition(async () => {
      markRenamed(value);                    // optimistic paint
      const error = await renameAction(value); // 'use server'
      if (error) return;  // settle without writing -> automatic rollback
      setName(value);     // durable — the shadow collapses onto it
    });
  }

  // what InlineEdit sees: the shadow on read, the flight on write
  const optimisticCtrl = useThru(
    nameCtrl,
    () => [shown, commitRename]
  );

  return <InlineEdit value={optimisticCtrl} />;
}`
      ),
      h3('TagInput'),
      codeBlock(
        'tsx',
        `import { startTransition, useOptimistic } from 'react';
import type { SetStateAction } from 'react';
import { useControl, useThru } from 'react-use-control';
import { TagInput } from 'haze-ui';

export function TagEditor({ initial }: { initial: string[] }) {
  const [tags, setTags, tagsCtrl] = useControl(undefined, initial);
  const [shown, markTags] = useOptimistic(
    tags,
    (_committed, next: string[]) => next
  );

  // TagInput's onChange emits the whole next list, so the reducer just
  // forwards it — adds, removals and reorderings all roll through
  function commitTags(next: SetStateAction<string[]>) {
    const value = typeof next === 'function' ? next(tags) : next;
    startTransition(async () => {
      markTags(value);
      const ok = await saveTagsAction(value); // 'use server'
      if (!ok) return;    // settle without writing -> automatic rollback
      setTags(value);
    });
  }

  const optimisticCtrl = useThru(tagsCtrl, () => [shown, commitTags]);

  // name='tags' keeps the FormData bridge alive too
  return <TagInput name='tags' value={optimisticCtrl} />;
}`
      ),
      slot('optimistic-demo'),
      list(
        [
          strong('Optimistic writes live inside transitions.'),
          ' ',
          code('markRenamed'),
          ' called outside an action or transition has no flight to outlive — React refuses with ',
          em('“An optimistic state update occurred outside a transition or action.”'),
        ],
        [
          strong('End the flight with the truth.'),
          ' Success writes durable state — ',
          code('setName'),
          ' / ',
          code('setTags'),
          ', or a ',
          code('router.refresh()'),
          ' revalidation; failure writes nothing, and the automatic revert ',
          em('is'),
          ' the rollback. An action that settles without writing leaves the UI exactly where the server left it.',
        ],
        [
          strong('Make the rollback audible.'),
          ' A silent revert looks like the app ignoring the user. Fire a ',
          code('useToast'),
          ' on failure so the conversation continues.',
        ]
      )
    ),
  ],
  ui: {
    payloadHeading: 'What the server receives',
    payloadEmpty: 'Nothing yet — submit the form.',
    titlePlaceholder: 'Project title',
    rolePlaceholder: 'Pick a role…',
    subscribeLabel: 'Email updates',
    tagsPlaceholder: 'Add tag…',
    submitLabel: 'Submit',
    emailPlaceholder: 'you@work.dev',
    takenError: 'That address is already registered.',
    tryHint: 'End the address with @taken.dev to see the rejection path.',
    settingsSubmitLabel: 'Save settings',
    savedAs: 'Saved ',
    nameLabel: 'Display name',
    tagsLabel: 'Tags',
    rejectLabel: 'Reject the next save',
    savedNote: 'Saved.',
    rolledBackNote: 'Rejected — the optimistic value rolled back.',
  },
};

const serverActionsZh: GuideDoc = {
  title: 'React 19 Actions × haze-ui 实战',
  intro: [
    'React 19 把 ',
    code('<form>'),
    ' 变成了一台异步状态机：',
    code('action'),
    ' prop 接受服务端函数，',
    code('useActionState'),
    ' 为它包上 pending 与错误态，',
    code('useOptimistic'),
    ' 则在往返落地之前先画出下一个值。haze-ui 生来就坐在这台机器里：每个持有值的组件都内置原生 FormData 桥，表单层原生理解 server action 的返回，controllable-state 模式给乐观 UI 一条单一写入通道。下面三节把它们全部接起来——',
    link(
      'examples/nextjs 的 actions-demo 路由',
      'https://github.com/wmzy/haze-ui/tree/main/examples/nextjs/app/actions-demo'
    ),
    '用真实的 ',
    code("'use server'"),
    ' 模块运行同样的代码。',
  ],
  sections: [
    sec(
      'native-form-actions',
      'Server action 走原生 FormData',
      p([
        'React 19 的表单 action 是世上最朴素的东西：',
        code('<form action={createProfile}>'),
        '，其中 ',
        code('createProfile'),
        ' 是一个 ',
        code("'use server'"),
        ' 函数，接收浏览器从表单成功控件构建出的 ',
        code('FormData'),
        '。没有序列化层，也没有客户端状态镜像——而且表单仍是一个真实的 POST，水合之前也能提交。',
      ]),
      p([
        '这个契约是原生的，haze-ui 也以原生方式接住。本身就渲染真实字段元素的组件——',
        code('Input'),
        '、',
        code('Checkbox'),
        '、',
        code('Radio'),
        '、',
        code('Slider'),
        ' 的 ',
        code("input[type='range']"),
        '、',
        code('FileInput'),
        '——直接走原生提交：给它们一个 ',
        code('name'),
        ' 就完事了。视觉控件不是字段的组件（',
        code('Switch'),
        ' 渲染 ',
        code('<button>'),
        '，',
        code('Rating'),
        ' 渲染星星，',
        code('Select'),
        ' 的选项是浮层）没法指望原生——所以一旦给了 ',
        code('name'),
        '，它们会渲染一座桥：一个携带同名 ',
        code('name'),
        ' 的隐藏（或裁剪）原生 input，与组件值保持同步（',
        code('src/lib/utils/native-form.tsx'),
        '）。',
      ]),
      table(
        ['组件', 'FormData 里是什么'],
        [
          [
            [code('Input'), '、', code('Checkbox'), '、', code('Radio'), '、', code('Slider'), '、', code('FileInput')],
            ['真实字段元素自带 ', code('name'), '——无需任何额外接线。'],
          ],
          [
            [code('Switch')],
            ['裁剪 checkbox 桥：勾选时提交 ', code('on'), '，未勾选什么都不提交（原生成功控件规则）。'],
          ],
          [
            [code('Rating')],
            ['隐藏字段携带 ', code('String(value)'), '；', code('0'), ' 星哨兵不提交。'],
          ],
          [
            [code('Select'), '（单选）'],
            ['隐藏字段携带当前值；', code("''"), ' 未选哨兵不提交。'],
          ],
          [
            [code('Select'), '（多选 / tags）、', code('TagInput')],
            ['同名下每个值一个隐藏 input——用 ', code('formData.getAll(name)'), ' 读取。'],
          ],
          [
            [code('Segmented'), '、', code('ColorPicker'), '、', code('OTPInput'), '、', code('RichTextEditor')],
            ['同样的隐藏字段桥——所有没有原生字段的值组件都走这条路。'],
          ],
        ]
      ),
      codeBlock(
        'tsx',
        `// app/actions.ts
'use server';

export async function createProfile(formData: FormData) {
  const title = String(formData.get('title') ?? '');
  const role = String(formData.get('role') ?? '');         // '' — nothing picked
  const subscribe = formData.get('subscribe') === 'on';    // absent when off
  const rating = Number(formData.get('rating') ?? 0) || 0; // absent at 0 stars
  const tags = formData.getAll('tags').map(String);        // repeated field

  await saveProfile({ title, role, subscribe, rating, tags });
}`
      ),
      codeBlock(
        'tsx',
        `import { Button, Input, Option, Rating, Select, Switch, TagInput } from 'haze-ui';

export function ProfileForm({
  createProfile,
}: {
  createProfile: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={createProfile}>
      <Input name='title' required placeholder='Project title' />
      <Select name='role' value=''>
        <Option value=''>Pick a role…</Option>
        <Option value='admin'>Admin</Option>
        <Option value='editor'>Editor</Option>
      </Select>
      <label>
        <Switch name='subscribe' /> Email updates
      </label>
      <Rating name='rating' value={0} />
      <TagInput name='tags' value={[]} placeholder='Add tag…' />
      <Button onClick={(e) => e.currentTarget.form?.requestSubmit()}>
        Create profile
      </Button>
    </form>
  );
}`
      ),
      caption([
        'ControlOrValue 约定下，传普通值的 ',
        code('value={…}'),
        ' 是非受控的',
        em('初始值'),
        '。这正是表单 action 表单想要的：DOM 持有字段状态，action 在提交时一次性读取。（haze ',
        code('Button'),
        ' 恒渲染 ',
        code("type='button'"),
        '——用 ',
        code("onClick={(e) => e.currentTarget.form?.requestSubmit()}"),
        ' 驱动表单：',
        code('requestSubmit()'),
        ' 会跑原生约束校验与 action 管线，',
        code('form.submit()'),
        ' 不会。）',
      ]),
      slot('native-demo'),
      note([
        strong('桥是不可见且不可交互的。'),
        '桥 input 都是 ',
        code('readOnly'),
        ' + ',
        code('tabIndex={-1}'),
        ' + ',
        code('aria-hidden'),
        '——它们从不进入 Tab 焦点序或可访问树，只有 FormData 看得见它们。读缺失和读值同样重要：未勾选的 ',
        code('Switch'),
        ' 在载荷里是',
        em('缺失'),
        '的（绝不是 ',
        code("'off'"),
        '），空 ',
        code('Select'),
        '、0 星 ',
        code('Rating'),
        '、空 ',
        code('TagInput'),
        ' 同理。',
      ])
    ),
    sec(
      'use-action-state',
      'useActionState：pending 与服务端错误',
      p([
        code('useActionState'),
        ' 为表单 action 包上「上一次结果、dispatch 函数、pending 标志」三件套：',
        code('const [state, formAction, pending] = useActionState(action, initialState)'),
        '。把它指向一个返回结果对象的服务端 action，整个提交生命周期——派发、等待往返、状态提交——都归 React。由于 ',
        code('formAction'),
        ' 直接传给 ',
        code('action'),
        '，',
        code("'use server'"),
        ' 的 action 在这里同样保持水合前可提交。',
      ]),
      codeBlock(
        'tsx',
        `import { useActionState } from 'react';
import { Button, Input } from 'haze-ui';

type State = { error?: string; saved?: string };

export function SettingsForm() {
  const [state, formAction, pending] = useActionState(saveSettings, {});

  return (
    <form action={formAction}>
      <Input name='email' required placeholder='you@work.dev' />
      {state.error && (
        <p role='alert' aria-live='polite'>
          {state.error}
        </p>
      )}
      <Button
        loading={pending}
        onClick={(e) => e.currentTarget.form?.requestSubmit()}
      >
        Save settings
      </Button>
      {state.saved && <p>{state.saved}</p>}
    </form>
  );
}

// app/actions.ts
'use server';

export async function saveSettings(
  _prev: State,
  formData: FormData
): Promise<State> {
  const email = String(formData.get('email') ?? '');
  await new Promise((resolve) => setTimeout(resolve, 600)); // fake latency
  if (email.endsWith('@taken.dev')) {
    return { error: 'That address is already registered.' };
  }
  return { saved: 'Saved ' + email };
}`
      ),
      p([
        code('Button'),
        ' 的 ',
        code('loading'),
        ' prop 就是 pending 的呈现面：把标志原样传进去，控件会自行禁用、置 ',
        code('aria-busy'),
        ' 并换入加载指示。错误随状态对象返回——用 ',
        code("role='alert'"),
        ' 渲染，让辅助技术听到拒绝。',
      ]),
      h3('react-f0rm 通道'),
      p([
        '当表单长过寥寥几个字段，haze-ui 的表单层接管这些管线：从 ',
        code("'haze-ui'"),
        ' 导入的 ',
        code('Form'),
        ' 与 ',
        code('FormItem'),
        '。',
        code('Form'),
        ' 自己的 ',
        code('action'),
        ' prop 原生理解 server action——它交给 action 的是由表单值构建的',
        em('已校验'),
        ' FormData（含文件、数组与嵌套对象），而且它理解拒绝：action 返回 ',
        code('{ errors: { email: "…" } }'),
        '，这份记录会以 ',
        code("type: 'server'"),
        ' 的字段错误落地，由对应的 ',
        code('FormItem'),
        ' 错误 span 渲染——与客户端校验失败完全同构。',
      ]),
      codeBlock(
        'tsx',
        `import {
  Button,
  Form,
  FormItem,
  InputCore,
  Option,
  SelectCore,
  useForm,
} from 'haze-ui';
import { useIsSubmitting } from 'react-f0rm';

type MemberValues = { email: string; role: string };

// app/actions.ts
// 'use server';
// export async function saveMember(formData: FormData) {
//   const email = String(formData.get('email') ?? '');
//   if (email.endsWith('@taken.dev')) {
//     return { errors: { email: 'That address is already registered.' } };
//   }
//   await db.members.save({
//     email,
//     role: String(formData.get('role') ?? ''),
//   });
// }

export function MemberForm({
  saveMember,
}: {
  saveMember: (
    formData: FormData
  ) => Promise<{ errors?: Record<string, string | string[]> } | void>;
}) {
  const form = useForm<MemberValues>({
    initialValues: { email: '', role: 'admin' },
  });
  const submitting = useIsSubmitting(form);

  // @types/react's own 'action' typing demands a void return; f0rm reads
  // the '{ errors }' rejection off the resolved value - one cast at the seam
  const memberAction = saveMember as unknown as (
    formData: FormData
  ) => Promise<void>;

  return (
    <Form form={form} action={memberAction}>
      <FormItem
        form={form}
        name='email'
        label='Email'
        rules={{ required: 'Email is required' }}
        mode='onBlur'
        input={InputCore}
      />
      <FormItem form={form} name='role' label='Role' input={SelectCore}>
        <Option value='admin'>Admin</Option>
        <Option value='editor'>Editor</Option>
      </FormItem>
      <Button
        loading={submitting}
        onClick={(e) => e.currentTarget.form?.requestSubmit()}
      >
        Save member
      </Button>
    </Form>
  );
}`
      ),
      note([
        code('setServerErrors'),
        '（同样从 ',
        code("'haze-ui'"),
        ' 再导出）以相同方式落地普通 REST 响应——',
        code('setServerErrors(form, { email: ["already taken"] })'),
        '——而重试会自动先清掉上一轮，每次提交都按新尝试裁决。',
        code('useIsSubmitting'),
        ' 是 ',
        code('form.isSubmitting'),
        ' 背后的订阅 hook，来自 ',
        code('react-f0rm'),
        '（haze-ui 的表单引擎，表单用户本来就依赖它）。',
      ]),
      slot('action-state-demo')
    ),
    sec(
      'use-optimistic',
      'useOptimistic：乐观更新与回滚',
      p([
        code('useOptimistic'),
        ' 持有服务端状态的一道影子。没有 transition 在飞时，影子',
        em('就是'),
        '你传入的状态（React 原样返回你的参数）；transition 进行中，乐观 setter 一调用就换成 reducer 算出的值，直到 transition 收尾——React 随即丢弃影子、按源状态重渲染。回滚不是你写的代码：action 结束时没有更新源状态，回滚就发生了。',
      ]),
      p([
        'haze-ui 这一侧靠的是 controllable-state 模式。组件必须',
        em('跟随'),
        '影子，而普通值做不到——普通值是非受控',
        em('初始值'),
        '，后续 prop 变化会被忽略。所以用 ',
        code('useControl'),
        ' 持有持久状态（它返回的 control 身份稳定），再用 ',
        code('useThru'),
        ' 把读指向影子、把写指向这次飞行：组件读到的就是乐观值，用户编辑直接开启 transition——组件自己对「乐观」一无所知。',
      ]),
      h3('InlineEdit'),
      codeBlock(
        'tsx',
        `import { startTransition, useOptimistic } from 'react';
import type { SetStateAction } from 'react';
import { useControl, useThru } from 'react-use-control';
import { InlineEdit } from 'haze-ui';

export function DisplayName({ initial }: { initial: string }) {
  const [name, setName, nameCtrl] = useControl(undefined, initial);
  const [shown, markRenamed] = useOptimistic(
    name,
    (_committed, next: string) => next
  );

  function commitRename(next: SetStateAction<string>) {
    const value = typeof next === 'function' ? next(name) : next;
    startTransition(async () => {
      markRenamed(value);                    // optimistic paint
      const error = await renameAction(value); // 'use server'
      if (error) return;  // settle without writing -> automatic rollback
      setName(value);     // durable — the shadow collapses onto it
    });
  }

  // what InlineEdit sees: the shadow on read, the flight on write
  const optimisticCtrl = useThru(
    nameCtrl,
    () => [shown, commitRename]
  );

  return <InlineEdit value={optimisticCtrl} />;
}`
      ),
      h3('TagInput'),
      codeBlock(
        'tsx',
        `import { startTransition, useOptimistic } from 'react';
import type { SetStateAction } from 'react';
import { useControl, useThru } from 'react-use-control';
import { TagInput } from 'haze-ui';

export function TagEditor({ initial }: { initial: string[] }) {
  const [tags, setTags, tagsCtrl] = useControl(undefined, initial);
  const [shown, markTags] = useOptimistic(
    tags,
    (_committed, next: string[]) => next
  );

  // TagInput's onChange emits the whole next list, so the reducer just
  // forwards it — adds, removals and reorderings all roll through
  function commitTags(next: SetStateAction<string[]>) {
    const value = typeof next === 'function' ? next(tags) : next;
    startTransition(async () => {
      markTags(value);
      const ok = await saveTagsAction(value); // 'use server'
      if (!ok) return;    // settle without writing -> automatic rollback
      setTags(value);
    });
  }

  const optimisticCtrl = useThru(tagsCtrl, () => [shown, commitTags]);

  // name='tags' keeps the FormData bridge alive too
  return <TagInput name='tags' value={optimisticCtrl} />;
}`
      ),
      slot('optimistic-demo'),
      list(
        [
          strong('乐观写入只活在 transition 里。'),
          '在 action 或 transition 之外调用 ',
          code('markRenamed'),
          ' 没有可依附的飞行——React 会直接拒绝：',
          em('“An optimistic state update occurred outside a transition or action.”'),
        ],
        [
          strong('用真相结束飞行。'),
          '成功就写持久状态——',
          code('setName'),
          ' / ',
          code('setTags'),
          '，或 ',
          code('router.refresh()'),
          ' 重新验证；失败什么都不写，自动回退',
          em('就是'),
          '回滚。settled 时没有写入的 action 会把 UI 精确留在服务端认可的位置。',
        ],
        [
          strong('让回滚被听见。'),
          '无声的回退看起来像应用无视了用户。失败时发一个 ',
          code('useToast'),
          '，让对话继续下去。',
        ]
      )
    ),
  ],
  ui: {
    payloadHeading: '服务端将收到',
    payloadEmpty: '还没有数据——提交表单试试。',
    titlePlaceholder: '项目名称',
    rolePlaceholder: '选择角色…',
    subscribeLabel: '邮件通知',
    tagsPlaceholder: '添加标签…',
    submitLabel: '提交',
    emailPlaceholder: 'you@work.dev',
    takenError: '该邮箱已被注册。',
    tryHint: '邮箱以 @taken.dev 结尾可触发拒绝路径。',
    settingsSubmitLabel: '保存设置',
    savedAs: '已保存 ',
    nameLabel: '显示名称',
    tagsLabel: '标签',
    rejectLabel: '让下一次保存失败',
    savedNote: '已保存。',
    rolledBackNote: '被拒绝——乐观值已回滚。',
  },
};

/** All migrated guide bodies, keyed by guide id then locale. */
export const GUIDE_CONTENT: Record<GuideId, GuideLocaleDocs> = {
  a11y: { en: a11yEn, zh: a11yZh },
  a11yContracts: { en: a11yContractsEn, zh: a11yContractsZh },
  darkMode: { en: darkModeEn, zh: darkModeZh },
  density: { en: densityEn, zh: densityZh },
  migration: { en: migrationEn, zh: migrationZh },
  motion: { en: motionEn, zh: motionZh },
  serverActions: { en: serverActionsEn, zh: serverActionsZh },
  streamingA11y: { en: streamingA11yEn, zh: streamingA11yZh },
};

/** Resolve a guide's doc for a locale; untranslated locales fall back to en. */
export function getGuideDoc(id: GuideId, locale: SiteLocale): GuideDoc {
  const docs = GUIDE_CONTENT[id];
  return docs[locale] ?? docs.en;
}

/** Locale-aware guide doc for page components (works outside the provider). */
export function useGuideDoc(id: GuideId): GuideDoc {
  const { locale } = useSiteLocale();
  return getGuideDoc(id, locale);
}

/** Render one block list; `slots` supplies page-owned interactive pieces. */
export function GuideBlocks({
  blocks,
  slots,
}: {
  blocks: readonly GuideBlock[];
  slots?: GuideSlots;
}) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'p':
            return (
              <p key={i} className={gParagraph}>
                <Rich text={block.text} codeClass={gInlineCode} />
              </p>
            );
          case 'note':
            return (
              <div key={i} className={gNote}>
                <Rich text={block.text} codeClass={gInlineCode} />
              </div>
            );
          case 'list':
            return (
              <ul key={i} className={gList}>
                {block.items.map((item, i) => (
                  <li key={i}>
                    <Rich text={item} codeClass={gInlineCode} />
                  </li>
                ))}
              </ul>
            );
          case 'code':
            return (
              <CodeBlock
                key={i}
                language={block.language}
                className={gCodeMargin}
              >
                {block.code}
              </CodeBlock>
            );
          case 'caption':
            return (
              <p key={i} className={gCaption}>
                <Rich text={block.text} codeClass={gInlineCode} />
              </p>
            );
          case 'table':
            return (
              <div key={i} className={gTableWrap}>
                <table className={gTable}>
                  <thead>
                    <tr>
                      {block.headers.map((header, i) => (
                        <th key={i}>
                          <Rich text={header} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td key={c}>
                            <Rich text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'h3':
            return <h3 key={i}>{block.text}</h3>;
          case 'slot':
            return <Fragment key={i}>{slots?.[block.name] ?? null}</Fragment>;
        }
      })}
    </>
  );
}

/**
 * Render a guide body: intro paragraph plus every section. Page components
 * keep their <h1> and hand interactive pieces in via `slots`.
 */
export function GuideDocView({
  doc,
  slots,
}: {
  doc: GuideDoc;
  slots?: GuideSlots;
}) {
  return (
    <>
      <p className={intro}>
        <Rich text={doc.intro} codeClass={gInlineCode} />
      </p>
      {doc.sections.map((guideSection) => (
        <div key={guideSection.id} className={section}>
          <h2>{guideSection.heading}</h2>
          <GuideBlocks blocks={guideSection.blocks} slots={slots} />
        </div>
      ))}
    </>
  );
}
