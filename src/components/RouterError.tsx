import { css } from '@linaria/core';
import { refresh } from '@native-router/core';
import { Link, useRouter } from '@native-router/react';

import { Alert, Button, Flex } from '@/lib';

type Props = {
  error: Error;
};

const wrapper = css`
  padding: var(--haze-space-8);
  max-width: 640px;
`;

const pre = css`
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  background: var(--haze-color-bg-muted);
  padding: var(--haze-space-4);
  border-radius: var(--haze-radius-md);
  overflow-x: auto;
  margin: var(--haze-space-4) 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

const linkReset = css`
  text-decoration: none;
`;

export default function RouterError({ error }: Props) {
  const router = useRouter();
  return (
    <section className={wrapper}>
      <Alert variant='danger'>Something went wrong</Alert>
      <pre className={pre}>{error.stack}</pre>
      <Flex gap='var(--haze-space-3)'>
        <Button variant='outline' onClick={() => refresh(router)}>
          Refresh
        </Button>
        <Link className={linkReset} to='/'>
          <Button variant='ghost'>Go Home</Button>
        </Link>
      </Flex>
    </section>
  );
}
