# dev-agent-skills

A set of small, reusable instruction files for coding agents. Each file teaches one workflow: review a pull request, plan tests, triage a bug, write release notes.

They are plain Markdown. An agent reads a `SKILL.md` when a request matches its description, then follows the steps inside. This works with OpenCode, Claude Code, Codex, and similar agents. There is no runtime and nothing to install.

## Why

Agent instructions usually live in one chat and disappear. These files are readable, editable, and version controlled. Copy one into a project, change a step, and everyone on the team gets the same workflow.

## Install

Copy the skills you want into your agent's skills directory. Common locations:

- OpenCode: `~/.config/opencode/skills/`
- Claude Code: `.claude/skills/` inside your repo
- Codex: your Codex skills directory

```sh
cp -R skills/code-review-brief ~/.config/opencode/skills/
```

Keep the directory name identical to the `name` field in `SKILL.md`. The checker enforces this.

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

## Check and scaffold

```sh
npm run check
npm test
npm run new -- my-skill "Does one thing. Use when ..."
```

`check` reads every file under `skills/`. It verifies the frontmatter, the directory name, the required sections, and that the README lists the skill. `new` copies the template into a fresh folder.

Node 20 or newer. No packages to install.

## Add your own

1. Run `npm run new -- <name> "<description>"`.
2. Fill in each section. Write the steps so another agent can follow them without reading anything else.
3. Add a row to the table above.
4. Run `npm run check` and `npm test`.

Keep one skill per workflow. Put longer examples in `references/` inside the skill folder if you need them.

## License

MIT. See [LICENSE](LICENSE).
