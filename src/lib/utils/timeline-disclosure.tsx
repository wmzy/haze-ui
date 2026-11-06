import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useId } from 'react';
import { useControl } from 'react-use-control';

import { DisclosureChevron } from './disclosure-chevron';
import { useOpenWithChange } from './floating';
import { chevronPair, headerButton, panelBase } from './timeline-skin';

/**
 * The expandable-disclosure skeleton shared by the timeline row
 * families (Trace, StepTimeline): the controllable open state
 * (useControl + the onOpenChange seam), the per-instance panel id,
 * the aria-wired header button with its trailing chevron pair, and
 * the hidden panel wrapper.
 *
 * Zero css of its own: every chrome class (headerButton, chevronPair,
 * panelBase) rides utils/timeline-skin and the chevron glyph rides
 * utils/disclosure-chevron, whose css already lands in each consuming
 * family's css via split-css sharedLayers — so this module stays out
 * of the css/rsc-safe registries entirely. Row-level layout (the item
 * wrapper, status arms, stacked-vs-row display) stays with the family;
 * the marker (indicator) and the label/title block (body) are props,
 * rendered verbatim inside the button when the row is expandable and
 * as plain siblings when it is not.
 */
type TimelineDisclosureProps = {
  /** The status marker rendered at the row's inline start. */
  indicator: ReactNode;
  /** The label/title block — the header button's body when the row is expandable. */
  body: ReactNode;
  /** Whether a payload panel exists below the row (gates the panel render and the dead-button guard). */
  hasPanel: boolean;
  /** Whether the header is a disclosure toggle at all — StepTimeline's
   * collapsible flag. Defaults to true: Trace lines are expandable
   * exactly when they carry details. */
  collapsible?: boolean;
  /** Controlled/uncontrolled expanded state of the panel (default `false`). */
  open?: ControlOrValue<boolean>;
  /** Fires on every expand/collapse transition, whatever drove it. */
  onOpenChange?: (open: boolean) => void;
  /** Payload revealed below the row while expanded. */
  children?: ReactNode;
};

export function TimelineDisclosure({
  indicator,
  body,
  hasPanel,
  collapsible = true,
  open: openControl,
  onOpenChange,
  children,
}: TimelineDisclosureProps) {
  const [open, setOpen] = useControl(openControl, false);
  const handleSetOpen = useOpenWithChange(open, setOpen, onOpenChange);
  const panelId = useId();
  // A toggle with nothing to reveal would be a dead button — only a
  // row carrying payload behind a collapsible header becomes one.
  const expandable = collapsible && hasPanel;

  const toggleOpen = () => handleSetOpen(!open);

  return (
    <>
      {expandable ? (
        <button
          type='button'
          data-slot='header'
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggleOpen}
          x-class={[headerButton]}
        >
          {indicator}
          {body}
          <span
            data-slot='icon'
            aria-hidden='true'
            x-class={[chevronPair.closed, open && chevronPair.open]}
          >
            <DisclosureChevron size={12} />
          </span>
        </button>
      ) : (
        <>
          {indicator}
          {body}
        </>
      )}
      {hasPanel && (
        <div
          data-slot='panel'
          id={expandable ? panelId : undefined}
          hidden={expandable && !open}
          x-class={[panelBase]}
        >
          {children}
        </div>
      )}
    </>
  );
}
