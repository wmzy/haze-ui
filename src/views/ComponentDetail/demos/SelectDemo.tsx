import { useEffect, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import { Select, Option, OptionGroup } from '@/lib/components/Select';
import { Button } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, fieldRow, row } from '../styles';

import { CssVarsSection } from './shared';

const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'Solid' },
  { value: 'angular', label: 'Angular' },
];

// A thousand-option list for the virtualized multiple example.
const MANY_OPTIONS = Array.from({ length: 1000 }, (_, i) => (
  <Option key={i} value={`opt-${i}`}>
    Option {i + 1}
  </Option>
));

const GROUPED_FRAMEWORKS = [
  <OptionGroup key='frontend' label='Frontend'>
    <Option value='react'>React</Option>
    <Option value='vue'>Vue</Option>
    <Option value='svelte'>Svelte</Option>
  </OptionGroup>,
  <OptionGroup key='backend' label='Backend'>
    <Option value='node'>Node.js</Option>
    <Option value='deno'>Deno</Option>
    <Option value='bun'>Bun</Option>
  </OptionGroup>,
];

// Simulated remote corpus for the remote-search example — stands in
// for a server-side query endpoint.
const REMOTE_ITEMS = [
  ...FRAMEWORKS,
  { value: 'preact', label: 'Preact' },
  { value: 'qwik', label: 'Qwik' },
  { value: 'lit', label: 'Lit' },
  { value: 'alpine', label: 'Alpine.js' },
];

// Number-valued options for the generic-value example.
const YEAR_OPTIONS = [2021, 2022, 2023, 2024, 2025].map((year) => (
  <Option key={year} value={year}>
    {year}
  </Option>
));

const noteStyle = {
  fontSize: 'var(--haze-text-sm)',
  color: 'var(--haze-color-text-secondary)',
  margin: '0 0 var(--haze-space-3)',
} as const;

const valueStyle = {
  fontSize: 'var(--haze-text-sm)',
  color: 'var(--haze-color-text-secondary)',
} as const;

// ─── Select ────────────────────────────────────────────────────
export default function SelectDemo() {
  // Control triple: the component takes the control, buttons use the
  // setter (a bare value would be a non-controlled initial value).
  const [picked, setPicked, pickedCtrl] = useControl<string[]>(
    undefined,
    []
  );
  const [pickedMany, setPickedMany, pickedManyCtrl] = useControl<string[]>(
    undefined,
    []
  );
  const [searched, , searchedCtrl] = useControl<string>(undefined, '');
  const [grouped, , groupedCtrl] = useControl<string>(undefined, '');
  const [groupedMany, setGroupedMany, groupedManyCtrl] = useControl<
    string[]
  >(undefined, []);
  const [tagged, , taggedCtrl] = useControl<string[]>(undefined, [
    'react',
    'vue',
    'svelte',
  ]);
  // Tags-mode and maxCount examples.
  const [freeTags, setFreeTags, freeTagsCtrl] = useControl<string[]>(
    undefined,
    []
  );
  const [capped, , cappedCtrl] = useControl<string[]>(undefined, []);
  // Number-valued generic usage: one control per mode, both typed as
  // numbers end to end.
  const [year, , yearCtrl] = useControl<number>(undefined, 2025);
  const [years, , yearsCtrl] = useControl<number[]>(undefined, []);
  const [loading, setLoading] = useControl<boolean>(
    undefined,
    false
  );
  // Remote-search stand-in: the fake server owns the option list and
  // answers each query after a delay. A pending timer is cancelled on
  // unmount (and superseded by the next query).
  const [remoteItems, setRemoteItems] = useState(REMOTE_ITEMS);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const remoteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (remoteTimer.current !== null) clearTimeout(remoteTimer.current);
    },
    []
  );
  const handleRemoteSearch = (query: string) => {
    setRemoteLoading(true);
    if (remoteTimer.current !== null) clearTimeout(remoteTimer.current);
    remoteTimer.current = setTimeout(() => {
      setRemoteLoading(false);
      // "Server-side" matching — the component does none of this.
      const needle = query.trim().toLowerCase();
      setRemoteItems(
        needle === ''
          ? REMOTE_ITEMS
          : REMOTE_ITEMS.filter((item) =>
              item.label.toLowerCase().includes(needle)
            )
      );
    }, 500);
  };

  return (
    <>
      <h1>Select</h1>
      <p className={intro}>
        Dropdown selection with native &lt;select&gt; semantics, plus
        searchable / grouped / clearable / tags / maxCount / loading /
        maxTagCount modes on the floating listbox engine.
      </p>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={fieldRow}>
          <Select size='sm'>
            <Option value=''>Small select</Option>
            <Option value='a'>Option A</Option>
            <Option value='b'>Option B</Option>
          </Select>
        </div>
        <div className={fieldRow}>
          <Select size='md'>
            <Option value=''>Medium select</Option>
            <Option value='a'>Option A</Option>
            <Option value='b'>Option B</Option>
          </Select>
        </div>
        <div className={fieldRow}>
          <Select size='lg'>
            <Option value=''>Large select</Option>
            <Option value='a'>Option A</Option>
            <Option value='b'>Option B</Option>
          </Select>
        </div>
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div className={fieldRow}>
          <Select disabled>
            <Option value=''>Disabled</Option>
          </Select>
        </div>
      </div>

      <div className={section}>
        <h2>Searchable &amp; clearable</h2>
        <p style={noteStyle}>
          <code>searchable</code> swaps the native control for the floating
          listbox with a search input at the top of the panel: typing
          filters options, ↑/↓ move the highlight, Enter picks and
          closes, Escape closes. <code>clearable</code> reveals a × on
          hover/focus-within that empties the value without touching the
          panel (Backspace is the keyboard path).
        </p>
        <div className={fieldRow}>
          <Select
            searchable
            clearable
            value={searchedCtrl}
            placeholder='Pick a framework…'
          >
            {FRAMEWORKS.map((framework) => (
              <Option key={framework.value} value={framework.value}>
                {framework.label}
              </Option>
            ))}
          </Select>
        </div>
        <div className={row}>
          <span style={valueStyle}>
            Value: {searched === '' ? '(none)' : searched}
          </span>
        </div>
      </div>

      <div className={section}>
        <h2>Grouped options</h2>
        <p style={noteStyle}>
          <code>OptionGroup</code> labels option clusters. The native path
          renders a real <code>&lt;optgroup&gt;</code>; the floating paths
          render <code>role=&apos;group&apos;</code> sections whose keyboard order
          runs continuously across groups.
        </p>
        <div className={fieldRow}>
          <Select value={groupedCtrl} placeholder='Native grouped…'>
            {GROUPED_FRAMEWORKS}
          </Select>
        </div>
        <div className={fieldRow}>
          <Select
            multiple
            value={groupedManyCtrl}
            placeholder='Floating grouped…'
          >
            {GROUPED_FRAMEWORKS}
          </Select>
        </div>
        <div className={row}>
          <span style={valueStyle}>
            Native: {grouped === '' ? '(none)' : grouped} · Floating:{' '}
            {groupedMany.length > 0 ? groupedMany.join(', ') : '[]'}
          </span>
          <Button
            size='sm'
            variant='outline'
            onClick={() => setGroupedMany([])}
            disabled={groupedMany.length === 0}
          >
            Clear floating
          </Button>
        </div>
      </div>

      <div className={section}>
        <h2>Options prop</h2>
        <p style={noteStyle}>
          The data-driven <code>options</code> array replaces authored{' '}
          <code>&lt;Option&gt;</code> children (the Menu <code>items</code>{' '}
          shape): plain <code>{'{value, label, disabled}'}</code> entries
          and labelled <code>{'{label, options}'}</code> groups render
          through the same components, so every mode behaves identically
          to the children form. Both forms compose — data options first,
          children after.
        </p>
        <div className={fieldRow}>
          <Select
            options={[
              ...FRAMEWORKS.slice(0, 2),
              { value: 'solid', label: 'Solid (deprecated)', disabled: true },
              { label: 'Others', options: FRAMEWORKS.slice(2) },
            ]}
            placeholder='Data-driven…'
          />
        </div>
        <div className={fieldRow}>
          <Select
            multiple
            options={[
              { label: 'Compile-time', options: FRAMEWORKS.slice(0, 2) },
              { label: 'Runtime', options: FRAMEWORKS.slice(2) },
            ]}
            placeholder='Grouped data…'
          />
        </div>
      </div>

      <div className={section}>
        <h2>Multiple selection</h2>
        <p style={noteStyle}>
          <code>multiple</code> swaps the native control for a Chip trigger
          plus a listbox popover: selections render as removable chips,{' '}
          <code>placeholder</code> labels the empty trigger, and{' '}
          <code>onValuesChange</code> reports the <code>string[]</code>{' '}
          value after every toggle or chip removal.
        </p>
        <div className={fieldRow}>
          <Select
            multiple
            value={pickedCtrl}
            placeholder='Pick frameworks…'
            onValuesChange={(value) =>
              console.log('onValuesChange:', value)
            }
          >
            {FRAMEWORKS.map((framework) => (
              <Option key={framework.value} value={framework.value}>
                {framework.label}
              </Option>
            ))}
          </Select>
        </div>
        <div className={row}>
          <span style={valueStyle}>
            Value: {picked.length > 0 ? picked.join(', ') : '[]'}
          </span>
          <Button
            size='sm'
            variant='outline'
            onClick={() => setPicked([])}
            disabled={picked.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className={section}>
        <h2>maxTagCount &amp; clearable (multiple)</h2>
        <p style={noteStyle}>
          <code>maxTagCount</code> caps the rendered chips — the overflow
          collapses into a <code>+N</code> badge whose tooltip lists the
          hidden labels. <code>clearable</code> empties the whole
          selection in one click.
        </p>
        <div className={fieldRow}>
          <Select
            multiple
            clearable
            maxTagCount={1}
            value={taggedCtrl}
            placeholder='Pick frameworks…'
          >
            {FRAMEWORKS.map((framework) => (
              <Option key={framework.value} value={framework.value}>
                {framework.label}
              </Option>
            ))}
          </Select>
        </div>
        <div className={row}>
          <span style={valueStyle}>
            Selected: {tagged.length} (
            {tagged.length > 0 ? tagged.join(', ') : '[]'})
          </span>
        </div>
      </div>

      <div className={section}>
        <h2>Tags</h2>
        <p style={noteStyle}>
          <code>tags</code> implies multiple selection and moves the input
          into the trigger: selected values render as chips beside the
          field, typing filters the panel, and{' '}
          <code>Enter</code> on an unmatched query creates a new tag from
          it (a highlighted <code>Create &quot;…&quot;</code> row — deduped
          against existing options and the selection).{' '}
          <strong>Backspace</strong> on an empty field removes the last
          chip; Escape closes the panel and keeps focus in the field.
        </p>
        <div className={fieldRow}>
          <Select
            tags
            value={freeTagsCtrl}
            placeholder='Pick or type frameworks…'
          >
            {FRAMEWORKS.map((framework) => (
              <Option key={framework.value} value={framework.value}>
                {framework.label}
              </Option>
            ))}
          </Select>
        </div>
        <div className={row}>
          <span style={valueStyle}>
            Value: {freeTags.length > 0 ? freeTags.join(', ') : '[]'}
          </span>
          <Button
            size='sm'
            variant='outline'
            onClick={() => setFreeTags([])}
            disabled={freeTags.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className={section}>
        <h2>maxCount (multiple / tags)</h2>
        <p style={noteStyle}>
          <code>maxCount</code> caps the selection in multiple and tags
          modes: once filled, the remaining options dim and carry{' '}
          <code>aria-disabled</code> — clicks and Enter are rejected until
          something is deselected. Selected options always stay removable;
          the tags create row is suppressed at the cap.
        </p>
        <div className={fieldRow}>
          <Select
            multiple
            maxCount={2}
            value={cappedCtrl}
            placeholder='Pick at most two…'
          >
            {FRAMEWORKS.map((framework) => (
              <Option key={framework.value} value={framework.value}>
                {framework.label}
              </Option>
            ))}
          </Select>
        </div>
        <div className={row}>
          <span style={valueStyle}>
            Selected: {capped.length}
            {capped.length > 0 ? ` (${capped.join(', ')})` : ''}
          </span>
        </div>
      </div>

      <div className={section}>
        <h2>Loading</h2>
        <p style={noteStyle}>
          <code>loading</code> marks the floating panel busy: the options
          area shows a spinner with <code>aria-busy=&apos;true&apos;</code>, and
          search filtering stays suspended until the options arrive.
        </p>
        <div className={fieldRow}>
          <Select
            multiple
            searchable
            loading={loading}
            placeholder='Pick frameworks…'
          >
            {FRAMEWORKS.map((framework) => (
              <Option key={framework.value} value={framework.value}>
                {framework.label}
              </Option>
            ))}
          </Select>
        </div>
        <div className={row}>
          <Button
            size='sm'
            variant='outline'
            onClick={() => setLoading((v) => !v)}
          >
            {loading ? 'Finish loading' : 'Start loading'}
          </Button>
        </div>
      </div>

      <div className={section}>
        <h2>Remote search</h2>
        <p style={noteStyle}>
          <code>onSearch</code> turns the search panel into a remote query
          field: every query transition fires the callback — each
          keystroke, clearing the input (the empty query restores the
          full list), and the reset when the panel closes — while the
          component stops filtering locally, rendering exactly the{' '}
          <code>options</code> you pass back. Pair with{' '}
          <code>loading</code> for the pending state; debouncing is the
          consumer&apos;s concern. This fake server matches on the label
          after a half-second delay.
        </p>
        <div className={fieldRow}>
          <Select
            searchable
            onSearch={handleRemoteSearch}
            loading={remoteLoading}
            placeholder='Search frameworks…'
          >
            {remoteItems.map((item) => (
              <Option key={item.value} value={item.value}>
                {item.label}
              </Option>
            ))}
          </Select>
        </div>
        <div className={row}>
          <span style={valueStyle}>
            {remoteLoading
              ? 'Searching…'
              : `Server returned ${remoteItems.length} options`}
          </span>
        </div>
      </div>

      <div className={section}>
        <h2>Virtualized multiple</h2>
        <p style={noteStyle}>
          <code>virtualized</code> renders the listbox options through{' '}
          <code>VirtualList</code>: only the visible window (plus a small
          overscan) stays mounted, keeping thousand-option lists fast.
          Keyboard navigation scrolls the highlighted row into view, and{' '}
          <code>aria-posinset</code>/<code>aria-setsize</code> keep the
          unmounted remainder semantically addressable. Pass an object to
          tune <code>{'{ itemHeight, overscan }'}</code>.
        </p>
        <div className={fieldRow}>
          <Select
            multiple
            virtualized
            value={pickedManyCtrl}
            placeholder='Pick numbers…'
          >
            {MANY_OPTIONS}
          </Select>
        </div>
        <div className={row}>
          <span style={valueStyle}>Selected: {pickedMany.length}</span>
          <Button
            size='sm'
            variant='outline'
            onClick={() => setPickedMany([])}
            disabled={pickedMany.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className={section}>
        <h2>Number values</h2>
        <p style={noteStyle}>
          The value type is generic: number-valued <code>Option</code>s and
          a number control keep the whole chain typed —{' '}
          <code>onValuesChange</code> reports raw numbers on both paths
          (the native select&apos;s DOM stringification is mapped back to
          the option value), and the floating paths compare raw values.
        </p>
        <div className={fieldRow}>
          <Select value={yearCtrl} placeholder='Pick a year…'>
            {YEAR_OPTIONS}
          </Select>
        </div>
        <div className={fieldRow}>
          <Select multiple value={yearsCtrl} placeholder='Pick years…'>
            {YEAR_OPTIONS}
          </Select>
        </div>
        <div className={row}>
          <span style={valueStyle}>
            Single: {year} · Multiple: {years.length > 0 ? years.join(', ') : '[]'}
          </span>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='SelectProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders as native <strong>&lt;select&gt;</strong> with full
              keyboard support
            </li>
            <li>
              Use <strong>aria-label</strong> or a visible{' '}
              <strong>&lt;label&gt;</strong>
            </li>
            <li>
              <strong>Arrow keys</strong> navigate options,{' '}
              <strong>Enter</strong> selects
            </li>
            <li>
              Multiple mode renders a <strong>listbox</strong> popover with{' '}
              <strong>aria-multiselectable</strong>
            </li>
            <li>
              The floating triggers are APG select-only comboboxes:{' '}
              <strong>role=&quot;combobox&quot;</strong> with aria-expanded,
              aria-controls and aria-activedescendant for the keyboard
              highlight
            </li>
            <li>
              Searchable panels put the search input inside the popup —
              focus moves there on open, and the input mirrors{' '}
              <strong>aria-activedescendant</strong> so screen readers
              announce highlight moves while typing
            </li>
            <li>
              Tags mode renders the search input inside the trigger next
              to the chips — it owns the combobox semantics, and the
              create row is a plain listbox option
            </li>
            <li>
              At a <strong>maxCount</strong> cap, locked options carry{' '}
              <strong>aria-disabled</strong> and stay visible
            </li>
            <li>
              Option groups are native <strong>optgroup</strong> elements
              on the select path and <strong>role=&apos;group&apos;</strong> sections
              on the floating paths
            </li>
            <li>
              The clear × and chip removes are pointer-only by design
              (nested interactive controls inside a button are invalid
              HTML); keyboard users clear with <strong>Backspace</strong>{' '}
              and remove chips with Backspace or the listbox
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='select' />
    </>
  );
}
