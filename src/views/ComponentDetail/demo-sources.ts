/**
 * demos 目录源码映射：'./demos/ButtonDemo.tsx' → 文件内容字符串。
 * DemoSource（源码区块）与 DemoPreview（页内运行）共享同一条解析路径。
 */

export type DemoEntry = { fileName: string; source: string };

const demoSources = import.meta.glob('./demos/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** route 名 → demo 文件名（'data-table' → 'DataTableDemo.tsx'）。 */
function demoFileName(route: string): string {
  const componentName = `${route
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')}Demo`;
  return `${componentName}.tsx`;
}

// route key 全小写，而文件名内部的大写切分无法从 route 恢复
// （'numberinput' → NumberInputDemo、'otpinput' → OTPInputDemo），统一转
// 小写后比对即可全部命中。demos 目录之外的 demo（'form' 在
// @/components/FormDemo）找不到 → undefined，调用方各自兜底。
const demoEntriesByName = new Map<string, DemoEntry>(
  Object.entries(demoSources).map(([path, source]) => {
    const fileName = path.slice('./demos/'.length);
    return [fileName.toLowerCase(), { fileName, source }];
  })
);

/** route key → demos 目录里的源码条目；查不到（如 'form'）→ undefined。 */
export function resolveDemo(name: string): DemoEntry | undefined {
  return demoEntriesByName.get(demoFileName(name).toLowerCase());
}
