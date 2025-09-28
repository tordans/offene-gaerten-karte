import { useQueryState, parseAsBoolean } from 'nuqs';

export function useFavoritesOnly() {
  return useQueryState('favoritesOnly', parseAsBoolean.withDefault(false));
}
