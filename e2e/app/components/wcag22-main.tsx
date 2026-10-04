/**
 * WCAG 2.2 audit harness for e2e/wcag22.spec.ts: a page of
 * representative small controls — every family that historically ships
 * compact targets — in their smallest size variant where one exists.
 *
 *   - SC 2.5.8 Target Size (Minimum): every interactive element's box
 *     must be ≥24×24 CSS px.
 *   - SC 2.4.11 Focus Not Obscured / focus appearance: walking the page
 *     with Tab, every stop must paint a ≥2px indicator (outline or
 *     box-shadow ring — the library uses both).
 *
 * Panels that only exist while open (menus, tooltips) are mounted via
 * their triggers here; their items are audited by the a11y/menu specs.
 */
import { useState } from 'react';

import { Accordion, AccordionItem } from '../../../src/lib/components/Accordion';
import { Breadcrumb, BreadcrumbItem } from '../../../src/lib/components/Breadcrumb';
import { Button } from '../../../src/lib/components/Button';
import { Checkbox } from '../../../src/lib/components/Checkbox';
import { Command, CommandInput, CommandItem, CommandList } from '../../../src/lib/components/Command';
import { Menu } from '../../../src/lib/components/Menu';
import { OTPInput } from '../../../src/lib/components/OTPInput';
import { Pagination } from '../../../src/lib/components/Pagination';
import { Radio, RadioGroup } from '../../../src/lib/components/Radio';
import { Rating } from '../../../src/lib/components/Rating';
import { Segmented } from '../../../src/lib/components/Segmented';
import { Slider } from '../../../src/lib/components/Slider';
import { Switch } from '../../../src/lib/components/Switch';
import { Tab, TabList, TabPanel, Tabs } from '../../../src/lib/components/Tabs';
import { Tag } from '../../../src/lib/components/Tag';
import { Tree } from '../../../src/lib/components/Tree';
import { Tooltip } from '../../../src/lib/components/Tooltip';

import { mountPage } from './mount';

const treeData = [
  {
    key: '0-0',
    title: 'parent 0',
    children: [
      { key: '0-0-0', title: 'leaf 0-0-0' },
      { key: '0-0-1', title: 'leaf 0-0-1' },
    ],
  },
  { key: '0-1', title: 'parent 1' },
];

function App() {
  const [seg, setSeg] = useState('a');
  const [tab, setTab] = useState('preview');
  return (
    <>
      <section data-testid="case-tag">
        <Tag closable>removable</Tag>
        <Tag closable size="sm">small removable</Tag>
      </section>
      <section data-testid="case-pagination">
        <Pagination total={100} pageSize={10} page={3} />
        <Pagination total={100} pageSize={10} page={3} size="sm" />
      </section>
      <section data-testid="case-rating">
        <Rating value={3} />
      </section>
      <section data-testid="case-segmented">
        <Segmented
          options={['alpha', 'beta', 'gamma']}
          value={seg}
          onChange={setSeg}
        />
        <Segmented options={['one', 'two']} value="one" size="sm" />
      </section>
      <section data-testid="case-switch">
        <Switch checked aria-label="default switch" />
        <Switch size="sm" aria-label="small switch" />
        <Switch size="lg" aria-label="large switch" />
      </section>
      <section data-testid="case-checkbox">
        <Checkbox aria-label="bare checkbox" />
        <Checkbox label="labeled checkbox" />
      </section>
      <section data-testid="case-radio">
        <RadioGroup value="daily">
          <Radio value="daily">Daily</Radio>
          <Radio value="weekly">Weekly</Radio>
        </RadioGroup>
      </section>
      <section data-testid="case-otp">
        <OTPInput length={6} />
      </section>
      <section data-testid="case-slider">
        <Slider value={62} aria-label="volume" />
        <Slider
          range
          value={[25, 65]}
          aria-label={['minimum volume', 'maximum volume']}
        />
      </section>
      <section data-testid="case-tooltip-button">
        <Tooltip content="Focus ring check">
          <Button size="sm">Tooltip trigger</Button>
        </Tooltip>
      </section>
      <section data-testid="case-menu">
        <Menu
          trigger={<Button>Open menu</Button>}
          items={[
            { key: 'cut', label: 'Cut' },
            { key: 'copy', label: 'Copy' },
          ]}
        />
      </section>
      <section data-testid="case-breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem href="#">Home</BreadcrumbItem>
          <BreadcrumbItem href="#">Library</BreadcrumbItem>
          <BreadcrumbItem>Current page</BreadcrumbItem>
        </Breadcrumb>
      </section>
      <section data-testid="case-accordion">
        <Accordion>
          <AccordionItem title="First section">Content one</AccordionItem>
          <AccordionItem title="Second section">Content two</AccordionItem>
        </Accordion>
      </section>
      <section data-testid="case-tabs">
        <Tabs value={tab} onChange={setTab}>
          <TabList>
            <Tab value="write">Write</Tab>
            <Tab value="preview">Preview</Tab>
            <Tab value="diff">Diff</Tab>
          </TabList>
          <TabPanel value="write">Write panel</TabPanel>
          <TabPanel value="preview">Preview panel</TabPanel>
          <TabPanel value="diff">Diff panel</TabPanel>
        </Tabs>
      </section>
      <section data-testid="case-tree">
        <Tree treeData={treeData} checkable />
      </section>
      <section data-testid="case-command">
        <Command>
          <CommandInput placeholder="Type a command…" />
          <CommandList>
            <CommandItem>Copy file</CommandItem>
            <CommandItem>Delete file</CommandItem>
          </CommandList>
        </Command>
      </section>
    </>
  );
}

mountPage(<App />);
