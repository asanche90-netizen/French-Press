import sharp from "sharp";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const src = resolve(root, "public/icon.svg");
const svg = readFileSync(src);

const targets = [
  { size: 192, file: "public/pwa-192.png" },
  { size: 512, file: "public/pwa-512.png" },
  { size: 180, file: "public/apple-touch-icon.png" },
];

for (const { size, file } of targets) {
  const out = resolve(root, file);
  await sharp(svg).resize(size, size).png().toFile(out);
  console.log(`wrote ${file} (${size}x${size})`);
}
