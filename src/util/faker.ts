import type { JsonSchema } from 'json-schema-faker';

import * as R from 'ramda';
import { format } from 'date-fns';
import { generate, registerFormat } from 'json-schema-faker';
import { faker } from '@faker-js/faker';

registerFormat('date-string', () => format(faker.date.recent(), 'yyyy-MM-dd'));

export function schemaFaker<T = unknown>(schema: unknown): Promise<T> {
  console.log('faker:', schema);
  return generate(schema as JsonSchema) as Promise<T>;
}

export function fakerWhenNothing<
  F extends (...args: unknown[]) => Promise<unknown>,
>(fn: F, schema: unknown) {
  return R.pipe(
    fn,
    R.andThen(R.when(R.isEmpty, () => schemaFaker(schema))),
    R.otherwise(() => schemaFaker(schema))
  ) as F;
}
