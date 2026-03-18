import {css} from '@linaria/core';
import {
  createMemoryCacheProvider,
  useCache,
  useError,
  useInjectable,
  useLoading,
  useResult,
  useRun,
} from 'react-toolroom/async';

import {useMock} from '@/components/DevTool';
import {Flex, Tag, Skeleton} from '@/lib';
import * as articleService from '@/services/article';
import {tagListSchema} from '@/types/index.schema';

const cache = createMemoryCacheProvider<string[], string[]>({
  cacheTime: 10000,
  hash: (k: string[]) => JSON.stringify(k),
});

const stale = css`
  opacity: 0.5;
`;

export default function Tags() {
  const fetchTags = useInjectable(articleService.fetchTags);
  useMock(fetchTags, tagListSchema, 'tagList', cache);
  const isStale = useCache(fetchTags, cache, 2000);
  const tags = useResult(fetchTags, []);
  const loading = useLoading(fetchTags);
  const error = useError(fetchTags);

  useRun(fetchTags, []);

  if (loading) {
    return (
      <aside>
        <Skeleton />
      </aside>
    );
  }

  if (error) return <aside>error</aside>;

  return (
    <aside x-class={isStale && stale}>
      <h1>Popular Tags</h1>
      <Flex gap="var(--pbl-space-2)" wrap>
        {tags.map((t) => (
          <Tag key={t} size="sm">{t}</Tag>
        ))}
      </Flex>
    </aside>
  );
}
