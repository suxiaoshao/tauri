import { Role } from '@chatgpt/types/common';

export interface Message {
  role: Role;
  content: string;
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
