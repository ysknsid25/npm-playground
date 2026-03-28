// 04_lifecycle.test.ts — ライフサイクルフック
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'

interface User {
  id: number
  name: string
}

describe('ライフサイクルフック', () => {
  let db: User[] = []
  let callLog: string[] = []

  beforeAll(() => {
    callLog.push('beforeAll')
    db = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]
  })

  afterAll(() => {
    callLog.push('afterAll')
    db = []
  })

  beforeEach(() => {
    callLog.push('beforeEach')
  })

  afterEach(() => {
    callLog.push('afterEach')
  })

  it('DB にデータがある', () => {
    expect(db).toHaveLength(2)
  })

  it('Alice が存在する', () => {
    expect(db.find((u) => u.name === 'Alice')).toBeTruthy()
  })

  it('callLog の順番を確認（このテスト実行時点）', () => {
    // beforeAll × 1, beforeEach × 3 (このテストまで)
    expect(callLog.filter((e) => e === 'beforeAll')).toHaveLength(1)
    expect(callLog.filter((e) => e === 'beforeEach')).toHaveLength(3)
  })
})
