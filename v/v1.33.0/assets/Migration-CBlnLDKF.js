import{t as e}from"./jsx-runtime-Cx0BB4qO.js";import{t}from"./CodeBlock-C2ywdVcy.js";import{a as n}from"./styles-DBn9Gwwz.js";import{n as r,t as i}from"./guide-content-D5ZX0cDM.js";var a=e(),o=`haze-index__compareGrid`,s=`haze-index__compareCol`,c=`haze-index__compareLabel`;function l({before:e,after:n,beforeLabel:r,afterLabel:i}){return(0,a.jsxs)(`div`,{className:o,children:[(0,a.jsxs)(`div`,{className:s,children:[(0,a.jsx)(`div`,{className:c,children:r}),(0,a.jsx)(t,{language:`tsx`,children:e})]}),(0,a.jsxs)(`div`,{className:s,children:[(0,a.jsx)(`div`,{className:c,children:i}),(0,a.jsx)(t,{language:`tsx`,children:n})]})]})}function u(){let e=r(`migration`);return(0,a.jsxs)(`div`,{className:n,children:[(0,a.jsx)(`h1`,{children:e.title}),(0,a.jsx)(i,{doc:e,slots:{"form-item-compare":(0,a.jsx)(l,{beforeLabel:`AntD`,afterLabel:`haze-ui`,before:`const RULES = {
  email: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Enter a valid email' },
  ],
  role: [{ required: true, message: 'Pick a role' }],
};
<Form.Item name="email" label="Email" rules={RULES.email}>
  <Input />
</Form.Item>`,after:`import { zodResolver } from 'haze-ui';
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
/>`}),"default-value-compare":(0,a.jsx)(l,{beforeLabel:`AntD / shadcn`,afterLabel:`haze-ui`,before:`// uncontrolled and controlled are different props
<Input defaultValue="hello" />
<Input value={text} onChange={(e) => setText(e.target.value)} />`,after:`import { useControl } from 'react-use-control';
const [text, setText, textCtrl] = useControl(undefined, 'hello');
// plain value → uncontrolled INITIAL (later prop changes ignored)
<Input value="hello" />
// control     → controlled: one state, writes flow through it
<Input value={textCtrl} onChange={(e) => log(e.target.value)} />
// text is already updated by the Input itself — onChange here is
// a native-event side channel, not the value pipeline`}),"open-compare":(0,a.jsx)(l,{beforeLabel:`AntD / shadcn`,afterLabel:`haze-ui`,before:`const [open, setOpen] = useState(false);
<Modal
  open={open}
  onOk={() => setOpen(false)}
  onCancel={() => setOpen(false)}
/>
// shadcn: onOpenChange receives the next open state
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>…</DialogContent>
</Dialog>`,after:`const [, setOpen, openCtrl] = useControl(undefined, false);
<Dialog
  open={openCtrl}              // Control = controlled channel
  onClose={() => setOpen(false)} // single exit callback, all paths
  title='Edit member'
>
  <Button onClick={() => setOpen(false)}>Close</Button>
</Dialog>`}),"select-compare":(0,a.jsx)(l,{beforeLabel:`AntD`,afterLabel:`haze-ui`,before:`<Select
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
/>`,after:`<Select
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
</Select>`}),"dropdown-compare":(0,a.jsx)(l,{beforeLabel:`AntD`,afterLabel:`haze-ui`,before:`<Dropdown
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
</Dropdown>`,after:`<DropdownMenu>
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
</DropdownMenu>`}),"drawer-compare":(0,a.jsx)(l,{beforeLabel:`AntD / shadcn`,afterLabel:`haze-ui`,before:`// AntD
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
</Sheet>`,after:`<Drawer
  open={openCtrl}        // ControlOrValue
  onClose={close}
  placement='right'      // same four names as AntD
>
  …
</Drawer>`})}})]})}export{u as default};