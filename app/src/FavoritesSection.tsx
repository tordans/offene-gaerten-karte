import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';
import { HeartIcon, XMarkIcon, ArrowsPointingInIcon } from '@heroicons/react/24/solid';
import type { Garden } from './types';

type FavoritesSectionProps = {
  gardens: Garden[];
  setSelectedGarden: (garden: Garden | null) => void;
  setViewState: (viewState: { longitude: number; latitude: number; zoom: number }) => void;
  viewState: { longitude: number; latitude: number; zoom: number };
};

export default function FavoritesSection({
  gardens,
  setSelectedGarden,
  setViewState,
  viewState
}: FavoritesSectionProps) {
  const [favorites, setFavorites] = useQueryState('favorites', parseAsArrayOf(parseAsString).withDefault([]));

  // Function to toggle favorite status
  const toggleFavorite = (gardenId: string) => {
    const newFavorites = favorites?.includes(gardenId)
      ? favorites.filter((id: string) => id !== gardenId)
      : [...(favorites || []), gardenId];
    setFavorites(newFavorites);
  };

  // Function to check if a garden is favorited
  const isFavorite = (gardenId: string) => favorites?.includes(gardenId) || false;

  return (
    <div className="mb-6 border-b border-red-800 pb-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-red-700 flex items-center gap-2">
          <HeartIcon className="w-4 h-4 text-red-600" />
          Favoriten
        </h2>
        <span className="bg-amber-200 text-amber-900 px-2 py-1 rounded-full text-xs font-medium">{favorites?.length || 0}</span>
      </div>
      <div className="space-y-2">
        {favorites && favorites.length > 0 ? (
          gardens
            .filter(garden => garden.id && isFavorite(garden.id))
            .map((garden) => (
              <div key={garden.id} className="p-2 bg-amber-200 rounded border-l-4 border-blue-500">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {garden.address}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => garden.id && toggleFavorite(garden.id)}
                    className="text-red-600 hover:text-red-800 cursor-pointer flex items-center gap-1 text-xs"
                  >
                    <XMarkIcon className="w-3 h-3" />
                    Entfernen
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGarden(garden);
                      setViewState({
                        longitude: garden.coordinates.lng,
                        latitude: garden.coordinates.lat,
                        zoom: viewState.zoom
                      });
                    }}
                    className="text-black hover:text-blue-400 cursor-pointer flex items-center gap-1 text-xs"
                  >
                    <ArrowsPointingInIcon className="w-3 h-3" />
                    Karte zentrieren
                  </button>
                </div>
              </div>
            ))
        ) : (
          <div className="text-sm text-gray-500 italic">
            Noch keine Favoriten. Klicken Sie auf das Herz-Symbol bei einem Garten, um ihn zu Ihren Favoriten hinzuzufügen.
          </div>
        )}
      </div>
    </div>
  );
}
