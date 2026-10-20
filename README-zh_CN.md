# Haze UI

> 状态可控的 React 组件库。

[English](./README.md) | 简体中文

[![npm](https://img.shields.io/npm/v/haze-ui)](https://www.npmjs.com/package/haze-ui)
[![downloads](https://img.shields.io/npm/dm/haze-ui.svg)](https://www.npmjs.com/package/haze-ui)
[![CI](https://github.com/wmzy/haze-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/wmzy/haze-ui/actions/workflows/ci.yml)

haze-ui 是一个 React 19 组件库：Linaria（零运行时 CSS-in-JS）+ `--haze-*`
设计令牌；140 个组件、9 大分组；ESM-only、`preserveModules` 可摇树产物；
RTL 与生俱来；RSC 感知拆分（仅交互模块预注入 `'use client'`，静态子集可直接
作为 React Server Components 渲染）。每个有状态组件都讲同一套
`ControlOrValue<T>` 协议——一个 prop（如 `checked?: Control<T> | T`）同时覆盖
受控与非受控两种用法。peer 仅有 `react` / `react-dom`（v19）；全部引擎包
（react-f0rm、TanStack Table、recharts、dnd-kit、qrcode）都是普通依赖，
import 不到达即被摇树摇掉。

## 快速开始

```sh
npm i haze-ui
# 或
pnpm add haze-ui
```

加载 CSS——两种模式任选：

```jsx
// A）一份完整样式表（最简单）
import 'haze-ui/styles.css';
```

```ts
// B）官方 Vite 插件按 import 自动注入 per-component CSS
//    vite.config.ts
import hazeCss from 'vite-plugin-haze-ui';

export default { plugins: [react(), hazeCss()] };
```

插件通过 npm 安装：`npm i -D vite-plugin-haze-ui`。

渲染第一个组件：

```jsx
import { lightTheme, Button } from 'haze-ui';

export function App() {
  return (
    <main className={lightTheme}>
      <Button onClick={() => console.log('haze!')}>开始</Button>
    </main>
  );
}
```

主题类激活令牌集——配置到此为止。想从模板起步？
[painless](https://github.com/wmzy/painless) 是基于 haze-ui 的 RealWorld SPA
模板——克隆下来删掉不需要的部分，即是成品形态的客户端应用。

颜色由 OKLCH 生成、交互态在运行时以 CSS 相对色推导，因此浏览器基线为
Chrome/Edge 119+、Safari 16.4+ 或 Firefox 128+（无 HSL/hex 回退）。

### 浏览器支持语义

[package.json](./package.json) 的 `browserslist` 字段只约束 **JS API 面**：
`eslint-plugin-compat` 按targets（`chrome >= 119`、`edge >= 119`、
`safari >= 16.4`、`firefox >= 128`）对全部 `src/**/*.{ts,tsx}` 做门禁，低于
底线的现代 JS API 会在 CI 失败而不是发布出去。**CSS 有意不转译**：OKLCH
颜色、CSS 相对色、`popover` 属性与 CSS anchor positioning 原样直出，无
polyfill/回退——同一四引擎即硬性 CSS 底线。

## 亮点

- **有意只支持 React 19**——ref-as-prop、原生 `popover`/anchor 定位、RSC 感知的
  `'use client'` 拆分都基于 React 19 形态；没有 React 18 兼容层
  （peer 依赖 `^19.0.0`）。
- **无障碍是发布门禁**——每个组件测试套件都有 axe 用例；Playwright e2e 覆盖
  Chromium/Firefox/WebKit 与手机视口工程；像素级视觉基线；macOS CI 上的真实
  VoiceOver 冒烟套件。
  → [无障碍指南](https://wmzy.github.io/haze-ui/guides/a11y) ·
  [A11y 契约表](https://wmzy.github.io/haze-ui/guides/a11y-contracts)
- **Per-component CSS**——JS 入口不 import 任何样式。整包 `haze-ui/styles.css`、
  按需 `haze-ui/css/*.css` 子路径，或让
  [vite-plugin-haze-ui](https://github.com/wmzy/vite-plugin-haze-ui) 通过
  `haze-ui/css-manifest.json` 按你的 import 自动注入。
  → [入门](https://wmzy.github.io/haze-ui/getting-started)
- **`Control<T> | T` 可控状态**——每组件一个状态 prop，由
  [react-use-control](https://github.com/wmzy/react-use-control) 驱动；
  没有 `defaultXxx` / `xxx` 双套 API 要同步。
  → [入门](https://wmzy.github.io/haze-ui/getting-started)
- **AI / 聊天组件族**——`ChatContainer`、`ChatMessage`、`StreamingText`、
  `ToolCallCard`、`ThinkingIndicator`、`ChatInput` 覆盖 agent 聊天界面，
  并附 Vercel AI SDK `useChat` 的单测适配 recipe。
  → [AI 展示](https://wmzy.github.io/haze-ui/ai-showcase) ·
  [Recipes](https://wmzy.github.io/haze-ui/recipes)
- **多历法日期层**——公历之外内置六个适配器（Hijri Umm al-Qura、波斯历、
  希伯来历、日本年号、佛历、埃塞俄比亚历）：整数算术实现并与全量 ICU
  `Intl` oracle 交叉验证，经 barrel 的 `getAdapter()` 导出。
  → [组件](https://wmzy.github.io/haze-ui/components)
- **OKLCH 令牌 + W3C DTF 导出**——hover/active/focus-ring 颜色在运行时由
  CSS 相对色公式再推导；整个令牌注册表可导出为 W3C Design Tokens 格式
  （Figma / Tokens Studio 可用）。
  → [令牌](https://wmzy.github.io/haze-ui/tokens) ·
  [主题编辑器](https://wmzy.github.io/haze-ui/theme-editor)

## 生态

| 资源 | 链接 |
| --- | --- |
| 文档站 | <https://wmzy.github.io/haze-ui/> |
| 入门 | <https://wmzy.github.io/haze-ui/getting-started> |
| 迁移指南（AntD / shadcn） | <https://wmzy.github.io/haze-ui/guides/migration> |
| llms.txt / AI 用完整 API | <https://wmzy.github.io/haze-ui/llms.txt> |
| MCP server（`npx haze-ui-mcp`） | 随本包 bin 一起发布——见[帮助页](https://wmzy.github.io/haze-ui/help) |
| shadcn registry | [registry/README.md](./registry/README.md) — `pnpm dlx shadcn@latest add wmzy/haze-ui/button` |
| painless（RealWorld SPA 模板） | <https://github.com/wmzy/painless> — GitHub |
| vite-plugin-haze-ui（CSS 自动注入） | <https://www.npmjs.com/package/vite-plugin-haze-ui> — npm |

每个带样式的导出都可经 shadcn CLI 安装（对 npm 包的薄封装）——见
[registry/README.md](./registry/README.md)。

## 社区

- 🐛 [报告 bug](https://github.com/wmzy/haze-ui/issues/new?template=bug_report.yml)
- ✨ [提功能需求](https://github.com/wmzy/haze-ui/issues/new?template=feature_request.yml)
- 📖 [参与贡献](./CONTRIBUTING.md)
- 🔒 [安全策略](./SECURITY.md)

**正在用 haze-ui 构建产品？** 欢迎展示：开一个标题为 `used by: <项目名>` 的
issue，附项目名、链接与（可选）logo，我们会把它加入本 README。

## 许可

[MIT](https://choosealicense.com/licenses/mit/)
