import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/demo.ts'],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 100,
        statements: 90,
      },
    },
  },
});
