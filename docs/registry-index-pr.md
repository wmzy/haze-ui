# shadcn Registry Index 收录准备（@haze-ui namespace）

提交 shadcn/ui [Registry Directory](https://ui.shadcn.com/docs/registry/registry-index)
收录 PR 所需的全部材料。**不能代提 PR**——需要用户 GitHub 身份；本文档备齐后按步骤操作即可。

- 目标仓库：`shadcn-ui/ui`（https://github.com/shadcn-ui/ui）
- 收录后效果：`shadcn add @haze-ui/<item>` / `shadcn search` 直接可用（namespace 形态，无需先改 `components.json`）
- 注意：GitHub repo 形态（`shadcn add wmzy/haze-ui/<item>`）**不需要**收录即可用——收录是为了
  `@haze-ui` namespace 入口 + 官方目录曝光（479+ registries 的发现页 / search 流量）

## 1. 元数据（directory entry）

Task 原始提法是 `name: wmzy/haze-ui`，但 directory 的 zod schema（`apps/v4/lib/registry-directory.ts`，
`.strict()`）**强制 `@namespace` 形态**（`^@[a-zA-Z0-9][a-zA-Z0-9_-]*$`），`wmzy/haze-ui` 会被
`pnpm validate:registries` 直接打回。等效且合规的 namespace 是 **`@haze-ui`**（已核对
https://ui.shadcn.com/r/registries.json 全部 479 条，无 `@haze-ui`，仅有一个不相干的 `@hazeglow`）。

`url` 的 `{name}` 模板逐项解析到本仓库的 per-item JSON（flat registry-item payload，content 内嵌——
与 `shadcn build` 产物同形）。**不要用** `https://wmzy.github.io/haze-ui/registry.json`：实测 404
（docs deploy 只发布 demo 站产物，不含 registry JSON）。jsDelivr gh CDN 实测可达
（`.../registry/button.json` → 200）。

```json
{
  "name": "@haze-ui",
  "homepage": "https://wmzy.github.io/haze-ui/",
  "url": "https://cdn.jsdelivr.net/gh/wmzy/haze-ui@main/registry/{name}.json",
  "description": "150+ accessible React components and full-page blocks on controllable state and OKLCH design tokens: forms, data tables, AI chat kit, dashboard/CRUD/login blocks. npm-distributed, thin-wrapper shadcn integration.",
  "author": "wmzy",
  "logo": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none'><path d='M6 22a5 5 0 0 1 .8-9.93A7.5 7.5 0 0 1 21.4 10.5 5.5 5.5 0 0 1 22 21.5z' stroke='var(--foreground)' stroke-width='2.2' stroke-linejoin='round' fill='var(--foreground)' fill-opacity='.12'/><path d='M10 26h12M13 29h7' stroke='var(--foreground)' stroke-width='2.2' stroke-linecap='round'/></svg>"
}
```

（`author` 可选；`logo` 必填，须是内联 SVG 字符串，样式跟随 `var(--foreground)`——目录条目普遍如此。
上面是一个雾/云 mark，可换成仓库 favicon 的实际 SVG。）

## 2. 提交步骤

1. Fork https://github.com/shadcn-ui/ui，clone，`pnpm install`。
2. 编辑 **`apps/v4/registry/directory.json`**：按字母序插入上面的 entry（数组按 `name` 排序；
   `@haze-ui` 排在 `@hazeglow` 前）。除新增 entry 外**不要改动任何既有条目**——CI 的
   `validate-registries` 会校验 directory.json ↔ `public/r/registries.json` 的同步与去重。
3. 校验：`pnpm validate:registries`（zod `.strict()`：多余字段报错；`url` 必须含 `{name}`）。
4. Push 分支，向 `shadcn-ui/ui` 的 `main` 开 PR（标题见下）。合并即发布，Registry Health 随后
   自动开始监控（不阻塞发布）。

## 3. PR 材料（英文，可直接粘贴）

**Title:**

```
registry: add @haze-ui
```

**Body:**

```markdown
## Description

Adds the **@haze-ui** registry to the registry directory.

[haze-ui](https://github.com/wmzy/haze-ui) is an open-source (MIT) React component
library — 150+ accessible components plus full-page blocks (login, dashboard,
master–detail CRUD) — built on a controllable-state pattern (`Control<T> | T` via
react-use-control) and OKLCH design tokens. It ships as a normal npm package with
per-component CSS subpaths; the registry items install thin wrapper files, so
consumers keep the shadcn workflow (`shadcn add` / `diff` / `update`) while the
implementation stays versioned underneath.

- Homepage / docs: https://wmzy.github.io/haze-ui/
- Source: https://github.com/wmzy/haze-ui
- Install example: `npx shadcn@latest add @haze-ui/button`, blocks:
  `npx shadcn@latest add @haze-ui/login-block`
- Also usable as a plain GitHub registry: `npx shadcn@latest add wmzy/haze-ui/button`

Registry requirements checklist:

- [x] Open source and publicly accessible (MIT, repo + jsDelivr URLs resolve)
- [x] Valid JSON conforming to the registry schema
      (https://cdn.jsdelivr.net/gh/wmzy/haze-ui@main/registry.json)
- [x] Flat registry — root `registry.json` index plus per-item
      `registry/<name>.json` payloads (no nested items)
- [x] Index `files` arrays carry no `content` property (content is embedded only
      in the per-item payloads, same shape `shadcn build` emits)

Validated locally with `pnpm validate:registries`.
```

## 4. 提交前自查（本仓库侧）

- [ ] `pnpm build` 通过（generate-registry 自校验含 blocks：files 存在、registryDependencies
      解析到本库 items、npm deps 与 vendored 源 import 一致）
- [ ] `main` 分支上 `registry.json`（根 index）与 `registry/<item>.json`（154 项）为最新构建产物
      —— jsDelivr `@main` 即时镜像仓库文件
- [ ] 抽查 CDN 可达：`https://cdn.jsdelivr.net/gh/wmzy/haze-ui@main/registry.json` 与
      `.../registry/login-block.json` 返回 200
- [ ] Registry Health 基线：收录后前几日在 https://ui.shadcn.com/r/registries.json 观察
      `health.status`（reliability 取决于 jsDelivr 可用性；如后期想自托管 `{name}.json` 端点，
      改 `url` 模板并再提一个 directory PR 即可）

## 5. 备选方案记录

| 方案 | 结论 |
| --- | --- |
| `https://wmzy.github.io/haze-ui/registry.json` | 404——deploy 只发 demo 站，不含 registry JSON（已实测）。若想启用，需在 deploy.yml 里把根 `registry.json`/`registry/` 复制进 dist，属于后续可选项 |
| `https://unpkg.com/haze-ui/registry.json` | 302→可达，但它是全量 index（items 内联），没有 per-item `{name}.json` 端点，不满足 directory 的 url 模板形态 |
| `https://raw.githubusercontent.com/wmzy/haze-ui/main/registry/{name}.json` | 可用但无 CDN 缓存、有限流；jsDelivr 为优选 |
