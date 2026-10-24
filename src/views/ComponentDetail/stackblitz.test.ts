import { buildStackblitzProject } from './stackblitz';

type GeneratedPkg = {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
};

const parsePkg = (raw: string): GeneratedPkg => JSON.parse(raw) as GeneratedPkg;

const buttonSource = `import { Button } from '@/lib';

export default function Demo() {
  return <Button variant='solid'>Solid</Button>;
}
`;

describe('buildStackblitzProject', () => {
  it('emits a package.json with react/react-dom/haze-ui and vite devDeps', () => {
    const project = buildStackblitzProject('button', buttonSource);
    const pkg = parsePkg(project.files['package.json']!);
    expect(pkg.dependencies['haze-ui']).toBeDefined();
    expect(pkg.dependencies.react).toBeDefined();
    expect(pkg.dependencies['react-dom']).toBeDefined();
    expect(pkg.devDependencies.vite).toBeDefined();
    expect(pkg.devDependencies['@vitejs/plugin-react']).toBeDefined();
    expect(pkg.devDependencies.typescript).toBeDefined();
    expect(pkg.scripts.dev).toBe('vite');
  });

  it('returns a node template project opened on src/App.tsx', () => {
    const project = buildStackblitzProject('button', buttonSource);
    expect(project.template).toBe('node');
    expect(project.openFile).toBe('src/App.tsx');
  });

  it('aliases @/lib to the haze-ui package in vite.config.ts', () => {
    const viteConfig = buildStackblitzProject('button', buttonSource).files[
      'vite.config.ts'
    ]!;
    expect(viteConfig).toContain("'@/lib': 'haze-ui'");
  });

  it('embeds the demo source verbatim as src/App.tsx', () => {
    const project = buildStackblitzProject('button', buttonSource);
    expect(project.files['src/App.tsx']).toBe(buttonSource);
  });

  it('imports tokens.css and the component css family in src/main.tsx', () => {
    const main = buildStackblitzProject('button', buttonSource).files[
      'src/main.tsx'
    ]!;
    expect(main).toContain("import 'haze-ui/css/tokens.css'");
    expect(main).toContain("import 'haze-ui/css/button.css'");
    expect(main).toContain("from 'react-dom/client'");
  });

  it('appends known libs imported by the demo to dependencies', () => {
    const source = `import { Smile } from 'lucide-react';
import { FiX } from 'react-icons/fi';
import { Button } from '@/lib';

export default function Demo() {
  return <Button>hi</Button>;
}
`;
    const pkg = parsePkg(
      buildStackblitzProject('button', source).files['package.json']!
    );
    expect(pkg.dependencies['lucide-react']).toBeDefined();
    // 子路径导入（react-icons/fi）归并到包名
    expect(pkg.dependencies['react-icons']).toBeDefined();
  });

  it('falls back to tokens-only css when the routeKey is unknown', () => {
    const project = buildStackblitzProject('form', buttonSource);
    const main = project.files['src/main.tsx']!;
    expect(main).toContain("import 'haze-ui/css/tokens.css'");
    expect(main).not.toMatch(/haze-ui\/css\/(?!tokens)/);
    // 工程文件树依然完整
    expect(Object.keys(project.files)).toContain('src/App.tsx');
  });
});

describe('buildStackblitzProject (props playground input)', () => {
  const input = {
    componentName: 'Button',
    importStatement: "import { Button } from 'haze-ui';",
    propsState: {
      variant: 'solid',
      note: 'plain text',
      label: 'Press "me"',
      square: true,
      disabled: false,
      count: 7,
      icon: { ref: 1 },
      onSelect: () => undefined,
    } as Record<string, unknown>,
  };

  it('emits a complete vite project tree with repo-pinned versions', () => {
    const project = buildStackblitzProject(input);
    expect(project.title).toBe('haze-ui · Button playground');
    expect(project.openFile).toBe('src/App.tsx');
    const pkg = parsePkg(project.files['package.json']!);
    expect(pkg.dependencies['haze-ui']).toBeDefined();
    expect(pkg.dependencies.react).toMatch(/^\^19\./);
    expect(pkg.dependencies['react-dom']).toMatch(/^\^19\./);
    expect(pkg.devDependencies.vite).toBeDefined();
    expect(Object.keys(project.files)).toEqual(
      expect.arrayContaining([
        'package.json',
        'index.html',
        'vite.config.ts',
        'src/main.tsx',
        'src/App.tsx',
      ])
    );
  });

  it('serializes the props state into App.tsx as JSX attributes', () => {
    const app = buildStackblitzProject(input).files['src/App.tsx']!;
    expect(app).toContain("import { Button } from 'haze-ui';");
    // 字符串（含枚举值）→ 双引号字面量
    expect(app).toContain('variant="solid"');
    expect(app).toContain('note="plain text"');
    // 含双引号的字符串走花括号 + JSON 转义（JSX 属性字面量没有 \ 转义）
    expect(app).toContain('label={"Press \\"me\\""');
    // boolean true → 裸属性；false / number → 花括号表达式
    expect(app).toMatch(/\n\s+square\n/);
    expect(app).toContain('disabled={false}');
    expect(app).toContain('count={7}');
    expect(app).toContain('<Button');
  });

  it('skips values it cannot serialize and reports them by prop name', () => {
    const project = buildStackblitzProject(input);
    expect(project.skipped).toEqual(['icon', 'onSelect']);
    expect(project.files['src/App.tsx']).not.toContain('icon');
    expect(project.files['src/App.tsx']).not.toContain('onSelect');
  });

  it('mounts lightTheme and tokens per the getting-started recipe', () => {
    const app = buildStackblitzProject(input).files['src/App.tsx']!;
    expect(app).toContain("import 'haze-ui/styles.css';");
    expect(app).toContain(
      '`${lightTheme} ${spacing} ${typography} ${motion}`'
    );
  });

  it('renders a bare self-closing component when nothing is overridden', () => {
    const app = buildStackblitzProject({
      componentName: 'Switch',
      importStatement: "import { Switch } from 'haze-ui';",
      propsState: {},
    }).files['src/App.tsx']!;
    expect(app).toContain('<Switch />');
  });

  it('is pure — equal inputs produce equal projects', () => {
    const first = buildStackblitzProject(input);
    const second = buildStackblitzProject({
      componentName: 'Button',
      importStatement: "import { Button } from 'haze-ui';",
      propsState: { ...input.propsState },
    });
    expect(second).toEqual(first);
  });
});
