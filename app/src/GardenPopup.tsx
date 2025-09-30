import { ArrowTopRightOnSquareIcon, HeartIcon, HomeModernIcon } from '@heroicons/react/24/solid'
import { formatDistanceToNow } from 'date-fns'
import { de } from 'date-fns/locale'
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
      <h3 className="mb-1 text-sm font-semibold">{garden.address}</h3>
      <div className="mb-2 space-y-1 text-xs text-gray-600">
        <button
          onClick={() => garden.id && toggleFavorite(garden.id)}
          className={`flex items-center gap-1 text-xs ${garden.id && isFavorite(garden.id) ? 'text-amber-600' : 'text-blue-600'} block hover:underline`}
        >
          <HeartIcon className="h-3 w-3" />
          {garden.id && isFavorite(garden.id)
            ? 'Aus Favoriten entfernen'
            : 'Zu Favoriten hinzufügen'}
        </button>
        <a
          href={`https://www.xn--offene-grten-ncb.de/${garden.websiteSlug}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <ArrowTopRightOnSquareIcon className="h-3 w-3" />
          Website öffnen
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(garden.address)}&travelmode=transit`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <HomeModernIcon className="h-3 w-3" />
          Route berechnen (ÖPNV)
        </a>
      </div>
      <div className="text-xs">
        <strong>Öffnungszeiten:</strong>
        <ul className="mt-1 space-y-2">
          {garden.dates.map((date, index) => {
            const { formatted, relative } = formatDate(date)

            // Check if this date matches the current filter
            const matchesFilter = selectedMonth
              ? date.month === selectedMonth && (selectedDay === null || date.day === selectedDay)
              : false

            return (
              <li
                key={index}
                className={`text-gray-700 ${
                  matchesFilter ? 'border-l-4 border-amber-500 bg-amber-50 pl-2' : ''
                }`}
              >
                <div className="font-medium">{formatted}</div>
                {date.startTime && date.endTime && (
                  <div className="text-gray-600">
                    {date.startTime}-{date.endTime}
                  </div>
                )}
                <div className="text-xs text-gray-500">{relative}</div>
                {date.note && <div className="text-xs text-gray-500">{date.note}</div>}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
