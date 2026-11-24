import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, parseFrontmatter } from "./lib/skills.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const name = "android-agent-skills";
const version = process.env.ANDROID_PACK_VERSION ?? "1.0.0";
const dist = path.join(root, "dist");
const stage = path.join(dist, name);

const manifest = await loadManifest(root);
const androidSkills = manifest.skills.filter((skill) => skill.category === "android");
if (androidSkills.length === 0) throw new Error("No android skills found in skills.manifest.json");

await rm(stage, { recursive: true, force: true });
await mkdir(path.join(stage, "skills"), { recursive: true });

for (const skill of androidSkills) {
  await cp(path.join(root, "skills", skill.name), path.join(stage, "skills", skill.name), { recursive: true });
}
await cp(path.join(root, "LICENSE"), path.join(stage, "LICENSE"));

const subset = {
  version: 1,
  name,
  source: "ImSuri919/dev-agent-skills",
  skills: androidSkills,
};
await writeFile(path.join(stage, "skills.manifest.json"), `${JSON.stringify(subset, null, 2)}\n`, "utf8");

const installScript = `#!/usr/bin/env node

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const skillsRoot = path.join(packageRoot, "skills");

function parse(argv) {
  const options = { agents: [], check: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--check") options.check = true;
    else if (arg === "--all") options.all = true;
    else if (arg === "--agent") options.agents.push(argv[++index]);
    else if (arg === "--dir") options.dir = argv[++index];
    else if (arg === "--base") options.base = argv[++index];
    else throw new Error("Unknown argument: " + arg);
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
  if (!defaults[agent]) throw new Error("Unknown agent: " + agent);
  return defaults[agent];
}

function help() {
  console.log("Usage:");
  console.log("  node install.mjs --agent claude [--dir PATH] [--check]");
  console.log("  node install.mjs --all --base PATH [--check]");
  console.log("Agents: opencode, claude, codex, gemini");
}

try {
  const options = parse(process.argv.slice(2));
  if (!options.agents.length && !options.all) {
    help();
    process.exitCode = 1;
  } else {
    const entries = await readdir(skillsRoot, { withFileTypes: true });
    const names = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
    const sources = new Map();
    for (const skill of names) {
      sources.set(skill, await readFile(path.join(skillsRoot, skill, "SKILL.md"), "utf8"));
    }
    const agents = options.all ? ["opencode", "claude", "codex", "gemini"] : options.agents;
    for (const agent of agents) {
      const target = targetFor(agent, options);
      let changed = 0;
      for (const skill of names) {
        const destination = path.join(target, skill, "SKILL.md");
        const existing = await readFile(destination, "utf8").catch(() => null);
        if (options.check) {
          if (existing !== sources.get(skill)) changed += 1;
          continue;
        }
        if (existing === sources.get(skill)) continue;
        await mkdir(path.dirname(destination), { recursive: true });
        await writeFile(destination, sources.get(skill), "utf8");
        changed += 1;
      }
      const label = options.check ? "missing or changed" : "written";
      console.log(agent + ": " + changed + " of " + names.length + " skills " + label + " (" + target + ")");
      if (options.check && changed) process.exitCode = 1;
    }
  }
} catch (error) {
  console.error("FAIL " + error.message);
  process.exitCode = 1;
}
`;
await writeFile(path.join(stage, "install.mjs"), installScript, { encoding: "utf8", mode: 0o755 });

const skillRows = [];
const skillBullets = [];
for (const skill of androidSkills) {
  const text = await readFile(path.join(stage, "skills", skill.name, "SKILL.md"), "utf8");
  const description = parseFrontmatter(text)?.description ?? "";
  skillRows.push(`| \`${skill.name}\` | ${description} |`);
  skillBullets.push(`- \`${skill.name}\` — ${description}`);
}

const packageReadme = `# Android Agent Skills

Five coding-agent skills for Android work, packaged from [dev-agent-skills](https://github.com/ImSuri919/dev-agent-skills).

These are Markdown instruction files for your coding agent. They add no Gradle dependency and do not change your app build.

## Included

| Skill | What it does |
| --- | --- |
${skillRows.join("\n")}

## Install

Unzip this package, then run the standalone installer from the extracted folder:

\`\`\`sh
node install.mjs --agent claude --dir /path/to/android-project/.claude/skills
node install.mjs --agent opencode
node install.mjs --all --base /path/to/test-folder
node install.mjs --agent claude --check
\`\`\`

Supported agents: \`opencode\`, \`claude\`, \`codex\`, \`gemini\`.

## Use in a prompt

Once installed, ask your agent things like:

- "Gradle build fails on assembleDebug"
- "Review compose UI for the new feed screen"
- "Use adb logcat to debug a device crash"
- "Plan a play store release with a staged rollout"
- "Check android permissions in the merged manifest"

## License

MIT. See [LICENSE](LICENSE).
`;
await writeFile(path.join(stage, "README.md"), packageReadme, "utf8");

const packageJson = {
  name: `@imsuri919/${name}`,
  version,
  description: "Five coding-agent skills for Android development",
  type: "module",
  bin: { "android-agent-skills": "./install.mjs" },
  files: ["skills", "install.mjs", "skills.manifest.json", "README.md", "LICENSE"],
  license: "MIT",
  repository: {
    type: "git",
    url: "git+https://github.com/ImSuri919/dev-agent-skills.git",
  },
};
await writeFile(path.join(stage, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");

const notes = `# Android Agent Skills v${version}

Installable pack of ${androidSkills.length} coding-agent skills for Android work.

## Included

${skillBullets.join("\n")}

## Install

Download \`${name}-${version}.zip\` or \`.tar.gz\`, extract it, then run:

\`\`\`sh
node install.mjs --agent claude --dir /path/to/android-project/.claude/skills
\`\`\`

No Gradle dependency is added. These are Markdown instructions your coding agent reads on demand.

Full source: https://github.com/ImSuri919/dev-agent-skills
`;
await writeFile(path.join(dist, "android-release-notes.md"), notes, "utf8");

function run(command, args) {
  const result = spawnSync(command, args, { cwd: dist, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} exited with ${result.status}`);
}

run("zip", ["-rq", `${name}-${version}.zip`, name]);
run("tar", ["-czf", `${name}-${version}.tar.gz`, name]);

console.log(`Staged ${androidSkills.length} skills in ${path.relative(root, stage)}`);
console.log(`Wrote ${name}-${version}.zip and .tar.gz in dist/`);
