import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { readFileSync } from "node:fs";

const app = new Hono();

// --- レポートの蓄積 ---
const reportStore: { source: string; receivedAt: string; data: unknown }[] = [];

// Reporting-Endpoints からブラウザが自動送信するレポートの受信
app.post("/reports", async (c) => {
  const body = await c.req.json();
  const reports = Array.isArray(body) ? body : [body];
  for (const r of reports) {
    reportStore.push({ source: "Reporting-Endpoints", receivedAt: new Date().toISOString(), data: r });
  }
  console.log(`[Reporting-Endpoints] ${reports.length} report(s) received`);
  return c.json({ status: "ok" });
});

// ReportingObserver からクライアントが手動送信するレポートの受信
app.post("/reports/collect", async (c) => {
  const body = await c.req.json();
  const reports = Array.isArray(body) ? body : [body];
  for (const r of reports) {
    reportStore.push({ source: "ReportingObserver", receivedAt: new Date().toISOString(), data: r });
  }
  console.log(`[ReportingObserver] ${reports.length} report(s) received`);
  return c.json({ status: "ok" });
});

// 蓄積したレポートの一覧取得
app.get("/reports/list", (c) => c.json(reportStore));

// 蓄積したレポートのクリア
app.delete("/reports/list", (c) => {
  reportStore.length = 0;
  return c.json({ status: "cleared" });
});

// --- HTML 配信（Reporting-Endpoints ヘッダー付き） ---
app.get("/", (c) => {
  // Step 1: 送信先を定義
  c.header("Reporting-Endpoints", 'default="/reports"');
  // Step 2: CSP で report-to を指定（report-only にして挙動をブロックはしない）
  c.header(
    "Content-Security-Policy-Report-Only",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; report-uri /reports; report-to default"
  );

  return c.html(/* html */ `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporting API Demo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; color: #333; }
    h1 { margin-bottom: 8px; }
    h2 { margin-top: 32px; margin-bottom: 12px; border-bottom: 2px solid #eee; padding-bottom: 4px; }
    p { margin: 8px 0; line-height: 1.6; }
    .section { margin-bottom: 24px; }
    .buttons { display: flex; gap: 12px; flex-wrap: wrap; margin: 12px 0; }
    button {
      padding: 10px 18px; border: 1px solid #333; border-radius: 6px;
      background: #f5f5f5; cursor: pointer; font-size: 14px;
    }
    button:hover { background: #e0e0e0; }
    button.danger { background: #c00; color: #fff; border-color: #c00; }
    button.danger:hover { background: #a00; }
    .log { background: #f5f5f5; padding: 12px; border-radius: 6px; overflow: auto; font-size: 13px; font-family: monospace; white-space: pre-wrap; max-height: 400px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; color: #fff; font-weight: bold; font-size: 12px; margin-right: 8px; }
    .badge-observer { background: #0ea5e9; }
    .badge-endpoints { background: #8b5cf6; }
    .report-card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
    .info { background: #e0f2fe; border: 1px solid #7dd3fc; padding: 12px; border-radius: 6px; margin: 12px 0; }
    #observer-status { font-size: 14px; color: #666; }
  </style>
</head>
<body>
  <h1>Reporting API デモ</h1>
  <p id="observer-status"></p>

  <div class="info">
    <strong>このページの仕組み:</strong>
    サーバー（Hono）がこのHTMLを配信する際に <code>Reporting-Endpoints</code> と <code>Content-Security-Policy-Report-Only</code> ヘッダーを付与しています。
    同時に、JavaScript の <code>ReportingObserver</code> も動作しています。
    両方の経路でレポートがどう届くか比較できます。
  </div>

  <h2>CSP 違反をトリガーする</h2>
  <div class="buttons">
    <button id="btn-csp">インラインスクリプトを注入</button>
  </div>

  <h2>クライアント側ログ（ReportingObserver）</h2>
  <div id="observer-log" class="log">まだレポートはありません。上のボタンでトリガーしてください。</div>

  <h2>サーバー側ログ（両方のレポートを蓄積）</h2>
  <div class="buttons">
    <button id="btn-fetch">サーバーのレポートを取得</button>
    <button id="btn-clear" class="danger">すべてクリア</button>
  </div>
  <div id="server-log" class="log">まだ取得していません。</div>

  <script>
    // --- ReportingObserver ---
    const observerLogEl = document.getElementById('observer-log');
    const statusEl = document.getElementById('observer-status');
    let observerReports = [];

    if (typeof ReportingObserver === 'undefined') {
      statusEl.textContent = '⚠ このブラウザは ReportingObserver をサポートしていません（Chrome / Edge で開いてください）';
    } else {
      statusEl.textContent = '✓ ReportingObserver が動作中';

      const observer = new ReportingObserver((reports) => {
        for (const report of reports) {
          const entry = {
            type: report.type,
            url: report.url,
            body: report.body ? report.body.toJSON() : {},
            timestamp: new Date().toISOString(),
          };
          observerReports.push(entry);

          // サーバーにも転送
          fetch('/reports/collect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
          }).catch(console.error);
        }
        renderObserverLog();
      }, { types: ['csp-violation'], buffered: true });

      observer.observe();
    }

    function renderObserverLog() {
      if (observerReports.length === 0) {
        observerLogEl.textContent = 'まだレポートはありません。';
        return;
      }
      observerLogEl.textContent = JSON.stringify(observerReports, null, 2);
    }

    // --- トリガー ---
    function triggerCSPViolation() {
      // インラインスクリプトを注入 → CSP違反
      const script = document.createElement('script');
      script.textContent = "console.log('CSP violation test')";
      document.head.appendChild(script);
      document.head.removeChild(script);
    }

    // --- サーバーログ ---
    async function fetchServerReports() {
      const res = await fetch('/reports/list');
      const data = await res.json();
      const el = document.getElementById('server-log');
      if (data.length === 0) {
        el.textContent = 'サーバーにレポートはありません。';
      } else {
        el.textContent = JSON.stringify(data, null, 2);
      }
    }

    async function clearAll() {
      observerReports = [];
      renderObserverLog();
      await fetch('/reports/list', { method: 'DELETE' });
      document.getElementById('server-log').textContent = 'クリアしました。';
    }

    // --- イベントリスナー ---
    document.getElementById('btn-csp').addEventListener('click', triggerCSPViolation);
    document.getElementById('btn-fetch').addEventListener('click', fetchServerReports);
    document.getElementById('btn-clear').addEventListener('click', clearAll);
  </script>
</body>
</html>`);
});

import { createServer } from "node:https";

serve(
  {
    fetch: app.fetch,
    port: 3000,
    createServer,
    serverOptions: {
      key: readFileSync("localhost-key.pem"),
      cert: readFileSync("localhost.pem"),
    },
  },
  (info) => {
    console.log(`Reporting API Demo: https://localhost:${info.port}`);
  }
);
