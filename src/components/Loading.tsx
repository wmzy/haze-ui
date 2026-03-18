import { css } from '@linaria/core';
import {
  type CSSProperties,
  type ReactPortal,
  useMemo,
  useEffect,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { cancel } from '@native-router/core';
import { useLoading, useRouter } from '@native-router/react';

const bar = css`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 1000;
  background: var(--haze-color-bg-muted);
  display: flex;
  align-items: stretch;
  overflow: hidden;
  width: 100vw;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover {
    height: 6px;
  }
`;

const fill = css`
  transition: width 0.4s ease;
  background: var(--haze-color-primary);
  height: 100%;
  border-radius: 0 var(--haze-radius-sm) var(--haze-radius-sm) 0;
`;

export default function Loading(): ReactPortal | null {
  const router = useRouter();
  const [percent, setPercent] = useState<number>(0);
  const el = useMemo(() => document.createElement('div'), []);

  const loading = useLoading();
  const { key, status } = loading || {};

  useEffect(() => {
    setPercent(0);
  }, [key]);

  useEffect(() => {
    const remove = () => {
      if (el.parentElement) document.body.removeChild(el);
    };

    if (status === undefined) {
      remove();
    } else if (status === 'pending') {
      remove();
      document.body.appendChild(el);

      const timer = setInterval(() => {
        setPercent((p) => {
          if (p >= 80) return p;
          return p + 30;
        });
      }, 500);

      return () => clearInterval(timer);
    } else if (status === 'resolved') {
      setPercent(100);
      const timer = setTimeout(remove, 500);
      return () => {
        clearTimeout(timer);
        remove();
      };
    }
  }, [status]);

  return createPortal(
    <button
      data-testid='loading'
      type='button'
      title='Click to cancel!'
      onClick={() => cancel(router)}
      className={bar}
    >
      {percent ? (
        <div
          style={{ width: `${percent}%` } as CSSProperties}
          className={fill}
        />
      ) : null}
    </button>,
    el
  );
}
