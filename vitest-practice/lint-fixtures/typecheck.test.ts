/**
 * `settings.vitest.typecheck: true`（+ 型情報付きパース）のときの挙動検証。
 *
 * 実装は allowArguments とは別に、型情報が使える場合に
 *   - isClassOrFunctionType(type) → return
 *   - isStringLikeType(type)      → return
 * という分岐を持つ。allowArguments はここを使わない環境向けの簡易措置に見える。
 *
 * このファイルには allowArguments は一切指定していない（デフォルト false）。
 */
import { it, expect } from 'vitest'

const obj = { title: 'member title', count: 1 }
const getTitle = (): string => 'call title'
const getCount = (): number => 1

// [1] 型が string の CallExpression → 型情報があればエラーなしのはず
it(getTitle(), () => {
  expect(1).toBe(1)
})

// [2] 型が string の MemberExpression → 同上
it(obj.title, () => {
  expect(1).toBe(1)
})

// [3] 型が number → 型情報があってもエラーになるはず
it(getCount(), () => {
  expect(1).toBe(1)
})

// [4] 型が number の MemberExpression → 同上
it(obj.count, () => {
  expect(1).toBe(1)
})
