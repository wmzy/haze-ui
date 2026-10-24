import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { Segmented } from '@/lib';
import { Rich, useSiteLocale } from '@/views/i18n';
import { page, intro, section } from '@/views/ComponentDetail/styles';

const FRAMEWORKS = [
  { value: 'vite', label: 'Vite' },
  { value: 'next', label: 'Next.js' },
] as const;

const codeBlock = css`
  background: var(--haze-color-bg-muted);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-4);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-normal);
  overflow-x: auto;
  margin: var(--haze-space-3) 0 var(--haze-space-6);
  white-space: pre;
  color: var(--haze-color-text);
`;

const inlineCode = css`
  background: var(--haze-color-bg-muted);
  border-radius: var(--haze-radius-sm);
  padding: 0.15em 0.4em;
  font-family: var(--haze-font-mono);
  font-size: 0.9em;
`;

const paragraph = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-base);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-relaxed);
  margin: 0 0 var(--haze-space-4);
`;

const stepList = css`
  list-style: none;
  padding: 0;
  margin: 0 0 var(--haze-space-6);
  counter-reset: step;

  & > li {
    counter-increment: step;
    padding-left: var(--haze-space-8);
    position: relative;
    margin-bottom: var(--haze-space-4);
    font-family: var(--haze-font-sans);
    font-size: var(--haze-text-base);
    line-height: var(--haze-leading-relaxed);
    color: var(--haze-color-text);

    &::before {
      content: counter(step);
      position: absolute;
      left: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--haze-color-primary);
      color: var(--haze-color-text-inverse);
      font-size: var(--haze-text-xs);
      font-weight: var(--haze-weight-bold);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

const note = css`
  background: var(--haze-color-primary-subtle);
  border-left: 3px solid var(--haze-color-primary);
  border-radius: 0 var(--haze-radius-md) var(--haze-radius-md) 0;
  padding: var(--haze-space-3) var(--haze-space-4);
  margin: var(--haze-space-4) 0;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-normal);
`;

const frameworkPanel = css`
  margin-top: var(--haze-space-4);
`;

export default function GettingStarted() {
  const { t } = useSiteLocale();
  const gs = t.gettingStarted;
  const [framework, , frameworkCtrl] = useControl(undefined, 'vite');

  return (
    <div className={page}>
      <h1>{gs.title}</h1>
      <p className={intro}>{gs.intro}</p>

      <div className={section}>
        <h2>{gs.installation.title}</h2>
        <p className={paragraph}>
          <Rich text={gs.installation.peers} codeClass={inlineCode} />
        </p>
        <pre className={codeBlock}>npm install haze-ui @linaria/core</pre>
        <p className={paragraph}>{gs.installation.orOtherManagers}</p>
        <pre className={codeBlock}>{`# pnpm
pnpm add haze-ui @linaria/core

# yarn
yarn add haze-ui @linaria/core`}</pre>
      </div>

      <div className={section}>
        <h2>{gs.frameworks.title}</h2>
        <p className={paragraph}>
          <Rich text={gs.frameworks.intro} codeClass={inlineCode} />
        </p>
        <Segmented
          options={[...FRAMEWORKS]}
          value={frameworkCtrl}
          aria-label={gs.frameworks.switchLabel}
        />
        {framework === 'vite' ? (
          <div className={frameworkPanel}>
            <p className={paragraph}>{gs.frameworks.vite.lead}</p>
            <pre className={codeBlock}>{`npm create vite@latest my-app -- --template react-ts
cd my-app
npm i haze-ui @linaria/core`}</pre>
            <p className={paragraph}>
              <Rich text={gs.frameworks.vite.modeA} codeClass={inlineCode} />
            </p>
            <pre
              className={codeBlock}
            >{`// src/main.tsx — mode A: one full stylesheet (simplest)
import 'haze-ui/styles.css';`}</pre>
            <p className={paragraph}>
              <Rich text={gs.frameworks.vite.modeB} codeClass={inlineCode} />
            </p>
            <pre
              className={codeBlock}
            >{`// vite.config.ts — mode B: the plugin injects per-component CSS
import react from '@vitejs/plugin-react';
import hazeCss from 'vite-plugin-haze-ui';

export default {
  plugins: [react(), hazeCss()],
};`}</pre>
            <div className={note}>
              <Rich text={gs.frameworks.vite.pluginNote} codeClass={inlineCode} />
            </div>
          </div>
        ) : (
          <div className={frameworkPanel}>
            <p className={paragraph}>{gs.frameworks.next.lead}</p>
            <pre className={codeBlock}>{`npx create-next-app@latest my-app --app --ts
cd my-app
npm i haze-ui @linaria/core`}</pre>
            <p className={paragraph}>
              <Rich text={gs.frameworks.next.modeA} codeClass={inlineCode} />
            </p>
            <pre
              className={codeBlock}
            >{`// app/layout.tsx — mode A: one full stylesheet (simplest)
import 'haze-ui/styles.css';`}</pre>
            <p className={paragraph}>
              <Rich text={gs.frameworks.next.modeB} codeClass={inlineCode} />
            </p>
            <pre
              className={codeBlock}
            >{`// app/layout.tsx — mode B: tokens once + each component family
import 'haze-ui/css/tokens.css';
import 'haze-ui/css/button.css'; // OTPInput -> 'haze-ui/css/otp-input.css'`}</pre>
            <div className={note}>
              <Rich text={gs.frameworks.next.note} codeClass={inlineCode} />
            </div>
          </div>
        )}
      </div>

      <div className={section}>
        <h2>{gs.otherBundlers.title}</h2>
        <p className={paragraph}>
          <Rich text={gs.otherBundlers.lead} codeClass={inlineCode} />
        </p>
        <pre className={codeBlock}>{`// entry module — no plugin to install, the CSS ships as plain files
import 'haze-ui/styles.css';
// or per-component (the same files the Vite plugin would inject):
// import 'haze-ui/css/tokens.css';
// import 'haze-ui/css/button.css';`}</pre>
        <p className={paragraph}>
          <Rich text={gs.otherBundlers.configLead} codeClass={inlineCode} />
        </p>
        <pre className={codeBlock}>{`// webpack.config.js — webpack 5, css-loader + a style injector
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\\.css$/,
        // style-loader instead of MiniCssExtractPlugin also works in dev
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin()],
};`}</pre>
        <div className={note}>
          <Rich text={gs.otherBundlers.sideEffectsNote} codeClass={inlineCode} />
        </div>
        <div className={note}>
          <Rich text={gs.otherBundlers.rspackNote} codeClass={inlineCode} />
        </div>
      </div>

      <div className={section}>
        <h2>{gs.setup.title}</h2>
        <ol className={stepList}>
          <li>
            <Rich text={gs.setup.steps[0]?.lead ?? []} codeClass={inlineCode} />
            <pre className={codeBlock}>{`// full bundle (~12kB gzipped)
import 'haze-ui/styles.css';

// or per-component: tokens once + each component's css
import 'haze-ui/css/tokens.css';
import 'haze-ui/css/button.css'; // OTPInput -> 'haze-ui/css/otp-input.css'`}</pre>
          </li>
          <li>
            <Rich text={gs.setup.steps[1]?.lead ?? []} codeClass={inlineCode} />
            <pre
              className={codeBlock}
            >{`import { lightTheme, spacing, typography } from 'haze-ui';

function App() {
  return (
    <div className={\`\${lightTheme} \${spacing} \${typography}\`}>
      {/* your app */}
    </div>
  );
}`}</pre>
          </li>
          <li>
            <Rich text={gs.setup.steps[2]?.lead ?? []} codeClass={inlineCode} />
            <pre
              className={codeBlock}
            >{`import { Button, Input, Card } from 'haze-ui';

function LoginForm() {
  return (
    <Card>
      <Input placeholder="Email" />
      <Input placeholder="Password" />
      <Button>Sign In</Button>
    </Card>
  );
}`}</pre>
          </li>
        </ol>
      </div>

      <div className={section}>
        <h2>{gs.theming.title}</h2>
        <p className={paragraph}>{gs.theming.tokensPara}</p>
        <pre
          className={codeBlock}
        >{`import { lightTheme, darkTheme } from 'haze-ui';

// Apply to any container
<div className={darkTheme}>
  <Button>Dark Mode Button</Button>
</div>`}</pre>
        <p className={paragraph}>{gs.theming.overridePara}</p>
        <pre className={codeBlock}>{`/* Custom brand color */
.my-theme {
  --haze-color-primary: #8b5cf6;
  --haze-color-primary-hover: #7c3aed;
  --haze-color-primary-active: #6d28d9;
}`}</pre>
        <div className={note}>
          <Rich text={gs.theming.prefixNote} codeClass={inlineCode} />
        </div>
        <p className={paragraph}>
          <Rich text={gs.theming.dtfPara} codeClass={inlineCode} />
        </p>
        <pre
          className={codeBlock}
        >{`import lightTokens from 'haze-ui/design-tokens/light.json';

// lightTokens.haze.color.primary.$value -> 'oklch(0.563 0.241 260.8)'
// lightTokens.haze.radius.md.$value -> '6px'
// dark mode: 'haze-ui/design-tokens/dark.json'`}</pre>
        <div className={note}>{gs.theming.dtfNote}</div>
      </div>

      <div className={section}>
        <h2>{gs.tailwind.title}</h2>
        <p className={paragraph}>
          <Rich text={gs.tailwind.intro} codeClass={inlineCode} />
        </p>
        <pre className={codeBlock}>{`/* app/globals.css */
@import 'tailwindcss';

/* 'inline' makes every utility carry the var() reference itself, so each
   token resolves on the element inside your themed subtree */
@theme inline {
  --color-primary: var(--haze-color-primary);
  --color-primary-hover: var(--haze-color-primary-hover);
  --color-bg: var(--haze-color-bg);
  --color-bg-muted: var(--haze-color-bg-muted);
  --color-text: var(--haze-color-text);
  --color-border: var(--haze-color-border);
}`}</pre>
        <pre className={codeBlock}>{`<div className={lightTheme}>
  <p className="bg-primary px-4 py-2 rounded-md">
    Tailwind utilities, Haze UI tokens
  </p>
</div>`}</pre>
        <div className={note}>
          <Rich text={gs.tailwind.inlineNote} codeClass={inlineCode} />
        </div>
        <p className={paragraph}>
          <Rich text={gs.tailwind.cascadePara} codeClass={inlineCode} />
        </p>
        <p className={paragraph}>
          <Rich text={gs.tailwind.preflightPara} codeClass={inlineCode} />
        </p>
      </div>

      <div className={section}>
        <h2>{gs.controlled.title}</h2>
        <p className={paragraph}>
          <Rich text={gs.controlled.intro} codeClass={inlineCode} />
        </p>
        <pre className={codeBlock}>{`import { Input } from 'haze-ui';
import { useControl } from 'react-use-control';

function SearchBox() {
  const [value, setValue, valueCtrl] = useControl(undefined, '');

  return (
    <>
      <Input value={valueCtrl} placeholder="Search..." />
      <p>You typed: {value}</p>
    </>
  );
}`}</pre>
        <p className={paragraph}>
          <Rich text={gs.controlled.outro} codeClass={inlineCode} />
        </p>
      </div>

      <div className={section}>
        <h2>{gs.ssr.title}</h2>
        <p className={paragraph}>
          <Rich text={gs.ssr.enforcedPara} codeClass={inlineCode} />
        </p>
        <p className={paragraph}>
          <Rich text={gs.ssr.boundaryPara} codeClass={inlineCode} />
        </p>
        <p className={paragraph}>
          <Rich text={gs.ssr.loadPara} codeClass={inlineCode} />
        </p>
        <pre className={codeBlock}>{`// app/layout.tsx
import type { Metadata } from 'next';
import { lightTheme, spacing, typography } from 'haze-ui/tokens';

import 'haze-ui/styles.css';
// or per-component: 'haze-ui/css/tokens.css' + 'haze-ui/css/button.css' + ...

export const metadata: Metadata = {
  title: 'My App',
  description: 'Built with Haze UI',
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body className={\`\${lightTheme} \${spacing} \${typography}\`}>
        {children}
      </body>
    </html>
  );
}`}</pre>
        <pre className={codeBlock}>{`// app/page.tsx
'use client';

import { Button, ToastContainer, useToast } from 'haze-ui';

export default function Page() {
  const toast = useToast();

  return (
    <ToastContainer>
      <Button onClick={() => toast('Saved', {variant: 'success'})}>
        Save
      </Button>
    </ToastContainer>
  );
}`}</pre>
        <div className={note}>
          <Rich text={gs.ssr.note} codeClass={inlineCode} />
        </div>
      </div>

      <div className={section}>
        <h2>{gs.testing.title}</h2>
        <p className={paragraph}>
          <Rich text={gs.testing.jestLead} codeClass={inlineCode} />
        </p>
        <pre className={codeBlock}>{`pnpm add -D jest jest-environment-jsdom babel-jest \\
  @babel/preset-env @babel/preset-react \\
  @testing-library/react @testing-library/user-event`}</pre>
        <pre className={codeBlock}>{`// babel.config.cjs — ".cjs" because Vite scaffolds set "type": "module"
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};`}</pre>
        <pre className={codeBlock}>{`// style-mock.js — moduleNameMapper target for CSS imports
module.exports = {};`}</pre>
        <pre
          className={codeBlock}
        >{`// jest.config.cjs — verified against a real throwaway Jest consumer
// ESM-only packages that must pass through Babel. pnpm stores packages at
// node_modules/.pnpm/<name>@<ver>/node_modules/<name>/ (scope '/' -> '+'),
// npm/yarn use node_modules/<name>/ — allow-list both shapes.
const esmOnly = ['haze-ui', 'react-use-control']; // exact names
const esmScopes = ['@tanstack']; // react-table pulls table-core + store, all ESM
const pnpmStore = [
  ...esmOnly.map((n) => n.replace('/', '\\\\+')),
  ...esmScopes.map((s) => s.replace('/', '\\\\+') + '[^/]*'),
].join('|');
const flat = [
  ...esmOnly,
  ...esmScopes.map((s) => s + '/[^/]*'),
].join('|');

module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\\\.css$': '<rootDir>/style-mock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:\\\\.pnpm/(?:' + pnpmStore + ')@|(?:' + flat + ')/))',
  ],
};`}</pre>
        <p className={paragraph}>
          <Rich text={gs.testing.allowNote} codeClass={inlineCode} />
        </p>
        <pre
          className={codeBlock}
        >{`// haze-ui.test.js — the styles.css import exercises the mapper stub
import 'haze-ui/styles.css';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Switch } from 'haze-ui';

test('Button renders children into a native button', () => {
  render(<Button>Save changes</Button>);
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeTruthy();
});

test('Switch toggles aria-checked on click', async () => {
  const user = userEvent.setup();
  render(<Switch aria-label='Dark mode' />);
  const sw = screen.getByRole('switch', { name: 'Dark mode' });
  expect(sw.getAttribute('aria-checked')).toBe('false');
  await user.click(sw);
  expect(sw.getAttribute('aria-checked')).toBe('true');
});`}</pre>
        <p className={paragraph}>
          <Rich text={gs.testing.vitestPara} codeClass={inlineCode} />
        </p>
      </div>

      <div className={section}>
        <h2>{gs.typescript.title}</h2>
        <p className={paragraph}>
          <Rich text={gs.typescript.para} codeClass={inlineCode} />
        </p>
        <pre
          className={codeBlock}
        >{`import type { ButtonProps, InputProps } from 'haze-ui';`}</pre>
      </div>

      <div className={section}>
        <h2>{gs.browser.title}</h2>
        <p className={paragraph}>
          <Rich text={gs.browser.para} codeClass={inlineCode} />
        </p>
        <ul className={stepList}>
          {gs.browser.browsers.map((browser) => (
            <li key={browser}>{browser}</li>
          ))}
        </ul>
      </div>

      <div className={section}>
        <h2>{gs.cdn.title}</h2>
        <p className={paragraph}>
          <Rich text={gs.cdn.para} codeClass={inlineCode} />
        </p>
        <pre className={codeBlock}>{`<!doctype html>
<html>
  <head>
    <!-- tokens + styles: one stylesheet, pinned to a real version -->
    <link rel="stylesheet" href="https://unpkg.com/haze-ui@1.33.0/styles.css" />
    <!-- components: esm.sh, with React kept external to the import map -->
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@19.1.0",
          "react-dom/client": "https://esm.sh/react-dom@19.1.0/client",
          "haze-ui": "https://esm.sh/haze-ui@1.33.0?external=react,react-dom"
        }
      }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      import { createRoot } from 'react-dom/client';
      import { lightTheme, spacing, typography, Button } from 'haze-ui';

      createRoot(document.getElementById('root')).render(
        <main className={\`\${lightTheme} \${spacing} \${typography}\`}>
          <Button>haze!</Button>
        </main>
      );
    </script>
  </body>
</html>`}</pre>
        <div className={note}>
          <Rich text={gs.cdn.note} codeClass={inlineCode} />
        </div>
      </div>
    </div>
  );
}
