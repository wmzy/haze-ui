/**
 * blocks 目录源码映射：'./blocks/DashboardBlock.tsx' → 文件内容字符串。
 * 页面渲染用组件走常规静态 import（./index.tsx），StackBlitz 工程与
 * 源码折叠区共享这里 ?raw 读出的原文 —— 与 ComponentDetail 的
 * demo-sources.ts 同一条解析路径。
 */

export type BlockSourceEntry = { fileName: string; source: string };

const blockSources = import.meta.glob('./blocks/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const entriesByName = new Map<string, BlockSourceEntry>(
  Object.entries(blockSources).map(([path, source]) => {
    const fileName = path.slice('./blocks/'.length);
    return [fileName, { fileName, source }];
  })
);

/** block id（'dashboard'）→ 源码条目；查不到 → undefined。 */
export function resolveBlockSource(id: string): BlockSourceEntry | undefined {
  const pascal = `${id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')}Block.tsx`;
  return entriesByName.get(pascal);
}
