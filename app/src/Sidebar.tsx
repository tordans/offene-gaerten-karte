import { useState } from 'react'
import BackgroundToggle from './BackgroundToggle'
import DateFilter from './DateFilter'
import FavoritesSection from './FavoritesSection'
import Footer from './Footer'
import MobileMenuButton from './MobileMenuButton'
import MobileSidebarToggle from './MobileSidebarToggle'
import ProjectDescription from './ProjectDescription'
import type { GardensJson } from './types'

type SidebarProps = {
  gardens: GardensJson
  onStateChange?: (isOpen: boolean) => void
}

export default function Sidebar({ gardens, onStateChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  const handleStateChange = (newIsOpen: boolean) => {
    setIsOpen(newIsOpen)
    onStateChange?.(newIsOpen)
  }

  return (
    <>
      <nav
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed top-0 left-0 z-50 h-full w-80 overflow-y-auto border-r-2 border-red-800 bg-amber-100 p-4 shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:w-80 lg:translate-x-0`}
      >
        <MobileSidebarToggle onClose={() => handleStateChange(false)} />
        <h1 className="mb-2 text-xl font-bold text-red-700">Offene Gärten Karte</h1>
        <ProjectDescription />
        <FavoritesSection gardens={gardens} />
        <DateFilter gardens={gardens} />
        <BackgroundToggle />
        <Footer />
      </nav>

      {!isOpen && <MobileMenuButton onOpen={() => handleStateChange(true)} />}
    </>
  )
}
