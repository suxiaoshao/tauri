import tailwindcss from '@tailwindcss/postcss';
import { resolve } from 'node:path';

// oxlint-disable-next-line no-anonymous-default-export
export default {
  plugins: [
    tailwindcss({
      base: resolve(__dirname, '../../..'),
    }),
  ],
};
