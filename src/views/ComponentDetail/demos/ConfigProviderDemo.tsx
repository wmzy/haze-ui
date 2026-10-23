import { useState } from 'react';

import {
  Button,
  ButtonLink,
  ConfigProvider,
  Input,
  Table,
  TableBody,
  TableCell,
  TableRow,
  ToastContainer,
  Tooltip,
  useToast,
} from '@/lib';

import PropsTable from '../PropsTable';
import A11yNote from '../A11yNote';

import { intro, section, row, fieldRow, codeBlock } from '../styles';

const SIZES = ['sm', 'md', 'lg'] as const;

/** Fires toasts through the container — must sit inside ToastContainer. */
function ToastActions() {
  const toast = useToast();
  return (
    <div className={row}>
      <Button
        variant='outline'
        onClick={() => toast('Config default: 1500ms, top-right, max 2')}
      >
        Fire config-default toast
      </Button>
      <Button
        variant='ghost'
        onClick={() =>
          toast('Explicit 1000ms always beats the config', { duration: 1000 })
        }
      >
        Fire with explicit duration
      </Button>
    </div>
  );
}

// ─── ConfigProvider ────────────────────────────────────────────
export default function ConfigProviderDemo() {
  const [size, setSize] = useState<(typeof SIZES)[number]>('lg');
  const [compact, setCompact] = useState(false);

  return (
    <>
      <h1>ConfigProvider</h1>
      <p className={intro}>
        Library-wide component defaults and spacing density through one
        provider — a scoped take on the AntD v6{' '}
        <code>ConfigProvider</code> idea. Every wired component reads its
        section (keyed by exported name) via <code>useConfigDefaults</code>;
        an explicit prop still wins, nested providers shallow-merge per
        component section with the inner one taking precedence, and with no
        provider mounted every component keeps its built-in defaults.
      </p>

      <div className={section}>
        <h2>Default Button size</h2>
        <div className={fieldRow}>
          <div className={row}>
            {SIZES.map((s) => (
              <button key={s} onClick={() => setSize(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <ConfigProvider defaults={{ Button: { size }, ButtonLink: { size } }}>
          <div className={row}>
            <Button>size omitted — follows the provider</Button>
            <Button size='sm'>size=&quot;sm&quot; wins</Button>
            <ButtonLink href='#config-provider'>anchors wear it too</ButtonLink>
          </div>
        </ConfigProvider>
      </div>

      <div className={section}>
        <h2>Nested providers</h2>
        <p>
          The inner provider&apos;s keys win for the sections it names;
          everything else keeps the outer value.
        </p>
        <ConfigProvider defaults={{ Button: { size: 'sm' } }}>
          <div className={row}>
            <Button>outer: sm</Button>
            <ConfigProvider defaults={{ Button: { size: 'lg' } }}>
              <Button>inner: lg</Button>
            </ConfigProvider>
          </div>
        </ConfigProvider>
      </div>

      <div className={section}>
        <h2>Toast defaults</h2>
        <p>
          <code>duration</code>, <code>placement</code> and{' '}
          <code>maxCount</code> apply to the container and{' '}
          <code>useToast()</code> calls that omit them. The module-level{' '}
          <code>toast()</code> runs outside the React tree and keeps its
          own 3000ms default.
        </p>
        <ConfigProvider
          defaults={{
            Toast: { duration: 1500, placement: 'top-right', maxCount: 2 },
          }}
        >
          <ToastContainer>
            <ToastActions />
          </ToastContainer>
        </ConfigProvider>
      </div>

      <div className={section}>
        <h2>Tooltip delay</h2>
        <p>
          Hover the trigger: the config delay (400ms here) replaces the
          built-in 150ms when the prop is omitted.
        </p>
        <ConfigProvider defaults={{ Tooltip: { delay: 400 } }}>
          <Tooltip content='Configured to appear after 400ms'>
            <Button variant='outline'>Hover me</Button>
          </Tooltip>
        </ConfigProvider>
      </div>

      <div className={section}>
        <h2>Field defaults</h2>
        <p>
          Form-field sections work the same way — <code>Input</code>,{' '}
          <code>Textarea</code>, <code>NumberInput</code>,{' '}
          <code>Pagination</code> take a <code>size</code>{' '}
          (<code>NumberInput</code> also <code>step</code>),{' '}
          <code>Datepicker</code> takes <code>picker</code>/{' '}
          <code>weekStartsOn</code>, <code>TimePicker</code> takes{' '}
          <code>format</code>/<code>use12Hours</code>.
        </p>
        <ConfigProvider defaults={{ Input: { size: 'lg' } }}>
          <div className={row}>
            <Input placeholder='size omitted — follows the provider' />
            <Input size='sm' placeholder='size="sm" wins' />
          </div>
        </ConfigProvider>
      </div>

      <div className={section}>
        <h2>Global density</h2>
        <p>
          The <code>density</code> knob re-declares the spacing scale at
          75% inside density-aware components — <code>Table</code> today.
          It rides the same context and nests the same way (an inner
          provider&apos;s value wins); component-level sizing axes such as
          DataTable&apos;s <code>size</code> stay separate and keep
          winning.
        </p>
        <div className={fieldRow}>
          <div className={row}>
            <button onClick={() => setCompact(!compact)}>
              {compact ? 'normal' : 'compact'}
            </button>
          </div>
        </div>
        <ConfigProvider density={compact ? 'compact' : 'normal'}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>The table subtree reads the compact scale</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>when the provider says so</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ConfigProvider>
      </div>

      <div className={section}>
        <h2>Usage</h2>
        <pre className={codeBlock}>{`import { ConfigProvider } from 'haze-ui';

<ConfigProvider
  density='compact'
  defaults={{
    Button: { size: 'lg' },
    ButtonLink: { size: 'lg' },
    Input: { size: 'lg' },
    Toast: { duration: 1500, placement: 'top-right', maxCount: 3 },
    Tooltip: { delay: 400 },
    Table: { striped: true },
  }}
>
  <App />
</ConfigProvider>`}</pre>
        <h3>Wiring another component (library internals)</h3>
        <p>
          Sections are keyed by exported component name. To add one,
          register it in the <code>ComponentDefaultsSections</code> record
          in <code>ConfigContext.ts</code> — one entry types the provider
          prop, the nesting merge and the accessor at once — then resolve
          each prop three-tier inside the component:
        </p>
        <pre className={codeBlock}>{`const config = useConfigDefaults('MyComponent');
const size = sizeProp ?? config.size ?? 'md'; // prop → config → built-in`}</pre>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='ConfigProviderProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              The provider renders no DOM and changes no semantics — it
              only substitutes default prop values
            </li>
            <li>
              Defaults that affect timing (Tooltip <code>delay</code>,
              Toast <code>duration</code>) remain hover-pausable and
              pause-on-focus as their components define
            </li>
            <li>
              SSR-safe: no <code>document</code>/<code>window</code>{' '}
              access, safe for string rendering and hydration
            </li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}
