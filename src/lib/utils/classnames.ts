// ESM replacement for the UMD-only `babel-runtime-jsx-plus` classnames
// helper that babel-plugin-transform-jsx-class imports. The vite alias
// points that import here, so builds inline a tree-shakeable ESM helper
// instead of leaving an unresolvable UMD named-import in the dist.
export function classnames(...args: unknown[]): string {
  const classes: string[] = [];
  const push = (value: unknown): void => {
    if (!value) return;
    if (typeof value === 'string' || typeof value === 'number') {
      classes.push(String(value));
    } else if (Array.isArray(value)) {
      value.forEach(push);
    } else if (typeof value === 'object') {
      for (const [key, on] of Object.entries(value)) {
        if (on) classes.push(key);
      }
    }
  };
  args.forEach(push);
  return classes.join(' ');
}
