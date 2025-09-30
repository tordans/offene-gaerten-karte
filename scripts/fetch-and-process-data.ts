import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Google Sheets configuration
const SHEET_ID = '1osuhw20aR0ZwlC-4MwKkO89vuxKqL-meSNXyRy5JHd4';
const GAERTEN_SHEET_GID = '0';
const DATEN_SHEET_GID = '1889715507';

type GardenFromSheets = {
  GARTEN_ID: string;
  WEBSITE_SLUG: string;
  LAT: string;
  LNG: string;
  ADRESSE: string;
};

type DateFromSheets = {
  GARTEN_ID: string;
  TAG: string;
  VON: string;
  BIS: string;
  NOTIZ: string;
};

type ProcessedGarden = {
  id: string;
  websiteSlug: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  dates: Array<{
    day: number;
    month: number;
    year?: number;
    startTime?: string;
    endTime?: string;
    note?: string;
  }>;
  errors?: string[];
};

function parseCSV(csvText: string) {
  const lines = csvText.split('\n');
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}


function parseDateFromSheets(dateData: DateFromSheets) {
  // Parse date from DATEN sheet format
  try {
    // Validate TAG field format
    if (!dateData.TAG || !/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateData.TAG)) {
      return null;
    }

    // Parse TAG field (DD.MM.YYYY format)
    const [day, month, year] = dateData.TAG.split('.').map(Number);

    // Validate parsed values
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31 || month < 1 || month > 12) return null;
    if (year < 2020 || year > 2030) return null;

    // Parse time fields (HH:MM format)
    const startTime = dateData.VON || '10:00';
    const endTime = dateData.BIS || '18:00';

    // Validate time formats
    if (dateData.VON && !/^\d{1,2}:\d{2}$/.test(dateData.VON)) return null;
    if (dateData.BIS && !/^\d{1,2}:\d{2}$/.test(dateData.BIS)) return null;

    return {
      day,
      month,
      year,
      startTime,
      endTime,
      note: dateData.NOTIZ || undefined
    };
  } catch {
    return null;
  }
}

function convertCoordinates(latStr: string, lngStr: string) {
  try {
    // Validate input format (should be like "528.544.129")
    if (!latStr || !lngStr) return null;

    // Check if the format contains dots (expected format)
    if (!latStr.includes('.') || !lngStr.includes('.')) return null;

    // Convert from format like "528.544.129" to "52.8544129"
    const lat = parseFloat(latStr.replace(/\./g, '')) / 10000000;
    const lng = parseFloat(lngStr.replace(/\./g, '')) / 10000000;

    if (isNaN(lat) || isNaN(lng)) return null;

    // Validate coordinate ranges (rough bounds for Germany/Berlin area)
    if (lat < 47 || lat > 55 || lng < 5 || lng > 15) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}

async function fetchCSV(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

async function fetchAndProcessData() {
  try {
    console.log('Fetching data from Google Sheets...');

    // Fetch both sheets
    const gaertenCSV = await fetchCSV(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GAERTEN_SHEET_GID}`);
    const datenCSV = await fetchCSV(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${DATEN_SHEET_GID}`);

    const gaertenData = parseCSV(gaertenCSV);
    const datenData = parseCSV(datenCSV);

    console.log(`Fetched ${gaertenData.length - 1} gardens from GAERTEN sheet`);
    console.log(`Fetched ${datenData.length - 1} dates from DATEN sheet`);

    // Create a map of dates by GARTEN_ID
    const datesByGardenId = new Map<string, DateFromSheets[]>();
    for (const [index, row] of datenData.entries()) {
      if (index === 0) continue; // Skip header row
      if (row.length < 5) continue;

      const dateEntry: DateFromSheets = {
        GARTEN_ID: row[0],
        TAG: row[1],
        VON: row[2],
        BIS: row[3],
        NOTIZ: row[4]
      };

      if (!datesByGardenId.has(dateEntry.GARTEN_ID)) {
        datesByGardenId.set(dateEntry.GARTEN_ID, []);
      }
      datesByGardenId.get(dateEntry.GARTEN_ID)!.push(dateEntry);
    }

    // Convert to app format
    const processedGardens: ProcessedGarden[] = [];

    for (const [index, row] of gaertenData.entries()) {
      if (index === 0) continue; // Skip header row
      if (row.length < 9) continue;

      const garden: GardenFromSheets = {
        GARTEN_ID: row[0],
        WEBSITE_SLUG: row[1],
        LAT: row[3],
        LNG: row[4],
        ADRESSE: row[7]
      };

      // Convert coordinates
      const coords = convertCoordinates(garden.LAT, garden.LNG);

      // Berlin center coordinates as fallback
      const BERLIN_CENTER = { lat: 52.5200, lng: 13.4050 };

      // Track errors
      const errors: string[] = [];

      // Validate coordinates
      if (!coords) {
        if (!garden.LAT || !garden.LNG) {
          errors.push("lat, lng fields are empty");
        } else if (!garden.LAT.includes('.') || !garden.LNG.includes('.')) {
          errors.push("lat, lng format invalid (expected format like 528.544.129)");
        } else {
          errors.push("lat, lng conversion failed, falling back to berlin");
        }
      }

      // Validate garden ID format
      if (!garden.GARTEN_ID || garden.GARTEN_ID.trim() === '') {
        errors.push("garden ID is empty or missing");
      }

      // Validate website slug format
      if (!garden.WEBSITE_SLUG || garden.WEBSITE_SLUG.trim() === '') {
        errors.push("website slug is empty or missing");
      }

      // Validate address format
      if (!garden.ADRESSE || garden.ADRESSE.trim() === '') {
        errors.push("address is empty or missing");
      }

      // Get dates for this garden from DATEN sheet
      const gardenDates = datesByGardenId.get(garden.GARTEN_ID) || [];
      const dates = gardenDates
        .map(dateEntry => parseDateFromSheets(dateEntry))
        .filter(date => date !== null);

      // Data consistency validation
      if (gardenDates.length === 0) {
        errors.push("no dates found in DATEN sheet");
      }

      // Check for invalid dates and track specific issues
      const invalidDates = gardenDates.filter(dateEntry => {
        const parsed = parseDateFromSheets(dateEntry);
        return parsed === null;
      });

      if (invalidDates.length > 0) {
        errors.push(`${invalidDates.length} invalid date entries found`);

        // Add specific error details for each invalid date
        invalidDates.forEach((dateEntry, index) => {
          if (!dateEntry.TAG || dateEntry.TAG.trim() === '') {
            errors.push(`date ${index + 1}: TAG field is empty`);
          } else if (!/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateEntry.TAG)) {
            errors.push(`date ${index + 1}: TAG format invalid (expected DD.MM.YYYY, got "${dateEntry.TAG}")`);
          }

          if (dateEntry.VON && !/^\d{1,2}:\d{2}$/.test(dateEntry.VON)) {
            errors.push(`date ${index + 1}: VON format invalid (expected HH:MM, got "${dateEntry.VON}")`);
          }

          if (dateEntry.BIS && !/^\d{1,2}:\d{2}$/.test(dateEntry.BIS)) {
            errors.push(`date ${index + 1}: BIS format invalid (expected HH:MM, got "${dateEntry.BIS}")`);
          }
        });
      }

      const processedGarden: ProcessedGarden = {
        id: garden.GARTEN_ID,
        websiteSlug: garden.WEBSITE_SLUG,
        address: garden.ADRESSE,
        coordinates: coords || BERLIN_CENTER,
        dates,
        ...(errors.length > 0 && { errors })
      };

      processedGardens.push(processedGarden);
    }

    // Save processed data to app directory
    const appOutputPath = join(__dirname, '../app/src/data/gardens-and-dates.json');
    writeFileSync(appOutputPath, JSON.stringify(processedGardens, null, 2), 'utf-8');

    // Save last updated timestamp
    const lastUpdated = new Date().toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    const lastUpdatedPath = join(__dirname, '../app/src/data/last-updated.json');
    writeFileSync(lastUpdatedPath, JSON.stringify({ lastUpdated }, null, 2), 'utf-8');

    // Summary statistics
    const gardensWithErrors = processedGardens.filter(garden => garden.errors && garden.errors.length > 0);
    const totalDates = processedGardens.reduce((sum, garden) => sum + garden.dates.length, 0);

    console.log(`Processed and saved ${processedGardens.length} gardens`);
    console.log(`Total dates: ${totalDates}`);
    console.log(`Gardens with errors: ${gardensWithErrors.length}`);
    console.log(`Data saved to: ${appOutputPath}`);

    if (gardensWithErrors.length > 0) {
      console.log('\nGardens with errors:');
      gardensWithErrors.forEach(garden => {
        console.log(`  Garden ${garden.id}: ${garden.errors?.join(', ')}`);
      });
    }

  } catch (error) {
    console.error('Error fetching and processing data:', error);
    process.exit(1);
  }
}

// Run the data fetching and processing
fetchAndProcessData();
