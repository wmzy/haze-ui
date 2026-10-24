import type { ComponentPropsWithoutRef, MouseEvent } from 'react';

import { useState } from 'react';
import { css } from '@linaria/core';

import { Button, Flex } from '@/lib';
import { page } from '@/views/ComponentDetail/styles';
import { GuideDocView, useGuideDoc } from '@/views/Guides/guide-content';

/*
 * Composition guide: the five escape hatches. Prose, the hatch map,
 * the Core/headless/token inventories and code samples live in
 * guide-content.tsx; this shell owns the live `as` playground — the
 * wiring-proof demo for the polymorphism section.
 */

const demoStage = css`
  border: 1px dashed var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-4);
  margin: var(--haze-space-4) 0 var(--haze-space-2);
`;

const demoStatus = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
  background: var(--haze-color-bg-muted);
  border-radius: var(--haze-radius-sm);
  padding: var(--haze-space-2) var(--haze-space-3);
  margin: var(--haze-space-2) 0 var(--haze-space-4);
`;

/** The "any component" arm: forwards props (+ would forward a ref) to
 * a DOM element — the only contract `as` demands of a custom target. */
function StubLink({ children, ...rest }: ComponentPropsWithoutRef<'a'>) {
  return (
    <a href='https://example.com' {...rest}>
      {children}
    </a>
  );
}

/**
 * One Button call site, three renderings. Clicking reports the element
 * that actually rendered — straight from the event target — proving the
 * wiring (data-slot, gated type, anchor semantics) follows the element.
 */
function AsPlaygroundDemo({ idleStatus }: { idleStatus: string }) {
  const [status, setStatus] = useState(idleStatus);

  const describe = (e: MouseEvent<HTMLElement>) => {
    // A demo, not a link target: keep the guide page mounted.
    e.preventDefault();
    const el = e.currentTarget;
    const type = el.getAttribute('type');
    setStatus(
      `<${el.tagName.toLowerCase()}> · data-slot="${el.dataset.slot ?? ''}"${
        type ? ` · type="${type}"` : ''
      }`
    );
  };

  return (
    <div className={demoStage}>
      <Flex gap='var(--haze-space-2)' wrap align='center'>
        <Button size='sm' variant='outline' onClick={describe}>
          native button
        </Button>
        <Button
          as='a'
          href='https://example.com'
          size='sm'
          variant='outline'
          onClick={describe}
        >
          as='a'
        </Button>
        <Button as={StubLink} size='sm' variant='outline' onClick={describe}>
          as=&#123;Link&#125;
        </Button>
      </Flex>
      <p className={demoStatus} aria-live='polite'>
        {status}
      </p>
    </div>
  );
}

export default function CompositionGuide() {
  const doc = useGuideDoc('composition');
  const { playgroundIdle = 'Click any of the three.' } = doc.ui ?? {};

  return (
    <div className={page}>
      <h1>{doc.title}</h1>
      <GuideDocView
        doc={doc}
        slots={{
          'as-playground': <AsPlaygroundDemo idleStatus={playgroundIdle} />,
        }}
      />
    </div>
  );
}
