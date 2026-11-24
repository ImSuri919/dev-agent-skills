import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, matchSkills, readSkill, writeGenerated } from "./lib/skills.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = await loadManifest(root);
const casesFile = JSON.parse(await readFile(path.join(root, "evals", "cases.json"), "utf8"));

const results = [];
for (const testCase of casesFile.cases) {
  const matches = matchSkills(testCase.prompt, manifest, 3);
  const top = matches[0]?.name ?? "none";
  const text = await readSkill(root, testCase.expect).catch(() => "");
  const lower = text.toLowerCase();
  const missing = testCase.must_include.filter((phrase) => !lower.includes(phrase.toLowerCase()));
  const routed = top === testCase.expect;
  const passed = routed && missing.length === 0;
  results.push({
    id: testCase.id,
    prompt: testCase.prompt,
    expect: testCase.expect,
    routed_to: top,
    missing_contract: missing,
    passed,
  });
}

const passedCount = results.filter((result) => result.passed).length;
const covered = new Set(results.filter((result) => result.passed).map((result) => result.expect)).size;
const totalSkills = manifest.skills.length;
const summary = `${passedCount}/${results.length} cases passed | ${covered}/${totalSkills} skills covered`;

const lines = [
  "# Skill routing and contract results",
  "",
  summary,
  "",
  "Each case sends a prompt through the same router used by the MCP server, then checks that the winning skill contains the output phrases it promises.",
  "",
  "| Case | Prompt | Expected | Routed to | Result |",
  "| --- | --- | --- | --- | --- |",
  ...results.map((result) => {
    const detail = result.passed
      ? "pass"
      : result.missing_contract.length
        ? `fail, missing: ${result.missing_contract.join(", ")}`
        : `fail, routed to ${result.routed_to}`;
    return `| ${result.id} | ${result.prompt} | ${result.expect} | ${result.routed_to} | ${detail} |`;
  }),
  "",
  "This is a structural check. It does not run a language model and does not measure answer quality.",
  "",
];

await writeGenerated(root, "docs/eval-results.json", `${JSON.stringify({ summary, results }, null, 2)}\n`);
await writeGenerated(root, "docs/eval-results.md", lines.join("\n"));
console.log(summary);
if (passedCount !== results.length) process.exitCode = 1;
