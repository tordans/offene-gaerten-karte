import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import type { GardensJson } from '../../shared/types';

const DATA_PATH = join(import.meta.dir, '../../data/gardens-parsed.json');
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

async function geocode(address: string): Promise<{ lat: number; lon: number } | null> {
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'offene-gaerten-scraper/1.0' } });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

async function main() {
  const raw = await readFile(DATA_PATH, 'utf-8');
  const gardens: GardensJson = JSON.parse(raw);
  let updated = false;
  for (const garden of gardens) {
    if (garden.lat && garden.lng) continue;
    const address = garden.address.raw;
    if (!address) continue;
    try {
      const geo = await geocode(address);
      if (geo) {
        garden.lat = geo.lat;
        garden.lng = geo.lon;
        garden._geocodedAt = new Date().toISOString();
        updated = true;
        console.log(`Geocoded: ${address} -> ${geo.lat},${geo.lon}`);
      } else {
        console.warn(`No geocode result for: ${address} (${garden.url})`);
      }
    } catch (e) {
      console.error(`Failed to geocode ${address}:`, e);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  if (updated) {
    await writeFile(DATA_PATH, JSON.stringify(gardens, null, 2), 'utf-8');
    console.log('Updated gardens-parsed.json');
  } else {
    console.log('No updates needed.');
  }
}

main();
