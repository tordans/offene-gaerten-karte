// Background layer options
export const BACKGROUND_OPTIONS = {
  standard: 'standard',
  aerial: 'aerial',
} as const;

export type BackgroundOption = keyof typeof BACKGROUND_OPTIONS;
