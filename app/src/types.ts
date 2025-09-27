export type GardenDate = {
  day: number;
  month: number;
  year?: number;
  startTime?: string; // '10:00'
  endTime?: string;   // '18:00'
};

export type Garden = {
  id: string;
  websiteSlug: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  dates: GardenDate[];
  errors?: string[];
};

export type GardensJson = Garden[];
