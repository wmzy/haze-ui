import type { ReactElement, ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { Children, cloneElement } from 'react';
import { useControl } from 'react-use-control';

import { walkChildren } from '../../utils/walk-children';

import { StepperProvider } from './StepperContext';

type StepperProps = {
  activeStep?: ControlOrValue<number>;
  children: ReactNode;
  className?: string;
};

const stepper = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--haze-space-2);
  align-items: flex-start;
  font-family: var(--haze-font-sans);
`;

export default function Stepper({
  activeStep: activeStepControl,
  children,
  className,
}: StepperProps) {
  const [activeStep, setActiveStep] = useControl(activeStepControl, 0);
  const totalSteps = Children.count(children);

  return (
    <StepperProvider value={{ activeStep, setActiveStep, totalSteps }}>
      <div data-slot='stepper' x-class={[stepper, className]} role="list">
        {/* Walk via utils/walk-children: no Fragment flattening — a
            wrapped step keeps the shipped behavior of receiving no
            injected index. */}
        {walkChildren(children, (child, index) =>
          cloneElement(child as ReactElement<{ index?: number }>, { index })
        )}
      </div>
    </StepperProvider>
  );
}

export type { StepperProps };
