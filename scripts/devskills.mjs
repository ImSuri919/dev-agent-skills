#!/usr/bin/env node

import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  listSkillNames,
  loadManifest,
  parseFrontmatter,
  sha256,
  skillPath,
  writeGenerated,
} from "./lib/skills.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const TEMPLATE = path.join(ROOT, "templates", "SKILL.md.template");
const REQUIRED_HEADINGS = [
  "## Purpose",
  "## When to use",
  "## Steps",
  "## Output format",
  "## Avoid",
  "## Example",
];
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSkill(dirName, text) {
  const errors = [];
  const frontmatter = parseFrontmatter(text);
  if (!frontmatter) return ["missing YAML frontmatter at the top of the file"];

  if (!frontmatter.name) errors.push("missing 'name' field");
  if (frontmatter.name !== dirName) {
    errors.push(`name '${frontmatter.name}' does not match directory '${dirName}'`);
  }
  if (frontmatter.name && !NAME_PATTERN.test(frontmatter.name)) {
    errors.push("name must be lowercase kebab-case");
  }
  if (!frontmatter.description) {
    errors.push("missing 'description' field");
  } else {
    if (frontmatter.description.length > 300) errors.push("description is over 300 characters");
    if (!/use when/i.test(frontmatter.description)) errors.push("description must include 'Use when'");
  }
  for (const heading of REQUIRED_HEADINGS) {
    if (!text.includes(heading)) errors.push(`missing section '${heading}'`);
  }
  if (/\[TODO|TODO:|\{\{/.test(text)) errors.push("contains an unfilled placeholder");
  if (!text.endsWith("\n")) errors.push("file must end with a newline");
  return errors;
}

export async function validateRepo(root = ROOT) {
  const errors = [];
  let skills;
  try {
    skills = await listSkillNames(root);
  } catch {
    return { errors: ["missing skills/ directory"], skills: [] };
  }

  const readme = await readFile(path.join(root, "README.md"), "utf8").catch(() => "");
  if (!readme) errors.push("missing README.md");
  if (skills.length === 0) errors.push("no skills found in skills/");

  for (const name of skills) {
    const text = await readFile(skillPath(root, name), "utf8").catch(() => null);
    if (text === null) {
      errors.push(`${name}: missing SKILL.md`);
      continue;
    }
    for (const error of validateSkill(name, text)) errors.push(`${name}: ${error}`);
    if (readme && !readme.includes(`skills/${name}/SKILL.md`)) {
      errors.push(`${name}: not listed in README.md`);
    }
  }

  const manifest = await loadManifest(root).catch(() => null);
  if (!manifest) {
    errors.push("missing or invalid skills.manifest.json");
  } else {
    const names = manifest.skills.map((skill) => skill.name).sort();
    for (const name of skills) {
      if (!names.includes(name)) errors.push(`${name}: missing from skills.manifest.json`);
    }
    for (const name of names) {
      if (!skills.includes(name)) errors.push(`${name}: manifest entry has no skill directory`);
    }
    if (new Set(names).size !== names.length) errors.push("manifest contains duplicate skill names");
    for (const skill of manifest.skills) {
      if (!skill.category || !Array.isArray(skill.tags) || !Array.isArray(skill.triggers)) {
        errors.push(`${skill.name}: manifest entry needs category, tags and triggers`);
      }
      for (const related of skill.related || []) {
        if (!names.includes(related)) errors.push(`${skill.name}: unknown related skill '${related}'`);
      }
    }
  }

  return { errors, skills };
}

export async function buildLock(root = ROOT) {
  const skills = await listSkillNames(root);
  const entries = {};
  for (const name of skills) {
    entries[name] = sha256(await readFile(skillPath(root, name), "utf8"));
  }
  return { version: 1, skills: entries };
}

export async function checkLock(root = ROOT) {
  const expected = await buildLock(root);
  const actual = JSON.parse(await readFile(path.join(root, "skills.lock.json"), "utf8").catch(() => "null"));
  if (!actual || actual.version !== 1) return ["missing or invalid skills.lock.json"];
  const errors = [];
  for (const [name, digest] of Object.entries(expected.skills)) {
    if (actual.skills?.[name] !== digest) errors.push(`${name}: digest does not match skills.lock.json`);
  }
  for (const name of Object.keys(actual.skills || {})) {
    if (!(name in expected.skills)) errors.push(`${name}: stale entry in skills.lock.json`);
  }
  return errors;
}

async function createSkill(name, description) {
  if (!name || !NAME_PATTERN.test(name)) {
    throw new Error("name must be lowercase kebab-case, for example code-review-brief");
  }
  if (!description || !/use when/i.test(description)) {
    throw new Error("description must say what the skill does and include 'Use when ...'");
  }
  const target = path.join(SKILLS_DIR, name);
  if (existsSync(target)) throw new Error(`skills/${name} already exists`);

  const template = await readFile(TEMPLATE, "utf8");
  const content = template
    .replaceAll("{{NAME}}", name)
    .replaceAll("{{DESCRIPTION}}", description.replace(/\s+/g, " ").trim());
  await mkdir(target, { recursive: true });
  const skillPath = path.join(target, "SKILL.md");
  await writeFile(skillPath, content, "utf8");
  console.log(`Created ${path.relative(ROOT, skillPath)}`);
  console.log("Fill in every section, add it to README.md, then run npm run check.");
}

function usage() {
  console.log("Usage:");
  console.log("  node scripts/devskills.mjs check");
  console.log('  node scripts/devskills.mjs new <name> "Does one thing. Use when ..."');
  console.log("  node scripts/devskills.mjs lock");
  console.log("  node scripts/devskills.mjs lock:check");
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === "check") {
    const { errors, skills } = await validateRepo();
    if (errors.length) {
      for (const error of errors) console.error(`FAIL ${error}`);
      process.exitCode = 1;
    } else {
      console.log(`OK: ${skills.length} skills are valid`);
    }
    return;
  }
  if (command === "new") {
    try {
      await createSkill(args[0], args.slice(1).join(" "));
    } catch (error) {
      console.error(`FAIL ${error.message}`);
      process.exitCode = 1;
    }
    return;
  }
  if (command === "lock") {
    const lock = await buildLock();
    const target = await writeGenerated(ROOT, "skills.lock.json", `${JSON.stringify(lock, null, 2)}\n`);
    console.log(`Wrote ${path.relative(ROOT, target)} with ${Object.keys(lock.skills).length} digests`);
    return;
  }
  if (command === "lock:check") {
    const errors = await checkLock();
    if (errors.length) {
      for (const error of errors) console.error(`FAIL ${error}`);
      process.exitCode = 1;
    } else {
      console.log("OK: skills.lock.json matches all skills");
    }
    return;
  }
  usage();
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
