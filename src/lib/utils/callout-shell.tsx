import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

type CalloutShellProps = {
  /** Controllable visibility; uncontrolled callouts start visible. */
  visible?: ControlOrValue<boolean>;
  /** Fires after the dismiss button hides the callout. */
  onClose?: () => void;
  /** Whether the dismiss button renders at all — each wrapper resolves
   * its own gating (Alert's `closable` prop, Banner's onClose presence)
   * before handing over. */
  dismissible: boolean;
  /** Live-region role for the root div, resolved by the wrapper through
   * statusLiveRoles (only danger interrupts). */
  role: 'status' | 'alert';
  /** data-slot of the root div — the wrapper's family name. */
  slotName: 'alert' | 'banner';
  /** Precomposed classes for the root div; every css import stays in the
   * wrapper so family attribution is untouched. */
  surfaceClassName: (string | undefined)[];
  /** Class for the content slot div. */
  contentClassName: string;
  /** Precomposed classes for the dismiss button. */
  closeClassName: (string | undefined)[];
  /** Accessible name of the dismiss button (the wrapper's locale
   * string). */
  closeLabel: string;
  children: ReactNode;
  /** Forwarded to the root div. */
  ref?: Ref<HTMLDivElement>;
};

/**
 * The shared skeleton of Alert and Banner — structural twins differing
 * only in skin classes, dismissal gating and locale section. Zero-css by
 * contract: the wrappers keep their direct status-skin/callout-skin
 * imports and pass every class in, so this module owns only the
 * useControl visibility seam, the dismiss wiring and the DOM shape
 * (surface + content slot + optional close button).
 */
export default function CalloutShell({
  visible: visibleControl,
  onClose,
  dismissible,
  role,
  slotName,
  surfaceClassName,
  contentClassName,
  closeClassName,
  closeLabel,
  children,
  ref,
}: CalloutShellProps) {
  const [visible, setVisible] = useControl(visibleControl, true);

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div
      ref={ref}
      role={role}
      data-slot={slotName}
      x-class={surfaceClassName}
    >
      <div data-slot='content' x-class={[contentClassName]}>{children}</div>
      {dismissible && (
        <button
          type='button'
          data-slot='close'
          x-class={closeClassName}
          aria-label={closeLabel}
          onClick={handleClose}
        >
          ×
        </button>
      )}
    </div>
  );
}
