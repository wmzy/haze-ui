import {css} from '@linaria/core';
import {refresh} from '@native-router/core';
import {Link, useRouter} from '@native-router/react';

import {Alert, Button, Flex} from '@/lib';

type Props = {
  error: Error;
};

const wrapper = css`
  padding: var(--pbl-space-8);
  max-width: 640px;
`;

const pre = css`
  font-family: var(--pbl-font-mono);
  font-size: var(--pbl-text-xs);
  background: var(--pbl-color-bg-muted);
  padding: var(--pbl-space-4);
  border-radius: var(--pbl-radius-md);
  overflow-x: auto;
  margin: var(--pbl-space-4) 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

const linkReset = css`
  text-decoration: none;
`;

export default function RouterError({error}: Props) {
  const router = useRouter();
  return (
    <section className={wrapper}>
      <Alert variant="danger">Something went wrong</Alert>
      <pre className={pre}>{error.stack}</pre>
      <Flex gap="var(--pbl-space-3)">
        <Button variant="outline" onClick={() => refresh(router)}>
          Refresh
        </Button>
        <Link className={linkReset} to='/'>
          <Button variant="ghost">Go Home</Button>
        </Link>
      </Flex>
    </section>
  );
}
