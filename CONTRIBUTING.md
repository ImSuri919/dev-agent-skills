# Contributing

## Add a skill

```sh
npm run new -- my-skill "Does one thing. Use when ..."
```

Fill in every section of the generated `SKILL.md`, then:

1. Add the skill to the table in `README.md` and `README.hi.md`.
2. Add an entry to `skills.manifest.json` with a category, tags, triggers, and `related` hand-offs. Use one-way edges. Cycles fail CI.
3. Add a case to `evals/cases.json` with a prompt that should route to your skill and the output phrases it promises.
4. Run `npm run lock` to refresh the digest file.
5. Run `npm run verify`.

## Conventions

- Directory name and `name` field must match, in lowercase kebab-case.
- The `description` field says what the skill does and includes "Use when". Keep it under 300 characters.
- Include these sections in order: Purpose, When to use, Steps, Output format, Avoid, Example.
- Write steps as actions. Do not leave placeholders in a committed skill.
- One skill per workflow. If a skill keeps growing, split it.
- Anything that goes to another person is drafted for approval, never sent by the skill.

## Check locally

```sh
npm run verify
```

This runs the skill check, unit tests, lockfile check, eval cases, graph cycle check, and playground data build. GitHub Actions runs the same command. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before opening a pull request.
