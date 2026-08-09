/**
 * vitest/valid-title の `disallowedWords: ["skip", "only"]` の挙動検証。
 *
 * ドキュメントは it.skip('should be skipped') を "incorrect" 例として挙げているが、
 * 実装は new RegExp(`\\b(${disallowedWords.join('|')})\\b`, 'iu') を
 * 「タイトル文字列」にのみ適用しており、.skip / .only という修飾子は見ていない。
 * また \b の性質上 "skipped" は \bskip\b にマッチしない。
 */
import { describe, it, expect } from 'vitest'

describe('foo', () => {
  // [1] ドキュメントの "incorrect" 例。"skipped" は \bskip\b にマッチしないためエラーにならないはず
  it.skip('should be skipped', () => {
    expect(1).toBe(1)
  })

  // [2] .only 修飾子そのものは検査対象外なのでエラーにならないはず
  it.only('runs alone', () => {
    expect(1).toBe(1)
  })

  // [3] タイトル文字列に独立した単語として含まれる場合のみエラーになるはず
  it('should skip this case', () => {
    expect(1).toBe(1)
  })

  it('only this one matters', () => {
    expect(1).toBe(1)
  })

  // [4] 大文字小文字は 'i' フラグで無視されるためエラーになるはず
  it('SKIP for now', () => {
    expect(1).toBe(1)
  })

  // [5] 部分一致（単語境界なし）はエラーにならないはず
  it('skipping and onlyish', () => {
    expect(1).toBe(1)
  })
})
