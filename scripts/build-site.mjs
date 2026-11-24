import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, parseFrontmatter, readSkill, writeGenerated } from "./lib/skills.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = await loadManifest(root);

const skills = [];
for (const entry of manifest.skills) {
  const text = await readSkill(root, entry.name);
  skills.push({
    ...entry,
    description: parseFrontmatter(text)?.description ?? "",
    text,
  });
}

const payload = JSON.stringify({ version: manifest.version, skills }).replace(/</g, "\\u003c");
await writeGenerated(root, "site/data.js", `window.DEVSKILLS_DATA = ${payload};\n`);
console.log(`Wrote site/data.js with ${skills.length} skills`);
