---
name: a11y-focus-check
description: Check keyboard access and visible focus in a UI before calling it done. Use when reviewing a screen, a component, or an accessibility change.
---

# a11y-focus-check

## Purpose

Find the keyboard and focus problems a person hits immediately, with enough detail to fix each one.

## When to use

- Reviewing a new screen, dialog, menu, or form.
- A component handles clicks but has no keyboard path.
- An accessibility bug was reported and you need to verify the fix.

## Steps

1. Put the mouse away. Load the page and press Tab from the top.
2. Record the order focus visits. It should follow the visual reading order.
3. At each stop, check that the focus indicator is visible against the background. A removed outline with no replacement is a finding.
4. Try Enter and Space on buttons and links. Try arrow keys where a widget uses them.
5. Open each dialog and menu. Check that focus moves into it, stays inside it, and returns to the trigger on close.
6. Check that form fields have persistent labels and that errors are announced near the field.
7. Check that nothing important is reachable only by hover.
8. Record the element, the step to reproduce, and the specific fix for each finding.

## Output format

A table with four columns: element, how to reproduce, problem, fix. Sort by severity. Under the table, write one line stating what you checked and found clean.

## Avoid

- Running a scanner and reporting its score as the result.
- Listing generic advice such as "improve contrast" without naming the element.
- Assuming a library handles dialogs correctly without trying Tab and Escape.

## Example

| Element | Reproduce | Problem | Fix |
| --- | --- | --- | --- |
| Save button | Tab to button | No visible focus ring | Add a :focus-visible outline with 3:1 contrast |
| Filter dialog | Open, press Tab 8 times | Focus leaves dialog | Trap focus inside the dialog |

Checked clean: tab order in the header, Escape closes the filter dialog, all inputs have labels.
