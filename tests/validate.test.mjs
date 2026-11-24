import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { validateSkill, validateRepo, buildLock, checkLock } from "../scripts/devskills.mjs";

function skillText(name, description = "Does one thing. Use when the task is that thing.") {
  return `---\nname: ${name}\ndescription: ${description}\n---\n\n# ${name}\n\n## Purpose\n\nProduces one result.\n\n## When to use\n\n- One case.\n\n## Steps\n\n1. Do the work.\n\n## Output format\n\nA short answer.\n\n## Avoid\n\n- Guessing.\n\n## Example\n\nAn answer.\n`;
}

async function makeRepo(t, skills, readme) {
  const dir = await mkdtemp(path.join(process.env.TMPDIR || os.tmpdir(), "dev-agent-skills-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  await mkdir(path.join(dir, "skills"), { recursive: true });
  await writeFile(path.join(dir, "README.md"), readme ?? "# Test\n", "utf8");
  const manifest = {
    version: 2,
    skills: Object.keys(skills).map((name) => ({
      name,
      category: "test",
      tags: ["test"],
      triggers: ["test"],
      related: [],
    })),
  };
  await writeFile(path.join(dir, "skills.manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  for (const [name, text] of Object.entries(skills)) {
    const skillDir = path.join(dir, "skills", name);
    await mkdir(skillDir, { recursive: true });
    await writeFile(path.join(skillDir, "SKILL.md"), text, "utf8");
  }
  return dir;
}

test("a complete skill has no errors", () => {
  assert.deepEqual(validateSkill("test-plan", skillText("test-plan")), []);
});

test("a name that does not match the directory is rejected", () => {
  const errors = validateSkill("test-plan", skillText("wrong-name"));
  assert.ok(errors.some((error) => error.includes("does not match directory")));
});

test("a missing required section is rejected", () => {
  const text = skillText("test-plan").replace("## Example\n\nAn answer.\n", "");
  assert.ok(validateSkill("test-plan", text).some((error) => error.includes("## Example")));
});

test("a description without 'Use when' is rejected", () => {
  const errors = validateSkill("test-plan", skillText("test-plan", "Does one thing."));
  assert.ok(errors.some((error) => error.includes("Use when")));
});

test("an unfilled placeholder is rejected", () => {
  const text = skillText("test-plan").replace("A short answer.", "TODO: write this");
  assert.ok(validateSkill("test-plan", text).some((error) => error.includes("placeholder")));
});

test("a skill missing from the README is reported", async (t) => {
  const dir = await makeRepo(t, { "test-plan": skillText("test-plan") }, "# Test\n");
  const { errors, skills } = await validateRepo(dir);
  assert.deepEqual(skills, ["test-plan"]);
  assert.ok(errors.some((error) => error.includes("not listed in README.md")));
});

test("a valid repo passes the check", async (t) => {
  const dir = await makeRepo(
    t,
    { "test-plan": skillText("test-plan") },
    "# Test\n\n[test-plan](skills/test-plan/SKILL.md)\n",
  );
  const result = await validateRepo(dir);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.skills, ["test-plan"]);
});

test("the lockfile detects a changed skill", async (t) => {
  const dir = await makeRepo(t, { "test-plan": skillText("test-plan") });
  const lock = await buildLock(dir);
  await writeFile(path.join(dir, "skills.lock.json"), `${JSON.stringify(lock)}\n`, "utf8");
  assert.deepEqual(await checkLock(dir), []);

  const skillFile = path.join(dir, "skills", "test-plan", "SKILL.md");
  await writeFile(skillFile, `${skillText("test-plan")}\n`, "utf8");
  assert.ok((await checkLock(dir)).some((error) => error.includes("does not match")));
});
