# Contributing

## Add a skill

```sh
npm run new -- my-skill "Does one thing. Use when ..."
```

Fill in every section of the generated `SKILL.md`. Then add the skill to the table in `README.md` and run `npm run check` and `npm test`.

## Conventions

- Directory name and `name` field must match, in kebab-case.
- The `description` field says what the skill does and starts the trigger with "Use when". Keep it under 300 characters.
- Include these sections in order: Purpose, When to use, Steps, Output format, Avoid, Example.
- Write steps as actions. Do not leave `[TODO]` or template placeholders in a committed skill.
- One skill per workflow. If a skill keeps growing, split it.
- Anything that goes to another person (a PR comment, a release note, an email) is drafted for the user to approve, never sent by the skill.

## Check locally

```sh
npm run check
npm test
```

GitHub Actions runs both on every push and pull request. Keep the wording plain and specific. Prefer a concrete example over a claim about best practices.
