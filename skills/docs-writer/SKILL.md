---
name: docs-writer
description: Write a README or guide that lets a reader finish a task. Use when adding user-facing technical docs, examples, or setup instructions.
---

# docs-writer

## Purpose

Produce documentation that answers the reader's next question, with commands that work when copied.

## When to use

- Writing or rewriting a README, setup guide, or how-to.
- Adding docs for a feature people will use without help.
- A doc was reported as confusing or outdated.

## Steps

1. Name the reader and the task in one sentence. Example: a new backend developer running the project locally.
2. List what the reader needs before starting: versions, accounts, access, files.
3. Write the shortest path to a working result. Put the copyable command block early.
4. Explain what the successful result looks like so the reader can tell it worked.
5. Add the options people actually change, each with the reason to change it.
6. Add the two or three failures you expect, with the fix under each.
7. Remove any section that does not help the reader finish the task. Move deep reference material to a linked page.
8. Run every command in the doc once. Replace placeholders with real values.

## Output format

A title, one paragraph naming the task, then these sections in order: Before you start, Quick start, Verify, Options, Troubleshooting, Next. Keep headings short.

## Avoid

- Opening with a product history instead of the task.
- Feature lists with no path to a working command.
- Placeholder commands no one can run.

## Example

# Run the reporting API locally

Start the API and check that `/health` responds before you work on the report routes.

## Before you start
Node 22 and a local Postgres on port 5432.

## Quick start
cp .env.example .env
npm install
npm run dev

## Verify
curl http://localhost:3000/health
Expect {"status":"ok"}.
