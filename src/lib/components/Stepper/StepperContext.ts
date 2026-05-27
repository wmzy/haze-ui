import type {Dispatch, SetStateAction} from 'react';

import {createContext, useContext} from 'react';

type StepperContextValue = {
  activeStep: number;
  setActiveStep: Dispatch<SetStateAction<number>>;
  totalSteps: number;
};

const StepperContext = createContext<StepperContextValue | undefined>(undefined);

export const StepperProvider = StepperContext.Provider;

export function useStepperContext() {
  const ctx = useContext(StepperContext);
  if (!ctx) throw new Error('Step must be used within <Stepper>');
  return ctx;
}
