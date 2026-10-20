import { css } from '@linaria/core';

import { CodeBlock } from '@/lib';
import { page } from '@/views/ComponentDetail/styles';
import { GuideDocView, useGuideDoc } from '@/views/Guides/guide-content';

/*
 * Migration guide: concept mapping from AntD and shadcn/ui onto haze-ui.
 * Prose, the component map table and the trap callouts live in
 * guide-content.tsx; this shell owns the six before/after code pairs
 * (the Compare layout) and injects them as slots.
 */

const compareGrid = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--haze-space-3);
  margin: var(--haze-space-2) 0 var(--haze-space-4);

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const compareCol = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-2);
  min-width: 0;
`;

const compareLabel = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

/** Side-by-side before/after code pair; stacks on narrow screens. */
function Compare({
  before,
  after,
  beforeLabel,
  afterLabel,
}: {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
}) {
  return (
    <div className={compareGrid}>
      <div className={compareCol}>
        <div className={compareLabel}>{beforeLabel}</div>
        <CodeBlock language='tsx'>{before}</CodeBlock>
      </div>
      <div className={compareCol}>
        <div className={compareLabel}>{afterLabel}</div>
        <CodeBlock language='tsx'>{after}</CodeBlock>
      </div>
    </div>
  );
}

export default function MigrationGuide() {
  const doc = useGuideDoc('migration');

  return (
    <div className={page}>
      <h1>{doc.title}</h1>
      <GuideDocView
        doc={doc}
        slots={{
          'form-item-compare': (
            <Compare
              beforeLabel='AntD'
              afterLabel='haze-ui'
              before={`const RULES = {
  email: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Enter a valid email' },
  ],
  role: [{ required: true, message: 'Pick a role' }],
};

<Form.Item name="email" label="Email" rules={RULES.email}>
  <Input />
</Form.Item>`}
              after={`import { zodResolver } from 'haze-ui';

// one adapter per schema, reused by any number of fields
const validateEmail = zodResolver(z.email('Enter a valid email'));
const validateRole = zodResolver(
  z.enum(['admin', 'editor', 'viewer'], 'Pick a role')
);

<FormItem
  form={form}
  name='email'
  label='Email'
  validate={validateEmail}
  mode='onBlur'
  input={InputCore}   // FormItem wires id/aria/onBlur/onChange/value
/>`}
            />
          ),
          'default-value-compare': (
            <Compare
              beforeLabel='AntD / shadcn'
              afterLabel='haze-ui'
              before={`// uncontrolled and controlled are different props
<Input defaultValue="hello" />
<Input value={text} onChange={(e) => setText(e.target.value)} />`}
              after={`import { useControl } from 'react-use-control';

const [text, setText, textCtrl] = useControl(undefined, 'hello');

// plain value → uncontrolled INITIAL (later prop changes ignored)
<Input value="hello" />

// control     → controlled: one state, writes flow through it
<Input value={textCtrl} onChange={(e) => log(e.target.value)} />
// text is already updated by the Input itself — onChange here is
// a native-event side channel, not the value pipeline`}
            />
          ),
          'open-compare': (
            <Compare
              beforeLabel='AntD / shadcn'
              afterLabel='haze-ui'
              before={`const [open, setOpen] = useState(false);

<Modal
  open={open}
  onOk={() => setOpen(false)}
  onCancel={() => setOpen(false)}
/>

// shadcn: onOpenChange receives the next open state
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>…</DialogContent>
</Dialog>`}
              after={`const [, setOpen, openCtrl] = useControl(undefined, false);

<Dialog
  open={openCtrl}              // Control = controlled channel
  onClose={() => setOpen(false)} // single exit callback, all paths
  title='Edit member'
>
  <Button onClick={() => setOpen(false)}>Close</Button>
</Dialog>`}
            />
          ),
          'select-compare': (
            <Compare
              beforeLabel='AntD'
              afterLabel='haze-ui'
              before={`<Select
  defaultValue="admin"
  onChange={(value) => setRole(value)}   // value: string
  options={ROLES}                        // or <Option /> children
/>

// remote search: onSearch + loading
<Select
  showSearch
  filterOption={false}
  onSearch={setQuery}
  loading={fetching}
  options={results}
/>`}
              after={`<Select
  value={roleCtrl}                          // ControlOrValue
  onValuesChange={(value) => side(value)}   // value: string | string[]
  onChange={(e) => log(e.target.value)}     // native event (single mode)
>
  <Option value='admin'>Admin</Option>
  <Option value='editor'>Editor</Option>
</Select>

// remote search: onSearch suspends local filtering
<Select
  searchable
  loading={fetching}
  onSearch={setQuery}      // every query transition, '' included
>
  {results.map((r) => <Option key={r} value={r}>{r}</Option>)}
</Select>`}
            />
          ),
          'dropdown-compare': (
            <Compare
              beforeLabel='AntD'
              afterLabel='haze-ui'
              before={`<Dropdown
  menu={{
    items: [
      { key: 'edit', label: 'Edit' },
      { key: 'share', children: [
        { key: 'link', label: 'Copy link' },
      ]},
    ],
    onClick: ({ key }) => act(key),
  }}
>
  <Button>Actions</Button>
</Dropdown>`}
              after={`<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant='outline'>Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => act('edit')}>
      Edit
    </DropdownMenuItem>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onClick={() => act('link')}>
          Copy link
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={destroy}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}
            />
          ),
          'drawer-compare': (
            <Compare
              beforeLabel='AntD / shadcn'
              afterLabel='haze-ui'
              before={`// AntD
<Drawer
  open={open}
  onClose={close}
  placement="right"   // left | right | top | bottom
  width={420}
>
  …

// shadcn (Sheet): side="right" | "left" | "top" | "bottom"
<Sheet>
  <SheetContent side="right">…</SheetContent>
</Sheet>`}
              after={`<Drawer
  open={openCtrl}        // ControlOrValue
  onClose={close}
  placement='right'      // same four names as AntD
>
  …
</Drawer>`}
            />
          ),
        }}
      />
    </div>
  );
}
