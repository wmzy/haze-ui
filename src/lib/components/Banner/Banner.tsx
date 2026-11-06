import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { StatusColor } from '../../utils/status-skin';

import { dismissBtn, statusLiveRoles } from '../../utils/status-skin';
import { calloutContent, calloutSurface } from '../../utils/callout-skin';

import CalloutShell from '../../utils/callout-shell';

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
  const strings = useStrings('banner');

  return (
    <CalloutShell
      visible={visibleControl}
      onClose={onClose}
      dismissible={onClose !== undefined}
      role={statusLiveRoles[color]}
      slotName='banner'
      surfaceClassName={[calloutSurface, banner, colors[color], className]}
      contentClassName={calloutContent}
      closeClassName={[dismissBtn, closeBtnSize]}
      closeLabel={strings.close}
      ref={ref}
    >
      {children}
    </CalloutShell>
  );
}

export type { BannerProps };
