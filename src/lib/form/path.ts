import type {Name} from 'react-f0rm';

const numericSegment = /^-?\d+$/;

/**
 * 把 `Name`（`'user.tags'` / `'items[0].name'` / 段数组）解析为段数组，
 * 语法镜像 react-f0rm 的路径解析器（数组段只能方括号：`items[0]`；
 * 点分数字段抛 TypeError；带引号段 `items["0"]` 表示字符串键）。
 * f0rm 未导出它的解析器，这里集中一份为「操作前物化」提供一致的
 * 段视图——上游解析器若变，只需同步这一处。
 */
export function toSegments(name: Name): (string | number)[] {
  if (Array.isArray(name)) return name;
  const segments: (string | number)[] = [];
  let current = '';
  const flush = () => {
    if (numericSegment.test(current)) {
      throw new TypeError(
        `Numeric path segment must use bracket notation (path: ${name})`
      );
    }
    segments.push(current);
    current = '';
  };
  for (let i = 0; i < name.length; i++) {
    const char = name[i]!;
    if (char === '.') {
      if (current !== '') flush();
    } else if (char === '[') {
      if (current !== '') flush();
      const quote = name[i + 1];
      if (quote === '"' || quote === "'") {
        const close = name.indexOf(quote, i + 2);
        if (close === -1) {
          throw new TypeError(`Unterminated quote in path: ${name}`);
        }
        if (name[close + 1] !== ']') {
          throw new TypeError(`Expected "]" after quoted segment in path: ${name}`);
        }
        segments.push(name.slice(i + 2, close));
        i = close + 1;
      } else {
        const close = name.indexOf(']', i + 1);
        if (close === -1) {
          throw new TypeError(`Unterminated bracket in path: ${name}`);
        }
        const raw = name.slice(i + 1, close);
        segments.push(numericSegment.test(raw) ? Number(raw) : raw);
        i = close;
      }
    } else {
      current += char;
    }
  }
  if (current !== '' || segments.length === 0) flush();
  return segments;
}
