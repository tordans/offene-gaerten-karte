# Data Fetching Scripts

Scripts for fetching and processing garden data from Google Sheets.

## Usage

### Local Development
```bash
cd scripts
npm install
npm run fetch-data
```

### GitHub Actions
The data fetching is automated via GitHub Actions:
- **Manual Trigger**: Go to Actions tab → "Deploy static content to Pages" → "Run workflow"
- **Automatic**: Triggers on pushes to main branch
