# dev-agent-skills

![CI](https://github.com/ImSuri919/dev-agent-skills/actions/workflows/ci.yml/badge.svg)
![skills](https://img.shields.io/badge/skills-16-brightgreen)
![license](https://img.shields.io/badge/license-MIT-blue)

A set of small, reusable instruction files for coding agents. Each file teaches one workflow: review a pull request, plan tests, triage a bug, write release notes.

An agent reads a `SKILL.md` when a request matches its description, then follows the steps inside. This works with OpenCode, Claude Code, Codex, and similar agents.

[Hindi version](README.hi.md) | [Playground](https://imsuri919.github.io/dev-agent-skills/) | [Eval results](docs/eval-results.md) | [Skill graph](docs/skill-graph.md)

## What makes this repo different

Most skill collections are a folder of Markdown files. This one also ships the machinery around them.

1. **MCP server.** Agents can load a skill on demand instead of carrying all instructions in context. It exposes `list_skills`, `get_skill`, `match_skill`, and `get_manifest` over stdio. No packages to install.
2. **Public eval scorecard.** Nineteen cases send a plain request through the same router the MCP server uses, then check that the winning skill contains the output sections it promises. Results are committed at [docs/eval-results.md](docs/eval-results.md).
3. **One command installer.** Copy the skills into OpenCode, Claude Code, Codex, or Gemini paths. A SHA-256 lockfile makes the install reproducible and detects drift.
4. **Skill graph.** `related` fields in the manifest generate a Mermaid graph, and CI fails if a hand-off cycle appears.
5. **Browser playground.** Search, filter, route a prompt, and read any skill on a static page with no build step or backend.

## Why use this

Agent instructions usually live in one chat and disappear. These files are readable, editable, and version controlled. Copy one into a project, change a step, and everyone on the team gets the same workflow.

## Included skills

| Skill | What it does | Use when |
| --- | --- | --- |
| [code-review-brief](skills/code-review-brief/SKILL.md) | Turns a diff into a short brief a maintainer can act on | Asked to review or summarize a PR |
| [test-plan](skills/test-plan/SKILL.md) | Decides which tests are worth writing for a change | Adding or changing tests |
| [perf-triage](skills/perf-triage/SKILL.md) | Finds the measured cause of a slowdown before changing code | Something feels slow |
| [a11y-focus-check](skills/a11y-focus-check/SKILL.md) | Checks keyboard access and visible focus in a UI | Reviewing a UI or accessibility |
| [release-notes](skills/release-notes/SKILL.md) | Drafts user-facing notes from merged work | Preparing a release |
| [debug-triage](skills/debug-triage/SKILL.md) | Narrows an error or incident to a supported claim | An error spikes or a bug is reported |
| [api-contract](skills/api-contract/SKILL.md) | Pins down request, response, and error shapes for an endpoint | Designing or changing an API |
| [docs-writer](skills/docs-writer/SKILL.md) | Writes a README or guide a reader can follow | Writing user-facing technical docs |
| [refactor-simplify](skills/refactor-simplify/SKILL.md) | Finds code that can be deleted or merged | A PR feels larger than it needs to be |
| [skill-author](skills/skill-author/SKILL.md) | Writes a new skill that works on its own | Saving a repeated workflow |
| [seo-basics](skills/seo-basics/SKILL.md) | Runs a first-pass technical SEO check on a site | A site needs more organic traffic |
| [gradle-build-triage](skills/gradle-build-triage/SKILL.md) | Narrows a failing Android build to one task and one cause | Gradle build or sync fails |
| [compose-ui-review](skills/compose-ui-review/SKILL.md) | Reviews Compose state, recomposition and accessibility | A Compose screen is in review |
| [adb-debug](skills/adb-debug/SKILL.md) | Captures device evidence and debugs a crash with logcat | An app fails on a real device |
| [play-store-release](skills/play-store-release/SKILL.md) | Plans a signed AAB rollout with metadata and rollback | Shipping to Play Store |
| [android-permissions-check](skills/android-permissions-check/SKILL.md) | Audits the merged manifest against real feature use | Adding an SDK or cutting permissions |

Android projects work the same way: copy the skills you want into the agent's skills folder inside the repo, for example `.claude/skills/` for Claude Code. The instructions are Markdown; no Android dependency is added to your app.

## Install the files by hand

Copy the skills you want into your agent's skills directory:

- OpenCode: `~/.config/opencode/skills/`
- Claude Code: `.claude/skills/` inside your repo
- Codex: `~/.codex/skills/`
- Gemini CLI: `~/.gemini/skills/`

```sh
cp -R skills/code-review-brief ~/.config/opencode/skills/
```

Keep the directory name identical to the `name` field. The checker enforces this.

## Install with the CLI

```sh
node scripts/install.mjs --agent opencode
node scripts/install.mjs --agent claude --dir /path/to/project/.claude/skills
node scripts/install.mjs --all --base /path/to/test-folder
node scripts/install.mjs --agent opencode --check
node scripts/install.mjs --agent opencode --frozen
```

`--check` reports missing or changed files. `--frozen` verifies `skills.lock.json` before writing anything.

## Run the MCP server

Add this to your agent's MCP config with an absolute path:

```json
{
  "mcpServers": {
    "dev-agent-skills": {
      "command": "node",
      "args": ["/absolute/path/to/dev-agent-skills/scripts/mcp-server.mjs"]
    }
  }
}
```

Tools: `list_skills` filters by category, `get_skill` reads one skill, `match_skill` routes a request, `get_manifest` returns tags and triggers. Skills are also exposed as `skill://<name>` resources.

## Check everything

```sh
npm run verify
```

That runs the skill check, unit tests, lockfile check, eval cases, graph cycle check, and site data build. Individual commands: `npm run check`, `npm test`, `npm run lock:check`, `npm run eval`, `npm run graph`, `npm run site:build`.

Node 20 or newer. No packages to install.

## Add your own skill

1. Run `npm run new -- <name> "<description>"`.
2. Fill in every section. Write steps another agent can follow without reading anything else.
3. Add the skill to the table above and to `skills.manifest.json` with a category, tags, triggers, and hand-off links.
4. Add an eval case in `evals/cases.json` with a prompt and the output phrases the skill promises.
5. Run `npm run lock`, then `npm run verify`.

The manifest drives the router, installer, graph, playground, and MCP server. A skill without a manifest entry fails CI.

## License

MIT. See [LICENSE](LICENSE).
