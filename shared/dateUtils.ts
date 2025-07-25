// Utility to parse German date strings like '11. Mai 10-18 Uhr'
import { GardenDateParsed } from './types';

const MONTHS: Record<string, number> = {
  'januar': 1,
  'februar': 2,
  'märz': 3,
  'april': 4,
  'mai': 5,
  'juni': 6,
  'juli': 7,
  'august': 8,
  'september': 9,
  'oktober': 10,
  'november': 11,
  'dezember': 12,
};

export function parseGermanDateString(raw: string): GardenDateParsed | null {
  // Example: '11. Mai 10-18 Uhr'
  const dateRegex = /([0-9]{1,2})\.\s*([A-Za-zäöüÄÖÜ]+)(?:\s+([0-9]{1,2})-(?:([0-9]{1,2}))?\s*Uhr)?/i;
  const match = raw.match(dateRegex);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const monthName = match[2].toLowerCase();
  const month = MONTHS[monthName];
  let startTime: string | undefined;
  let endTime: string | undefined;
  if (match[3]) {
    startTime = `${match[3].padStart(2, '0')}:00`;
    if (match[4]) {
      endTime = `${match[4].padStart(2, '0')}:00`;
    }
  }
  return { day, month, startTime, endTime };
}
