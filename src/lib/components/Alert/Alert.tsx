import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import { useStrings } from '../LocaleProvider';

import { base, variants, contentStyle, closeBtn } from './alert-styles';

type AlertProps = {
  visible?: ControlOrValue<boolean>;
  onClose?: () => void;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  closable?: boolean;
  className?: string;
  children: ReactNode;
};

export default function Alert({
  visible: visibleControl,
  onClose,
  variant = 'info',
  closable = false,
  className,
  children,
}: AlertProps) {
  const [visible, setVisible] = useControl(visibleControl, true);
  const strings = useStrings('alert');

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div role='alert' data-slot='alert' x-class={[base, variants[variant], className]}>
      <div data-slot='content' className={contentStyle}>{children}</div>
      {closable && (
        <button
          type='button'
          data-slot='close'
          className={closeBtn}
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
