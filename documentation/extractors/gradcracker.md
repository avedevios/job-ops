# Gradcracker Scraper (How It Works)

This is a plain-English walkthrough of the Gradcracker extractor in `extractors/gradcracker`.

## Big picture

The scraper builds a list of Gradcracker search URLs, visits each list page, extracts job cards, then opens each job?s detail page to grab the full description and the external application link.

## 1) Build search URLs

- It starts with a fixed set of UK regions (e.g. London & South East, West Midlands, South West).
- It uses default role terms like `web-development` and `software-systems`.
- If you set `GRADCRACKER_SEARCH_TERMS`, those replace the defaults (JSON array of strings).
- Every role is combined with every location to form a Gradcracker search URL, sorted by newest first.

## 2) Crawl list pages

On each list page it:

- Waits for the job cards to load (`article[wire:key]`).
- Scrapes basic fields from each card: title, employer, employer URL, discipline, deadline, salary, location, degree required, and start date.
- Queues each job?s detail page for deeper scraping.

Optional controls:

- `GRADCRACKER_MAX_JOBS_PER_TERM` caps how many jobs are queued per role term.
- `JOBOPS_SKIP_APPLY_FOR_EXISTING=1` and `JOBOPS_EXISTING_JOB_URLS` (or `JOBOPS_EXISTING_JOB_URLS_FILE`) let it skip jobs you already know about.

## 3) Crawl job detail pages

On each job page it:

- Waits for the main content block (`.body-content`).
- Saves the full description text.
- Looks for the Apply button and clicks it to capture the final application URL.
  - Handles both popup windows and same-tab redirects.
  - Waits for the URL to stabilize before recording it.
- Skips the Apply click if the job is already known (same env rules as above).

## 4) Progress reporting (optional)

If `JOBOPS_EMIT_PROGRESS=1` is set, the extractor prints structured progress lines that the orchestrator can stream into the UI.

## Notes

- The crawler runs with Playwright + Crawlee, launched through Camoufox to look more like a real browser.
- Concurrency is kept low (1 or 2) and timeouts are generous to reduce flakiness.
