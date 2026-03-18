import type {Dispatch, SetStateAction} from 'react';

import {createContext, useContext} from 'react';

type RadioContextValue = {
  name: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
};

const RadioContext = createContext<RadioContextValue | undefined>(undefined);

export const RadioProvider = RadioContext.Provider;

export function useRadioContext() {
  return useContext(RadioContext);
}
