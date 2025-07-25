export type GardenDateRaw = {
  raw: string;
  parsed: GardenDateParsed;
};

export type GardenDateParsed = {
  day: number;
  month: number;
  year?: number;
  startTime?: string; // '10:00'
  endTime?: string;   // '18:00'
};

export type Garden = {
  url: string;
  address: {
    raw: string;
    parsed?: string; // Optionally normalized
  };
  dates: GardenDateRaw[];
  lat?: number;
  lng?: number;
  _parsedAt?: string;
  _id: string;
  _geocodedAt?: string;
  [key: string]: any; // For extra raw/debug info
};

export type GardensJson = Garden[];
