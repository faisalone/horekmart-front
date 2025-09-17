'use client'

import * as React from "react"
import { ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectOption {
  value: string | number
  label: string
}

interface SearchableSelectProps {
  value: string | number
  onValueChange: (value: string | number) => void
  placeholder?: string
  options: SelectOption[]
  disabled?: boolean
  className?: string
  allowNewOptions?: boolean
  onAddNewOption?: (newValue: string) => void
  addNewLabel?: string
}

export function SearchableSelect({
  value,
  onValueChange,
  placeholder = "Select an option",
  options,
  disabled = false,
  className,
  allowNewOptions = false,
  onAddNewOption,
  addNewLabel = "Add new option",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const showAddNew = allowNewOptions && 
    searchTerm.trim() && 
    !options.some(option => option.label.toLowerCase() === searchTerm.toLowerCase()) &&
    onAddNewOption

  const handleAddNew = () => {
    if (onAddNewOption && searchTerm.trim()) {
      onAddNewOption(searchTerm.trim())
      setIsOpen(false)
      setSearchTerm("")
    }
  }

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

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border px-3 py-2 text-sm shadow-sm",
          "bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&>span]:line-clamp-1"
        )}
      >
        <span className={selectedOption ? "text-gray-200" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-gray-800 border-gray-700 shadow-lg">
          <div className="p-2 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-sm bg-gray-900 border border-gray-600 pl-8 pr-8 py-1.5 text-sm text-gray-200 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-60 overflow-auto p-1">
            {filteredOptions.length === 0 && !showAddNew ? (
              <div className="py-2 px-3 text-sm text-gray-400">No options found</div>
            ) : (
              <>
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-gray-700 focus:bg-gray-700 focus:outline-none",
                      value === option.value ? "bg-gray-700 text-white" : "text-gray-200"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
                {showAddNew && (
                  <button
                    onClick={handleAddNew}
                    className="w-full rounded-sm px-3 py-2 text-left text-sm text-blue-400 hover:bg-gray-700 focus:bg-gray-700 focus:outline-none border-t border-gray-600 mt-1 pt-2"
                  >
                    + {addNewLabel}: "{searchTerm}"
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
