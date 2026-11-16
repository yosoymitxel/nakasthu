import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    silent: true, // los logs del motor tapaban el resultado
    reporters: process.env.CI ? ['default'] : ['dot'],
    alias: {
      'https://unpkg.com/htm@3.1.1?module': path.resolve(__dirname, './__tests__/mocks/html.js'),
      '../ui/utils/html.js': path.resolve(__dirname, './__tests__/mocks/html.js'),
    },
  },
});
