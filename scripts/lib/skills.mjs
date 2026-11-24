import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const STOPWORDS = new Set([
  "a", "an", "and", "are", "can", "do", "for", "from", "how", "i", "in", "is",
  "it", "me", "my", "of", "on", "or", "please", "the", "this", "to", "what",
  "when", "with", "you", "our", "we", "need", "make", "give", "about", "have",
]);

export function manifestPath(root) {
  return path.join(root, "skills.manifest.json");
}

export async function loadManifest(root) {
  const text = await readFile(manifestPath(root), "utf8");
  return JSON.parse(text);
}

export async function listSkillNames(root) {
  const entries = await readdir(path.join(root, "skills"), { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

export function skillPath(root, name) {
  return path.join(root, "skills", name, "SKILL.md");
}

export async function readSkill(root, name) {
  return readFile(skillPath(root, name), "utf8");
}

export async function writeGenerated(root, relativePath, text) {
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, text, "utf8");
  return target;
}

export function sha256(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = /^([a-z][a-z0-9_-]*):\s*(.*)$/.exec(line);
    if (field) fields[field[1]] = field[2].trim();
  }
  return fields;
}

export function tokenize(text) {
  return new Set(
    String(text)
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word)),
  );
}

export function matchSkills(request, manifest, limit = 3) {
  const words = tokenize(request);
  const lower = String(request).toLowerCase();
  const scored = manifest.skills
    .map((entry) => {
      const haystack = tokenize([entry.name, entry.description, ...(entry.tags || [])].join(" "));
      let score = 0;
      const reasons = [];
      for (const word of words) {
        if (haystack.has(word)) {
          score += 2;
          reasons.push(word);
        }
      }
      for (const tag of entry.tags || []) {
        if (words.has(tag)) {
          score += 3;
          reasons.push(tag);
        }
      }
      for (const trigger of entry.triggers || []) {
        if (lower.includes(trigger.toLowerCase())) {
          score += 4;
          reasons.push(trigger);
        }
      }
      return { name: entry.name, score, reasons: [...new Set(reasons)].slice(0, 5) };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
  return scored;
}
