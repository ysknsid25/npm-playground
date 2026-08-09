import vitest from '@vitest/eslint-plugin'
import tseslint from 'typescript-eslint'

/**
 * vitest/valid-title のオプション挙動を検証するための設定。
 * fixture ごとに異なるオプションを当てている。
 */
export default [
  {
    ignores: ['node_modules/**', 'coverage/**', 'html/**', 'tests/**', 'src/**'],
  },
  {
    // ドキュメント: "If true, the rule ignores the arguments of the describe, test, and it functions."
    files: ['lint-fixtures/allow-arguments.test.ts'],
    languageOptions: { parser: tseslint.parser },
    plugins: { vitest },
    rules: {
      'vitest/valid-title': ['error', { allowArguments: true }],
    },
  },
  {
    // 型情報あり + settings.vitest.typecheck: true（allowArguments は未指定）
    files: ['lint-fixtures/typecheck.test.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { vitest },
    settings: { vitest: { typecheck: true } },
    rules: {
      'vitest/valid-title': 'error',
    },
  },
  {
    files: ['lint-fixtures/disallowed-words.test.ts'],
    languageOptions: { parser: tseslint.parser },
    plugins: { vitest },
    rules: {
      'vitest/valid-title': ['error', { disallowedWords: ['skip', 'only'] }],
    },
  },
]
