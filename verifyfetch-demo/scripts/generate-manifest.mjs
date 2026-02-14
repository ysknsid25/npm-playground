import { generateChunkedHashes } from "verifyfetch";
import fs from "fs/promises";

async function main() {
    const filePath = "public/large-file.dat";
    const outputPath = "public/vf.manifest.json";

    console.log(`Reading ${filePath}...`);
    const data = await fs.readFile(filePath);

    console.log("Generating chunked hashes...");
    const chunkedInfo = await generateChunkedHashes(data);

    const manifest = {
        url: "/large-file.dat",
        chunked: chunkedInfo,
    };

    console.log(`Writing manifest to ${outputPath}...`);
    await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));
    console.log("Done.");
}

main().catch(console.error);
