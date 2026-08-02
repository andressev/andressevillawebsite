// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://andressev.github.io',
  base: '/andressevillawebsite/',
  vite: {
    plugins: [tailwindcss()]
  }
});