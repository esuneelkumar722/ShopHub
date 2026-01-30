import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/tests/setupTests.ts',
    include: ['src/tests/**/*.test.{ts,tsx}']
  }
})
