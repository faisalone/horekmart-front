import React from 'react'

interface ProgressBarProps {
  progress: number
  show: boolean
}

export default function ProgressBar({ progress, show }: ProgressBarProps) {
  if (!show) return null
  
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
      <div 
        className="h-full bg-blue-600 transition-all duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
