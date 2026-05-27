import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import {
  Button,
  Input,
  Select,
  Option,
  Checkbox,
  Switch,
  Badge,
  Dialog,
  Tooltip,
  Popover,
  Card,
  Radio,
  RadioGroup,
  Textarea,
  Slider,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  Alert,
  Avatar,
  Tag,
  Skeleton,
  Icon,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  Disclosure,
  Menu,
  MenuItem,
  NumberInput,
  FileInput,
  ToastContainer,
  useToast,
  List,
  ListItem,
  Combobox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Carousel,
  CarouselSlide,
  Datepicker,
  Tree,
  Divider,
  Spinner,
  Empty,
  Progress,
  Pagination,
  Grid,
  GridItem,
  Drawer,
  Stepper,
  Step,
  ChatMessage,
  ChatContainer,
  ChatInput,
  StreamingText,
  MarkdownRenderer,
  ToolCallCard,
  ThinkingIndicator,
  StepTimeline,
  StepTimelineItem,
  ApprovalCard,
  TokenCounter,
  ModelPicker,
  ConversationList,
  ConversationItem,
  DiffViewer,
  LogViewer,
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  ResizableGroup,
  ResizablePanel,
  ResizableHandle,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Transfer,
  Upload,
  ColorPicker,
  Rating,
  Timeline,
  TimelineItem,
  Title,
  Text,
  Paragraph,
  Stat,
  StatGroup,
  Segmented,
  Chip,
  ScrollArea,
  TimePicker,
  DateRangePicker,
  OTPInput,
  PasswordInput,
  TagInput,
  InlineEdit,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  NavigationBar,
  NavLink,
  BackToTop,
  Container,
  Banner,
  ConfirmDialog,
  CodeBlock,
  AspectRatio,
  VirtualList,
  TagGroup,
  TagGroupItem,
  BottomSheet,
  SwipeAction,
} from '@/lib';

const page = css`
  padding: var(--haze-space-8);
  max-width: 960px;

  h1 {
    font-size: var(--haze-text-3xl);
    font-weight: var(--haze-weight-bold);
    margin: 0 0 var(--haze-space-8);
  }
`;

const section = css`
  margin-bottom: var(--haze-space-10);

  h2 {
    font-size: var(--haze-text-xl);
    font-weight: var(--haze-weight-semibold);
    margin: 0 0 var(--haze-space-4);
    padding-bottom: var(--haze-space-2);
    border-bottom: 1px solid var(--haze-color-border);
  }

  h3 {
    font-size: var(--haze-text-base);
    font-weight: var(--haze-weight-medium);
    color: var(--haze-color-text-secondary);
    margin: var(--haze-space-4) 0 var(--haze-space-2);
  }
`;

const row = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-3);
  flex-wrap: wrap;
  margin-bottom: var(--haze-space-4);
`;

const fieldRow = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-3);
  margin-bottom: var(--haze-space-4);
  max-width: 320px;
`;

const label = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  cursor: pointer;
`;

function ButtonSection() {
  return (
    <div className={section} id='button'>
      <h2>Button</h2>
      <h3>Variants</h3>
      <div className={row}>
        <Button variant='solid'>Solid</Button>
        <Button variant='outline'>Outline</Button>
        <Button variant='ghost'>Ghost</Button>
      </div>
      <h3>Sizes</h3>
      <div className={row}>
        <Button size='sm'>Small</Button>
        <Button size='md'>Medium</Button>
        <Button size='lg'>Large</Button>
      </div>
    </div>
  );
}

function InputSection() {
  const [, , valueCtrl] = useControl(undefined, '');

  return (
    <div className={section} id='input'>
      <h2>Input</h2>
      <h3>Sizes</h3>
      <div className={fieldRow}>
        <Input size='sm' placeholder='Small' />
      </div>
      <div className={fieldRow}>
        <Input size='md' placeholder='Medium' />
      </div>
      <div className={fieldRow}>
        <Input size='lg' placeholder='Large' />
      </div>
      <h3>Controlled</h3>
      <div className={fieldRow}>
        <Input value={valueCtrl} placeholder='Type here...' />
      </div>
    </div>
  );
}

function SelectSection() {
  return (
    <div className={section} id='select'>
      <h2>Select</h2>
      <div className={fieldRow}>
        <Select>
          <Option value=''>Choose...</Option>
          <Option value='a'>Option A</Option>
          <Option value='b'>Option B</Option>
        </Select>
      </div>
    </div>
  );
}

function CheckboxSection() {
  return (
    <div className={section} id='checkbox'>
      <h2>Checkbox</h2>
      <div className={row}>
        <label className={label}>
          <Checkbox /> Unchecked
        </label>
        <label className={label}>
          <Checkbox checked /> Checked
        </label>
      </div>
    </div>
  );
}

function SwitchSection() {
  return (
    <div className={section} id='switch'>
      <h2>Switch</h2>
      <div className={row}>
        <Switch size='sm' />
        <Switch size='md' />
        <Switch size='lg' />
      </div>
    </div>
  );
}

function BadgeSection() {
  return (
    <div className={section} id='badge'>
      <h2>Badge</h2>
      <div className={row}>
        <Badge variant='default'>Default</Badge>
        <Badge variant='success'>Success</Badge>
        <Badge variant='warning'>Warning</Badge>
        <Badge variant='danger'>Danger</Badge>
        <Badge variant='info'>Info</Badge>
      </div>
    </div>
  );
}

function DialogSection() {
  const [, , openCtrl] = useControl(undefined, false);
  const [, setOpen] = useControl(openCtrl);

  return (
    <div className={section} id='dialog'>
      <h2>Dialog</h2>
      <div className={row}>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      </div>
      <Dialog open={openCtrl} onClose={() => setOpen(false)}>
        <p style={{ margin: 0 }}>Modal dialog content. Press ESC to close.</p>
        <Button onClick={() => setOpen(false)} size='sm' variant='outline'>
          Close
        </Button>
      </Dialog>
    </div>
  );
}

function TooltipSection() {
  return (
    <div className={section} id='tooltip'>
      <h2>Tooltip</h2>
      <div className={row}>
        <Tooltip content='Hello!' position='top'>
          <Button variant='outline'>Hover me</Button>
        </Tooltip>
        <Tooltip content='Right side' position='right'>
          <Button variant='outline'>Right</Button>
        </Tooltip>
      </div>
    </div>
  );
}

function PopoverSection() {
  return (
    <div className={section} id='popover'>
      <h2>Popover</h2>
      <div className={row}>
        <Popover content={<span>Popover content</span>}>
          <Button variant='outline'>Toggle</Button>
        </Popover>
      </div>
    </div>
  );
}

function CardSection() {
  return (
    <div className={section} id='card'>
      <h2>Card</h2>
      <div className={row} style={{ alignItems: 'stretch' }}>
        <Card variant='elevated'>
          <strong>Elevated</strong>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Shadow card
          </p>
        </Card>
        <Card variant='outlined'>
          <strong>Outlined</strong>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Border card
          </p>
        </Card>
        <Card variant='filled'>
          <strong>Filled</strong>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Background card
          </p>
        </Card>
      </div>
    </div>
  );
}

function RadioSection() {
  return (
    <div className={section} id='radio'>
      <h2>Radio</h2>
      <RadioGroup>
        <Radio value='a'>Option A</Radio>
        <Radio value='b'>Option B</Radio>
        <Radio value='c'>Option C</Radio>
      </RadioGroup>
    </div>
  );
}

function TextareaSection() {
  return (
    <div className={section} id='textarea'>
      <h2>Textarea</h2>
      <div className={fieldRow}>
        <Textarea placeholder='Write something...' rows={3} />
      </div>
    </div>
  );
}

function SliderSection() {
  return (
    <div className={section} id='slider'>
      <h2>Slider</h2>
      <div className={fieldRow}>
        <Slider min={0} max={100} />
      </div>
    </div>
  );
}

function TabsSection() {
  const [, , tabCtrl] = useControl(undefined, 'a');

  return (
    <div className={section} id='tabs'>
      <h2>Tabs</h2>
      <Tabs value={tabCtrl}>
        <TabList>
          <Tab value='a'>Tab A</Tab>
          <Tab value='b'>Tab B</Tab>
        </TabList>
        <TabPanel value='a'>Panel A content</TabPanel>
        <TabPanel value='b'>Panel B content</TabPanel>
      </Tabs>
    </div>
  );
}

function AccordionSection() {
  return (
    <div className={section} id='accordion'>
      <h2>Accordion</h2>
      <Accordion>
        <AccordionItem title='Section 1'>Content for section 1.</AccordionItem>
        <AccordionItem title='Section 2'>Content for section 2.</AccordionItem>
      </Accordion>
    </div>
  );
}

function AlertSection() {
  return (
    <div className={section} id='alert'>
      <h2>Alert</h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--haze-space-2)',
          maxWidth: 480,
        }}
      >
        <Alert variant='info'>Informational alert.</Alert>
        <Alert variant='success'>Success alert.</Alert>
        <Alert variant='warning'>Warning alert.</Alert>
        <Alert variant='danger'>Danger alert.</Alert>
      </div>
    </div>
  );
}

function AvatarSection() {
  return (
    <div className={section} id='avatar'>
      <h2>Avatar</h2>
      <div className={row}>
        <Avatar size='sm' src='https://i.pravatar.cc/64?u=a' alt='Alice' />
        <Avatar size='md' src='https://i.pravatar.cc/80?u=b' alt='Bob' />
        <Avatar size='lg' alt='Carol' />
        <Avatar size='md' fallback='🎨' />
      </div>
    </div>
  );
}

function TagSection() {
  return (
    <div className={section} id='tag'>
      <h2>Tag</h2>
      <div className={row}>
        <Tag variant='default'>Default</Tag>
        <Tag variant='primary'>Primary</Tag>
        <Tag variant='success'>Success</Tag>
        <Tag variant='warning'>Warning</Tag>
        <Tag variant='danger' closable>
          Closable
        </Tag>
      </div>
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className={section} id='skeleton'>
      <h2>Skeleton</h2>
      <div
        style={{
          display: 'flex',
          gap: 'var(--haze-space-3)',
          alignItems: 'center',
          maxWidth: 320,
        }}
      >
        <Skeleton variant='circular' width={40} height={40} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--haze-space-1)',
          }}
        >
          <Skeleton variant='text' width='60%' />
          <Skeleton variant='text' width='80%' />
        </div>
      </div>
    </div>
  );
}

function IconSection() {
  return (
    <div className={section} id='icon'>
      <h2>Icon</h2>
      <div className={row}>
        <Icon size='sm'>
          <svg viewBox='0 0 24 24'>
            <path
              d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            />
          </svg>
        </Icon>
        <Icon size='md'>
          <svg viewBox='0 0 24 24'>
            <path
              d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            />
          </svg>
        </Icon>
        <Icon size='lg'>
          <svg viewBox='0 0 24 24'>
            <path
              d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
            />
          </svg>
        </Icon>
      </div>
    </div>
  );
}

function FlexSection() {
  return (
    <div className={section} id='flex'>
      <h2>Flex</h2>
      <Flex gap='var(--haze-space-3)' align='center'>
        <Badge>Item 1</Badge>
        <Badge variant='success'>Item 2</Badge>
        <Badge variant='info'>Item 3</Badge>
      </Flex>
    </div>
  );
}

function BreadcrumbSection() {
  return (
    <div className={section} id='breadcrumb'>
      <h2>Breadcrumb</h2>
      <Breadcrumb>
        <BreadcrumbItem href='#'>Home</BreadcrumbItem>
        <BreadcrumbItem href='#'>Components</BreadcrumbItem>
        <BreadcrumbItem>Breadcrumb</BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
}

function DisclosureSection() {
  return (
    <div className={section} id='disclosure'>
      <h2>Disclosure</h2>
      <div style={{ maxWidth: 480 }}>
        <Disclosure summary='Click to expand'>
          Hidden content revealed on toggle.
        </Disclosure>
      </div>
    </div>
  );
}

function MenuSection() {
  return (
    <div className={section} id='menu'>
      <h2>Menu</h2>
      <div className={row}>
        <Menu trigger={<Button variant='outline'>Open Menu</Button>}>
          <MenuItem>Edit</MenuItem>
          <MenuItem>Duplicate</MenuItem>
          <MenuItem disabled>Delete</MenuItem>
        </Menu>
      </div>
    </div>
  );
}

function NumberInputSection() {
  return (
    <div className={section} id='numberinput'>
      <h2>NumberInput</h2>
      <div className={row}>
        <NumberInput min={0} max={10} />
      </div>
    </div>
  );
}

function FileInputSection() {
  return (
    <div className={section} id='fileinput'>
      <h2>FileInput</h2>
      <div className={row}>
        <FileInput accept='image/*' />
      </div>
    </div>
  );
}

function ToastSectionInner() {
  const toast = useToast();
  return (
    <div className={section} id='toast'>
      <h2>Toast</h2>
      <div className={row}>
        <Button variant='outline' onClick={() => toast('Hello!')}>
          Show Toast
        </Button>
        <Button
          variant='outline'
          onClick={() => toast('Done!', { variant: 'success' })}
        >
          Success
        </Button>
      </div>
    </div>
  );
}

function ToastSection() {
  return (
    <ToastContainer>
      <ToastSectionInner />
    </ToastContainer>
  );
}

function ListSection() {
  return (
    <div className={section} id='list'>
      <h2>List</h2>
      <List>
        <ListItem>First item</ListItem>
        <ListItem>Second item</ListItem>
        <ListItem>Third item</ListItem>
      </List>
    </div>
  );
}

function ComboboxSection() {
  return (
    <div className={section} id='combobox'>
      <h2>Combobox</h2>
      <div className={fieldRow}>
        <Combobox
          options={[
            { value: 'apple', label: 'Apple' },
            { value: 'banana', label: 'Banana' },
            { value: 'cherry', label: 'Cherry' },
          ]}
          placeholder='Search...'
        />
      </div>
    </div>
  );
}

function TableSection() {
  return (
    <div className={section} id='table'>
      <h2>Table</h2>
      <Table striped>
        <TableHead>
          <TableRow>
            <TableCell as='th'>Name</TableCell>
            <TableCell as='th'>Role</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>Engineer</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bob</TableCell>
            <TableCell>Designer</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function CarouselSection() {
  return (
    <div className={section} id='carousel'>
      <h2>Carousel</h2>
      <div style={{ maxWidth: 400 }}>
        <Carousel>
          <CarouselSlide>
            <div
              style={{
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--haze-color-bg-subtle)',
                borderRadius: 'var(--haze-radius-md)',
              }}
            >
              Slide 1
            </div>
          </CarouselSlide>
          <CarouselSlide>
            <div
              style={{
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--haze-color-bg-muted)',
                borderRadius: 'var(--haze-radius-md)',
              }}
            >
              Slide 2
            </div>
          </CarouselSlide>
        </Carousel>
      </div>
    </div>
  );
}

function DatepickerSection() {
  return (
    <div className={section} id='datepicker'>
      <h2>Datepicker</h2>
      <div className={fieldRow}>
        <Datepicker placeholder='Pick a date' />
      </div>
    </div>
  );
}

function TreeSection() {
  return (
    <div className={section} id='tree'>
      <h2>Tree</h2>
      <h3>Basic</h3>
      <div style={{ maxWidth: 400 }}>
        <Tree
          treeData={[
            {
              key: '0-0',
              title: 'parent 0',
              children: [
                { key: '0-0-0', title: 'leaf 0-0-0' },
                { key: '0-0-1', title: 'leaf 0-0-1' },
              ],
            },
            {
              key: '0-1',
              title: 'parent 1',
              children: [{ key: '0-1-0', title: 'leaf 0-1-0' }],
            },
          ]}
        />
      </div>
      <h3>With Checkboxes</h3>
      <div style={{ maxWidth: 400 }}>
        <Tree
          treeData={[
            {
              key: '0-0',
              title: 'parent 0',
              children: [
                { key: '0-0-0', title: 'leaf 0-0-0' },
                { key: '0-0-1', title: 'leaf 0-0-1' },
              ],
            },
            {
              key: '0-1',
              title: 'parent 1',
              children: [{ key: '0-1-0', title: 'leaf 0-1-0' }],
            },
          ]}
          checkable
        />
      </div>
      <h3>With Icons and Lines</h3>
      <div style={{ maxWidth: 400 }}>
        <Tree
          treeData={[
            {
              key: '0-0',
              title: 'Documents',
              children: [
                { key: '0-0-0', title: 'Report.pdf' },
                { key: '0-0-1', title: 'Notes.txt' },
              ],
            },
            {
              key: '0-1',
              title: 'Images',
              children: [{ key: '0-1-0', title: 'Photo.png' }],
            },
          ]}
          showIcon
          showLine
        />
      </div>
      <h3>Left-Right Layout</h3>
      <div
        style={{
          display: 'flex',
          gap: 'var(--haze-space-4)',
          maxWidth: 600,
          height: 240,
          border: '1px solid var(--haze-color-border)',
          borderRadius: 'var(--haze-radius-md)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 200,
            flexShrink: 0,
            borderRight: '1px solid var(--haze-color-border)',
            overflow: 'auto',
            padding: 'var(--haze-space-3)',
          }}
        >
          <Tree
            treeData={[
              {
                key: '0-0',
                title: 'src',
                children: [
                  {
                    key: '0-0-0',
                    title: 'components',
                    children: [
                      { key: '0-0-0-0', title: 'Button.tsx' },
                      { key: '0-0-0-1', title: 'Dialog.tsx' },
                    ],
                  },
                  {
                    key: '0-0-1',
                    title: 'hooks',
                    children: [{ key: '0-0-1-0', title: 'useAuth.ts' }],
                  },
                ],
              },
              {
                key: '0-1',
                title: 'public',
                children: [{ key: '0-1-0', title: 'index.html' }],
              },
            ]}
            blockNode
            showLine
          />
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--haze-color-text-secondary)',
            fontSize: 'var(--haze-text-sm)',
          }}
        >
          Select a file to preview
        </div>
      </div>
    </div>
  );
}

function DividerSection() {
  return (
    <div className={section} id='divider'>
      <h2>Divider</h2>
      <div style={{ maxWidth: 480 }}>
        <p style={{ margin: 0 }}>Above the divider</p>
        <Divider />
        <p style={{ margin: 0 }}>Below the divider</p>
      </div>
      <h3>Vertical</h3>
      <div className={row}>
        <span>Left</span>
        <Divider orientation='vertical' />
        <span>Right</span>
      </div>
    </div>
  );
}

function SpinnerSection() {
  return (
    <div className={section} id='spinner'>
      <h2>Spinner</h2>
      <div className={row}>
        <Spinner size='sm' />
        <Spinner size='md' />
        <Spinner size='lg' />
      </div>
    </div>
  );
}

function EmptySection() {
  return (
    <div className={section} id='empty'>
      <h2>Empty</h2>
      <Empty description='No results found' />
    </div>
  );
}

function ProgressSection() {
  return (
    <div className={section} id='progress'>
      <h2>Progress</h2>
      <h3>Bar</h3>
      <div style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)' }}>
        <Progress value={25} size='sm' />
        <Progress value={50} color='success' />
        <Progress value={75} size='lg' color='warning' />
      </div>
      <h3>Circle</h3>
      <div className={row}>
        <Progress variant='circle' value={30} size='sm' />
        <Progress variant='circle' value={60} />
        <Progress variant='circle' value={90} size='lg' color='success' />
      </div>
    </div>
  );
}

function PaginationSection() {
  return (
    <div className={section} id='pagination'>
      <h2>Pagination</h2>
      <Pagination total={100} pageSize={10} />
    </div>
  );
}

function GridSection() {
  return (
    <div className={section} id='grid'>
      <h2>Grid</h2>
      <Grid columns={3} gap={3}>
        <GridItem span={1}>
          <div style={{ background: 'var(--haze-color-bg-subtle)', padding: 'var(--haze-space-3)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>1</div>
        </GridItem>
        <GridItem span={1}>
          <div style={{ background: 'var(--haze-color-bg-subtle)', padding: 'var(--haze-space-3)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>2</div>
        </GridItem>
        <GridItem span={1}>
          <div style={{ background: 'var(--haze-color-bg-subtle)', padding: 'var(--haze-space-3)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>3</div>
        </GridItem>
        <GridItem span={2}>
          <div style={{ background: 'var(--haze-color-bg-muted)', padding: 'var(--haze-space-3)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>span 2</div>
        </GridItem>
        <GridItem span={1}>
          <div style={{ background: 'var(--haze-color-bg-subtle)', padding: 'var(--haze-space-3)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>4</div>
        </GridItem>
      </Grid>
    </div>
  );
}

function DrawerSection() {
  const [, , openCtrl] = useControl(undefined, false);
  const [, setOpen] = useControl(openCtrl);

  return (
    <div className={section} id='drawer'>
      <h2>Drawer</h2>
      <div className={row}>
        <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      </div>
      <Drawer open={openCtrl} onClose={() => setOpen(false)}>
        <div style={{ padding: 'var(--haze-space-4)' }}>
          <p>Drawer content goes here.</p>
          <Button onClick={() => setOpen(false)} size='sm' variant='outline'>Close</Button>
        </div>
      </Drawer>
    </div>
  );
}

function StepperSection() {
  return (
    <div className={section} id='stepper'>
      <h2>Stepper</h2>
      <Stepper activeStep={1}>
        <Step title='Step 1' description='Completed' />
        <Step title='Step 2' description='In progress' />
        <Step title='Step 3' description='Pending' />
      </Stepper>
    </div>
  );
}

function ChatMessageSection() {
  return (
    <div className={section} id='chatmessage'>
      <h2>ChatMessage</h2>
      <ChatMessage role='user' name='You' timestamp='10:00 AM'>
        Hello, can you help me?
      </ChatMessage>
      <ChatMessage role='assistant' name='Assistant' timestamp='10:01 AM'>
        Of course! What do you need help with?
      </ChatMessage>
      <ChatMessage role='system'>Conversation started</ChatMessage>
    </div>
  );
}

function ChatContainerSection() {
  return (
    <div className={section} id='chatcontainer'>
      <h2>ChatContainer</h2>
      <div style={{ maxHeight: 200, border: '1px solid var(--haze-color-border)', borderRadius: 'var(--haze-radius-md)' }}>
        <ChatContainer>
          <ChatMessage role='assistant'>Welcome! How can I help?</ChatMessage>
          <ChatMessage role='user'>Show me the docs.</ChatMessage>
        </ChatContainer>
      </div>
    </div>
  );
}

function ChatInputSection() {
  return (
    <div className={section} id='chatinput'>
      <h2>ChatInput</h2>
      <div style={{ maxWidth: 480 }}>
        <ChatInput placeholder='Type a message...' />
      </div>
    </div>
  );
}

function StreamingTextSection() {
  return (
    <div className={section} id='streamingtext'>
      <h2>StreamingText</h2>
      <StreamingText text='Hello! This text appears character by character with a typewriter effect.' speed={30} />
    </div>
  );
}

function MarkdownRendererSection() {
  return (
    <div className={section} id='markdownrenderer'>
      <h2>MarkdownRenderer</h2>
      <div style={{ maxWidth: 480 }}>
        <MarkdownRenderer content={'## Hello World\n\nThis is **bold** and *italic* text.\n\n- Item one\n- Item two\n\n```js\nconsole.log("hi");\n```'} />
      </div>
    </div>
  );
}

function ToolCallCardSection() {
  return (
    <div className={section} id='toolcallcard'>
      <h2>ToolCallCard</h2>
      <div style={{ maxWidth: 400 }}>
        <ToolCallCard name='search_docs' input='query: "react hooks"' output='Found 5 results' status='done' />
      </div>
    </div>
  );
}

function ThinkingIndicatorSection() {
  return (
    <div className={section} id='thinkingindicator'>
      <h2>ThinkingIndicator</h2>
      <ThinkingIndicator />
      <ThinkingIndicator text='Processing' />
    </div>
  );
}

function StepTimelineSection() {
  return (
    <div className={section} id='steptimeline'>
      <h2>StepTimeline</h2>
      <div style={{ maxWidth: 320 }}>
        <StepTimeline>
          <StepTimelineItem label='Connected' description='API linked' status='done' />
          <StepTimelineItem label='Processing' description='Analyzing data...' status='active' />
          <StepTimelineItem label='Complete' status='pending' />
        </StepTimeline>
      </div>
    </div>
  );
}

function ApprovalCardSection() {
  return (
    <div className={section} id='approvalcard'>
      <h2>ApprovalCard</h2>
      <div style={{ maxWidth: 400 }}>
        <ApprovalCard title='Deploy to Production' description='This will deploy version 2.1.0 to all regions.' />
      </div>
    </div>
  );
}

function TokenCounterSection() {
  return (
    <div className={section} id='tokencounter'>
      <h2>TokenCounter</h2>
      <div style={{ maxWidth: 320 }}>
        <TokenCounter used={3200} max={8000} label='Context' />
      </div>
    </div>
  );
}

function ModelPickerSection() {
  const [, , modelCtrl] = useControl(undefined, 'gpt-4');

  return (
    <div className={section} id='modelpicker'>
      <h2>ModelPicker</h2>
      <div style={{ maxWidth: 320 }}>
        <ModelPicker
          value={modelCtrl}
          options={[
            { value: 'gpt-4', label: 'GPT-4', contextLength: '128k' },
            { value: 'gpt-3.5', label: 'GPT-3.5', contextLength: '16k' },
            { value: 'claude', label: 'Claude', contextLength: '200k' },
          ]}
        />
      </div>
    </div>
  );
}

function ConversationListSection() {
  return (
    <div className={section} id='conversationlist'>
      <h2>ConversationList</h2>
      <div style={{ maxWidth: 280, border: '1px solid var(--haze-color-border)', borderRadius: 'var(--haze-radius-md)' }}>
        <ConversationList>
          <ConversationItem title='New Chat' subtitle='Start a conversation' active />
          <ConversationItem title='Project Planning' subtitle='Yesterday' />
          <ConversationItem title='Code Review' subtitle='3 days ago' />
        </ConversationList>
      </div>
    </div>
  );
}

function DiffViewerSection() {
  return (
    <div className={section} id='diffviewer'>
      <h2>DiffViewer</h2>
      <div style={{ maxWidth: 560 }}>
        <DiffViewer
          oldValue={'const x = 1;\nconst y = 2;\nconsole.log(x + y);'}
          newValue={'const x = 10;\nconst y = 2;\nconst z = x + y;\nconsole.log(z);'}
        />
      </div>
    </div>
  );
}

function LogViewerSection() {
  return (
    <div className={section} id='logviewer'>
      <h2>LogViewer</h2>
      <div style={{ maxWidth: 560 }}>
        <LogViewer
          logs={[
            { level: 'info', message: 'Server started on port 3000', timestamp: '10:00:01' },
            { level: 'debug', message: 'Connected to database', timestamp: '10:00:02' },
            { level: 'warn', message: 'Cache miss for key: user_123', timestamp: '10:00:05' },
            { level: 'error', message: 'Failed to fetch data', timestamp: '10:00:10' },
          ]}
        />
      </div>
    </div>
  );
}

function CommandSection() {
  return (
    <div className={section} id='command'>
      <h2>Command</h2>
      <Command>
        <CommandInput placeholder='Type a command...' />
        <CommandList>
          <CommandItem>New File</CommandItem>
          <CommandItem>Open File</CommandItem>
          <CommandItem>Save</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandList>
      </Command>
    </div>
  );
}

function ResizableSection() {
  return (
    <div className={section} id='resizable'>
      <h2>Resizable</h2>
      <div style={{ height: 200, border: '1px solid var(--haze-color-border)', borderRadius: 'var(--haze-radius-md)' }}>
        <ResizableGroup>
          <ResizablePanel defaultSize={50}>
            <div style={{ padding: 'var(--haze-space-3)', height: '100%' }}>Left Panel</div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <div style={{ padding: 'var(--haze-space-3)', height: '100%' }}>Right Panel</div>
          </ResizablePanel>
        </ResizableGroup>
      </div>
    </div>
  );
}

function CollapsibleSection() {
  return (
    <div className={section} id='collapsible'>
      <h2>Collapsible</h2>
      <Collapsible>
        <CollapsibleTrigger>
          <Button variant='outline' size='sm'>Toggle Content</Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p style={{ padding: 'var(--haze-space-3) 0', margin: 0 }}>Hidden content revealed on toggle.</p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function TransferSection() {
  return (
    <div className={section} id='transfer'>
      <h2>Transfer</h2>
      <Transfer
        dataSource={[
          { key: 'a', title: 'Item A' },
          { key: 'b', title: 'Item B' },
          { key: 'c', title: 'Item C' },
        ]}
        targetKeys={['b']}
      />
    </div>
  );
}

function UploadSection() {
  return (
    <div className={section} id='upload'>
      <h2>Upload</h2>
      <div style={{ maxWidth: 400 }}>
        <Upload accept='image/*' />
      </div>
    </div>
  );
}

function ColorPickerSection() {
  return (
    <div className={section} id='colorpicker'>
      <h2>ColorPicker</h2>
      <div style={{ maxWidth: 320 }}>
        <ColorPicker presets={['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']} />
      </div>
    </div>
  );
}

function RatingSection() {
  return (
    <div className={section} id='rating'>
      <h2>Rating</h2>
      <div className={row}>
        <Rating />
        <Rating allowHalf />
        <Rating count={10} />
      </div>
    </div>
  );
}

function TimelineSection() {
  return (
    <div className={section} id='timeline'>
      <h2>Timeline</h2>
      <Timeline>
        <TimelineItem title='Order placed' description='Your order has been placed.' time='2 min ago' color='primary' />
        <TimelineItem title='Processing' description='Order is being processed.' time='1 min ago' color='success' />
        <TimelineItem title='Shipped' />
      </Timeline>
    </div>
  );
}

function TypographySection() {
  return (
    <div className={section} id='typography'>
      <h2>Typography</h2>
      <Title level={1}>Heading Level 1</Title>
      <Title level={2}>Heading Level 2</Title>
      <Title level={3}>Heading Level 3</Title>
      <Paragraph>This is a paragraph with normal text.</Paragraph>
      <div className={row}>
        <Text>Default</Text>
        <Text type='secondary'>Secondary</Text>
        <Text type='muted'>Muted</Text>
        <Text strong>Bold</Text>
        <Text code>code</Text>
        <Text mark>Highlighted</Text>
      </div>
    </div>
  );
}

function StatSection() {
  return (
    <div className={section} id='stat'>
      <h2>Stat</h2>
      <StatGroup>
        <Stat title='Total Users' value='12,345' trend='up' trendValue='12%' />
        <Stat title='Revenue' value='$45,678' trend='down' trendValue='3%' />
        <Stat title='Active' value='89%' />
      </StatGroup>
    </div>
  );
}

function SegmentedSection() {
  return (
    <div className={section} id='segmented'>
      <h2>Segmented</h2>
      <div className={row}>
        <Segmented options={['Map', 'Transit', 'Satellite']} />
      </div>
      <h3>Sizes</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)' }}>
        <Segmented options={['Small', 'Medium', 'Large']} size='sm' />
        <Segmented options={['Small', 'Medium', 'Large']} size='md' />
        <Segmented options={['Small', 'Medium', 'Large']} size='lg' />
      </div>
    </div>
  );
}

function ChipSection() {
  return (
    <div className={section} id='chip'>
      <h2>Chip</h2>
      <div className={row}>
        <Chip>Default</Chip>
        <Chip color='primary'>Primary</Chip>
        <Chip color='success'>Success</Chip>
        <Chip color='warning'>Warning</Chip>
        <Chip color='danger'>Danger</Chip>
      </div>
      <h3>Outline</h3>
      <div className={row}>
        <Chip variant='outline' color='primary'>Primary</Chip>
        <Chip variant='outline' color='success'>Success</Chip>
      </div>
    </div>
  );
}

function ScrollAreaSection() {
  return (
    <div className={section} id='scrollarea'>
      <h2>ScrollArea</h2>
      <ScrollArea maxHeight={150}>
        <div style={{ padding: 'var(--haze-space-2)' }}>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} style={{ margin: '0 0 var(--haze-space-2)' }}>Scrollable item {i + 1}</p>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function TimePickerSection() {
  return (
    <div className={section} id='timepicker'>
      <h2>TimePicker</h2>
      <div className={fieldRow}>
        <TimePicker placeholder='Select time' />
      </div>
    </div>
  );
}

function DateRangePickerSection() {
  return (
    <div className={section} id='daterangepicker'>
      <h2>DateRangePicker</h2>
      <DateRangePicker />
    </div>
  );
}

function OTPInputSection() {
  return (
    <div className={section} id='otpinput'>
      <h2>OTPInput</h2>
      <OTPInput length={6} />
    </div>
  );
}

function PasswordInputSection() {
  return (
    <div className={section} id='passwordinput'>
      <h2>PasswordInput</h2>
      <div className={fieldRow}>
        <PasswordInput placeholder='Enter password' />
      </div>
    </div>
  );
}

function TagInputSection() {
  return (
    <div className={section} id='taginput'>
      <h2>TagInput</h2>
      <div className={fieldRow}>
        <TagInput placeholder='Add a tag and press Enter' />
      </div>
    </div>
  );
}

function InlineEditSection() {
  return (
    <div className={section} id='inlineedit'>
      <h2>InlineEdit</h2>
      <InlineEdit placeholder='Click to edit this text' />
    </div>
  );
}

function DropdownMenuSection() {
  return (
    <div className={section} id='dropdownmenu'>
      <h2>DropdownMenu</h2>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant='outline'>Open Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ContextMenuSection() {
  return (
    <div className={section} id='contextmenu'>
      <h2>ContextMenu</h2>
      <ContextMenu>
        <ContextMenuTrigger>
          <div style={{ padding: 'var(--haze-space-4)', border: '1px dashed var(--haze-color-border)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>
            Right-click here
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
          <ContextMenuItem>Paste</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem>Select All</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

function NavigationBarSection() {
  return (
    <div className={section} id='navigationbar'>
      <h2>NavigationBar</h2>
      <NavigationBar
        brand={<span>MyApp</span>}
        end={<Button size='sm' variant='outline'>Login</Button>}
      >
        <NavLink active>Home</NavLink>
        <NavLink>Docs</NavLink>
        <NavLink>About</NavLink>
      </NavigationBar>
    </div>
  );
}

function BackToTopSection() {
  return (
    <div className={section} id='backtotop'>
      <h2>BackToTop</h2>
      <p style={{ fontSize: 'var(--haze-text-sm)', color: 'var(--haze-color-text-secondary)' }}>
        Fixed-position button that appears after scrolling. Renders at bottom-right of viewport.
      </p>
      <BackToTop threshold={100} />
    </div>
  );
}

function AffixSection() {
  return (
    <div className={section} id='affix'>
      <h2>Affix</h2>
      <p style={{ fontSize: 'var(--haze-text-sm)', color: 'var(--haze-color-text-secondary)' }}>
        Positions children fixed to the viewport. Use <code>position</code> and <code>offset</code> props.
      </p>
    </div>
  );
}

function ContainerSection() {
  return (
    <div className={section} id='container'>
      <h2>Container</h2>
      <Container size='sm'>
        <div style={{ background: 'var(--haze-color-bg-subtle)', padding: 'var(--haze-space-4)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>
          Small container (max 640px)
        </div>
      </Container>
    </div>
  );
}

function BannerSection() {
  return (
    <div className={section} id='banner'>
      <h2>Banner</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-2)' }}>
        <Banner variant='info'>This is an informational banner.</Banner>
        <Banner variant='success'>Operation completed successfully.</Banner>
        <Banner variant='warning'>Please review your settings.</Banner>
        <Banner variant='danger' onClose={() => { /* dismiss */ }}>Something went wrong.</Banner>
      </div>
    </div>
  );
}

function ConfirmDialogSection() {
  const [, , openCtrl] = useControl(undefined, false);
  const [, setOpen] = useControl(openCtrl);

  return (
    <div className={section} id='confirmdialog'>
      <h2>ConfirmDialog</h2>
      <div className={row}>
        <Button onClick={() => setOpen(true)}>Open Confirm Dialog</Button>
      </div>
      <ConfirmDialog
        open={openCtrl}
        title='Delete Item'
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        variant='danger'
      >
        Are you sure you want to delete this item? This action cannot be undone.
      </ConfirmDialog>
    </div>
  );
}

function CodeBlockSection() {
  return (
    <div className={section} id='codeblock'>
      <h2>CodeBlock</h2>
      <CodeBlock language='tsx'>
{`const greeting = "Hello, world!";
console.log(greeting);`}
      </CodeBlock>
    </div>
  );
}

function AspectRatioSection() {
  return (
    <div className={section} id='aspectratio'>
      <h2>AspectRatio</h2>
      <div style={{ maxWidth: 400 }}>
        <AspectRatio ratio={16 / 9}>
          <div style={{ width: '100%', height: '100%', background: 'var(--haze-color-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            16:9
          </div>
        </AspectRatio>
      </div>
    </div>
  );
}

function VirtualListSection() {
  const items = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`);
  return (
    <div className={section} id='virtuallist'>
      <h2>VirtualList</h2>
      <VirtualList
        items={items}
        height={200}
        itemHeight={32}
        renderItem={(item) => <div style={{ padding: '0 var(--haze-space-3)', lineHeight: '32px' }}>{item}</div>}
      />
    </div>
  );
}

function TagGroupSection() {
  return (
    <div className={section} id='taggroup'>
      <h2>TagGroup</h2>
      <TagGroup>
        <TagGroupItem>React</TagGroupItem>
        <TagGroupItem>TypeScript</TagGroupItem>
        <TagGroupItem onClose={() => { /* remove */ }}>Closable</TagGroupItem>
      </TagGroup>
    </div>
  );
}

function BottomSheetSection() {
  const [, , openCtrl] = useControl(undefined, false);
  const [, setOpen] = useControl(openCtrl);

  return (
    <div className={section} id='bottomsheet'>
      <h2>BottomSheet</h2>
      <div className={row}>
        <Button onClick={() => setOpen(true)}>Open Bottom Sheet</Button>
      </div>
      <BottomSheet open={openCtrl} onClose={() => setOpen(false)}>
        <p style={{ margin: 0 }}>Bottom sheet content. Click the backdrop to close.</p>
      </BottomSheet>
    </div>
  );
}

function SwipeActionSection() {
  return (
    <div className={section} id='swipeaction'>
      <h2>SwipeAction</h2>
      <div style={{ maxWidth: 400, border: '1px solid var(--haze-color-border)', borderRadius: 'var(--haze-radius-md)' }}>
        <SwipeAction
          left={<div style={{ padding: 'var(--haze-space-3)', color: 'var(--haze-color-success)' }}>Archive</div>}
          right={<div style={{ padding: 'var(--haze-space-3)', color: 'var(--haze-color-danger)' }}>Delete</div>}
        >
          <div style={{ padding: 'var(--haze-space-3)' }}>Swipe left or right</div>
        </SwipeAction>
      </div>
    </div>
  );
}

export default function ComponentDoc() {
  return (
    <div className={page}>
      <h1>Components</h1>
      <ButtonSection />
      <InputSection />
      <SelectSection />
      <CheckboxSection />
      <SwitchSection />
      <BadgeSection />
      <DialogSection />
      <TooltipSection />
      <PopoverSection />
      <CardSection />
      <RadioSection />
      <TextareaSection />
      <SliderSection />
      <TabsSection />
      <AccordionSection />
      <AlertSection />
      <AvatarSection />
      <TagSection />
      <SkeletonSection />
      <IconSection />
      <FlexSection />
      <BreadcrumbSection />
      <DisclosureSection />
      <MenuSection />
      <NumberInputSection />
      <FileInputSection />
      <ToastSection />
      <ListSection />
      <ComboboxSection />
      <TableSection />
      <CarouselSection />
      <DatepickerSection />
      <TreeSection />
      <DividerSection />
      <SpinnerSection />
      <EmptySection />
      <ProgressSection />
      <PaginationSection />
      <GridSection />
      <DrawerSection />
      <StepperSection />
      <ChatMessageSection />
      <ChatContainerSection />
      <ChatInputSection />
      <StreamingTextSection />
      <MarkdownRendererSection />
      <ToolCallCardSection />
      <ThinkingIndicatorSection />
      <StepTimelineSection />
      <ApprovalCardSection />
      <TokenCounterSection />
      <ModelPickerSection />
      <ConversationListSection />
      <DiffViewerSection />
      <LogViewerSection />
      <CommandSection />
      <ResizableSection />
      <CollapsibleSection />
      <TransferSection />
      <UploadSection />
      <ColorPickerSection />
      <RatingSection />
      <TimelineSection />
      <TypographySection />
      <StatSection />
      <SegmentedSection />
      <ChipSection />
      <ScrollAreaSection />
      <TimePickerSection />
      <DateRangePickerSection />
      <OTPInputSection />
      <PasswordInputSection />
      <TagInputSection />
      <InlineEditSection />
      <DropdownMenuSection />
      <ContextMenuSection />
      <NavigationBarSection />
      <BackToTopSection />
      <AffixSection />
      <ContainerSection />
      <BannerSection />
      <ConfirmDialogSection />
      <CodeBlockSection />
      <AspectRatioSection />
      <VirtualListSection />
      <TagGroupSection />
      <BottomSheetSection />
      <SwipeActionSection />
    </div>
  );
}
