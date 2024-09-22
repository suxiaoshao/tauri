import { array, enum_, InferOutput, nullish, object, pipe, regex, string, url } from 'valibot';

export enum Theme {
  Dark = 'dark',
  Light = 'light',
  System = 'system',
}

export const ChatGPTConfigSchema = object({
  apiKey: string(),
  theme: object({
    theme: enum_(Theme),
    color: pipe(string(), regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Invalid color format')),
  }),
  url: nullish(pipe(string(), url())),
  httpProxy: nullish(pipe(string(), url())),
  models: array(string()),
  temporaryHotkey: nullish(string()),
});

export type Config = InferOutput<typeof ChatGPTConfigSchema>;
