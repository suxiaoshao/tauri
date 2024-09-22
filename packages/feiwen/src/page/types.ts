import { check, forward, InferInput, integer, minValue, number, object, pipe, string, url } from 'valibot';

export const fetchInputSchema = pipe(
  object({
    url: pipe(string(), url()),
    startPage: pipe(number(), integer(), minValue(1)),
    endPage: pipe(number(), integer(), minValue(1)),
    cookies: string(),
  }),
  forward(
    check((input) => input.startPage < input.endPage, 'endPage must be greater than or equal to startPage'),
    ['endPage'],
  ),
);

export type FetchParams = InferInput<typeof fetchInputSchema>;
