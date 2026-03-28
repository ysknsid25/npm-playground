// 03_async.test.ts — 非同期テスト
import { describe, it, expect, vi } from 'vitest'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function asyncAdd(a: number, b: number): Promise<number> {
  await delay(10)
  return a + b
}

function eventuallyFails(): Promise<never> {
  return Promise.reject(new Error('Something went wrong'))
}

describe('async / await テスト', () => {
  it('async 関数の戻り値を検証', async () => {
    const result = await asyncAdd(3, 7)
    expect(result).toBe(10)
  })

  it('Promise の reject を検証', async () => {
    await expect(eventuallyFails()).rejects.toThrow('Something went wrong')
  })
})

describe('タイマーのモック', () => {
  it('vi.useFakeTimers でタイマーを即時進める', async () => {
    vi.useFakeTimers()

    let called = false
    setTimeout(() => {
      called = true
    }, 1000)

    expect(called).toBe(false)
    vi.advanceTimersByTime(1000)
    expect(called).toBe(true)

    vi.useRealTimers()
  })

  it('vi.runAllTimers で全タイマーを実行', () => {
    vi.useFakeTimers()

    const results: string[] = []
    setTimeout(() => results.push('A'), 100)
    setTimeout(() => results.push('B'), 200)
    setTimeout(() => results.push('C'), 300)

    vi.runAllTimers()
    expect(results).toEqual(['A', 'B', 'C'])

    vi.useRealTimers()
  })
})
