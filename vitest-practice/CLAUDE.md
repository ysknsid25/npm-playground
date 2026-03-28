# Vitest Practice

Vitestの各機能を検証するための作業ディレクトリ。

## 構成

```
vitest-practice/
├── src/
│   └── calculator.js     # テスト対象のサンプル実装
├── tests/
│   ├── 01_basic.test.js     # 基本アサーション・マッチャー
│   ├── 02_mock.test.js      # vi.fn() / vi.spyOn() / fetch モック
│   ├── 03_async.test.js     # async/await・タイマーモック
│   ├── 04_lifecycle.test.js # beforeAll/afterAll/beforeEach/afterEach
│   └── 05_snapshot.test.js  # スナップショット・インラインスナップショット
├── vitest.config.js
└── package.json
```

## コマンド

| コマンド | 説明 |
|---|---|
| `npm test` | 一回だけ実行 |
| `npm run test:watch` | ウォッチモード |
| `npm run test:ui` | ブラウザ UI で確認 |
| `npm run test:coverage` | カバレッジ計測 |

## スナップショット更新

```bash
npx vitest run --update-snapshots
```
