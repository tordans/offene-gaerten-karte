import { useQueryState, parseAsString } from 'nuqs';
import type { Garden } from '../types';

// Store selected garden ID in URL, but we need to find the garden object
export function useSelectedGardenId() {
  return useQueryState('selectedGarden', parseAsString);
}

export function useSetSelectedGardenId() {
  const [, setSelectedGardenId] = useQueryState('selectedGarden', parseAsString);
  return setSelectedGardenId;
}

// Helper hook to get the actual garden object from the ID
export function useSelectedGarden(gardens: Garden[]) {
  const [selectedGardenId] = useSelectedGardenId();

  if (!selectedGardenId) return null;

  return gardens.find(garden => garden.id === selectedGardenId) || null;
}

// Helper hook to set the selected garden by passing the garden object
export function useSetSelectedGarden() {
  const setSelectedGardenId = useSetSelectedGardenId();

  return (garden: Garden | null) => {
    setSelectedGardenId(garden?.id || null);
  };
}
