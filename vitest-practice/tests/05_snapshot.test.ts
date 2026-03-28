// 05_snapshot.test.ts — スナップショットテスト
import { describe, it, expect } from 'vitest'

interface User {
  name: string
  age: number
  email: string
}

interface ConfigOverrides {
  host?: string
  port?: number
  debug?: boolean
  timeout?: number
}

function renderUser(user: User): string {
  return `<div class="user">
  <h2>${user.name}</h2>
  <p>Age: ${user.age}</p>
  <p>Email: ${user.email}</p>
</div>`
}

function buildConfig(overrides: ConfigOverrides = {}) {
  return {
    host: 'localhost',
    port: 3000,
    debug: false,
    timeout: 5000,
    ...overrides,
  }
}

describe('スナップショットテスト', () => {
  it('HTML 文字列のスナップショット', () => {
    const html = renderUser({ name: 'Alice', age: 30, email: 'alice@example.com' })
    expect(html).toMatchSnapshot()
  })

  it('オブジェクトのスナップショット', () => {
    const config = buildConfig({ port: 8080, debug: true })
    expect(config).toMatchSnapshot()
  })

  it('インラインスナップショット', () => {
    expect(buildConfig()).toMatchInlineSnapshot(`
      {
        "debug": false,
        "host": "localhost",
        "port": 3000,
        "timeout": 5000,
      }
    `)
  })
})
