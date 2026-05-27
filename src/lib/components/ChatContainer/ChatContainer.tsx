import type { ReactNode } from 'react';
import { useRef, useEffect } from 'react';
import { css } from '@linaria/core';

type ChatContainerProps = {
  children: ReactNode;
  autoScroll?: boolean;
  className?: string;
};

const container = css`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  font-family: var(--haze-font-sans);
  padding: var(--haze-space-4);
  gap: var(--haze-space-1);
`;

export default function ChatContainer({
  children,
  autoScroll = true,
  className,
}: ChatContainerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoScroll || !ref.current) return;
    const el = ref.current;
    const observer = new MutationObserver(() => {
      el.scrollTop = el.scrollHeight;
    });
    observer.observe(el, { childList: true, subtree: true });
    el.scrollTop = el.scrollHeight;
    return () => observer.disconnect();
  }, [autoScroll]);

  return (
    <div ref={ref} x-class={[container, className]}>
      {children}
    </div>
  );
}

export type { ChatContainerProps };
