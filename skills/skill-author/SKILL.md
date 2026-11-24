---
name: skill-author
description: Write a new agent skill that works on its own and triggers on the right requests. Use when saving a repeated workflow as a skill or updating one that is unclear.
---

# skill-author

## Purpose

Produce a single skill file an agent can follow without asking what you meant.

## When to use

- A workflow has been repeated enough times to save it.
- An existing skill fires on the wrong requests or gives inconsistent answers.
- Turning a team convention into something agents can reuse.

## Steps

1. Describe the workflow in one sentence: what it produces, and the words a person would say to ask for it.
2. Check the available skills first. If one covers the workflow, improve it instead of adding a twin.
3. Write the name in lowercase kebab-case and keep the directory name identical.
4. Write the description as what the skill does plus "Use when" and the trigger words. Keep it under 300 characters.
5. Fill in the sections in this order: Purpose, When to use, Steps, Output format, Avoid, Example.
6. Write steps as actions an agent can take. Name the order, the inputs, and the stopping condition.
7. Give the exact output shape, including headings or columns the answer must contain.
8. Put anything long in a `references/` file inside the skill folder and link to it from the relevant step.
9. Test the skill once on a real request. Edit the step that produced the wrong answer, then test again.

## Output format

A `SKILL.md` file with frontmatter (`name`, `description`) and the six sections above, followed by a one paragraph note on the test request and the result.

## Avoid

- Leaving placeholders such as TODO in a finished skill.
- Writing a description that lists steps instead of triggers.
- Depending on a tool or file the agent will not have when the skill runs.

## Example

name: api-contract
description: Pin down the request, response, and error shape of an endpoint before code is written. Use when designing or changing an HTTP API.

Test request: "We need an endpoint to export orders." The skill produced a contract with failure bodies and an open question about pagination. Kept as written.
