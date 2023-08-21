export enum Status {
  Normal = 'normal',
  Hidden = 'hidden',
  Loading = 'loading',
  Error = 'error',
}

export enum Mode {
  Contextual = 'contextual',
  Single = 'single',
  AssistantOnly = 'assistant-only',
}

export enum Role {
  system = 'system',
  user = 'user',
  assistant = 'assistant',
}

export enum Model {
  Gpt35_0613 = 'gpt-3.5-turbo-0613',
  Gpt35 = 'gpt-3.5-turbo',
  Gpt35_0301 = 'gpt-3.5-turbo-0301',
  Gpt35_16k = 'gpt-3.5-turbo-16k',
  Gpt35_16k0613 = 'gpt-3.5-turbo-16k-0613',
}
