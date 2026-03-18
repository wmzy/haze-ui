import {css} from '@linaria/core';

import {page, intro, section} from '@/views/ComponentDetail/styles';

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

export default function GettingStarted() {
  return (
    <div className={page}>
      <h1>Getting Started</h1>
      <p className={intro}>
        Get up and running with Haze UI in your React project in just a few minutes.
      </p>

      <div className={section}>
        <h2>Installation</h2>
        <p className={paragraph}>
          Haze UI requires <code className={inlineCode}>react &gt;= 19</code> and{' '}
          <code className={inlineCode}>@linaria/core &gt;= 7</code> as peer dependencies.
        </p>
        <pre className={codeBlock}>npm install haze-ui @linaria/core</pre>
        <p className={paragraph}>Or with other package managers:</p>
        <pre className={codeBlock}>{`# pnpm
pnpm add haze-ui @linaria/core

# yarn
yarn add haze-ui @linaria/core`}</pre>
      </div>

      <div className={section}>
        <h2>Setup</h2>
        <ol className={stepList}>
          <li>
            <strong>Import the stylesheet</strong> — Haze UI ships a single CSS file containing
            all component styles and design tokens.
            <pre className={codeBlock}>{`import 'haze-ui/styles.css';`}</pre>
          </li>
          <li>
            <strong>Apply the theme</strong> — Wrap your app (or any subtree) with the theme
            class to activate design tokens.
            <pre className={codeBlock}>{`import { lightTheme, spacing, typography } from 'haze-ui';

function App() {
  return (
    <div className={\`\${lightTheme} \${spacing} \${typography}\`}>
      {/* your app */}
    </div>
  );
}`}</pre>
          </li>
          <li>
            <strong>Use components</strong> — Import and use any component directly.
            <pre className={codeBlock}>{`import { Button, Input, Card } from 'haze-ui';

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
        <h2>Theming</h2>
        <p className={paragraph}>
          Haze UI uses CSS custom properties (design tokens) for all visual values. Two built-in
          themes are available:
        </p>
        <pre className={codeBlock}>{`import { lightTheme, darkTheme } from 'haze-ui';

// Apply to any container
<div className={darkTheme}>
  <Button>Dark Mode Button</Button>
</div>`}</pre>
        <p className={paragraph}>
          You can override any token by setting the CSS variable on a parent element:
        </p>
        <pre className={codeBlock}>{`/* Custom brand color */
.my-theme {
  --haze-color-primary: #8b5cf6;
  --haze-color-primary-hover: #7c3aed;
  --haze-color-primary-active: #6d28d9;
}`}</pre>
        <div className={note}>
          All tokens are prefixed with <code className={inlineCode}>--haze-</code> to avoid
          conflicts with other libraries. See the full list of tokens in the source code.
        </div>
      </div>

      <div className={section}>
        <h2>Controlled Components</h2>
        <p className={paragraph}>
          Form components support both controlled and uncontrolled modes via{' '}
          <code className={inlineCode}>react-use-control</code>:
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
          You can also pass plain values for simple uncontrolled usage — just omit the{' '}
          <code className={inlineCode}>value</code> prop and the component manages its own state.
        </p>
      </div>

      <div className={section}>
        <h2>TypeScript</h2>
        <p className={paragraph}>
          Haze UI is written in TypeScript and ships type declarations out of the box.
          All component props are exported as types:
        </p>
        <pre className={codeBlock}>{`import type { ButtonProps, InputProps } from 'haze-ui';`}</pre>
      </div>

      <div className={section}>
        <h2>Browser Support</h2>
        <p className={paragraph}>
          Haze UI targets modern browsers that support CSS custom properties and the{' '}
          <code className={inlineCode}>&lt;dialog&gt;</code> element:
        </p>
        <ul className={stepList}>
          <li>Chrome / Edge 84+</li>
          <li>Firefox 98+</li>
          <li>Safari 15.4+</li>
        </ul>
      </div>
    </div>
  );
}
