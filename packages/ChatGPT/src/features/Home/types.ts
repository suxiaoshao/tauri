export enum Model {
  TextDavinci = 'text-davinci-003',
  Gpt35 = 'gpt-3.5-turbo-0613',
}

export interface ChatRequest {
  model: Model;
  stream: boolean;
  messages: Message[];
}

export interface Message {
  role: Role;
  content: string;
}
export enum Role {
  system = 'system',
  user = 'user',
  assistant = 'assistant',
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  choices: Choice[];
}

export interface Choice {
  index: number;
  delta: Delta;
  finish_reason: string | null;
}

export interface Delta {
  role: Role | null;
  content: string | null;
}
