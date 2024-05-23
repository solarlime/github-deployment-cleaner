/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteSvgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [viteSvgr(), react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/'],
      exclude: [
        'node_modules/',
        'src/setupTests.ts',
      ],
    },
  },
  base: '/github-deployment-cleaner/',
});
