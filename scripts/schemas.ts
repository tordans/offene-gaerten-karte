import { z } from 'zod'

// Termin type constants
export const TERMIN_TYP = {
  REGELTERMIN: 'Regeltermin',
  ABGESAGT: 'Abgesagt',
  ZUSATZTERMIN: 'Zusatztermin',
  TERMINVERSCHIEBUNG: 'Terminverschiebung',
} as const

// Zod schemas
export const terminTypSchema = z.enum([
  TERMIN_TYP.REGELTERMIN,
  TERMIN_TYP.ABGESAGT,
  TERMIN_TYP.ZUSATZTERMIN,
  TERMIN_TYP.TERMINVERSCHIEBUNG,
])

export const timeSchema = z.string().refine(
  (val) => {
    const match = val.match(/^(\d{1,2}):(\d{2})$/)
    if (!match) return false
    const hours = parseInt(match[1], 10)
    const minutes = parseInt(match[2], 10)
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
  },
  { message: 'Time must be in HH:MM format (00:00 to 23:59)' },
)

export const dateSchema = z.object({
  day: z.number().int().min(1).max(31),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2030).optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  note: z.string().optional(),
  terminTyp: terminTypSchema.default(TERMIN_TYP.REGELTERMIN),
})

export const coordinatesSchema = z.object({
  lat: z.number().min(46).max(56), // Germany bounds with buffer
  lng: z.number().min(5).max(16), // Germany bounds with buffer
})

export const gardenSchema = z.object({
  id: z.string().min(1),
  websiteSlug: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  coordinates: coordinatesSchema,
  dates: z.array(dateSchema),
  errors: z.array(z.string()).optional(),
})

export const gardensJsonSchema = z.array(gardenSchema)

// Types derived from Zod schemas
export type TerminTyp = z.infer<typeof terminTypSchema>
export type GardenDate = z.infer<typeof dateSchema>
export type Garden = z.infer<typeof gardenSchema>
export type GardensJson = z.infer<typeof gardensJsonSchema>
