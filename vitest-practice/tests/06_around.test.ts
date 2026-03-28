// 06_around.test.ts — aroundEach / aroundAll の検証

import {
    describe,
    it,
    expect,
    beforeEach,
    afterEach,
    aroundEach,
    aroundAll,
} from "vitest";

// ---- シミュレーション用のFakeDB ----
interface Transaction {
    insert(row: { name: string }): void;
    commit(): void;
    rollback(): void;
}

interface FakeDB {
    beginTransaction(): Transaction;
    committed: { name: string }[];
    log: string[];
}

function createFakeDB(): FakeDB {
    const committed: { name: string }[] = [];
    const log: string[] = [];

    return {
        beginTransaction() {
            const rows: { name: string }[] = [];
            log.push("BEGIN");
            return {
                insert(row) {
                    rows.push(row);
                    log.push(`INSERT ${JSON.stringify(row)}`);
                },
                commit() {
                    committed.push(...rows);
                    log.push("COMMIT");
                },
                rollback() {
                    log.push("ROLLBACK");
                },
            };
        },
        committed,
        log,
    };
}

// ============================================================
// パターン1: beforeEach / afterEach（従来の書き方）
// ============================================================
describe("【パターン1】beforeEach / afterEach でトランザクション管理", () => {
    const db = createFakeDB();
    let tx: Transaction; // beforeEach が呼ばれるまで未初期化のまま外側スコープに置かれる

    beforeEach(() => {
        tx = db.beginTransaction();
    });

    afterEach(() => {
        tx.rollback();
    });

    it("1件 INSERT してもコミットしないのでcommittedに残らない", () => {
        tx.insert({ name: "Alice" });
        expect(db.committed).toHaveLength(0);
    });

    it("複数件 INSERT してもロールバックされる", () => {
        tx.insert({ name: "Bob" });
        tx.insert({ name: "Charlie" });
        expect(db.committed).toHaveLength(0);
    });

    it("ログの中にBEGINとROLLBACKが含まれる", () => {
        expect(
            db.log.filter((l) => l === "BEGIN").length,
        ).toBeGreaterThanOrEqual(2);
        expect(
            db.log.filter((l) => l === "ROLLBACK").length,
        ).toBeGreaterThanOrEqual(2);
    });
});

// ============================================================
// パターン2: aroundEach（新しい書き方）
// ============================================================
describe("【パターン2】aroundEach でトランザクション管理", () => {
    const db = createFakeDB();

    aroundEach(async (runTest) => {
        const tx: Transaction = db.beginTransaction(); // const で確定、! 不要
        await runTest();
        tx.rollback(); // ! 不要
    });

    it("1件 INSERT してもロールバックされる", () => {
        expect(db.committed).toHaveLength(0);
    });

    it("2件目のテストでも同様にロールバックされる", () => {
        expect(db.committed).toHaveLength(0);
    });

    it("ログにBEGIN→ROLLBACKのペアが記録されている", () => {
        const begins = db.log.filter((l) => l === "BEGIN").length;
        const rollbacks = db.log.filter((l) => l === "ROLLBACK").length;
        expect(rollbacks).toBe(begins - 1);
    });
});

// ============================================================
// パターン3: aroundEach の実行順序を可視化
// ============================================================
describe("【パターン3】aroundEach の実行順序ログ", () => {
    const log: string[] = [];

    aroundEach(async (runTest) => {
        log.push("aroundEach: before");
        await runTest();
        log.push("aroundEach: after");
    });

    beforeEach(() => {
        log.push("beforeEach");
    });

    afterEach(() => {
        log.push("afterEach");
    });

    it("テスト1: ログに順番が記録される", () => {
        log.push("test1 実行");
    });

    it("テスト2: 2回目も同じ順序", () => {
        log.push("test2 実行");
    });

    it("全体の実行順序が正しい", () => {
        expect(log[0]).toBe("aroundEach: before");
        expect(log[1]).toBe("beforeEach");
        expect(log[2]).toBe("test1 実行");
        expect(log[3]).toBe("afterEach");
        expect(log[4]).toBe("aroundEach: after");
    });
});

// ============================================================
// パターン4: aroundAll でスイート全体を包む
// ============================================================
describe("【パターン4】aroundAll でスイート全体を包む", () => {
    const log: string[] = [];

    aroundAll(async (runSuite) => {
        log.push("aroundAll: start");
        await runSuite();
        log.push("aroundAll: end");
    });

    it("テスト1", () => {
        log.push("test1");
        expect(log[0]).toBe("aroundAll: start");
    });

    it("テスト2", () => {
        log.push("test2");
    });

    it("aroundAll が全テストを包んでいる", () => {
        log.push("test3");
        expect(log).not.toContain("aroundAll: end");
        expect(log[0]).toBe("aroundAll: start");
    });
});

describe("aroundEach の実行順序ログ", () => {
    const log: string[] = [];

    aroundEach(async (runTest) => {
        log.push("aroundEach: before");
        await runTest();
        log.push("aroundEach: after");
    });

    beforeEach(() => {
        log.push("beforeEach");
    });
    afterEach(() => {
        log.push("afterEach");
    });

    it("テスト1", () => {
        log.push("test1 実行");
    });

    it("全体の実行順序が正しい", () => {
        expect(log[0]).toBe("aroundEach: before");
        expect(log[1]).toBe("beforeEach");
        expect(log[2]).toBe("test1 実行");
        expect(log[3]).toBe("afterEach");
        expect(log[4]).toBe("aroundEach: after");
    });
});

// ============================================================
// パターン5: aroundAll と aroundEach の共存
// ============================================================
describe("aroundAll と aroundEach の共存", () => {
    const log: string[] = [];

    aroundAll(async (runSuite) => {
        log.push("aroundAll: start");
        await runSuite();
        log.push("aroundAll: end");
    });

    aroundEach(async (runTest) => {
        log.push("aroundEach: before");
        await runTest();
        log.push("aroundEach: after");
    });

    it("テスト1", () => {
        log.push("test1");
    });

    it("テスト2", () => {
        log.push("test2");
    });

    it("全体の実行順序を検証", () => {
        log.push("test3");
        expect(log[0]).toBe("aroundAll: start");
        expect(log[1]).toBe("aroundEach: before");
        expect(log[2]).toBe("test1");
        expect(log[3]).toBe("aroundEach: after");
        expect(log[4]).toBe("aroundEach: before");
        expect(log[5]).toBe("test2");
        expect(log[6]).toBe("aroundEach: after");
        expect(log[7]).toBe("aroundEach: before");
        // aroundAll: end はまだ記録されていない
        expect(log).not.toContain("aroundAll: end");
    });
});
