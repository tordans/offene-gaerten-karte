import { useQueryState, parseAsArrayOf, parseAsString } from 'nuqs';

export function useFavorites() {
  return useQueryState('favorites', parseAsArrayOf(parseAsString).withDefault([]));
}

export function useToggleFavorite() {
  const [favorites, setFavorites] = useQueryState('favorites', parseAsArrayOf(parseAsString).withDefault([]));

  return (gardenId: string) => {
    const isCurrentlyFavorite = favorites.includes(gardenId);
    const newFavorites = isCurrentlyFavorite
      ? favorites.filter(id => id !== gardenId)
      : [...favorites, gardenId];
    setFavorites(newFavorites);
  };
}

export function useIsFavorite() {
  const [favorites] = useQueryState('favorites', parseAsArrayOf(parseAsString).withDefault([]));

  return (gardenId: string) => favorites.includes(gardenId);
}
