import generatedProps from '@/generated/props.json';

/**
 * “Open in StackBlitz”支持：把 demo 源码组装成可独立运行的
 * Vite + React + haze-ui 工程的内存文件树（纯函数，不触碰 sdk）。
 */

/** generatedProps.components 里每个组件条目中本模块关心的字段。 */
type GeneratedComponentEntry = {
  routeKey: string;
  cssFamily?: string;
};

export type StackblitzProject = {
  title: string;
  template: 'node';
  files: Record<string, string>;
  openFile: string;
};

/** demo 源码中可能出现、react/react-dom/haze-ui 之外的第三方依赖 → 版本。 */
const KNOWN_RUNTIME_DEPS: Record<string, string> = {
  'react-icons': '^5.7.0',
  'lucide-react': '^1.41.0',
  '@linaria/core': '^8.2.0',
  '@tanstack/react-table': '^9.2.4',
  'react-use-control': '^1.6.0',
  zod: '^4.6.1',
};

const REACT_VERSION = '^19.2.8';
const HAZE_UI_VERSION = '^1.21.0';

/** 匹配 `from 'x'` / `import 'x'` / `import('x')` / `require('x')` 的说明符。 */
const IMPORT_SPECIFIER_RE =
  /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)['"]([^'"]+)['"]/g;

/** 'react-icons/fi' → 'react-icons'；'@scope/pkg/sub' → '@scope/pkg'。 */
function packageNameOf(specifier: string): string {
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]!;
}

/** route key（'data-table'）→ css family（'data-table'）；查不到 → undefined。 */
function cssFamilyFor(name: string): string | undefined {
  const components =
    generatedProps.components as Record<string, GeneratedComponentEntry>;
  return Object.values(components).find((entry) => entry.routeKey === name)
    ?.cssFamily;
}

/** 扫描源码 import 语句，收集已知第三方依赖（忽略相对/绝对导入）。 */
function inferDependencies(source: string): Record<string, string> {
  const deps: Record<string, string> = {};
  for (const match of source.matchAll(IMPORT_SPECIFIER_RE)) {
    const specifier = match[1]!;
    if (specifier.startsWith('.') || specifier.startsWith('/')) continue;
    const pkg = packageNameOf(specifier);
    const version = KNOWN_RUNTIME_DEPS[pkg];
    if (version && !(pkg in deps)) deps[pkg] = version;
  }
  return deps;
}

const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>haze-ui demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

/* props playground 工程的入口：App.tsx 自带主题类与整包样式（GettingStarted
 * 推荐用法），main.tsx 只负责挂载，不重复挂 token 类。 */
const playgroundMain = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;

const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // demo 源码统一从 '@/lib' 导入组件，直接解析到 npm 包
      '@/lib': 'haze-ui',
    },
  },
});
`;

/**
 * 组装 StackBlitz 工程：App.tsx 为 demo 源码原文；'@/lib' 由 vite alias
 * 解析到 haze-ui 包（alias 的字符串键按 `/` 边界前缀匹配，'@/lib/form'
 * 这类子路径同样命中 'haze-ui/form'）；main.tsx 引入 tokens.css 与该组件
 * 的 css family（routeKey 查不到时回退 tokens-only，不抛错）并把主题
 * token 类挂到 <html> 上；源码 import 的已知第三方库追加进 dependencies。
 *
 * `options` 支持多文件工程（Blocks 页等整页组合）：
 * - `files`：额外源码文件（'src/DashboardBlock.tsx' → 内容），并入工程树
 *   （可覆盖生成文件）；依赖扫描覆盖入口与全部额外文件。
 * - `cssFamilies`：route key 之外追加的 css family（整页 block 组合多个
 *   组件家族时逐个列出）；与 route key 查得的结果去重合并。
 * - `openFile`：StackBlitz 打开时聚焦的文件，默认入口 'src/App.tsx'。
 */
export type StackblitzProjectOptions = {
  files?: Record<string, string>;
  cssFamilies?: string[];
  openFile?: string;
};

/* 两个入口共用的 package.json：依赖版本以本仓 package.json 为准
 * （react/react-dom 取 peer ^19 行内实际开发版本，haze-ui 取已发布行）；
 * WebContainer（StackBlitz 的 node 运行时）跑不了 vite 8 的 rolldown
 * 原生绑定（dev server 起监听后即崩，见 webcontainer-core#2141），
 * 生成工程钉在 vite 7（esbuild 路线）保证页内/新标签都能跑起来。 */
function buildPackageJson(extraDeps: Record<string, string>): string {
  const pkg = {
    name: 'haze-ui-demo',
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: { dev: 'vite' },
    dependencies: {
      react: REACT_VERSION,
      'react-dom': REACT_VERSION,
      'haze-ui': HAZE_UI_VERSION,
      ...extraDeps,
    },
    devDependencies: {
      vite: '^7.3.7',
      '@vitejs/plugin-react': '^5.2.0',
      typescript: '^6.0.3',
    },
  };
  return `${JSON.stringify(pkg, null, 2)}\n`;
}

function buildDemoProject(
  name: string,
  source: string,
  options: StackblitzProjectOptions
): StackblitzProject {
  const extraFiles = options.files ?? {};
  const routeFamily = cssFamilyFor(name);
  const cssFamilies = [
    ...new Set([...(routeFamily ? [routeFamily] : []), ...(options.cssFamilies ?? [])]),
  ];
  const cssImports = [
    "import 'haze-ui/css/tokens.css';",
    ...cssFamilies.map((family) => `import 'haze-ui/css/${family}.css';`),
  ].join('\n');

  const main = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { lightTheme, spacing, typography, motion } from 'haze-ui';
import App from './App';

${cssImports}

// tokens.css 只定义 token 类，不自动应用 —— 挂到 <html> 上整页生效。
document.documentElement.classList.add(lightTheme, spacing, typography, motion);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`;

  return {
    title: `haze-ui · ${name} demo`,
    template: 'node',
    files: {
      'package.json': buildPackageJson(
        inferDependencies([source, ...Object.values(extraFiles)].join('\n'))
      ),
      'vite.config.ts': viteConfig,
      'index.html': indexHtml,
      'src/main.tsx': main,
      'src/App.tsx': source,
      ...extraFiles,
    },
    openFile: options.openFile ?? 'src/App.tsx',
  };
}

// ─── props playground 形态 ──────────────────────────────────────

/** props playground 导出输入：驱动中的组件名、其 import 语句与当前覆盖项。 */
export type PropsPlaygroundProjectInput = {
  componentName: string;
  importStatement: string;
  propsState: Record<string, unknown>;
};

/** playground 工程比通用形态多一个 `skipped`：无法序列化为 JSX 的 prop 名。 */
export type PropsPlaygroundProject = StackblitzProject & {
  skipped: string[];
};

/* 一个覆盖项 → JSX 属性源码：true → 裸属性；false/number → 花括号表达式；
 * string → 双引号字面量（JSX 属性字符串不支持反斜杠转义，值里含 `"` 或
 * 换行时改走 {JSON.stringify} 花括号，仍是合法 JSX）。其余类型
 * （undefined/null/对象/函数等）无法静态序列化 → undefined（记入 skipped）。 */
function serializeJsxProp(name: string, value: unknown): string | undefined {
  if (value === true) return name;
  if (value === false) return `${name}={false}`;
  if (typeof value === 'number') return `${name}={${value}}`;
  if (typeof value === 'string') {
    return /["\n\r]/.test(value)
      ? `${name}={${JSON.stringify(value)}}`
      : `${name}="${value}"`;
  }
  return undefined;
}

function buildPlaygroundProject(
  input: PropsPlaygroundProjectInput
): PropsPlaygroundProject {
  const { componentName, importStatement, propsState } = input;
  const attributes: string[] = [];
  const skipped: string[] = [];
  for (const [prop, value] of Object.entries(propsState)) {
    const attribute = serializeJsxProp(prop, value);
    if (attribute === undefined) skipped.push(prop);
    else attributes.push(attribute);
  }

  /* 元素源码：无覆盖 → 自闭合；有覆盖 → 属性逐行（6 空格标签、8 空格属性，
   * 与外层 <div> 缩进对齐）。 */
  const pad = '      ';
  const element =
    attributes.length === 0
      ? `${pad}<${componentName} />`
      : `${pad}<${componentName}\n${attributes
          .map((attribute) => `        ${attribute}`)
          .join('\n')}\n${pad}/>`;

  /* App.tsx 照 GettingStarted 推荐用法自包含：整包 styles.css + 根元素挂
   * lightTheme/spacing/typography/motion token 类（playground 组件可能组合
   * 主 css family 之外的子组件，整包样式免去闭包推算）。 */
  const app = `${importStatement}
import { lightTheme, spacing, typography, motion } from 'haze-ui';

import 'haze-ui/styles.css';

export default function App() {
  return (
    <div className={\`\${lightTheme} \${spacing} \${typography} \${motion}\`}>
${element}
    </div>
  );
}
`;

  return {
    title: `haze-ui · ${componentName} playground`,
    template: 'node',
    files: {
      'package.json': buildPackageJson({}),
      'vite.config.ts': viteConfig,
      'index.html': indexHtml,
      'src/main.tsx': playgroundMain,
      'src/App.tsx': app,
    },
    openFile: 'src/App.tsx',
    skipped,
  };
}

/**
 * demo 源码形态：App.tsx 为 demo 源码原文；'@/lib' 由 vite alias
 * 解析到 haze-ui 包；main.tsx 引入 tokens.css 与该组件的 css family
 * （routeKey 查不到时回退 tokens-only）并把主题 token 类挂到 <html> 上。
 * `options` 详见 StackblitzProjectOptions。
 */
export function buildStackblitzProject(
  name: string,
  source: string,
  options?: StackblitzProjectOptions
): StackblitzProject;
/**
 * props playground 形态：把驱动中的组件与当前 props 覆盖项序列化为
 * 自包含的 App.tsx（GettingStarted 推荐用法：整包 styles.css + 根元素
 * token 类）；无法序列化为 JSX 的值跳过并记入返回值的 `skipped`。
 */
export function buildStackblitzProject(
  input: PropsPlaygroundProjectInput
): PropsPlaygroundProject;
export function buildStackblitzProject(
  nameOrInput: string | PropsPlaygroundProjectInput,
  source?: string,
  options?: StackblitzProjectOptions
): StackblitzProject | PropsPlaygroundProject {
  if (typeof nameOrInput === 'string') {
    return buildDemoProject(nameOrInput, source ?? '', options ?? {});
  }
  return buildPlaygroundProject(nameOrInput);
}
