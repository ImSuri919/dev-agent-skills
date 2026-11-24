#!/usr/bin/env node

import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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
  const skillsDir = path.join(root, "skills");
  const errors = [];
  let entries;
  try {
    entries = await readdir(skillsDir, { withFileTypes: true });
  } catch {
    return { errors: ["missing skills/ directory"], skills: [] };
  }

  const readmePath = path.join(root, "README.md");
  const readme = await readFile(readmePath, "utf8").catch(() => "");
  if (!readme) errors.push("missing README.md");

  const skills = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (skills.length === 0) errors.push("no skills found in skills/");

  for (const name of skills) {
    const skillPath = path.join(skillsDir, name, "SKILL.md");
    const text = await readFile(skillPath, "utf8").catch(() => null);
    if (text === null) {
      errors.push(`${name}: missing SKILL.md`);
      continue;
    }
    for (const error of validateSkill(name, text)) errors.push(`${name}: ${error}`);
    if (readme && !readme.includes(`skills/${name}/SKILL.md`)) {
      errors.push(`${name}: not listed in README.md`);
    }
  }
  return { errors, skills };
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
  usage();
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main();
}
