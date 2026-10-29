import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { StatusColor } from '../../utils/status-skin';

import { useControl } from 'react-use-control';

import { dismissBtn, statusLiveRoles } from '../../utils/status-skin';
import { calloutContent, calloutSurface } from '../../utils/callout-skin';

import { useStrings } from '../LocaleProvider';

import { banner, colors, closeBtnSize } from './banner-styles';

type BannerProps = {
  visible?: ControlOrValue<boolean>;
  onClose?: () => void;
  /** Semantic status color. */
  color?: StatusColor;
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
    <div
      ref={ref}
      data-slot='banner'
      x-class={[calloutSurface, banner, colors[color], className]}
      role={statusLiveRoles[color]}
    >
      <div data-slot='content' x-class={[calloutContent]}>{children}</div>
      {onClose && (
        <button
          data-slot='close'
          x-class={[dismissBtn, closeBtnSize]}
          type="button"
          onClick={handleClose}
          aria-label={strings.close}
        >
          ×
        </button>
      )}
    </div>
  );
}

export type { BannerProps };
