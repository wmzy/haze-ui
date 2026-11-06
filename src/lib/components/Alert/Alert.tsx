import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { StatusColor } from '../../utils/status-skin';

import { dismissBtn, statusLiveRoles } from '../../utils/status-skin';
import { calloutContent, calloutSurface } from '../../utils/callout-skin';

import CalloutShell from '../../utils/callout-shell';

import { useStrings } from '../LocaleProvider';

import { base, colors, borders } from './alert-styles';

type AlertProps = {
  visible?: ControlOrValue<boolean>;
  onClose?: () => void;
  /** Semantic status color. */
  color?: StatusColor;
  closable?: boolean;
  className?: string;
  children: ReactNode;
  /** Forwarded to the root div (data-slot='alert'). */
  ref?: Ref<HTMLDivElement>;
};

export default function Alert({
  visible: visibleControl,
  onClose,
  color = 'info',
  closable = false,
  className,
  children,
  ref,
}: AlertProps) {
  const strings = useStrings('alert');

  return (
    <CalloutShell
      visible={visibleControl}
      onClose={onClose}
      dismissible={closable}
      role={statusLiveRoles[color]}
      slotName='alert'
      surfaceClassName={[calloutSurface, base, colors[color], borders[color], className]}
      contentClassName={calloutContent}
      closeClassName={[dismissBtn]}
      closeLabel={strings.close}
      ref={ref}
    >
      {children}
    </CalloutShell>
  );
}

export type { AlertProps };
