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

// // 指定時間ブロックする関数
// const blockForAWhile = (ms: any) =>
//     new Promise((resolve) => setTimeout(resolve, ms));

// // (Optional) ブロック時に呼ばれるコールバック関数
// const protectCallback = (job: any) =>
//     console.log(
//         `Call at ${new Date().toISOString()} were blocked by call started at ${job.currentRun().toISOString()}`,
//     );

// // 長時間実行されるジョブの例
// new Cron("* * * * * *", { protect: protectCallback }, async (job: any) => {
//     console.log(`Call started at ${job.currentRun().toISOString()} started`);
//     await blockForAWhile(4000);
//     console.log(
//         `Call started at ${job.currentRun().toISOString()} finished ${new Date().toISOString()}`,
//     );
// });
