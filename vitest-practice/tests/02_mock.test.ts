// 02_mock.test.ts — モック・スパイ・スタブ
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchData } from '../src/calculator'

describe('vi.fn() — 関数モック', () => {
  it('モック関数の呼び出し確認', () => {
    const mockFn = vi.fn()
    mockFn('hello')
    expect(mockFn).toHaveBeenCalledOnce()
    expect(mockFn).toHaveBeenCalledWith('hello')
  })

  it('戻り値を設定する', () => {
    const mockFn = vi.fn().mockReturnValue(42)
    expect(mockFn()).toBe(42)
  })

  it('呼び出し回数のカウント', () => {
    const mockFn = vi.fn()
    mockFn()
    mockFn()
    mockFn()
    expect(mockFn).toHaveBeenCalledTimes(3)
  })
})

describe('vi.spyOn() — スパイ', () => {
  it('既存メソッドをスパイ', () => {
    const obj = {
      greet(name: string) {
        return `Hello, ${name}!`
      },
    }
    const spy = vi.spyOn(obj, 'greet')
    obj.greet('Vitest')
    expect(spy).toHaveBeenCalledWith('Vitest')
  })

  it('スパイで戻り値を上書き', () => {
    const obj = { getValue: () => 1 }
    vi.spyOn(obj, 'getValue').mockReturnValue(999)
    expect(obj.getValue()).toBe(999)
  })
})

describe('fetch のモック', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetch 成功をモック', async () => {
    const mockData = { id: 1, name: 'Test' }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    })

    const result = await fetchData('https://example.com/api')
    expect(result).toEqual(mockData)
    expect(fetch).toHaveBeenCalledWith('https://example.com/api')
  })

  it('fetch 失敗をモック', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    })

    await expect(fetchData('https://example.com/api')).rejects.toThrow('HTTP error: 404')
  })
})
