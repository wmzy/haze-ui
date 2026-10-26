/**
 * Mobile floating-overlay harness for e2e/mobile-overlays.spec.ts
 * (chromium-mobile project, Pixel 7 emulation): the four floating-panel
 * families — multiple Select, Combobox, Datepicker, DropdownMenu — each
 * mounted twice, once with the trigger in the lower band of the initial
 * viewport (`data-stage="lower"`, vh spacer above it) and once near the
 * bottom of a tall document (`data-stage="bottom"`, 140vh spacer above
 * and a tail block below, so the triggers sit in the lower band again
 * once the page is scrolled fully down). Both stages force the
 * no-room-below collision case a phone viewport creates constantly; the
 * spec asserts the cross-tier containment contract (panel fully inside
 * the viewport, trigger never covered by the panel) at load and after
 * scrolling to the document bottom.
 *
 * Every trigger carries a distinct accessible name prefixed with its
 * stage (Lower/Bottom), and the Datepicker value is pinned to
 * 2026-09-01 so the calendar panel is always September 2026.
 */
import { css } from '@linaria/core';

import { Combobox } from '../../../src/lib/components/Combobox';
import { Datepicker } from '../../../src/lib/components/Datepicker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../src/lib/components/DropdownMenu';
import { Option, Select } from '../../../src/lib/components/Select';

import { mountPage } from './mount';

const heading = css`
  margin: 0 0 var(--haze-space-2);
  font-size: var(--haze-text-base);
  font-weight: var(--haze-weight-semibold);
  color: var(--haze-color-text-secondary);
`;

const stage = css`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--haze-space-3);
`;

/* Puts the lower stage's triggers into the bottom band of the initial
 * viewport (vh units, so the geometry holds on any phone viewport the
 * project emulates regardless of its exact pixel height). */
const lowerSpacer = css`
  height: 64vh;
`;

/* Lifts the bottom stage past the first screenful; the tail block below
 * the stage keeps its triggers in the lower band once the page has been
 * scrolled to the very bottom. */
const tallSpacer = css`
  height: 140vh;
`;

const tail = css`
  height: 112px;
`;

const row = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--haze-space-3);
`;

/* Fixed field widths: shrink-to-fit triggers would size with the host
 * font's glyph advances and make the collision geometry host-dependent
 * (same rationale as the wave5 fixed-width sections). */
const fieldWidth = css`
  width: 220px;
`;

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
];

const ENGINES = [
  { value: 'v8', label: 'V8' },
  { value: 'spidermonkey', label: 'SpiderMonkey' },
  { value: 'javascriptcore', label: 'JavaScriptCore' },
  { value: 'graaljs', label: 'GraalJS' },
  { value: 'hermes', label: 'Hermes' },
  { value: 'quickjs', label: 'QuickJS' },
];

/** One stage's worth of the four floating families. `prefix` feeds the
 * accessible names ("Lower fruits" / "Bottom fruits", …) so the spec
 * can address each trigger unambiguously on the shared page. */
function OverlayStage({ prefix }: { prefix: 'Lower' | 'Bottom' }) {
  return (
    <section data-stage={prefix.toLowerCase()} className={stage}>
      <h2 className={heading}>{prefix} band</h2>
      <div className={row}>
        <div className={fieldWidth}>
          <Select multiple aria-label={`${prefix} fruits`}>
            {FRUITS.map((fruit) => (
              <Option key={fruit.value} value={fruit.value}>
                {fruit.label}
              </Option>
            ))}
          </Select>
        </div>
        <Combobox
          options={ENGINES}
          placeholder={`${prefix} engine`}
          className={fieldWidth}
        />
      </div>
      <div className={row}>
        <Datepicker value='2026-09-01' placeholder={`${prefix} date`} />
        <DropdownMenu>
          <DropdownMenuTrigger>{prefix} actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Open</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Move…</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Archive</DropdownMenuItem>
            <DropdownMenuItem disabled>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}

mountPage(
  <>
    <div className={lowerSpacer} />
    <OverlayStage prefix='Lower' />
    <div className={tallSpacer} />
    <OverlayStage prefix='Bottom' />
    <div className={tail} />
  </>
);
