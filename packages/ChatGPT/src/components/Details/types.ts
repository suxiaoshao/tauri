import { type Key } from 'react';

export interface DetailsItem {
  key?: Key;
  label: string;
  value: React.ReactNode;
  span?: 1 | 2 | 3;
}
