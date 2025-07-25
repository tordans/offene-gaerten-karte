// Shared types for the Offene Gärten project

export interface GardenDateRaw {
  raw: string;
  parsed: GardenDateParsed;
}

export interface GardenDateParsed {
  day: number;
  month: number;
  year?: number;
  startTime?: string; // '10:00'
  endTime?: string;   // '18:00'
}

export interface Garden {
  url: string;
  address: {
    raw: string;
    parsed?: string; // Optionally normalized
  };
  dates: GardenDateRaw[];
  lat?: number;
  lng?: number;
  [key: string]: any; // For extra raw/debug info
}

export type GardensJson = Garden[];
