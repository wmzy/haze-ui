import { useRef } from 'react';
import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { Anchor } from '@/lib';

import PropsTable from '../PropsTable';
import A11yNote from '../A11yNote';

import { intro, section } from '../styles';

const ITEMS = [
  { id: 'anchor-basics', label: 'Basics' },
  {
    id: 'anchor-scroll',
    label: 'Scroll spy',
    children: [
      { id: 'anchor-spy-engine', label: 'Engines' },
      { id: 'anchor-spy-indicator', label: 'Sliding indicator' },
    ],
  },
  { id: 'anchor-control', label: 'Controlled highlight' },
];

// ─── Anchor ─────────────────────────────────────────────────────
const layout = css`
  display: flex;
  gap: var(--haze-space-6);
  align-items: flex-start;
`;

const navColumn = css`
  flex: none;
  width: 160px;
`;

const scrollBox = css`
  flex: 1;
  min-width: 0;
  height: 260px;
  overflow-y: auto;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  padding: var(--haze-space-4);
`;

const docSection = css`
  margin-bottom: var(--haze-space-10);

  h3 {
    margin: 0 0 var(--haze-space-2);
    font-size: var(--haze-text-base);
  }
  p {
    margin: 0;
    font-size: var(--haze-text-sm);
    color: var(--haze-color-text-secondary);
  }
`;

const mirror = css`
  margin-top: var(--haze-space-3);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
  font-family: var(--haze-font-mono);
`;

export default function AnchorDemo() {
  // Controlled via a control object: clicks and scroll-spy inside <Anchor>
  // write straight back into this state (SidebarDemo pattern).
  const [activeId, , activeIdCtrl] = useControl(undefined, 'anchor-basics');
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <h1>Anchor</h1>
      <p className={intro}>
        Sticky anchor navigation with IntersectionObserver scroll-spy (the
        engine is the `useAnchorSpy` hook). Items accept nested `children` for
        a second level, `indicator` adds a sliding highlight line, and the
        active id is a controllable state: hand it a control and clicks,
        scrolling and external writes all flow through the same state.
      </p>

      <div className={section}>
        <h2>Scroll-spy in a custom container</h2>
        <div className={layout}>
          <div className={navColumn}>
            <Anchor
              items={ITEMS}
              activeId={activeIdCtrl}
              indicator
              offsetTop={16}
              getContainer={() => scrollRef.current ?? document.body}
            />
            <p className={mirror}>activeId: {activeId}</p>
          </div>
          <div className={scrollBox} ref={scrollRef}>
            <section className={docSection} id="anchor-basics">
              <h3>Basics</h3>
              <p>
                Links resolve their target by element id. Clicking scrolls the
                container so the section lands `offsetTop` px below its top —
                room for a sticky header.
              </p>
            </section>
            <section className={docSection} id="anchor-scroll">
              <h3>Scroll spy</h3>
              <p>
                An IntersectionObserver tracks which sections intersect the
                viewport band; the topmost visible one gets the highlight and
                `aria-current`. Scroll this box to watch it move. The engine
                ships as the `useAnchorSpy` hook (`haze-ui/hooks`).
              </p>
              <section className={docSection} id="anchor-spy-engine">
                <h3>Engines</h3>
                <p>
                  Engines without IntersectionObserver fall back to a scroll
                  listener that activates the last section crossing the
                  `bounds` trigger line.
                </p>
              </section>
              <section className={docSection} id="anchor-spy-indicator">
                <h3>Sliding indicator</h3>
                <p>
                  `indicator` adds the sliding line next to the active item —
                  one measured bar animated with a transform transition,
                  disabled under prefers-reduced-motion. Nested `children`
                  render as an indented sub-list, exactly like these two
                  sections.
                </p>
              </section>
            </section>
            <section className={docSection} id="anchor-control">
              <h3>Controlled highlight</h3>
              <p>
                `activeId` accepts a control or a plain initial value — the
                mirror on the left is the same state the nav drives.
              </p>
            </section>
          </div>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='AnchorProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders a native <strong>nav</strong> landmark with a list of
              links
            </li>
            <li>
              The active link carries <strong>aria-current=&quot;true&quot;</strong>
            </li>
            <li>
              Real anchors — middle-click / copy-link still work, clicks just
              take over the scroll
            </li>
            <li>
              Nested <strong>children</strong> render as a real nested list —
              native semantics, no extra aria
            </li>
            <li>
              The sliding indicator line is decorative
              (<strong>aria-hidden</strong>) and its transition turns off
              under prefers-reduced-motion
            </li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}
