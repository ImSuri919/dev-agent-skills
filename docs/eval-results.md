# Skill routing and contract results

14/14 cases passed | 11/11 skills covered

Each case sends a prompt through the same router used by the MCP server, then checks that the winning skill contains the output phrases it promises.

| Case | Prompt | Expected | Routed to | Result |
| --- | --- | --- | --- | --- |
| review-01 | Please review this PR before we merge it. | code-review-brief | code-review-brief | pass |
| tests-01 | Add tests for the new coupon flow. | test-plan | test-plan | pass |
| perf-01 | The site is slow on the report page. | perf-triage | perf-triage | pass |
| a11y-01 | Check accessibility of the new dialog. | a11y-focus-check | a11y-focus-check | pass |
| release-01 | Write release notes for version 2.5.0. | release-notes | release-notes | pass |
| debug-01 | We have a production error spike since this morning. | debug-triage | debug-triage | pass |
| api-01 | Design an endpoint for exporting orders. | api-contract | api-contract | pass |
| docs-01 | Write a readme for this package. | docs-writer | docs-writer | pass |
| refactor-01 | Simplify this PR and remove dead code. | refactor-simplify | refactor-simplify | pass |
| skill-01 | Write a skill for our deploy checklist. | skill-author | skill-author | pass |
| seo-01 | Technical SEO check for our marketing site. | seo-basics | seo-basics | pass |
| review-02 | Review a diff that adds tests. | code-review-brief | code-review-brief | pass |
| docs-02 | Write a setup guide for contributors. | docs-writer | docs-writer | pass |
| a11y-02 | There is no focus ring when I use keyboard navigation. | a11y-focus-check | a11y-focus-check | pass |

This is a structural check. It does not run a language model and does not measure answer quality.
