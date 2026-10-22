/**
 * Fixture for the Wave 3–5 pixel baselines (e2e/snapshots.spec.ts): the
 * components added since the last baseline batch — ButtonGroup,
 * InputGroup, Meter, CopyButton + Snippet, Heatmap, TimeGrid,
 * NavigationMenu (closed bar) — plus the Wave-1 refactored Accordion in
 * its new form (controlled `open` + disabled item + `classNames` slots)
 * and the same Accordion again as a dark-theme island, following the
 * `darkfields` precedent (the theme classes are plain custom-property
 * sets, so a nested dark island covers theme regressions).
 *
 * Same mounting contract as snapshots-main.tsx: every component sits in
 * a fully determined state — controlled values, no timers, no network
 * (the heatmap walks a fixed wave pattern over the first 120 days of
 * 2026, CopyButton/Snippet stay idle so the copied feedback never
 * flips, no emoji — the mono/sans glyphs all resolve from the vendored
 * webfont or the platform's shared sans fallback). mountPage pins
 * --haze-font-mono inline on the root, so the vendored 'Haze E2E Mono'
 * wins regardless of Linaria stylesheet emission order.
 *
 * The NavigationMenu carries intentDelay={0}: the open-panel baseline in
 * the spec opens it with a pure hover, and a zero dwell makes the
 * hover→open sequence deterministic (no click-toggle race between the
 * intent timer firing and the click landing).
 */
import { css } from '@linaria/core';

import { Accordion, AccordionItem } from '../../src/lib/components/Accordion';
import { Button } from '../../src/lib/components/Button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from '../../src/lib/components/ButtonGroup';
import { CopyButton, Snippet } from '../../src/lib/components/CopyButton';
import { Heatmap } from '../../src/lib/components/Heatmap';
import { Input } from '../../src/lib/components/Input';
import {
  InputGroup,
  InputGroupAddon,
} from '../../src/lib/components/InputGroup';
import { Meter } from '../../src/lib/components/Meter';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../../src/lib/components/NavigationMenu';
import { Option, Select } from '../../src/lib/components/Select';
import { TimeGrid } from '../../src/lib/components/TimeGrid';

import { darkTheme } from '../../src/lib/tokens/colors';

import { mountPage } from './components/mount';

const section = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--haze-space-3);
`;

const row = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-3);
  flex-wrap: wrap;
`;

const meterWidth = css`
  width: 280px;
`;

const accordionWidth = css`
  width: 360px;
`;

/* Dark theme island — same skin as the darkfields section in
   snapshots-main.tsx: re-declares every token on the wrapper and paints
   its own background, so the nested Accordion renders as it would
   inside a dark app. */
const darkPanel = css`
  background: var(--haze-color-bg);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  padding: var(--haze-space-4) var(--haze-space-5);
`;

/* Consumer slot class for the Accordion `classNames` demo — a primary
   wash on every summary header (tokens only). */
const summaryTint = css`
  background: var(--haze-color-primary-subtle);
`;

/* ─── NavigationMenu mega-panel scaffolding ─────────────────────── */

const columns = css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--haze-space-6);
`;

const columnTitle = css`
  margin: 0 0 var(--haze-space-2);
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const menuLink = css`
  display: block;
  padding: var(--haze-space-1) var(--haze-space-2);
  margin-inline-start: calc(var(--haze-space-2) * -1);
  border-radius: var(--haze-radius-sm);
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
  text-decoration: none;

  &:hover {
    color: var(--haze-color-primary);
    background: var(--haze-color-bg-subtle);
  }

  &:focus-visible {
    outline: 2px solid var(--haze-color-focus-ring);
    outline-offset: 1px;
  }
`;

const featured = css`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-2);
  padding: var(--haze-space-4);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-primary-subtle);
`;

const featuredTitle = css`
  margin: 0;
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-semibold);
`;

const featuredBody = css`
  margin: 0;
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
`;

/** One labeled column of entries — the link-list half of a mega panel.
 * Plain blocks (no anchors): the panel must never navigate anywhere. */
function LinkColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className={columnTitle}>{title}</h3>
      {links.map((link) => (
        <span key={link} className={menuLink}>
          {link}
        </span>
      ))}
    </div>
  );
}

/* Deterministic pseudo-activity over the first 120 days of 2026 — a
 * fixed wave pattern, no Math.random (stable fixture + snapshots). */
const HEATMAP_DATA = Array.from({ length: 120 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 0, 1 + index))
    .toISOString()
    .slice(0, 10);
  const weekend = [0, 6].includes(new Date(Date.UTC(2026, 0, 1 + index)).getUTCDay());
  const value = weekend ? (index * 3) % 3 : ((index * 7) % 13) % 5;
  return { date, value };
});

const ACCORDION_ITEMS = (
  <>
    <AccordionItem itemKey="one" title="Controlled open section">
      The open array is driven from above: this item stays open until
      the parent control says otherwise.
    </AccordionItem>
    <AccordionItem itemKey="two" title="Disabled section" disabled>
      Inert header — pointer and keyboard cannot open it.
    </AccordionItem>
    <AccordionItem itemKey="three" title="Closed section">
      Content reveals when this one joins the open array.
    </AccordionItem>
  </>
);

mountPage(
  <>
    <section data-snap="buttongroup" className={section}>
      <div className={row}>
        <ButtonGroup aria-label="View scope" size="sm" variant="outline">
          <Button>Day</Button>
          <Button>Week</Button>
          <Button>Month</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Filter state" variant="ghost">
          <Button>All</Button>
          <Button>Open</Button>
          <Button>Archived</Button>
        </ButtonGroup>
        <ButtonGroup aria-label="Save action" disabled>
          <Button>Save</Button>
          <Button square aria-label="More save options">
            ▾
          </Button>
        </ButtonGroup>
      </div>
      <ButtonGroup aria-label="Alignment" variant="outline">
        <Button>Left</Button>
        <ButtonGroupSeparator />
        <Button>Center</Button>
        <ButtonGroupSeparator />
        <Button>Right</Button>
      </ButtonGroup>
    </section>

    <section data-snap="inputgroup" className={section}>
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <Input value="example" aria-label="Domain" />
        <InputGroupAddon>.dev</InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>¥</InputGroupAddon>
        <Input value="1,280.00" aria-label="Amount" />
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>Scope</InputGroupAddon>
        <Select value="team" aria-label="Stats scope">
          <Option value="org">Whole org</Option>
          <Option value="team">Current team</Option>
        </Select>
      </InputGroup>
      <InputGroup size="sm">
        <InputGroupAddon>@</InputGroupAddon>
        <Input value="haze" aria-label="Handle (sm)" />
        <Button size="sm">Follow</Button>
      </InputGroup>
    </section>

    <section data-snap="meter" className={section}>
      <div className={meterWidth}>
        <Meter
          value={42}
          label="Bandwidth"
          showValue
          thresholds={[{ at: 60, tone: 'warning' }, { at: 85, tone: 'danger' }]}
        />
        <Meter
          value={72}
          label="Bandwidth"
          showValue
          thresholds={[{ at: 60, tone: 'warning' }, { at: 85, tone: 'danger' }]}
        />
        <Meter
          value={93}
          label="Bandwidth"
          showValue
          thresholds={[{ at: 60, tone: 'warning' }, { at: 85, tone: 'danger' }]}
        />
        <Meter value={230} min={0} max={512} label="Storage (GB)" showValue />
      </div>
      <div className={row}>
        <Meter value={62} size="sm" aria-label="Load (sm)" className={meterWidth} />
        <Meter value={62} aria-label="Load (md)" className={meterWidth} />
        <Meter value={62} size="lg" aria-label="Load (lg)" className={meterWidth} />
      </div>
    </section>

    <section data-snap="copybutton" className={section}>
      <div className={row}>
        <CopyButton value="pnpm add haze-ui" aria-label="Copy install command" />
        <CopyButton value="text" size="sm" aria-label="Copy (sm)" />
        <CopyButton value="text" size="lg" aria-label="Copy (lg)" />
        <CopyButton value="text" variant="outline" aria-label="Copy (outline)" />
        <CopyButton value="text" variant="solid" aria-label="Copy (solid)" />
        <CopyButton value="text" square={false} aria-label="Copy with label">
          {(copied) => (copied ? 'Copied!' : 'Copy me')}
        </CopyButton>
      </div>
    </section>

    <section data-snap="snippet" className={section}>
      <Snippet value="pnpm add haze-ui" />
      <Snippet value="https://haze-ui.dev/docs/getting-started" />
      <Snippet value="sk-live-9f2b7c4e-8a1d-4e6f-b3c2-1a9d8e7f6c5b">
        <span aria-hidden="true">sk-live-••••••••6c5b</span>
      </Snippet>
    </section>

    <section data-snap="heatmap" className={section}>
      <Heatmap
        data={HEATMAP_DATA}
        summary="Activity over the first 120 days of 2026"
      />
      <Heatmap
        data={{ '2026-02-02': 3, '2026-02-03': 1, '2026-02-06': 5 }}
        startDate="2026-02-01"
        endDate="2026-02-28"
        summary="February activity"
      />
    </section>

    <section data-snap="timegrid" className={section}>
      <TimeGrid
        aria-label="Meeting time"
        value="10:00"
        from="09:00"
        to="18:00"
        step={60}
      />
      <TimeGrid
        aria-label="Lunch slot"
        from="11:00"
        to="15:00"
        step={60}
        disabledValues={['12:00', '13:00']}
      />
    </section>

    <section data-snap="navigationmenu" className={section}>
      <NavigationMenu aria-label="Product" intentDelay={0}>
        <NavigationMenuList>
          <NavigationMenuItem value="docs">
            <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className={columns}>
                <LinkColumn
                  title="Getting started"
                  links={['Installation', 'Theming', 'Dark mode', 'Tokens']}
                />
                <LinkColumn
                  title="Guides"
                  links={['Controlled state', 'ClassNames slots', 'Styling', 'FAQ']}
                />
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="components">
            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className={columns}>
                <LinkColumn
                  title="Layout"
                  links={['Grid', 'Flex', 'Container', 'Masonry']}
                />
                <div className={featured}>
                  <h3 className={featuredTitle}>Workbench layout</h3>
                  <p className={featuredBody}>
                    The IDE-style application frame with resizable
                    regions — the newest layout family.
                  </p>
                  <span className={menuLink}>Open the Workbench docs →</span>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem value="changelog">
            <NavigationMenuTrigger>Changelog</NavigationMenuTrigger>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </section>

    <section data-snap="accordioncontrolled" className={section}>
      <div className={accordionWidth}>
        <Accordion
          open={['one']}
          exclusive
          classNames={{ summary: summaryTint }}
        >
          {ACCORDION_ITEMS}
        </Accordion>
      </div>
    </section>

    <div className={`${darkPanel} ${darkTheme}`}>
      <section data-snap="accordiondark" className={section}>
        <div className={accordionWidth}>
          <Accordion
            open={['one']}
            exclusive
            classNames={{ summary: summaryTint }}
          >
            {ACCORDION_ITEMS}
          </Accordion>
        </div>
      </section>
    </div>
  </>
);
