import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { expect } from 'vitest';

// 发布契约：dist/css-manifest.json（split-css 从本次构建产物推导的
// 导出 → css 文件映射，发布为 haze-ui/css-manifest.json 子路径）必须与
// 实际发布面一致。消费方（如 painless 的 vite-plugin-haze-css）以它为
// 唯一事实源做按需 css 注入，漂移即下游 build 失败——前科：漏登记
// InputCore 家族曾令 painless build 必挂（kebab 直拼 input-core.css 不存在）。
// 守卫不重推导映射（那会与生成逻辑同错），而是用三个独立事实对账：
//   1. 运行时导出面：子进程裸 node import dist/index.js 读 Object.keys
//      ——新增导出而 manifest 未覆盖（解析失明/手改 manifest）即红；
//   2. families ∩ noCss = ∅ 且二者并集 = 运行时导出面（精确划分）；
//   3. families 值集合 = dist/css 实际 css 文件集合（缺文件/孤儿 css 红）。
// 本用例在「先 build 后 test」的 release 流水线里对将发布的 dist 实测；
// 无 dist 时（普通 CI 先 test 后 build）跳过。
const distDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../dist'
);
const built = existsSync(path.join(distDir, 'css-manifest.json'));

type CssManifest = {
  families: Record<string, string>;
  noCss: string[];
  // export -> 其渲染闭包需要的 *额外* css 家族文件（自身 family 已由
  // families 承载，tokens 恒注入故不在列）。split-css 从 dist JS import
  // 图推演——Button 的 loading 挂 Spinner、DateTimePicker 纯糖装
  // Datepicker 这类跨目录依赖不靠手工表维护。
  dependencies: Record<string, string[]>;
};

// describe.skip 仍会执行工厂函数（vitest 同 jest 语义：skip 只标记执行，
// 收集阶段照跑）——dist 缺席时工厂里不能做文件 IO，否则普通 CI
// （先 test 后 build）在本用例上套件级炸红。读操作一律以 built 门控。
const manifest = built
  ? (JSON.parse(
      readFileSync(path.join(distDir, 'css-manifest.json'), 'utf8')
    ) as CssManifest)
  : { families: {}, noCss: [], dependencies: {} };

const manifestContract = built ? describe : describe.skip;
manifestContract('dist 发布契约：css-manifest.json 与产物一致', () => {
  const families = manifest.families;
  const noCss = manifest.noCss;

  it('形状：{families: Record<string, string>, noCss: string[]}', () => {
    expect(families).toBeTruthy();
    expect(noCss).toBeTruthy();
    // 键值形状：css 文件名不含扩展名、不含路径分隔符
    for (const [name, css] of Object.entries(families)) {
      expect(name).toMatch(/^\w+$/);
      expect(css).toMatch(/^[\w-]+$/);
    }
    for (const name of noCss) expect(name).toMatch(/^\w+$/);
  });

  it('纯逻辑导出与有样式导出不相交', () => {
    const overlap = noCss.filter((name) => name in families);
    expect(overlap).toEqual([]);
  });

  it('运行时导出面被 families ∪ noCss 精确划分（新增导出漏入 manifest 即红）', () => {
    // 子进程裸 node 读运行时导出（同 dist-esm-contract 的理由：不经
    // vite/vitest 管线转换，拿到的是发布物的真实表面）
    const script = `import(${JSON.stringify(
      pathToFileURL(path.join(distDir, 'index.js')).href
    )})\n  .then((m) => { console.log(JSON.stringify(Object.keys(m).sort())); })\n  .catch((e) => { console.error(e.message); process.exit(1); });`;
    const stdout = execFileSync('node', ['--input-type=module', '-e', script], {
      encoding: 'utf8',
      stdio: 'pipe',
    });
    const runtimeExports = JSON.parse(stdout) as string[];
    expect(runtimeExports).toEqual(
      [...Object.keys(families), ...noCss].sort()
    );
  });

  it('families 值集合 = dist/css 实际 css 文件集合', () => {
    const cssFiles = readdirSync(path.join(distDir, 'css'))
      .filter((f) => f.endsWith('.css'))
      .map((f) => f.replace(/\.css$/, ''))
      .sort();
    expect([...new Set(Object.values(families))].sort()).toEqual(cssFiles);
  });

  it('dependencies：键 ⊆ 导出面、值 ⊆ 存在的 css 文件、不含自身 family', () => {
    const cssFiles = new Set(
      readdirSync(path.join(distDir, 'css'))
        .filter((f) => f.endsWith('.css'))
        .map((f) => f.replace(/\.css$/, ''))
    );
    cssFiles.delete('tokens'); // tokens 恒注入，dependencies 不该引用
    const exports_ = new Set([...Object.keys(families), ...noCss]);
    for (const [name, deps] of Object.entries(manifest.dependencies)) {
      expect(exports_.has(name), `${name} not an export`).toBe(true);
      expect(deps.length).toBeGreaterThan(0);
      for (const dep of deps) {
        expect(cssFiles.has(dep), `${name} -> ${dep}.css does not exist`).toBe(true);
        expect(dep).not.toBe(families[name]); // 自身 family 由 families 承载
      }
    }
  });

  it('dependencies 覆盖跨家族渲染面（Button loading → spinner 的前科）', () => {
    // 注册了前科锚点：Button 的 loading 渲染 Spinner、DateTimePicker 纯
    // 糖装 Datepicker——两处跨目录 css 依赖曾因 manifest 1:1 映射而不可
    // 表达，haze-ui-vite 只能拿 SHARING 手工补丁兜。闭包推演落地后这两
    // 个条目必须常驻；改动组件实现移除了依赖时删除对应断言即可。
    expect(manifest.dependencies.Button).toContain('spinner');
    expect(manifest.dependencies.DateTimePicker).toContain('datepicker');
  });
});
