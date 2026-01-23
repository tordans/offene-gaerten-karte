import { ArrowTopRightOnSquareIcon, HeartIcon, HomeModernIcon } from '@heroicons/react/24/solid'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
import { useFavoritesFeatureEnabled } from './stores/useFavoritesFeatureState'
import type { Garden } from './types'

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
    <div className="p-2">
      <h3 className="mb-1 font-semibold text-sm">{garden.address}</h3>
      <div className="mb-2 space-y-1 text-gray-600 text-xs">
        {favoritesFeatureEnabled && (
          <button
            type="button"
            onClick={() => garden.id && toggleFavorite(garden.id)}
            className="flex cursor-pointer items-center gap-1 text-xs text-blue-600 block hover:underline"
          >
            <HeartIcon className="size-3 text-black" />
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
      <div className="text-xs">
        <strong>Öffnungszeiten:</strong>
        <ul className="mt-1 space-y-2">
          {garden.dates.map((date) => {
            const { formatted, relative } = formatDate(date)

            // Check if this date matches the current filter
            const matchesFilter = selectedMonth
              ? date.month === selectedMonth && (selectedDay === null || date.day === selectedDay)
              : false

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
                className={`text-gray-700 ${
                  matchesFilter ? 'border-amber-500 border-l-4 bg-amber-50 pl-2' : ''
                }`}
              >
                <div className="font-medium">{formatted}</div>
                {date.startTime && date.endTime && (
                  <div className="text-gray-600">
                    {date.startTime}-{date.endTime}
                  </div>
                )}
                <div className="text-gray-500 text-xs">{relative}</div>
                {date.note && <div className="text-gray-500 text-xs">{date.note}</div>}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
