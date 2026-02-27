import {
  ArrowTopRightOnSquareIcon,
  HeartIcon,
  HomeModernIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import type { Garden, TerminTyp } from '../../scripts/schemas.ts'
import { TERMIN_TYP } from '../../scripts/schemas.ts'
import { useFavoritesFeatureEnabled } from './stores/useFavoritesFeatureState'

type GardenPopupProps = {
  garden: Garden
  isFavorite: (gardenId: string) => boolean
  toggleFavorite: (gardenId: string) => void
  selectedMonth?: number | null
  selectedDay?: number | null
}

export default function GardenPopup({
  garden,
  isFavorite,
  toggleFavorite,
  selectedMonth,
  selectedDay,
}: GardenPopupProps) {
  const favoritesFeatureEnabled = useFavoritesFeatureEnabled()

  // Helper function to format dates
  const formatDate = (date: {
    day: number
    month: number
    year?: number
    startTime?: string
    endTime?: string
    note?: string
    terminTyp: string
  }) => {
    const year = date.year || new Date().getFullYear()
    const parsed = { day: date.day, month: date.month, year }
    const dateObj = new Date(year, parsed.month - 1, parsed.day)
    const formatted = dateObj.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const relative = formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: de,
    })
    return { formatted, relative }
  }

  return (
    <section className="-mx-2.5 -mt-4">
      <header className="bg-gray-200 px-2.5 py-4">
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-gray-700 px-2 py-0.5 font-medium text-white text-xs">
            {garden.id}
          </span>
          <h1 className="font-semibold text-sm">{garden.name}</h1>
        </div>
        <p className="mt-1 text-gray-600 text-xs">{garden.address}</p>
      </header>
      <div className="px-2.5 py-3">
        <div className="mb-2 space-y-1 text-gray-600 text-xs">
          {favoritesFeatureEnabled && (
            <button
              type="button"
              onClick={() => garden.id && toggleFavorite(garden.id)}
              className="flex cursor-pointer items-center gap-1 text-blue-600 text-xs hover:underline"
            >
              <HeartIcon className="size-3 text-red-600" />
              {garden.id && isFavorite(garden.id)
                ? 'Aus Favoriten entfernen'
                : 'Zu Favoriten hinzufügen'}
            </button>
          )}
          <a
            href={`https://www.xn--offene-grten-ncb.de/${garden.websiteSlug}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ArrowTopRightOnSquareIcon className="size-3" />
            Website öffnen
          </a>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(garden.address)}&travelmode=transit`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <HomeModernIcon className="size-3" />
            Route berechnen (ÖPNV)
          </a>
        </div>
        <hr className="my-2 border-gray-300" />
        <div className="text-xs">
          <strong>Öffnungszeiten:</strong>
          <ul className="mt-1 space-y-2">
            {garden.dates.map((date) => {
              const { formatted, relative } = formatDate(date)

              // Check if this date matches the current filter
              const matchesFilter = selectedMonth
                ? date.month === selectedMonth && (selectedDay === null || date.day === selectedDay)
                : false

              // Determine styling based on terminTyp
              const terminTyp = date.terminTyp
              const isAbgesagt =
                terminTyp === TERMIN_TYP.ABGESAGT || terminTyp === TERMIN_TYP.TERMINVERSCHIEBUNG
              const isZusatztermin = terminTyp === TERMIN_TYP.ZUSATZTERMIN

              // Get label text for non-Regeltermin entries
              const terminLabels: Record<TerminTyp, string | null> = {
                [TERMIN_TYP.REGELTERMIN]: null,
                [TERMIN_TYP.ABGESAGT]: 'Termin abgesagt',
                [TERMIN_TYP.ZUSATZTERMIN]: 'Zusatztermin',
                [TERMIN_TYP.TERMINVERSCHIEBUNG]: 'Termin verschoben',
              }
              const terminLabel = terminLabels[terminTyp]

              return (
                <li
                  key={[
                    garden.id,
                    date.year,
                    date.month,
                    date.day,
                    date.startTime,
                    date.endTime,
                  ].join('-')}
                  className={`${matchesFilter ? 'border-amber-500 border-l-4 bg-amber-50 pl-2' : ''}`}
                >
                  <div
                    className={`font-medium ${
                      isAbgesagt
                        ? 'text-red-700 line-through'
                        : isZusatztermin
                          ? 'text-green-700'
                          : 'text-gray-700'
                    }`}
                  >
                    {formatted}
                  </div>
                  {date.startTime && date.endTime && (
                    <div
                      className={`${
                        isAbgesagt
                          ? 'text-red-700 line-through'
                          : isZusatztermin
                            ? 'text-green-700'
                            : 'text-gray-600'
                      }`}
                    >
                      {date.startTime}-{date.endTime}
                    </div>
                  )}
                  <div
                    className={`text-xs ${
                      isAbgesagt
                        ? 'text-red-700 line-through'
                        : isZusatztermin
                          ? 'text-green-700'
                          : 'text-gray-500'
                    }`}
                  >
                    {relative}
                  </div>
                  {terminLabel && (
                    <div
                      className={`flex items-center gap-1 font-medium text-xs ${
                        isAbgesagt ? 'text-red-700' : 'text-green-700'
                      }`}
                    >
                      <InformationCircleIcon className="size-3" />
                      {terminLabel}
                    </div>
                  )}
                  {date.note && (
                    <div
                      className={`text-xs ${
                        isAbgesagt
                          ? 'text-red-700 line-through'
                          : isZusatztermin
                            ? 'text-green-700'
                            : 'text-gray-500'
                      }`}
                    >
                      {date.note}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
