import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs'
import {
  useFavoritesFeatureEnabled,
  useFavoritesFeatureActions,
} from './stores/useFavoritesFeatureState'

export default function FavoritesToggle() {
  const enabled = useFavoritesFeatureEnabled()
  const { toggle } = useFavoritesFeatureActions()
  const [, setFavorites] = useQueryState('favorites', parseAsArrayOf(parseAsString).withDefault([]))

  const handleToggle = () => {
    if (enabled) {
      // When disabling, clear all favorites from URL
      setFavorites([])
    }
    toggle()
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="cursor-pointer text-black hover:text-blue-400 hover:underline"
      title="Favoriten-Funktion umschalten"
    >
      {enabled ? 'Favoriten-Funktion deaktivieren' : 'Favoriten-Funktion aktivieren'}
    </button>
  )
}
