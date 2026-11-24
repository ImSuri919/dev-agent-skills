#!/usr/bin/env node

import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { listSkillNames, loadManifest, readSkill, sha256, skillPath } from "./lib/skills.mjs";
import { checkLock } from "./devskills.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = await loadManifest(root);

function parseArgs(argv) {
  const options = { agents: [], check: false, frozen: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--check") options.check = true;
    else if (arg === "--frozen") options.frozen = true;
    else if (arg === "--all") options.all = true;
    else if (arg === "--agent") options.agents.push(argv[++index]);
    else if (arg === "--dir") options.dir = argv[++index];
    else if (arg === "--base") options.base = argv[++index];
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return options;
}

function targetFor(agent, options) {
  if (options.all) {
    if (!options.base) throw new Error("--all needs --base");
    return path.resolve(options.base, agent);
  }
  if (options.dir) return path.resolve(options.dir);
  const home = os.homedir();
  const defaults = {
    opencode: path.join(home, ".config", "opencode", "skills"),
    claude: path.join(process.cwd(), ".claude", "skills"),
    codex: path.join(home, ".codex", "skills"),
    gemini: path.join(home, ".gemini", "skills"),
  };
  if (!defaults[agent]) throw new Error(`Unknown agent: ${agent}`);
  return defaults[agent];
}

function help() {
  console.log("Usage:");
  console.log("  node scripts/install.mjs --agent opencode [--dir PATH] [--check] [--frozen]");
  console.log("  node scripts/install.mjs --all --base PATH [--check] [--frozen]");
  console.log("Agents: opencode, claude, codex, gemini");
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (!options.agents.length && !options.all) {
    help();
    process.exitCode = 1;
  } else {
    if (options.frozen) {
      const errors = await checkLock(root);
      if (errors.length) throw new Error(`lockfile check failed: ${errors.join("; ")}`);
      console.log("OK: lockfile verified");
    }

    const agents = options.all ? ["opencode", "claude", "codex", "gemini"] : options.agents;
    const skills = await listSkillNames(root);
    const digests = {};
    for (const name of skills) digests[name] = sha256(await readSkill(root, name));

    for (const agent of agents) {
      const targetDir = targetFor(agent, options);
      let copied = 0;
      let drifted = 0;
      for (const name of skills) {
        const destination = path.join(targetDir, name, "SKILL.md");
        const existing = await readFile(destination, "utf8").catch(() => null);
        if (options.check) {
          if (existing === null || sha256(existing) !== digests[name]) drifted += 1;
          continue;
        }
        if (existing !== null && sha256(existing) === digests[name]) continue;
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, await readFile(skillPath(root, name), "utf8"), "utf8");
        copied += 1;
      }
      if (options.check) {
        console.log(`${agent}: ${drifted === 0 ? "OK" : `${drifted} skills missing or drifted`} (${targetDir})`);
        if (drifted) process.exitCode = 1;
      } else {
        console.log(`${agent}: ${copied} skills written (${targetDir}), ${skills.length} total`);
      }
    }
    console.log(`Manifest v${manifest.version}: ${skills.length} skills`);
  }
} catch (error) {
  console.error(`FAIL ${error.message}`);
  process.exitCode = 1;
}
