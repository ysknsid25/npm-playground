/**
 * vitest/valid-title の `allowArguments: true` の挙動検証。
 *
 * ドキュメントの記述:
 *   "If true, the rule ignores the arguments of the describe, test, and it functions."
 *
 * 実装:
 *   if (!argument || (allowArguments && argument.type === AST_NODE_TYPES.Identifier)) return
 *   → 「単純な Identifier」のときだけスキップされる。
 */
import { describe, it, expect } from 'vitest'

const foo = 'identifier title'
const obj = { title: 'member title' }
const getTitle = () => 'call title'

// [1] Identifier → スキップされる（エラーなし）
describe(foo, () => {
  it(foo, () => {
    expect(1).toBe(1)
  })
})

// [2] CallExpression → ドキュメントの "ignores the arguments" に反してエラーになるはず
it(getTitle(), () => {
  expect(1).toBe(1)
})

// [3] MemberExpression → 同上
it(obj.title, () => {
  expect(1).toBe(1)
})

// [4] TemplateLiteral（式を含む）→ allowArguments とは無関係に、
//     `argument.type !== TemplateLiteral` の条件で元から報告対象外（エラーなし）
it(`prefix ${foo}`, () => {
  expect(1).toBe(1)
})
