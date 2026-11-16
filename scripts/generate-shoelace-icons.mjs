import fs from "node:fs";
import path from "node:path";

const iconsDir = path.resolve(
  "node_modules/@shoelace-style/shoelace/dist/assets/icons"
);

const outFile = path.resolve("src/assets/shoelace-icon-names.json");

// Read *.svg filenames -> icon names
const names = fs
  .readdirSync(iconsDir)
  .filter((f) => f.endsWith(".svg"))
  .map((f) => f.slice(0, -4))
  .sort((a, b) => a.localeCompare(b));

const file = JSON.stringify(names, null, 1) + "\n";

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, file, "utf8");

console.log(
  `Wrote ${names.length} icons to ${path.relative(process.cwd(), outFile)}`
);