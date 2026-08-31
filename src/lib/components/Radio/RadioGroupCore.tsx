import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import { useId } from 'react';

import { RadioProvider } from './RadioContext';

type RadioGroupCoreProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  className?: string;
  children: ReactNode;
};

const base = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-2);
  border: none;
  padding: 0;
  margin: 0;
`;

export default function RadioGroupCore({
  value,
  onChange,
  name,
  className,
  children,
}: RadioGroupCoreProps) {
  const autoName = useId();

  return (
    <fieldset x-class={[base, className]}>
      <RadioProvider value={{ name: name ?? autoName, value, setValue: onChange }}>
        {children}
      </RadioProvider>
    </fieldset>
  );
}

export type { RadioGroupCoreProps };
