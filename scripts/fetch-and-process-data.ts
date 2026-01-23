import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  TERMIN_TYP,
  terminTypSchema,
  dateSchema,
  gardenSchema,
  gardensJsonSchema,
  type Garden,
  type GardenDate,
} from './schemas.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Google Sheets configuration
const SHEET_ID = '1osuhw20aR0ZwlC-4MwKkO89vuxKqL-meSNXyRy5JHd4';
const GAERTEN_SHEET_GID = '0';
const DATEN_SHEET_GID = '1889715507';

// Raw sheet types
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
  STATUS?: string;
};

function findColumnIndices(headers: string[], columnNames: string[]): Record<string, number> {
  const indices: Record<string, number> = {};
  columnNames.forEach(name => {
    indices[name] = headers.findIndex(header => header === name);
  });
  return indices;
}

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


function parseDateFromSheets(dateData: DateFromSheets): GardenDate | null {
  try {
    // Validate TAG field format (DD.MM.YYYY)
    if (!dateData.TAG || !/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateData.TAG)) {
      return null;
    }

    // Parse TAG field
    const [day, month, year] = dateData.TAG.split('.').map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;

    // Validate and parse times
    const startTime = dateData.VON || '10:00';
    const endTime = dateData.BIS || '18:00';

    // terminTyp is already validated during initial parsing, use it directly
    const terminTyp = dateData.STATUS || TERMIN_TYP.REGELTERMIN;

    // Validate with Zod schema
    const parsed = dateSchema.safeParse({
      day,
      month,
      year,
      startTime: dateData.VON ? startTime : undefined,
      endTime: dateData.BIS ? endTime : undefined,
      note: dateData.NOTIZ || undefined,
      terminTyp,
    });

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function convertCoordinates(latStr: string, lngStr: string) {
  try {
    if (!latStr || !lngStr) return null;

    // Germany bounds with buffer (lat: ~47-55, lng: ~6-15, buffered to 46-56, 5-16)
    const GERMANY_LAT_MIN = 46;
    const GERMANY_LAT_MAX = 56;
    const GERMANY_LNG_MIN = 5;
    const GERMANY_LNG_MAX = 16;

    // Parse decimal format (e.g., "53.4105003", "13.5593833")
    const lat = parseFloat(latStr.trim());
    const lng = parseFloat(lngStr.trim());

    // Validate parsing succeeded
    if (isNaN(lat) || isNaN(lng)) return null;

    // Validate coordinate ranges (buffered bounds for Germany)
    // GeoJSON uses [longitude, latitude] order, but we store as {lat, lng}
    if (lat < GERMANY_LAT_MIN || lat > GERMANY_LAT_MAX || lng < GERMANY_LNG_MIN || lng > GERMANY_LNG_MAX) return null;

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

    // Find column indices for date data (explicit allow list)
    const datenHeaders = datenData[0] || [];
    const datenIndices = findColumnIndices(datenHeaders, ['GARTEN_ID', 'TAG', 'VON', 'BIS', 'NOTIZ', 'STATUS']);

    console.log('Date sheet column mapping:', datenIndices);

    for (const [index, row] of datenData.entries()) {
      if (index === 0) continue; // Skip header row
      if (row.length < Math.max(...Object.values(datenIndices)) + 1) continue;

      // Validate and parse STATUS field with Zod schema
      const rawStatus = row[datenIndices.STATUS]?.trim() || TERMIN_TYP.REGELTERMIN;
      const statusValidation = terminTypSchema.safeParse(rawStatus);
      const validatedStatus = statusValidation.success 
        ? statusValidation.data 
        : TERMIN_TYP.REGELTERMIN; // Default to Regeltermin if invalid

      const dateEntry: DateFromSheets = {
        GARTEN_ID: row[datenIndices.GARTEN_ID] || '',
        TAG: row[datenIndices.TAG] || '',
        VON: row[datenIndices.VON] || '',
        BIS: row[datenIndices.BIS] || '',
        NOTIZ: row[datenIndices.NOTIZ] || '',
        STATUS: validatedStatus
      };

      if (!datesByGardenId.has(dateEntry.GARTEN_ID)) {
        datesByGardenId.set(dateEntry.GARTEN_ID, []);
      }
      datesByGardenId.get(dateEntry.GARTEN_ID)!.push(dateEntry);
    }

    // Convert to app format
    const processedGardens: Garden[] = [];

    // Find column indices for garden data (explicit allow list)
    const gaertenHeaders = gaertenData[0] || [];
    const gaertenIndices = findColumnIndices(gaertenHeaders, ['GARTEN_ID', 'WEBSITE_SLUG', 'LAT', 'LNG', 'ADRESSE']);

    console.log('Garden sheet column mapping:', gaertenIndices);

    for (const [index, row] of gaertenData.entries()) {
      if (index === 0) continue; // Skip header row
      if (row.length < Math.max(...Object.values(gaertenIndices)) + 1) continue;

      const garden: GardenFromSheets = {
        GARTEN_ID: row[gaertenIndices.GARTEN_ID] || '',
        WEBSITE_SLUG: row[gaertenIndices.WEBSITE_SLUG] || '',
        LAT: row[gaertenIndices.LAT] || '',
        LNG: row[gaertenIndices.LNG] || '',
        ADRESSE: row[gaertenIndices.ADRESSE] || ''
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
        } else {
          const latNum = parseFloat(garden.LAT.trim());
          const lngNum = parseFloat(garden.LNG.trim());
          if (isNaN(latNum) || isNaN(lngNum)) {
            errors.push("lat, lng format invalid (expected decimal format like 53.4105003, 13.5593833)");
          } else {
            errors.push("lat, lng conversion failed or out of range, falling back to berlin");
          }
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

      const processedGarden = {
        id: garden.GARTEN_ID,
        websiteSlug: garden.WEBSITE_SLUG,
        address: garden.ADRESSE,
        coordinates: coords || BERLIN_CENTER,
        dates,
        ...(errors.length > 0 && { errors })
      };

      // Validate with Zod schema - only include valid gardens
      const validated = gardenSchema.safeParse(processedGarden);
      if (validated.success) {
        processedGardens.push(validated.data);
      }
      // Invalid gardens (e.g., empty IDs) are excluded from output
    }

    // Validate final output with Zod (already validated individually, but double-check)
    const validationResult = gardensJsonSchema.safeParse(processedGardens);
    if (!validationResult.success) {
      console.error('Final validation failed:', validationResult.error.issues);
      // Still save the data, but log the errors
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
