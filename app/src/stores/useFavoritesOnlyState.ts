import { parseAsBoolean, useQueryState } from 'nuqs'

export function useFavoritesOnly() {
  return useQueryState('favoritesOnly', parseAsBoolean.withDefault(false))
}
