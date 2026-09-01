import type { ComponentPropsWithoutRef } from 'react';

import { base, sizes, squareSizes, variants } from './styles';

type ButtonProps = {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  square?: boolean;
} & Omit<ComponentPropsWithoutRef<'button'>, 'type'>;

export default function Button({
  variant = 'solid',
  size = 'md',
  square = false,
  className,
  ...rest
}: ButtonProps) {
  const sizeClass = square ? squareSizes[size] : sizes[size];
  return (
    <button
      type='button'
      x-class={[base, variants[variant], sizeClass, className]}
      {...rest}
    />
  );
}

export type { ButtonProps };
