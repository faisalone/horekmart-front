'use client'

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps {
  value: string | number
  onValueChange: (value: string | number) => void
  placeholder?: string
  options: SelectOption[]
  disabled?: boolean
  className?: string
  required?: boolean
}

export function CustomSelect({
  value,
  onValueChange,
  placeholder = "Select an option",
  options,
  disabled = false,
  className,
  required = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedOption = options.find(option => option.value === value)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (option: SelectOption) => {
    onValueChange(option.value)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm("")
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (!disabled) {
        event.preventDefault()
        setIsOpen(!isOpen)
      }
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2 text-left bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-between text-white transition-colors",
          "hover:border-gray-500",
          className
        )}
      >
        <span className={selectedOption ? "text-white" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "transform rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-hidden">
          {options.length > 5 && (
            <div className="p-2 border-b border-gray-600">
              <input
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false)
                    setSearchTerm("")
                  }
                  e.stopPropagation()
                }}
                autoFocus
                className="w-full px-3 py-2 text-sm bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
          
          <div className="max-h-48 overflow-y-auto dropdown-scroll">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-sm text-gray-400 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelect(option)
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className={cn(
                    "w-full px-3 py-2.5 text-left text-sm transition-colors duration-150",
                    "border-l-2 border-transparent hover:border-blue-500 cursor-pointer",
                    value === option.value 
                      ? "bg-blue-600 text-white border-l-blue-400" 
                      : "text-gray-200 hover:bg-gray-600 hover:text-white"
                  )}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
