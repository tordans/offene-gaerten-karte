import { HeartIcon, ArrowTopRightOnSquareIcon, HomeModernIcon } from '@heroicons/react/24/solid';
import type { Garden } from './types';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

type GardenPopupProps = {
  garden: Garden;
  isFavorite: (gardenId: string) => boolean;
  toggleFavorite: (gardenId: string) => void;
};

export default function GardenPopup({ garden, isFavorite, toggleFavorite }: GardenPopupProps) {
  // Helper function to format dates
  const formatDate = (date: { day: number; month: number; year?: number; startTime?: string; endTime?: string }) => {
    const year = date.year || new Date().getFullYear();
    const parsed = { day: date.day, month: date.month, year };
    const dateObj = new Date(year, parsed.month - 1, parsed.day);
    const formatted = dateObj.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const relative = formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: de
    });
    return { formatted, relative };
  };

  return (
    <div className="p-2">
      <h3 className="font-semibold text-sm mb-1">
        {garden.address}
      </h3>
      <div className="text-xs text-gray-600 mb-2 space-y-1">
        <button
          onClick={() => garden.id && toggleFavorite(garden.id)}
          className={`text-xs flex items-center gap-1 ${garden.id && isFavorite(garden.id) ? 'text-amber-600' : 'text-blue-600'} hover:underline block`}
        >
          <HeartIcon className="w-3 h-3" />
          {garden.id && isFavorite(garden.id) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
        </button>
        <a
          href={`https://www.xn--offene-grten-ncb.de/${garden.websiteSlug}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          <ArrowTopRightOnSquareIcon className="w-3 h-3" />
          Website öffnen
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(garden.address)}&travelmode=transit`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:underline flex items-center gap-1"
        >
          <HomeModernIcon className="w-3 h-3" />
          Route berechnen (ÖPNV)
        </a>
      </div>
      <div className="text-xs">
        <strong>Öffnungszeiten:</strong>
        <ul className="mt-1 space-y-2">
          {garden.dates.map((date, index) => {
            const { formatted, relative } = formatDate(date);
            return (
              <li key={index} className="text-gray-700">
                <div className="font-medium">{formatted}</div>
                {date.startTime && date.endTime && (
                  <div className="text-gray-600">{date.startTime}-{date.endTime}</div>
                )}
                <div className="text-xs text-gray-500">{relative}</div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
