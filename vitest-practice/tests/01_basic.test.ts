// 01_basic.test.ts — 基本的なアサーション
import { describe, it, expect } from 'vitest'
import { add, subtract, multiply, divide } from '../src/calculator'

describe('基本的なアサーション', () => {
  it('2 + 3 = 5', () => {
    expect(add(2, 3)).toBe(5)
  })

  it('10 - 4 = 6', () => {
    expect(subtract(10, 4)).toBe(6)
  })

  it('3 * 4 = 12', () => {
    expect(multiply(3, 4)).toBe(12)
  })

  it('10 / 2 = 5', () => {
    expect(divide(10, 2)).toBe(5)
  })

  it('ゼロ除算はエラーをスロー', () => {
    expect(() => divide(1, 0)).toThrow('Division by zero')
  })
})

describe('マッチャーの種類', () => {
  it('toBe — 厳密等価', () => {
    expect(1 + 1).toBe(2)
  })

  it('toEqual — 深い等価（オブジェクト）', () => {
    expect({ a: 1, b: 2 }).toEqual({ a: 1, b: 2 })
  })

  it('toContain — 配列・文字列に含まれるか', () => {
    expect([1, 2, 3]).toContain(2)
    expect('hello world').toContain('world')
  })

  it('toBeGreaterThan / toBeLessThan', () => {
    expect(5).toBeGreaterThan(3)
    expect(2).toBeLessThan(10)
  })

  it('toBeTruthy / toBeFalsy', () => {
    expect('text').toBeTruthy()
    expect('').toBeFalsy()
  })

  it('toBeNull / toBeUndefined', () => {
    expect(null).toBeNull()
    expect(undefined).toBeUndefined()
  })
})
