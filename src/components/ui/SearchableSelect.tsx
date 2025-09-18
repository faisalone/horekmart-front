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
  theme?: 'light' | 'dark'
  error?: boolean
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
  theme = 'dark',
  error = false
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState<number>(-1)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const optionsContainerRef = React.useRef<HTMLDivElement>(null)
  const savedScrollPosition = React.useRef<number>(0)
  const listboxId = React.useId()

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Keep activeIndex valid as the filtered list changes
  React.useEffect(() => {
    if (!isOpen) return
    if (filteredOptions.length === 0) {
      setActiveIndex(-1)
      return
    }
    setActiveIndex((prev) => {
      if (prev < 0) return 0
      if (prev >= filteredOptions.length) return filteredOptions.length - 1
      return prev
    })
  }, [filteredOptions, isOpen])

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

  // Auto-focus search input when dropdown opens (robust)
  React.useEffect(() => {
    if (!isOpen) return
    let tries = 0
    const tryFocus = () => {
      const el = searchInputRef.current
      if (!el) return
      el.focus({ preventScroll: true })
      if (document.activeElement !== el && tries < 3) {
        tries += 1
        requestAnimationFrame(tryFocus)
      }
    }
    // next frame ensures input is mounted
    requestAnimationFrame(tryFocus)
  }, [isOpen])

  // Position dropdown to selected option when opening
  React.useEffect(() => {
    if (isOpen && optionsContainerRef.current) {
      const container = optionsContainerRef.current
      
      if (selectedOption) {
        // Wait for DOM to render
        setTimeout(() => {
          const selectedButton = container.querySelector(`[data-value="${selectedOption.value}"]`) as HTMLElement
          if (selectedButton) {
            // Calculate position to center the selected option
            const containerHeight = container.clientHeight
            const buttonTop = selectedButton.offsetTop
            const buttonHeight = selectedButton.clientHeight
            const scrollTop = buttonTop - (containerHeight / 2) + (buttonHeight / 2)
            
            // Set scroll position immediately without animation
            container.scrollTop = Math.max(0, scrollTop)
            savedScrollPosition.current = container.scrollTop
          }
        }, 10)
      } else {
        // If no selection, restore previous scroll position
        container.scrollTop = savedScrollPosition.current
      }

      // Initialize active index to selected option if visible
      const idx = filteredOptions.findIndex(o => o.value === selectedOption?.value)
      setActiveIndex(idx >= 0 ? idx : (filteredOptions.length > 0 ? 0 : -1))
    }
  }, [isOpen, selectedOption])

  // Save scroll position when dropdown closes
  React.useEffect(() => {
    if (!isOpen && optionsContainerRef.current) {
      savedScrollPosition.current = optionsContainerRef.current.scrollTop
    }
  }, [isOpen])

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

  // Roving active option: ensure active option stays in view on keyboard nav
  React.useEffect(() => {
    if (!isOpen || activeIndex < 0 || !optionsContainerRef.current) return
    const container = optionsContainerRef.current
    const optionEl = container.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
    if (!optionEl) return
    const elTop = optionEl.offsetTop
    const elBottom = elTop + optionEl.offsetHeight
    const viewTop = container.scrollTop
    const viewBottom = viewTop + container.clientHeight
    if (elTop < viewTop) {
      container.scrollTop = elTop
    } else if (elBottom > viewBottom) {
      container.scrollTop = elBottom - container.clientHeight
    }
  }, [activeIndex, isOpen])

  const handleSelect = (option: SelectOption) => {
    onValueChange(option.value)
    setIsOpen(false)
    setSearchTerm("")
  }

  // Modern Tailwind approach using data-attribute variants
  const styles = React.useMemo(() => {
    const button = cn(
      'flex w-full items-center justify-between whitespace-nowrap rounded-lg border px-4 py-3 text-sm',
      'focus:outline-none focus-visible:outline-none !focus:outline-none !focus-visible:outline-none focus-visible:outline-offset-0',
      'transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      '[&>span]:line-clamp-1',
      // light base
      'bg-white text-gray-900 border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20',
      // dark overrides
      'data-[color-scheme=dark]:bg-gray-800 data-[color-scheme=dark]:text-gray-100 data-[color-scheme=dark]:border-gray-600 data-[color-scheme=dark]:hover:border-blue-500 data-[color-scheme=dark]:focus:border-blue-400 data-[color-scheme=dark]:focus:ring-blue-400',
      // error variant
      'data-[error=true]:border-red-500 data-[error=true]:hover:border-red-600 data-[error=true]:focus:border-red-500 data-[error=true]:focus:ring-red-500',
      // open state ring
      'data-[state=open]:ring-2 data-[state=open]:ring-blue-500 data-[state=open]:ring-opacity-20 data-[color-scheme=dark]:data-[state=open]:ring-blue-400 data-[error=true]:data-[state=open]:ring-red-500'
    )

    const placeholder = cn(
      selectedOption ? 'text-current' : 'text-gray-500 data-[color-scheme=dark]:text-gray-400'
    )

    const chevron = cn('h-4 w-4', 'text-gray-500 data-[color-scheme=dark]:text-gray-400')

    const dropdown = cn(
      'absolute z-30 mt-1 w-full rounded-md border shadow-lg',
      'bg-white border-gray-200',
      'data-[color-scheme=dark]:bg-gray-800 data-[color-scheme=dark]:border-gray-600'
    )

    const searchContainer = cn('p-2', 'border-b border-gray-200 data-[color-scheme=dark]:border-gray-600')

    const searchInput = cn(
      'w-full rounded-sm',
      'bg-white border border-gray-300 pl-8 pr-8 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none !focus:outline-none !focus-visible:outline-none focus-visible:outline-offset-0 focus:ring-1 focus:ring-blue-500',
      'data-[color-scheme=dark]:bg-gray-700 data-[color-scheme=dark]:border-gray-600 data-[color-scheme=dark]:text-gray-100 data-[color-scheme=dark]:focus:border-blue-400 data-[color-scheme=dark]:focus:ring-blue-400'
    )

    const searchIcon = cn('absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2', 'text-gray-400')

    const clearButton = cn('absolute right-2 top-1/2 -translate-y-1/2', 'text-gray-400 hover:text-gray-600 data-[color-scheme=dark]:hover:text-gray-300')

    const optionsContainer = 'max-h-60 overflow-auto p-1'

    const noOptions = cn('py-2 px-3 text-sm', 'text-gray-500 data-[color-scheme=dark]:text-gray-400')

    const option = cn(
      'w-full rounded-sm px-3 py-2 text-left text-sm focus:outline-none',
      'hover:bg-gray-100 focus:bg-gray-100 data-[color-scheme=dark]:hover:bg-gray-700 data-[color-scheme=dark]:focus:bg-gray-700'
    )

  const selectedOptionClass = cn('bg-blue-50 text-blue-700 data-[color-scheme=dark]:bg-blue-900 data-[color-scheme=dark]:text-blue-300')
  const unselectedOption = 'text-gray-900 data-[color-scheme=dark]:text-gray-100'

    const addNewOption = cn(
      'w-full rounded-sm px-3 py-2 text-left text-sm',
      'text-blue-600 data-[color-scheme=dark]:text-blue-400',
      'hover:bg-gray-100 focus:bg-gray-100 data-[color-scheme=dark]:hover:bg-gray-700 data-[color-scheme=dark]:focus:bg-gray-700',
      'focus:outline-none border-t mt-1 pt-2 border-gray-200 data-[color-scheme=dark]:border-gray-600'
    )

    return {
      button,
      placeholder,
      chevron,
      dropdown,
      searchContainer,
      searchInput,
      searchIcon,
      clearButton,
      optionsContainer,
      noOptions,
      option,
      selectedOption: selectedOptionClass,
      unselectedOption,
      addNewOption,
    }
  }, [theme, error, selectedOption])

  // styles derived above

  return (
  <div className={cn("relative", className)} ref={dropdownRef} data-color-scheme={theme}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        data-state={isOpen ? 'open' : 'closed'}
        data-error={error ? 'true' : 'false'}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={styles.button}
      >
        <span className={styles.placeholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={styles.chevron} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.searchContainer}>
            <div className="relative">
              <Search className={styles.searchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                autoFocus={isOpen}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    if (!isOpen) {
                      setIsOpen(true)
                      return
                    }
                    setActiveIndex((prev) => {
                      const next = Math.min((prev < 0 ? -1 : prev) + 1, filteredOptions.length - 1)
                      return next
                    })
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setActiveIndex((prev) => {
                      const next = Math.max((prev < 0 ? 0 : prev) - 1, 0)
                      return next
                    })
                  } else if (e.key === 'Home') {
                    e.preventDefault()
                    if (filteredOptions.length > 0) setActiveIndex(0)
                  } else if (e.key === 'End') {
                    e.preventDefault()
                    if (filteredOptions.length > 0) setActiveIndex(filteredOptions.length - 1)
                  } else if (e.key === 'Enter') {
                    e.preventDefault()
                    if (activeIndex >= 0 && filteredOptions[activeIndex]) {
                      handleSelect(filteredOptions[activeIndex])
                    } else if (showAddNew) {
                      handleAddNew()
                    }
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    setIsOpen(false)
                  }
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className={styles.clearButton}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <div 
            ref={optionsContainerRef} 
            className={styles.optionsContainer}
            id={listboxId}
            role="listbox"
            onScroll={(e) => {
              // Save scroll position as user manually scrolls
              savedScrollPosition.current = e.currentTarget.scrollTop
            }}
          >
            {filteredOptions.length === 0 && !showAddNew ? (
              <div className={styles.noOptions}>No options found</div>
            ) : (
              <>
                {filteredOptions.map((option, idx) => (
                  <button
                    key={option.value}
                    data-value={option.value}
                    data-index={idx}
                    id={`${listboxId}-option-${idx}`}
                    onClick={() => handleSelect(option)}
                    onMouseMove={() => setActiveIndex(idx)}
                    role="option"
                    aria-selected={value === option.value}
                    data-active={activeIndex === idx ? 'true' : 'false'}
                    className={cn(
                      styles.option,
                      'data-[active=true]:bg-gray-100 data-[color-scheme=dark]:data-[active=true]:bg-gray-700',
                      value === option.value ? styles.selectedOption : styles.unselectedOption
                    )}
                  >
                    {option.label}
                  </button>
                ))}
                {showAddNew && (
                  <button
                    onClick={handleAddNew}
                    className={styles.addNewOption}
                  >
                    + {addNewLabel}: &quot;{searchTerm}&quot;
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
