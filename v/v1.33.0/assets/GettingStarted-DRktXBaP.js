import{t as e}from"./jsx-runtime-Cx0BB4qO.js";import{t}from"./Segmented-CMLYIM_i.js";import{d as n,i as r,t as i}from"./index-DTFmVJX0.js";import{a,r as o,s}from"./styles-DBn9Gwwz.js";var c=e(),l=[{value:`vite`,label:`Vite`},{value:`next`,label:`Next.js`}],u=`haze-index__codeBlock`,d=`haze-index__inlineCode`,f=`haze-index__paragraph`,p=`haze-index__stepList`,m=`haze-index__note`,h=`haze-index__frameworkPanel`;function g(){let{t:e}=r(),g=e.gettingStarted,[_,,v]=n(void 0,`vite`);return(0,c.jsxs)(`div`,{className:a,children:[(0,c.jsx)(`h1`,{children:g.title}),(0,c.jsx)(`p`,{className:o,children:g.intro}),(0,c.jsxs)(`div`,{className:s,children:[(0,c.jsx)(`h2`,{children:g.installation.title}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.installation.peers,codeClass:d})}),(0,c.jsx)(`pre`,{className:u,children:`npm install haze-ui @linaria/core`}),(0,c.jsx)(`p`,{className:f,children:g.installation.orOtherManagers}),(0,c.jsx)(`pre`,{className:u,children:`# pnpm
pnpm add haze-ui @linaria/core
# yarn
yarn add haze-ui @linaria/core`})]}),(0,c.jsxs)(`div`,{className:s,children:[(0,c.jsx)(`h2`,{children:g.frameworks.title}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.frameworks.intro,codeClass:d})}),(0,c.jsx)(t,{options:[...l],value:v,"aria-label":g.frameworks.switchLabel}),_===`vite`?(0,c.jsxs)(`div`,{className:h,children:[(0,c.jsx)(`p`,{className:f,children:g.frameworks.vite.lead}),(0,c.jsx)(`pre`,{className:u,children:`npm create vite@latest my-app -- --template react-ts
cd my-app
npm i haze-ui @linaria/core`}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.frameworks.vite.modeA,codeClass:d})}),(0,c.jsx)(`pre`,{className:u,children:`// src/main.tsx — mode A: one full stylesheet (simplest)
import 'haze-ui/styles.css';`}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.frameworks.vite.modeB,codeClass:d})}),(0,c.jsx)(`pre`,{className:u,children:`// vite.config.ts — mode B: the plugin injects per-component CSS
import react from '@vitejs/plugin-react';
import hazeCss from 'vite-plugin-haze-ui';
export default {
  plugins: [react(), hazeCss()],
};`}),(0,c.jsx)(`div`,{className:m,children:(0,c.jsx)(i,{text:g.frameworks.vite.pluginNote,codeClass:d})})]}):(0,c.jsxs)(`div`,{className:h,children:[(0,c.jsx)(`p`,{className:f,children:g.frameworks.next.lead}),(0,c.jsx)(`pre`,{className:u,children:`npx create-next-app@latest my-app --app --ts
cd my-app
npm i haze-ui @linaria/core`}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.frameworks.next.modeA,codeClass:d})}),(0,c.jsx)(`pre`,{className:u,children:`// app/layout.tsx — mode A: one full stylesheet (simplest)
import 'haze-ui/styles.css';`}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.frameworks.next.modeB,codeClass:d})}),(0,c.jsx)(`pre`,{className:u,children:`// app/layout.tsx — mode B: tokens once + each component family
import 'haze-ui/css/tokens.css';
import 'haze-ui/css/button.css'; // OTPInput -> 'haze-ui/css/otp-input.css'`}),(0,c.jsx)(`div`,{className:m,children:(0,c.jsx)(i,{text:g.frameworks.next.note,codeClass:d})})]})]}),(0,c.jsxs)(`div`,{className:s,children:[(0,c.jsx)(`h2`,{children:g.setup.title}),(0,c.jsxs)(`ol`,{className:p,children:[(0,c.jsxs)(`li`,{children:[(0,c.jsx)(i,{text:g.setup.steps[0]?.lead??[],codeClass:d}),(0,c.jsx)(`pre`,{className:u,children:`// full bundle (~12kB gzipped)
import 'haze-ui/styles.css';
// or per-component: tokens once + each component's css
import 'haze-ui/css/tokens.css';
import 'haze-ui/css/button.css'; // OTPInput -> 'haze-ui/css/otp-input.css'`})]}),(0,c.jsxs)(`li`,{children:[(0,c.jsx)(i,{text:g.setup.steps[1]?.lead??[],codeClass:d}),(0,c.jsx)(`pre`,{className:u,children:`import { lightTheme, spacing, typography } from 'haze-ui';
function App() {
  return (
    <div className={\`\${lightTheme} \${spacing} \${typography}\`}>
      {/* your app */}
    </div>
  );
}`})]}),(0,c.jsxs)(`li`,{children:[(0,c.jsx)(i,{text:g.setup.steps[2]?.lead??[],codeClass:d}),(0,c.jsx)(`pre`,{className:u,children:`import { Button, Input, Card } from 'haze-ui';
function LoginForm() {
  return (
    <Card>
      <Input placeholder="Email" />
      <Input placeholder="Password" />
      <Button>Sign In</Button>
    </Card>
  );
}`})]})]})]}),(0,c.jsxs)(`div`,{className:s,children:[(0,c.jsx)(`h2`,{children:g.theming.title}),(0,c.jsx)(`p`,{className:f,children:g.theming.tokensPara}),(0,c.jsx)(`pre`,{className:u,children:`import { lightTheme, darkTheme } from 'haze-ui';
// Apply to any container
<div className={darkTheme}>
  <Button>Dark Mode Button</Button>
</div>`}),(0,c.jsx)(`p`,{className:f,children:g.theming.overridePara}),(0,c.jsx)(`pre`,{className:u,children:`/* Custom brand color */
.my-theme {
  --haze-color-primary: #8b5cf6;
  --haze-color-primary-hover: #7c3aed;
  --haze-color-primary-active: #6d28d9;
}`}),(0,c.jsx)(`div`,{className:m,children:(0,c.jsx)(i,{text:g.theming.prefixNote,codeClass:d})}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.theming.dtfPara,codeClass:d})}),(0,c.jsx)(`pre`,{className:u,children:`import lightTokens from 'haze-ui/design-tokens/light.json';
// lightTokens.haze.color.primary.$value -> 'oklch(0.563 0.241 260.8)'
// lightTokens.haze.radius.md.$value -> '6px'
// dark mode: 'haze-ui/design-tokens/dark.json'`}),(0,c.jsx)(`div`,{className:m,children:g.theming.dtfNote})]}),(0,c.jsxs)(`div`,{className:s,children:[(0,c.jsx)(`h2`,{children:g.tailwind.title}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.tailwind.intro,codeClass:d})}),(0,c.jsx)(`pre`,{className:u,children:`/* app/globals.css */
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
}`}),(0,c.jsx)(`pre`,{className:u,children:`<div className={lightTheme}>
  <p className="bg-primary px-4 py-2 rounded-md">
    Tailwind utilities, Haze UI tokens
  </p>
</div>`}),(0,c.jsx)(`div`,{className:m,children:(0,c.jsx)(i,{text:g.tailwind.inlineNote,codeClass:d})}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.tailwind.cascadePara,codeClass:d})}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.tailwind.preflightPara,codeClass:d})})]}),(0,c.jsxs)(`div`,{className:s,children:[(0,c.jsx)(`h2`,{children:g.controlled.title}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.controlled.intro,codeClass:d})}),(0,c.jsx)(`pre`,{className:u,children:`import { Input } from 'haze-ui';
import { useControl } from 'react-use-control';
function SearchBox() {
  const [value, setValue, valueCtrl] = useControl(undefined, '');
  return (
    <>
      <Input value={valueCtrl} placeholder="Search..." />
      <p>You typed: {value}</p>
    </>
  );
}`}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.controlled.outro,codeClass:d})})]}),(0,c.jsxs)(`div`,{className:s,children:[(0,c.jsx)(`h2`,{children:g.ssr.title}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.ssr.enforcedPara,codeClass:d})}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.ssr.boundaryPara,codeClass:d})}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.ssr.loadPara,codeClass:d})}),(0,c.jsx)(`pre`,{className:u,children:`// app/layout.tsx
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
}`}),(0,c.jsx)(`pre`,{className:u,children:`// app/page.tsx
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
}`}),(0,c.jsx)(`div`,{className:m,children:(0,c.jsx)(i,{text:g.ssr.note,codeClass:d})})]}),(0,c.jsxs)(`div`,{className:s,children:[(0,c.jsx)(`h2`,{children:g.testing.title}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.testing.jestLead,codeClass:d})}),(0,c.jsx)(`pre`,{className:u,children:`pnpm add -D jest jest-environment-jsdom babel-jest \\
  @babel/preset-env @babel/preset-react \\
  @testing-library/react @testing-library/user-event`}),(0,c.jsx)(`pre`,{className:u,children:`// babel.config.cjs — ".cjs" because Vite scaffolds set "type": "module"
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};`}),(0,c.jsx)(`pre`,{className:u,children:`// style-mock.js — moduleNameMapper target for CSS imports
module.exports = {};`}),(0,c.jsx)(`pre`,{className:u,children:`// jest.config.cjs — verified against a real throwaway Jest consumer
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
};`}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.testing.allowNote,codeClass:d})}),(0,c.jsx)(`pre`,{className:u,children:`// haze-ui.test.js — the styles.css import exercises the mapper stub
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
});`}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.testing.vitestPara,codeClass:d})})]}),(0,c.jsxs)(`div`,{className:s,children:[(0,c.jsx)(`h2`,{children:g.typescript.title}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.typescript.para,codeClass:d})}),(0,c.jsx)(`pre`,{className:u,children:`import type { ButtonProps, InputProps } from 'haze-ui';`})]}),(0,c.jsxs)(`div`,{className:s,children:[(0,c.jsx)(`h2`,{children:g.browser.title}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.browser.para,codeClass:d})}),(0,c.jsx)(`ul`,{className:p,children:g.browser.browsers.map(e=>(0,c.jsx)(`li`,{children:e},e))})]}),(0,c.jsxs)(`div`,{className:s,children:[(0,c.jsx)(`h2`,{children:g.cdn.title}),(0,c.jsx)(`p`,{className:f,children:(0,c.jsx)(i,{text:g.cdn.para,codeClass:d})}),(0,c.jsx)(`pre`,{className:u,children:`<!doctype html>
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
    <\/script>
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
    <\/script>
  </body>
</html>`}),(0,c.jsx)(`div`,{className:m,children:(0,c.jsx)(i,{text:g.cdn.note,codeClass:d})})]})]})}export{g as default};