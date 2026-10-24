import type { ReactElement, ReactNode } from 'react';

import { Fragment, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';

import { css } from '@linaria/core';
import { Check, Copy, ExternalLink, RotateCcw, SlidersHorizontal } from 'lucide-react';

import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Icon,
  Input,
  NumberInput,
  Segmented,
  Switch,
  ToastContainer,
  toast,
} from '@/lib';


import generatedProps from '@/generated/props.json';
import propsDocs from '@/generated/props-docs.json';

import { buildStackblitzProject } from './stackblitz';

/*
 * Interactive props debugger for the demo sandbox (Storybook-controls
 * style), mounted by DemoPreview between its toolbar and the preview
 * box. Rows come from src/generated/props.json (TS AST extraction);
 * descriptions and defaults are layered on from props-docs.json — the
 * same sources PropsTable renders read-only. Controls are all haze-ui
 * components and the panel state is demo-site-local useState (never a
 * library contract).
 *
 * Value flow: only props the user actually touches become "overrides".
 * Overrides are (a) injected live into the demo node when its root is a
 * single clonable element, and (b) always rendered as copy-ready JSX
 * attribute source for fragment-rooted demo pages.
 */

/** One row of src/generated/props.json (generated from library source). */
type GeneratedRow = {
  name: string;
  type: string;
  required: boolean;
};

type ComponentEntry = {
  routeKey: string;
  cssFamily: string;
  imports: string[];
  propsTypes: Record<string, GeneratedRow[]>;
  otherTypes: Record<string, GeneratedRow[]>;
};

/** One row of src/generated/props-docs.json (hand-maintained overrides). */
type DocRow = {
  name: string;
  type?: string;
  default?: string;
  description?: string;
};

type ControlSpec =
  | { kind: 'boolean'; initial: boolean }
  | { kind: 'enum'; options: string[]; initial: string | undefined }
  | { kind: 'string'; initial: string }
  | { kind: 'number'; initial: number | undefined }
  | { kind: 'readonly' };

type PlaygroundRow = {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  spec: ControlSpec;
};

type PropsPlaygroundProps = {
  /** Route key (e.g. 'button'); resolves the generated component entry. */
  name?: string;
  /** The demo node — single clonable roots receive live prop overrides. */
  demo: ReactNode;
  /** Places the (possibly overridden) demo node into the preview layout. */
  children: (node: ReactNode) => ReactNode;
};

// The JSON import infers a fixed-key literal type; lookups are dynamic.
const componentsByRoute = new Map(
  Object.values(
    (generatedProps as { components: Record<string, ComponentEntry> })
      .components
  ).map((entry) => [entry.routeKey, entry] as const)
);

const docsByType = propsDocs as Record<string, DocRow[]>;

/* A component entry can carry several props types (Button vs ButtonLink);
 * the playground drives the main one — `imports[0] + 'Props'` — falling
 * back to the sole key when the heuristic misses. */
function resolvePrimaryType(entry: ComponentEntry): string | undefined {
  const keys = Object.keys(entry.propsTypes);
  if (keys.length === 0) return undefined;
  const primary = `${entry.imports[0] ?? ''}Props`;
  if (keys.includes(primary)) return primary;
  return keys.length === 1 ? keys[0] : undefined;
}

/* The export the playground drives (the StackBlitz export renders it):
 * the primary props type's owner when the naming heuristic lands, else
 * imports[0]. */
function primaryComponentOf(entry: ComponentEntry): string | undefined {
  const typeName = resolvePrimaryType(entry);
  const owner = typeName?.replace(/Props$/, '');
  return owner && entry.imports.includes(owner) ? owner : entry.imports[0];
}

/* String-literal unions ('a' | 'b', single member allowed) become
 * Segmented options; everything non-literal stays out. */
const LITERAL_UNION = /^'[^']*'(\s*\|\s*'[^']*')*$/;

function literalMembers(type: string): string[] | undefined {
  if (!LITERAL_UNION.test(type)) return undefined;
  return type.split('|').map((member) => member.trim().replace(/^'|'$/g, ''));
}

/* Hand-written defaults in props-docs.json are TS expression source —
 * only literal booleans / numbers / single-quoted strings are
 * representable in a control. */
function parseDefault(
  raw: string | undefined
): string | number | boolean | undefined {
  const trimmed = raw?.trim();
  if (trimmed === undefined || trimmed === '') return undefined;
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if (trimmed.length > 1 && trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }
  return undefined;
}

function classify(row: GeneratedRow, rawDefault: string | undefined): ControlSpec {
  const initial = parseDefault(rawDefault);
  if (row.type === 'boolean') {
    return { kind: 'boolean', initial: initial === true };
  }
  const members = literalMembers(row.type);
  if (members) {
    return {
      kind: 'enum',
      options: members,
      initial:
        typeof initial === 'string' && members.includes(initial)
          ? initial
          : undefined,
    };
  }
  if (row.type === 'string') {
    return { kind: 'string', initial: typeof initial === 'string' ? initial : '' };
  }
  if (row.type === 'number') {
    return { kind: 'number', initial: typeof initial === 'number' ? initial : undefined };
  }
  return { kind: 'readonly' };
}

function resolveRows(name: string | undefined): PlaygroundRow[] | undefined {
  if (!name) return undefined;
  const entry = componentsByRoute.get(name);
  if (!entry) return undefined;
  const typeName = resolvePrimaryType(entry);
  if (!typeName) return undefined;
  const generated = entry.propsTypes[typeName];
  if (!generated || generated.length === 0) return undefined;
  const docs = new Map(
    (docsByType[typeName] ?? []).map((row) => [row.name, row] as const)
  );
  return generated.map((row) => {
    const doc = docs.get(row.name);
    return {
      name: row.name,
      type: row.type,
      required: row.required,
      description: doc?.description,
      spec: classify(row, doc?.default),
    };
  });
}

/* JSX attribute source for one override — always valid JSX (strings via
 * JSON.stringify survive embedded quotes and backslashes). */
function formatOverride(name: string, value: unknown): string {
  if (value === true) return name;
  if (typeof value === 'string' || typeof value === 'number') {
    return `${name}={${JSON.stringify(value)}}`;
  }
  return `${name}={${String(value)}}`;
}

// ─── Styles ─────────────────────────────────────────────────────

const panel = css`
  font-family: var(--haze-font-sans);
  border-bottom: 1px solid var(--haze-color-border);
  background: var(--haze-color-bg-subtle);
`;

const panelHeader = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--haze-space-2);
  padding: var(--haze-space-1) var(--haze-space-3);
`;

const trigger = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-1) var(--haze-space-2);
  border: none;
  border-radius: var(--haze-radius-sm);
  background: transparent;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text-secondary);
  cursor: pointer;

  &:hover {
    color: var(--haze-color-text);
    background: var(--haze-color-bg-muted);
  }
`;

const countTag = css`
  min-width: 1.25em;
  padding: 0 var(--haze-space-1);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-primary);
  color: var(--haze-color-text-inverse);
  font-size: var(--haze-text-xs);
  line-height: 1.5;
  text-align: center;
`;

const headerActions = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-1);
`;

const panelBody = css`
  padding: var(--haze-space-3);
  border-top: 1px solid var(--haze-color-border);
`;

const controlsGrid = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--haze-space-2) var(--haze-space-4);
  max-height: 18rem;
  overflow-y: auto;
`;

const controlRow = css`
  display: grid;
  grid-template-columns: minmax(96px, 40%) 1fr;
  align-items: center;
  gap: var(--haze-space-3);
  min-width: 0;
`;

const propName = css`
  display: block;
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-semibold);
  color: var(--haze-color-text);
`;

const propType = css`
  display: block;
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const controlCol = css`
  display: flex;
  align-items: center;
  min-width: 0;
`;

const readonlyMark = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
`;

const codeFooter = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  margin-top: var(--haze-space-3);
`;

const codePre = css`
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: var(--haze-space-2) var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-sm);
  background: var(--haze-color-bg);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text);
  overflow-x: auto;
  white-space: pre;
`;

const hint = css`
  margin: var(--haze-space-2) 0 0;
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
`;

// ─── Control rendering ──────────────────────────────────────────

function PropControl({
  row,
  value,
  onChange,
}: {
  row: PlaygroundRow;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  switch (row.spec.kind) {
    case 'boolean':
      return (
        <Switch
          checked={value === true}
          onClick={() => onChange(value !== true)}
          aria-label={row.name}
        />
      );
    case 'enum':
      return (
        <Segmented
          size='sm'
          options={row.spec.options}
          value={typeof value === 'string' ? value : row.spec.initial}
          onChange={(next) => onChange(next)}
        />
      );
    case 'string':
      return (
        <Input
          size='sm'
          value={typeof value === 'string' ? value : row.spec.initial}
          onChange={(event) => onChange(event.target.value)}
          aria-label={row.name}
        />
      );
    case 'number':
      return (
        <NumberInput
          size='sm'
          value={typeof value === 'number' ? value : row.spec.initial}
          onChange={(event) => {
            // Mirrors NumberInputCore's own parse (Number('') === 0), so
            // clearing commits 0 and controlled re-renders never snap back.
            onChange(Number(event.target.value));
          }}
          aria-label={row.name}
        />
      );
    default:
      return <span className={readonlyMark}>read-only</span>;
  }
}

// ─── Panel ──────────────────────────────────────────────────────

export default function PropsPlayground({
  name,
  demo,
  children,
}: PropsPlaygroundProps) {
  const rows = resolveRows(name);
  const [overrides, setOverrides] = useState<Record<string, unknown>>({});
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  if (!rows) return <>{children(demo)}</>;

  const entry = componentsByRoute.get(name ?? '');
  const componentName = entry ? primaryComponentOf(entry) : undefined;

  const setOverride = (prop: string, next: unknown) =>
    setOverrides((prev) => ({ ...prev, [prop]: next }));

  /* Export the driven component + current overrides as a runnable
   * StackBlitz project in a new tab; the SDK loads as a lazy chunk so
   * pages that never export stay SDK-free. Failures (chunk load, popup
   * blocked) surface through the module-level toast — the panel below
   * carries its own ToastContainer, so the notice is always rendered. */
  const openInStackBlitz = async () => {
    if (!componentName) return;
    const project = buildStackblitzProject({
      componentName,
      importStatement: `import { ${componentName} } from 'haze-ui';`,
      propsState: overrides,
    });
    try {
      const { default: sdk } = await import('@stackblitz/sdk');
      sdk.openProject(project, { newWindow: true });
    } catch {
      toast(
        'Could not open StackBlitz — the SDK failed to load or the popup was blocked.',
        { variant: 'danger' }
      );
    }
  };

  /* Live injection: a single clonable root (anything but a fragment)
   * receives the current overrides; fragment-rooted demo pages fall
   * back to the copyable attribute source below. */
  const demoElement =
    isValidElement(demo) && demo.type !== Fragment
      ? (demo as ReactElement<Record<string, unknown>>)
      : undefined;
  const overrideEntries = Object.entries(overrides);
  const injected =
    demoElement && overrideEntries.length > 0
      ? cloneElement(demoElement, overrides)
      : demo;

  const codeText =
    overrideEntries.length > 0
      ? overrideEntries
          .map(([prop, value]) => formatOverride(prop, value))
          .join('\n')
      : '{/* toggle the controls above to generate props */}';

  return (
    <>
      {/* ToastContainer 让失败提示有处可落（空栈不可见；demo 预览保持在
          容器外，嵌套容器的 demo 仍由最近的容器接管自己的 toast）。 */}
      <ToastContainer>
        <section className={panel} data-slot='props-playground'>
          <Collapsible>
            <div className={panelHeader}>
              <CollapsibleTrigger className={trigger}>
                <Icon icon={SlidersHorizontal} size='sm' />
                <span>Props playground</span>
                {overrideEntries.length > 0 && (
                  <span className={countTag} data-slot='playground-count'>
                    {overrideEntries.length}
                  </span>
                )}
              </CollapsibleTrigger>
              <div className={headerActions}>
                {componentName && (
                  <Button
                    size='sm'
                    variant='ghost'
                    data-slot='open-stackblitz'
                    onClick={() => void openInStackBlitz()}
                  >
                    <Icon icon={ExternalLink} size='sm' />
                    Open in StackBlitz
                  </Button>
                )}
                {overrideEntries.length > 0 && (
                  <Button size='sm' variant='ghost' onClick={() => setOverrides({})}>
                    <Icon icon={RotateCcw} size='sm' />
                    Reset
                  </Button>
                )}
              </div>
            </div>
            <CollapsibleContent>
              <div className={panelBody}>
                <div className={controlsGrid}>
                  {rows.map((row) => (
                    <div
                      key={row.name}
                      className={controlRow}
                      data-slot='prop-row'
                      data-prop={row.name}
                    >
                      <div>
                        <code className={propName} title={row.description ?? undefined}>
                          {row.name}
                          {row.required ? ' *' : ''}
                        </code>
                        <code className={propType}>{row.type}</code>
                      </div>
                      <div className={controlCol}>
                        <PropControl
                          row={row}
                          value={overrides[row.name]}
                          onChange={(next) => setOverride(row.name, next)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className={codeFooter}>
                  <pre className={codePre} data-slot='playground-code'>
                    {codeText}
                  </pre>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => {
                      void navigator.clipboard.writeText(codeText);
                      setCopied(true);
                      if (timer.current) clearTimeout(timer.current);
                      timer.current = setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    <Icon icon={copied ? Check : Copy} size='sm' />
                    {copied ? 'Copied' : 'Copy props'}
                  </Button>
                </div>
                <p className={hint}>
                  {demoElement
                    ? 'Overrides are injected live into the demo root below as props.'
                    : 'Fragment-rooted demo pages cannot receive live props — copy the generated attributes instead.'}
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </section>
      </ToastContainer>
      {children(injected)}
    </>
  );
}

export type { PropsPlaygroundProps };
