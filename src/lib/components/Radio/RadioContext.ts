import {createContext, useContext} from 'react';

type RadioContextValue = {
  name: string;
  value: string;
  setValue: (value: string) => void;
};

const RadioContext = createContext<RadioContextValue | undefined>(undefined);

export const RadioProvider = RadioContext.Provider;

export function useRadioContext() {
  return useContext(RadioContext);
}
