import React from 'react'

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

export function Skeleton({ className = '', children }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-700 rounded ${className}`}>
      {children}
    </div>
  )
}

// Skeleton components for auth forms
export function AuthFormSkeleton() {
  return (
    <div className="space-y-4">
      {/* Input field skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" /> {/* Label */}
        <Skeleton className="h-12 w-full rounded-full" /> {/* Input */}
      </div>
      
      {/* Timer/button area skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" /> {/* Timer text */}
        <Skeleton className="h-4 w-24" /> {/* Switch button */}
      </div>
      
      {/* Description skeleton */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

// Skeleton for email/phone display
export function IdentifierDisplaySkeleton() {
  return (
    <div className="space-y-3 mb-4">
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  )
}

// Loading overlay for smooth transitions
export function LoadingOverlay({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null
  
  return (
    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10 transition-all duration-300">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="text-gray-300 text-sm">Loading...</span>
      </div>
    </div>
  )
}
