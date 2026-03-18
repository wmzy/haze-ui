import type {ReactNode} from 'react';
import type {Control} from 'react-use-control';

import {css} from '@linaria/core';
import {useId} from 'react';
import {useControl} from 'react-use-control';

import {RadioProvider} from './RadioContext';

type RadioGroupProps = {
  value?: Control<string> | string;
  name?: string;
  className?: string;
  children: ReactNode;
};

const base = css`
  display: flex;
  flex-direction: column;
  gap: var(--pbl-space-2);
  border: none;
  padding: 0;
  margin: 0;
`;

export default function RadioGroup({
  value: valueControl,
  name,
  className,
  children,
}: RadioGroupProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');
  const autoName = useId();

  return (
    <fieldset x-class={[base, className]}>
      <RadioProvider value={{name: name ?? autoName, value, setValue}}>
        {children}
      </RadioProvider>
    </fieldset>
  );
}

export type {RadioGroupProps};
