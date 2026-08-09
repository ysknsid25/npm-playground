import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // lint 検証用のダミー（it.only を含む）なのでテスト実行からは除外する
    exclude: ['**/node_modules/**', 'lint-fixtures/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})
