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
    </div>
  );
}
