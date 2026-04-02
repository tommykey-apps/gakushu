import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    include: ['app/**/*.test.ts'],
    environment: 'happy-dom',
  },
})
