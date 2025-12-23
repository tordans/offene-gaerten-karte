import { Bars3Icon } from '@heroicons/react/24/solid'

type MobileMenuButtonProps = {
  onOpen: () => void
}

export default function MobileMenuButton({ onOpen }: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="fixed top-4 left-4 z-50 rounded-full border-2 border-red-800 bg-amber-100 p-3 shadow-lg transition-colors hover:bg-amber-200 lg:hidden"
      aria-label="Menü öffnen"
    >
      <Bars3Icon className="h-6 w-6 text-red-700" />
    </button>
  )
}
