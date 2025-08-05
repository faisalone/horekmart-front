import React from 'react'
import Link from 'next/link'

interface LogoHeaderProps {
  showBorder?: boolean
}

export default function LogoHeader({ showBorder = true }: LogoHeaderProps) {
  return (
    <div className="pt-4 pb-2 text-center">
      <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
        <img src="/logo-light.svg" alt="Horekmart" className="h-32 mx-auto" />
      </Link>
      {showBorder && <div className="mx-8 mt-2 border-b border-gray-700"></div>}
    </div>
  )
}
