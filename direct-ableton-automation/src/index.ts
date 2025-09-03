// src/index.ts
import { readFileSync } from "fs";
import { applySong } from "./top-layer";

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error("usage: ts-node src/index.ts <song.json>");
    process.exit(1);
  }
  const raw = readFileSync(path, "utf8");
  const json = JSON.parse(raw);
  const res = await applySong(json);
  console.log(JSON.stringify(res, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
