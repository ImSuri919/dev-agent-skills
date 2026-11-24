---
name: seo-basics
description: Run a first-pass technical SEO check on a site and rank the fixes by likely impact. Use when a site needs more organic traffic or an SEO issue was reported.
---

# seo-basics

## Purpose

Find the small number of crawl, index, and page issues most likely to block organic traffic, with evidence for each.

## When to use

- A site is not getting the organic traffic it expects.
- A launch or migration changed URLs.
- Someone asks for a quick SEO check before a deeper audit.

## Steps

1. Record the site URL, the market, and the main conversion page.
2. Check `robots.txt` and `sitemap.xml`. Verify the sitemap is referenced, returns 200, and lists canonical URLs.
3. Check that important pages are indexable: no `noindex`, no redirect to a different URL, and one self referencing canonical each.
4. Sample five important pages. Check the title, meta description, H1, and whether the page answers one clear query.
5. Check internal links to those pages. A page with no links from the site is a finding.
6. Check HTTPS, one preferred host, and mobile rendering. Note mixed content and broken redirects.
7. Check Core Web Vitals field data if available. Name the page and the metric, not a lab score alone.
8. Check Search Console for coverage errors and queries with impressions but low clicks when you have access.
9. Rank findings by: blocks indexing, affects many pages, affects the main conversion page, then everything else.

## Output format

A short summary of scope, then a table with four columns: finding, evidence, impact, fix. Sort by impact. End with Open questions for anything you could not verify.

## Avoid

- Reporting a missing meta description as a critical issue.
- Guessing at rankings without search data.
- Listing dozens of small fixes without naming the one that blocks crawling.

## Example

| Finding | Evidence | Impact | Fix |
| --- | --- | --- | --- |
| Staging host indexable | robots.txt allows it, pages have no canonical | High | Add noindex and canonical to production host |
| Product pages orphaned | No internal links found in navigation or sitemap | High | Add links from category pages |

Open questions: Search Console access not provided, so query data was not checked.
