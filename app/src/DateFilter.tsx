import type { Garden } from './types';

type DateFilterProps = {
  gardens: Garden[];
  monthCounts: { month: number; count: number }[];
  availableDays: { day: number; count: number }[];
  selectedMonth: number | null;
  selectedDay: number | null;
  setSelectedMonth: (month: number | null) => void;
  setSelectedDay: (day: number | null) => void;
};

export default function DateFilter({
  gardens,
  monthCounts,
  availableDays,
  selectedMonth,
  selectedDay,
  setSelectedMonth,
  setSelectedDay
}: DateFilterProps) {
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
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Nach Datum filtern</h2>
      <div className="space-y-2">
        {/* All Gardens Option */}
        <button
          onClick={() => {
            setSelectedMonth(null);
            setSelectedDay(null);
          }}
          className={`w-full text-left px-3 py-2 rounded cursor-pointer flex justify-between items-center ${
            selectedMonth === null
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <span>Alle Gärten</span>
          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">{gardens.length}</span>
        </button>

        {/* Month Options */}
        {monthCounts.map(({ month, count }) => (
          <div key={month}>
            <button
              disabled={count === 0}
              onClick={() => {
                setSelectedMonth(month);
                setSelectedDay(null);
              }}
              className={`w-full text-left px-3 py-2 rounded flex justify-between items-center ${
                count === 0
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                  : selectedMonth === month
                  ? 'bg-blue-100 text-blue-800 cursor-pointer'
                  : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
              }`}
            >
              <span>{monthNames[month - 1]}</span>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">{count}</span>
            </button>

            {/* Day Options - Show as subgroup when month is selected */}
            {selectedMonth === month && availableDays.length > 0 && (
              <div className="ml-4 mt-2 space-y-1">
                <button
                  onClick={() => setSelectedDay(null)}
                  className={`w-full text-left px-3 py-2 rounded cursor-pointer text-sm flex justify-between items-center ${
                    selectedDay === null
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span>Alle Tage im {monthNames[selectedMonth - 1]}</span>
                  <span className="bg-green-200 text-green-700 px-2 py-1 rounded-full text-xs font-medium">{monthCounts.find(m => m.month === selectedMonth)?.count || 0}</span>
                </button>
                {availableDays.map(({ day, count }) => (
                  <button
                    key={`${selectedMonth}-${day}`}
                    disabled={count === 0}
                    onClick={() => setSelectedDay(day)}
                    className={`w-full text-left px-3 py-2 rounded text-sm flex justify-between items-center ${
                      count === 0
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                        : selectedDay === day
                        ? 'bg-green-100 text-green-800 cursor-pointer'
                        : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                    }`}
                  >
                    <span>{getWeekdayName(day, selectedMonth)} {day}. {monthNames[selectedMonth - 1]}</span>
                    <span className="bg-green-200 text-green-700 px-2 py-1 rounded-full text-xs font-medium">{count}</span>
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
