import { any, enum_, type InferOutput, nullish, object, pipe, record, regex, string, url } from 'valibot';

export enum Theme {
  Dark = 'dark',
  Light = 'light',
  System = 'system',
}

export const ChatGPTConfigSchema = object({
  theme: object({
    theme: enum_(Theme),
    color: pipe(string(), regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, 'Invalid color format')),
  }),
  httpProxy: nullish(pipe(string(), url())),
  temporaryHotkey: nullish(string()),
  adapterSettings: record(string(), any()),
});

export type Config = InferOutput<typeof ChatGPTConfigSchema>;
