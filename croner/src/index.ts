import { Cron } from "croner";

console.log("Croner demo started. Waiting for the next execution...");

// 5秒ごとに実行するメインジョブ
const mainJob = new Cron("*/5 * * * * *", () => {
    console.log("###");
    console.log(`Task executed at ${new Date().toISOString()}`);
    console.log("###");
});

// メインジョブの生存確認をするためのジョブを入れてみる
const heartBeatJob = new Cron("*/5 * * * * *", () => {
    console.log(
        `mainJob is ${mainJob.isRunning()}, previous run at ${mainJob.previousRun()}, next run at ${mainJob.nextRun()}`,
    );
});

// 16秒後にジョブを停止する
setTimeout(() => {
    console.log("Stopping demonstration...");
    mainJob.stop();
    heartBeatJob.stop();
}, 16000);
