import { XMarkIcon } from '@heroicons/react/24/solid'

type MobileSidebarToggleProps = {
  onClose: () => void
}

export default function MobileSidebarToggle({ onClose }: MobileSidebarToggleProps) {
  return (
    <button
      onClick={onClose}
      className="absolute top-4 right-4 z-50 rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-50 lg:hidden"
      aria-label="Sidebar schließen"
    >
      <XMarkIcon className="h-5 w-5 text-gray-600" />
    </button>
  )
}
