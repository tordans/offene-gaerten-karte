import { useQueryState, parseAsInteger } from 'nuqs';
import type { Garden } from './types';
import { useFavoritesOnly } from './stores/useFavoritesOnlyState';

type DateFilterProps = {
  gardens: Garden[];
};

export default function DateFilter({ gardens }: DateFilterProps) {
  const [selectedMonth, setSelectedMonth] = useQueryState('month', parseAsInteger);
  const [selectedDay, setSelectedDay] = useQueryState('day', parseAsInteger);
  const [, setFavoritesOnly] = useFavoritesOnly();

  // Calculate month counts
  const monthCounts = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return {
      month,
      count: gardens.filter(garden =>
        garden.dates.some(date => date.month === month)
      ).length
    };
  });

  // Get available days for selected month with counts
  const availableDays = selectedMonth
    ? Array.from(
        new Set(
          gardens
            .flatMap(garden => garden.dates)
            .filter(date => date.month === selectedMonth)
            .map(date => date.day)
        )
      )
      .sort((a, b) => a - b)
      .map(day => ({
        day,
        count: gardens.filter(garden =>
          garden.dates.some(date =>
            date.month === selectedMonth &&
            date.day === day
          )
        ).length
      }))
    : [];

  // German month names
  const monthNames = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  // Helper function to get weekday name for a specific day
  const getWeekdayName = (day: number, month: number, year?: number) => {
    const date = new Date(year || new Date().getFullYear(), month - 1, day);
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  };

  return (
    <div className="mb-6 border-b border-red-800 pb-4">
      <h2 className="text-lg font-semibold mb-3 text-red-700">Nach Datum filtern</h2>
      <div className="space-y-2">
        {/* All Gardens Option */}
        <button
          onClick={() => {
            setSelectedMonth(null);
            setSelectedDay(null);
            setFavoritesOnly(false);
          }}
          className={`w-full text-left px-3 py-2 rounded cursor-pointer flex justify-between items-center ${
            selectedMonth === null
              ? 'bg-amber-400 text-amber-900'
              : 'bg-amber-50 hover:bg-amber-200'
          }`}
        >
          <span>Alle Gärten</span>
          <span className="bg-amber-100 text-amber-900 px-2 py-1 rounded-full text-xs font-medium">{gardens.length}</span>
        </button>

        {/* Month Options */}
        {monthCounts.map(({ month, count }) => (
          <div key={month}>
            <button
              disabled={count === 0}
              onClick={() => {
                setSelectedMonth(month);
                setSelectedDay(null);
                setFavoritesOnly(false);
              }}
              className={`w-full text-left px-3 py-2 rounded flex justify-between items-center ${
                count === 0
                  ? 'cursor-not-allowed bg-transparent border border-amber-200 text-gray-700'
                  : selectedMonth === month
                  ? 'bg-amber-400 text-amber-900 cursor-pointer'
                  : 'bg-amber-50 hover:bg-amber-200 cursor-pointer'
              }`}
            >
              <span>{monthNames[month - 1]}</span>
              <span className="bg-amber-100 text-amber-900 px-2 py-1 rounded-full text-xs font-medium">{count}</span>
            </button>

            {/* Day Options - Show as subgroup when month is selected */}
            {selectedMonth === month && availableDays.length > 0 && (
              <div className="ml-4 mt-2 space-y-1">
                <button
                  onClick={() => {
                    setSelectedDay(null);
                    setFavoritesOnly(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded cursor-pointer text-sm flex justify-between items-center ${
                    selectedDay === null
                      ? 'bg-amber-400 text-amber-900'
                      : 'bg-amber-50 hover:bg-amber-200'
                  }`}
                >
                  <span>Alle Tage im {monthNames[selectedMonth - 1]}</span>
                  <span className="bg-amber-100 text-amber-900 px-2 py-1 rounded-full text-xs font-medium">{monthCounts.find(m => m.month === selectedMonth)?.count || 0}</span>
                </button>
                {availableDays.map(({ day, count }) => (
                  <button
                    key={`${selectedMonth}-${day}`}
                    disabled={count === 0}
                    onClick={() => {
                      setSelectedDay(day);
                      setFavoritesOnly(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex justify-between items-center ${
                      count === 0
                        ? 'cursor-not-allowed bg-transparent border border-amber-200 text-amber-400'
                        : selectedDay === day
                        ? 'bg-amber-400 text-amber-900 cursor-pointer'
                        : 'bg-amber-50 hover:bg-amber-200 cursor-pointer'
                    }`}
                  >
                    <span>{getWeekdayName(day, selectedMonth)} {day}. {monthNames[selectedMonth - 1]}</span>
                    <span className="bg-amber-100 text-amber-900 px-2 py-1 rounded-full text-xs font-medium">{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
