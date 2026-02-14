import {
    verifyFetchResumable,
    clearOldDownloads,
    getDownloadProgress,
} from "/verifyfetch/index.js";

const FILE_URL = "/large-file.dat";
const MANIFEST_URL = "/vf.manifest.json";

// --- Standard Fetch State ---
let fetchController = null;
let fetchBytesReceived = 0;
let fetchTotalBytes = 0;
let fetchChunks = [];
let fetchIsPaused = false;

// --- VerifyFetch State ---
let verifyController = null;
let verifyIsPaused = false;
let verifyManifest = null;

// UI Elements
const fetchStatus = document.getElementById("fetch-status");
const fetchProgress = document.getElementById("fetch-progress");
const fetchBtnStart = document.getElementById("fetch-btn-start");
const fetchBtnPause = document.getElementById("fetch-btn-pause");
const fetchBtnResume = document.getElementById("fetch-btn-resume");

const verifyStatus = document.getElementById("verify-status");
const verifyProgress = document.getElementById("verify-progress");
const verifyBtnStart = document.getElementById("verify-btn-start");
const verifyBtnPause = document.getElementById("verify-btn-pause");
const verifyBtnResume = document.getElementById("verify-btn-resume");

// --- Helper: Update UI ---
function updateFetchUI(status, progress) {
    if (status) fetchStatus.textContent = status;
    if (progress !== undefined) fetchProgress.value = progress;

    fetchBtnStart.disabled = fetchController || fetchIsPaused;
    fetchBtnPause.disabled = !fetchController;
    fetchBtnResume.disabled = !fetchIsPaused;
}

function updateVerifyUI(status, progress) {
    if (status) verifyStatus.textContent = status;
    if (progress !== undefined) verifyProgress.value = progress;

    verifyBtnStart.disabled = verifyController || verifyIsPaused; // Disable start if running or paused (use resume)
    verifyBtnPause.disabled = !verifyController;
    verifyBtnResume.disabled = !verifyIsPaused;
}

// --- Standard Fetch Implementation ---

async function startFetch() {
    fetchChunks = [];
    fetchBytesReceived = 0;
    fetchIsPaused = false;
    updateFetchUI("Starting...", 0);

    try {
        fetchController = new AbortController();
        const response = await fetch(FILE_URL, {
            signal: fetchController.signal,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const contentLength = response.headers.get("Content-Length");
        fetchTotalBytes = contentLength ? parseInt(contentLength, 10) : 0;

        updateFetchUI("Downloading...", 0);
        await readStream(response.body);

        updateFetchUI("Completed!", 100);
        fetchController = null;
    } catch (err) {
        if (err.name === "AbortError") {
            updateFetchUI("Paused");
        } else {
            updateFetchUI(`Error: ${err.message}`);
            fetchController = null;
        }
    }
}

async function pauseFetch() {
    if (fetchController) {
        fetchController.abort();
        fetchController = null;
        fetchIsPaused = true;
        updateFetchUI("Paused");
    }
}

async function resumeFetch() {
    if (!fetchIsPaused) return;
    fetchIsPaused = false;
    updateFetchUI("Resuming...");

    try {
        fetchController = new AbortController();
        const headers = { Range: `bytes=${fetchBytesReceived}-` };
        const response = await fetch(FILE_URL, {
            headers,
            signal: fetchController.signal,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        if (response.status !== 206) {
            console.warn(
                "Server did not return 206 Partial Content. Restarting?",
            );
        }

        updateFetchUI("Downloading...");
        await readStream(response.body);

        updateFetchUI("Completed!", 100);
        fetchController = null;
    } catch (err) {
        if (err.name === "AbortError") {
            updateFetchUI("Paused");
        } else {
            updateFetchUI(`Error: ${err.message}`);
            fetchController = null;
        }
    }
}

async function readStream(readableStream) {
    const reader = readableStream.getReader();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        fetchChunks.push(value);
        fetchBytesReceived += value.length;

        if (fetchTotalBytes > 0) {
            const percent = (fetchBytesReceived / fetchTotalBytes) * 100;
            updateFetchUI(null, percent);
        }
    }
}

// --- VerifyFetch Implementation ---

async function loadManifest() {
    const res = await fetch(MANIFEST_URL);
    verifyManifest = await res.json();
}

async function runVerifyFetch() {
    if (!verifyManifest) await loadManifest();

    verifyController = new AbortController();
    const signal = verifyController.signal;

    try {
        const fetchImpl = (url, init) => {
            return fetch(url, { ...init, signal });
        };

        await verifyFetchResumable(FILE_URL, {
            chunked: verifyManifest.chunked,
            fetchImpl: fetchImpl,
            onProgress: (progress) => {
                const percent =
                    (progress.bytesVerified / progress.totalBytes) * 100;
                const speed = progress.speed
                    ? (progress.speed / 1024 / 1024).toFixed(2) + " MB/s"
                    : "";
                updateVerifyUI(
                    `Downloading... (${Math.round(percent)}%) - ${speed}`,
                    percent,
                );
            },
            onResume: (state) => {
                console.log("Resumed from state:", state);
                updateVerifyUI("Resumed download");
            },
        });

        updateVerifyUI("Verified & Completed!", 100);
        verifyController = null;
        verifyIsPaused = false;
    } catch (err) {
        if (err.name === "AbortError" || signal.aborted) {
            updateVerifyUI("Paused");
            verifyIsPaused = true;
        } else {
            console.error(err);
            updateVerifyUI(`Error: ${err.message}`);
            verifyController = null;
        }
    }
}

async function startVerify() {
    await clearOldDownloads(0);
    verifyIsPaused = false;
    updateVerifyUI("Starting...", 0);
    await runVerifyFetch();
}

async function pauseVerify() {
    if (verifyController) {
        verifyController.abort();
        verifyController = null;

        verifyIsPaused = true;
        updateVerifyUI("Paused");
    }
}

async function resumeVerify() {
    verifyIsPaused = false;
    updateVerifyUI("Resuming...");
    await runVerifyFetch();
}

async function checkResumeState() {
    try {
        const progress = await getDownloadProgress(FILE_URL);
        if (
            progress &&
            progress.bytesVerified < (progress.totalBytes || Infinity)
        ) {
            verifyIsPaused = true;
            const percent =
                (progress.bytesVerified / progress.totalBytes) * 100;
            updateVerifyUI(`Paused (Resumable)`, percent);
        }
    } catch (e) {
        console.warn("Failed to check resume state:", e);
    }
}

// Event Listeners
fetchBtnStart.addEventListener("click", startFetch);
fetchBtnPause.addEventListener("click", pauseFetch);
fetchBtnResume.addEventListener("click", resumeFetch);

verifyBtnStart.addEventListener("click", startVerify);
verifyBtnPause.addEventListener("click", pauseVerify);
verifyBtnResume.addEventListener("click", resumeVerify);

// Initial UI
updateFetchUI("Ready", 0);
updateVerifyUI("Ready", 0);

// Check if there is a pending download
checkResumeState();
