// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://hydrotechjs.pl',
  output: 'static',
  build: {
    format: 'file',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap({ filter: (page) => !/\/404(?:\.html)?\/?$/.test(page) })],
});
