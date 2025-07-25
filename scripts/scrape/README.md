# Scrape Script

This script scrapes all garden pages from https://www.xn--offene-grten-ncb.de/gaerten-alphabetisch/ and extracts:
- URL
- Address (from iframe title)
- Dates (raw and parsed)

## Usage

1. Install dependencies:
   ```sh
   bun install
   ```
2. Run the script:
   ```sh
   bun run scrape.ts
   ```

The output is written to `../../data/gardens.json`.

You can rerun the script to update or add missing data. Already-scraped gardens are cached.
