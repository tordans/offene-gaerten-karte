# Scrape Script

This script scrapes all garden pages from https://www.xn--offene-grten-ncb.de/gaerten-alphabetisch/ in three separate steps:

## Steps

1. **Fetch URLs**
   - Fetches all garden detail URLs from the main page and saves them to `../../data/garden-urls.json`.
   - Run:
     ```sh
     bun run scrape/scrape.ts fetch-urls
     ```

2. **Fetch Pages**
   - Downloads and caches each garden's HTML page to `../../data/cache/`, skipping already cached files.
   - Run:
     ```sh
     bun run scrape/scrape.ts fetch-pages
     ```

3. **Parse Pages**
   - Parses the cached HTML files and extracts relevant data (currently a stub, to be implemented).
   - Run:
     ```sh
     bun run scrape/scrape.ts parse-pages
     ```

## Notes
- You can run each step independently.
- The script always respects the cache and will not re-download pages unless you delete them from the cache folder.
- Parsing logic can be extended in `parse-pages` step.
