import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import { useStrings } from '../LocaleProvider';

import { banner, colors, closeBtn, content } from './banner-styles';

type BannerProps = {
  visible?: ControlOrValue<boolean>;
  onClose?: () => void;
  /** Semantic status color. */
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
  className?: string;
  /** Forwarded to the root div (data-slot='banner'). */
  ref?: Ref<HTMLDivElement>;
};

export default function Banner({
  visible: visibleControl,
  onClose,
  color = 'info',
  children,
  className,
  ref,
}: BannerProps) {
  const [visible, setVisible] = useControl(visibleControl, true);
  const strings = useStrings('banner');

  if (!visible) return null;

  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  return (
    <div ref={ref} data-slot='banner' x-class={[banner, colors[color], className]} role="alert">
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
