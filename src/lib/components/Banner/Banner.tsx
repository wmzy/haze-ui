import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import { useStrings } from '../LocaleProvider';

import { banner, variants, closeBtn, content } from './banner-styles';

type BannerProps = {
  visible?: ControlOrValue<boolean>;
  onClose?: () => void;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  children: ReactNode;
  className?: string;
};

export default function Banner({
  visible: visibleControl,
  onClose,
  variant = 'info',
  children,
  className,
}: BannerProps) {
  const [visible, setVisible] = useControl(visibleControl, true);
  const strings = useStrings('banner');

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div data-slot='banner' x-class={[banner, variants[variant], className]} role="alert">
      <div data-slot='content' x-class={[content]}>{children}</div>
      {onClose && (
        <button data-slot='close' x-class={[closeBtn]} type="button" onClick={handleClose} aria-label={strings.close}>
          x
        </button>
      )}
    </div>
  );
}

export type { BannerProps };
