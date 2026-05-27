import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useState } from 'react';
import { useControl } from 'react-use-control';

type RatingProps = {
  value?: Control<number> | number;
  count?: number;
  allowHalf?: boolean;
  onChange?: (value: number) => void;
  className?: string;
};

const container = css`
  display: inline-flex;
  gap: var(--haze-space-1);
  font-family: var(--haze-font-sans);
`;

const star = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: var(--haze-color-border);
  transition: color 0.15s, transform 0.15s;
  position: relative;

  &:hover {
    transform: scale(1.1);
  }
`;

const starActive = css`
  color: var(--haze-color-warning);
`;

const starHalf = css`
  color: var(--haze-color-warning);
`;

export default function Rating({
  value: valueControl,
  count = 5,
  allowHalf = false,
  onChange,
  className,
}: RatingProps) {
  const [value, setValue] = useControl(valueControl as Control<number>, 0);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleClick = (index: number) => {
    const newValue = index + 1;
    setValue(newValue);
    onChange?.(newValue);
  };

  const displayValue = hoverValue ?? value;

  return (
    <div x-class={[container, className]} role="radiogroup">
      {Array.from({ length: count }, (_, i) => {
        const filled = displayValue >= i + 1;
        const halfFilled = allowHalf && displayValue >= i + 0.5 && displayValue < i + 1;

        return (
          <span
            key={i}
            x-class={[star, (filled || halfFilled) && starActive]}
            role="radio"
            aria-checked={value >= i + 1 ? 'true' : 'false'}
            aria-label={`${i + 1} star${i > 0 ? 's' : ''}`}
            onClick={() => handleClick(i)}
            onMouseEnter={() => setHoverValue(i + 1)}
            onMouseLeave={() => setHoverValue(null)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={filled ? 'currentColor' : halfFilled ? 'url(#half)' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              {halfFilled && (
                <defs>
                  <linearGradient id="half">
                    <stop offset="50%" stopColor="currentColor" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
        );
      })}
    </div>
  );
}

export type { RatingProps };
