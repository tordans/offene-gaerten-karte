# Geocode Script

This script reads `../../data/gardens.json` and geocodes missing lat/lng using the Nominatim API.

- Adds a 1-second delay between requests to respect rate limits.
- Updates the JSON in place.
- Allows manual editing of coordinates if needed.

## Usage

1. Install dependencies:
   ```sh
   bun install
   ```
2. Run the script:
   ```sh
   bun run geocode.ts
   ```

You can rerun the script to fill in missing coordinates.
