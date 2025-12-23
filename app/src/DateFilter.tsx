import { parseAsInteger, useQueryState } from 'nuqs'
import { useFavoritesOnly } from './stores/useFavoritesOnlyState'
import type { Garden } from './types'

type DateFilterProps = {
  gardens: Garden[]
}

export default function DateFilter({ gardens }: DateFilterProps) {
  const [selectedMonth, setSelectedMonth] = useQueryState('month', parseAsInteger)
  const [selectedDay, setSelectedDay] = useQueryState('day', parseAsInteger)
  const [, setFavoritesOnly] = useFavoritesOnly()

  // Calculate month counts
  const monthCounts = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    return {
      month,
      count: gardens.filter((garden) => garden.dates.some((date) => date.month === month)).length,
    }
  })

  // Get available days for selected month with counts
  const availableDays = selectedMonth
    ? Array.from(
        new Set(
          gardens
            .flatMap((garden) => garden.dates)
            .filter((date) => date.month === selectedMonth)
            .map((date) => date.day),
        ),
      )
        .sort((a, b) => a - b)
        .map((day) => ({
          day,
          count: gardens.filter((garden) =>
            garden.dates.some((date) => date.month === selectedMonth && date.day === day),
          ).length,
        }))
    : []

  // German month names
  const monthNames = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ]

  // Helper function to get weekday name for a specific day
  const getWeekdayName = (day: number, month: number, year?: number) => {
    const date = new Date(year || new Date().getFullYear(), month - 1, day)
    return date.toLocaleDateString('de-DE', { weekday: 'short' })
  }

  return (
    <div className="mb-6 border-red-800 border-b pb-4">
      <h2 className="mb-3 font-semibold text-lg text-red-700">Nach Datum filtern</h2>
      <div className="space-y-2">
        {/* All Gardens Option */}
        <button
          type="button"
          onClick={() => {
            setSelectedMonth(null)
            setSelectedDay(null)
            setFavoritesOnly(false)
          }}
          className={`flex w-full cursor-pointer items-center justify-between rounded px-3 py-2 text-left ${
            selectedMonth === null
              ? 'bg-amber-400 text-amber-900'
              : 'bg-amber-50 hover:bg-amber-200'
          }`}
        >
          <span>Alle Gärten</span>
          <span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-900 text-xs">
            {gardens.length}
          </span>
        </button>

        {/* Month Options */}
        {monthCounts.map(({ month, count }) => (
          <div key={month}>
            <button
              type="button"
              disabled={count === 0}
              onClick={() => {
                setSelectedMonth(month)
                setSelectedDay(null)
                setFavoritesOnly(false)
              }}
              className={`flex w-full items-center justify-between rounded px-3 py-2 text-left ${
                count === 0
                  ? 'cursor-not-allowed border border-amber-200 bg-transparent text-gray-700'
                  : selectedMonth === month
                    ? 'cursor-pointer bg-amber-400 text-amber-900'
                    : 'cursor-pointer bg-amber-50 hover:bg-amber-200'
              }`}
            >
              <span>{monthNames[month - 1]}</span>
              <span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-900 text-xs">
                {count}
              </span>
            </button>

            {/* Day Options - Show as subgroup when month is selected */}
            {selectedMonth === month && availableDays.length > 0 && (
              <div className="mt-2 ml-4 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay(null)
                    setFavoritesOnly(false)
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between rounded px-3 py-2 text-left text-sm ${
                    selectedDay === null
                      ? 'bg-amber-400 text-amber-900'
                      : 'bg-amber-50 hover:bg-amber-200'
                  }`}
                >
                  <span>Alle Tage im {monthNames[selectedMonth - 1]}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-900 text-xs">
                    {monthCounts.find((m) => m.month === selectedMonth)?.count || 0}
                  </span>
                </button>
                {availableDays.map(({ day, count }) => (
                  <button
                    type="button"
                    key={`${selectedMonth}-${day}`}
                    disabled={count === 0}
                    onClick={() => {
                      setSelectedDay(day)
                      setFavoritesOnly(false)
                    }}
                    className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm ${
                      count === 0
                        ? 'cursor-not-allowed border border-amber-200 bg-transparent text-amber-400'
                        : selectedDay === day
                          ? 'cursor-pointer bg-amber-400 text-amber-900'
                          : 'cursor-pointer bg-amber-50 hover:bg-amber-200'
                    }`}
                  >
                    <span>
                      {getWeekdayName(day, selectedMonth)} {day}. {monthNames[selectedMonth - 1]}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-900 text-xs">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
