import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import Throttle from "throttle";
import { createReadStream, statSync } from "fs";
import { Readable } from "stream";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

app.use("*", async (c, next) => {
    const range = c.req.header("range");
    if (range) {
        console.log(
            `Range Request: ${c.req.method} ${c.req.url} Range: ${range}`,
        );
    }
    await next();
});

app.get("/large-file.dat", async (c) => {
    const filePath = "./public/large-file.dat";
    const stats = statSync(filePath);
    const fileSize = stats.size;
    const range = c.req.header("range");

    let start = 0;
    let end = fileSize - 1;
    let status = 200;
    let headers = {
        "Content-Type": "application/octet-stream",
        "Accept-Ranges": "bytes",
    };

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        start = parseInt(parts[0], 10);
        end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
            c.status(416);
            return c.text("Requested Range Not Satisfiable");
        }

        const chunksize = end - start + 1;
        headers["Content-Range"] = `bytes ${start}-${end}/${fileSize}`;
        headers["Content-Length"] = chunksize.toString();
        status = 206;
    } else {
        headers["Content-Length"] = fileSize.toString();
    }

    const fileStream = createReadStream(filePath, { start, end });

    const BPS = 1024 * 1024;
    const throttledStream = fileStream.pipe(new Throttle(BPS));

    const readable = Readable.toWeb(throttledStream);

    return c.newResponse(readable, status, headers);
});

app.use(
    "/verifyfetch/*",
    serveStatic({
        root: "./node_modules/verifyfetch/dist",
        rewriteRequestPath: (path) => path.replace(/^\/verifyfetch/, ""),
    }),
);

app.use("/*", serveStatic({ root: "./public" }));

const port = 3000;

console.log("Starting server...");

try {
    serve(
        {
            fetch: app.fetch,
            port,
        },
        (info) => {
            console.log(`Server listening at http://localhost:${info.port}`);
            console.log(`Test page: http://localhost:${info.port}/index.html`);
        },
    );
} catch (e) {
    console.error("Failed to start server:", e);
}
