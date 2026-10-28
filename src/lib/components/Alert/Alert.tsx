import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { StatusColor } from '../../utils/status-skin';

import { useControl } from 'react-use-control';

import { dismissBtn, statusLiveRoles } from '../../utils/status-skin';

import { useStrings } from '../LocaleProvider';

import { base, colors, borders, contentStyle } from './alert-styles';

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
  const [visible, setVisible] = useControl(visibleControl, true);
  const strings = useStrings('alert');

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div
      ref={ref}
      role={statusLiveRoles[color]}
      data-slot='alert'
      x-class={[base, colors[color], borders[color], className]}
    >
      <div data-slot='content' className={contentStyle}>{children}</div>
      {closable && (
        <button
          type='button'
          data-slot='close'
          x-class={[dismissBtn]}
          aria-label={strings.close}
          onClick={handleClose}
        >
          ×
        </button>
      )}
    </div>
  );
}

export type { AlertProps };
