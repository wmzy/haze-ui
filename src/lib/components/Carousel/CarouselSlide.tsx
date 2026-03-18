import type {ReactNode} from 'react';

import {css} from '@linaria/core';

type CarouselSlideProps = {
  className?: string;
  children: ReactNode;
};

const slide = css`
  flex: 0 0 100%;
  scroll-snap-align: start;
  min-width: 0;
`;

export default function CarouselSlide({className, children}: CarouselSlideProps) {
  return <div x-class={[slide, className]} role='group' aria-roledescription='slide'>{children}</div>;
}

export type {CarouselSlideProps};
