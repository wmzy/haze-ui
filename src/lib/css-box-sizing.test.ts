import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 面板家族 box-sizing 契约：库里没有全局 `* { box-sizing: border-box }`
// reset（token-only 的设计决定），所以每个「声明了盒尺寸属性
// （width/max-width/height…）的面板盒」必须自己声明
// `box-sizing: border-box` —— 否则 content-box 下 padding/border 会让
// width/max-width 的语义漂移（Dialog 在 412px 视口实测溢出 32px 的前科，
// 见 mobile.spec.ts）。本测试在构建产物层面钉住这个约定：面板家族的
// dist/css/<family>.css 一旦声明盒尺寸就必须包含 border-box。
// 与 css-manifest.test.ts 同一门控：无 dist 时（普通 CI 先 test 后
// build）跳过；「先 build 后 test」的 release 流水线对将发布的 dist 实测。
const distDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../dist'
);
const built = existsSync(path.join(distDir, 'css'));

/**
 * 判定标准（add/remove 时同步更新）：家族 css 声明了盒尺寸属性
 * （width / max-width / height / min-width / …）→ 必须在白名单里；
 * 确实没有任何设置盒尺寸的盒 → 移出并在 REMOVED 记录理由。
 */
const PANEL_FAMILIES = [
  'dialog',
  'drawer',
  'bottom-sheet',
  'popover',
  'menu',
  'dropdown-menu',
  'context-menu',
  'select',
  'combobox',
  'datepicker',
  'time-picker',
  'date-range-picker',
  'tree-select',
  'cascader',
  'command',
  'hover-card',
  'sidebar',
  'app-shell',
] as const;

/**
 * 从白名单移出的面板家族及其理由。给未来加 width/height 的人留路标：
 * 一旦这些家族真的声明了盒尺寸，请把它们挪回 PANEL_FAMILIES 并补
 * box-sizing。
 */
const REMOVED_FAMILIES: Record<string, string> = {
  // 气泡是纯内容盒：没有任何 width/max-width/height 声明（任务白名单
  // 预判的可能移出项，实测确认）。
  tooltip: 'content-sized bubble — no box-dimension declaration',
  // Toast 面板本体（.haze-Toast__base）内容自适应；css 里仅有的
  // width/height 声明在内层图标/按钮控件上，不在面板盒上。
  toast: 'content-sized panel; only inner icon controls declare sizes',
  // 轨道/胶片层没有尺寸盒：唯一的 min-width: 0 是 flex 溢出防护，
  // 胶片宽度来自 flex-basis（无 padding/border，两种盒模型等价）。
  carousel: 'no sized box — only a min-width: 0 flex guard',
};

const familyCss = (family: string) =>
  readFileSync(path.join(distDir, 'css', `${family}.css`), 'utf8');

// describe.skip 仍会执行工厂函数（vitest 同 jest 语义）——dist 缺席时
// 工厂里不能做文件 IO（css-manifest.test.ts 的教训），读操作以 built 门控。
const contract = built ? describe : describe.skip;
contract('dist 面板家族 css 的 box-sizing 契约', () => {
  it.each(PANEL_FAMILIES)('%s.css 声明盒尺寸的盒使用 border-box', (family) => {
    expect(familyCss(family)).toMatch(/box-sizing:\s*border-box/);
  });

  it('PANEL_FAMILIES 与 REMOVED_FAMILIES 不重叠且文件都存在', () => {
    const overlap = Object.keys(REMOVED_FAMILIES).filter((name) =>
      (PANEL_FAMILIES as readonly string[]).includes(name)
    );
    expect(overlap).toEqual([]);
    for (const name of Object.keys(REMOVED_FAMILIES)) {
      expect(familyCss(name)).toBeTruthy();
    }
  });
});
