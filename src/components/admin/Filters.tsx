'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/select-custom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { Search, Filter, X, ChevronDown, RotateCcw, Sparkles, TrendingUp, ChevronUp, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterManager, FilterState } from '@/utils/filterUtils';

// Filter Field Types
export type FilterFieldType = 'search' | 'select' | 'sort' | 'toggle';

interface SelectOption {
  value: string | number;
  label: string;
}

export interface FilterField {
  key: string;
  type: FilterFieldType;
  label?: string;
  placeholder?: string;
  options?: SelectOption[];
  className?: string;
}

export interface FilterConfig {
  title?: string;
  description?: string;
  fields: FilterField[];
  showClearAll?: boolean;
  showToggle?: boolean; // For mobile toggle
  gridCols?: string; // Tailwind grid class
}

interface FiltersProps<T extends Record<string, any>> {
  filters: T;
  onFiltersChange: (filters: Partial<T>) => void;
  onClearFilters: () => void;
  config: FilterConfig;
  isLoading?: boolean;
  resultCount?: number;
  searchQuery?: string;
  className?: string;
}

function Filters<T extends Record<string, any>>({
  filters,
  onFiltersChange,
  onClearFilters,
  config,
  isLoading = false,
  resultCount,
  searchQuery,
  className = ''
}: FiltersProps<T>) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true); // Start open by default
  const [isExpanded, setIsExpanded] = useState(false);

  // Use FilterManager utilities
  const hasActiveFilters = FilterManager.hasActiveFilters(filters as FilterState);
  const activeFilterCount = FilterManager.getActiveFilterCount(filters as FilterState);

  const handleFieldChange = (key: string, value: any) => {
    const updatedFilters = FilterManager.updateFilter(filters, key, value);
    onFiltersChange(updatedFilters);
  };

  const handleClearAll = () => {
    console.log('Clear All clicked - Current filters:', filters);
    
    // Use FilterManager to clear all filters
    const cleanFilters = FilterManager.clearAllFilters(filters);
    
    // Call onFiltersChange immediately to update the UI
    onFiltersChange(cleanFilters);
    
    // Then call the original clear function
    onClearFilters();
  };

  const renderField = (field: FilterField) => {
    const value = filters[field.key] || '';

    switch (field.type) {
      case 'search':
        return (
          <div key={field.key} className={cn("relative group", field.className)}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
              <Input
                placeholder={field.placeholder || 'Search products, categories, SKUs...'}
                value={value}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className={cn(
                  "pl-12 pr-12 py-4 h-auto bg-gray-800/30 border border-gray-600/50 rounded-xl",
                  "text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20",
                  "text-lg font-medium transition-all duration-200",
                  "hover:border-gray-500 hover:bg-gray-700/30",
                  "backdrop-blur-sm shadow-lg"
                )}
              />
              {value && (
                <button
                  onClick={() => handleFieldChange(field.key, '')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              {isLoading && value && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className={cn("space-y-1", field.className)}>
            {field.label && (
              <label className="block text-xs font-medium text-gray-400 tracking-wide">
                {field.label}
              </label>
            )}
            {/* Fields that need search functionality (many options) vs simple dropdown (few options) */}
            {field.key === 'category_id' || field.key === 'vendor_id' ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 hover:border-gray-600"
                  >
                    {value
                      ? field.options?.find((option) => option.value === value)?.label
                      : field.placeholder || 'Select...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 bg-gray-800 border-gray-700">
                  <Command className="bg-gray-800">
                    <CommandInput 
                      placeholder={`Search ${field.label?.toLowerCase()}...`} 
                      className="bg-gray-800 border-gray-700 text-gray-200"
                    />
                    <CommandEmpty className="text-gray-400">No {field.label?.toLowerCase()} found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-auto dropdown-scroll">
                      {field.options?.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={() => handleFieldChange(field.key, option.value)}
                          className="text-gray-200 hover:bg-gray-700"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <Select value={value} onValueChange={(newValue) => handleFieldChange(field.key, newValue)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500">
                  <SelectValue placeholder={field.placeholder || 'Select...'} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {field.options?.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={String(option.value)}
                      className="text-gray-200 focus:bg-gray-700"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        );

      case 'sort':
        return (
          <div key={field.key} className={cn("space-y-1", field.className)}>
            {field.label && (
              <label className="flex items-center gap-1 text-xs font-medium text-gray-400 tracking-wide">
                <TrendingUp className="w-3 h-3" />
                {field.label}
              </label>
            )}
            <Select 
              value={FilterManager.getSortValue(filters as FilterState)} 
              onValueChange={(newValue) => {
                if (!newValue) {
                  // Clear sort values using FilterManager
                  const updatedFilters = FilterManager.clearSort(filters);
                  onFiltersChange(updatedFilters);
                } else {
                  const sortValue = String(newValue);
                  const [sort_by, sort_order] = sortValue.split('_');
                  const updatedFilters = FilterManager.updateSort(
                    filters, 
                    sort_by, 
                    sort_order as 'asc' | 'desc'
                  );
                  onFiltersChange(updatedFilters);
                }
              }}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500">
                <SelectValue placeholder={field.placeholder || 'Sort by...'} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {field.options?.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={String(option.value)}
                    className="text-gray-200 focus:bg-gray-700"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'toggle':
        return null; // We'll handle the clear button separately for better UX

      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile Floating Filter Toggle - Only show when filters are hidden */}
      {config.showToggle && !isFiltersOpen && (
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <Button
            onClick={() => setIsFiltersOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl border-0 text-white"
          >
            <Filter className="w-6 h-6" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      )}

      <Card className={cn(
        "bg-gradient-to-br from-gray-900/95 to-gray-800/95 border border-gray-700/50",
        "backdrop-blur-lg shadow-xl transition-all duration-300 overflow-visible",
        config.showToggle && isFiltersOpen ? "block" : config.showToggle ? "hidden" : "block",
        className
      )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-3 text-lg font-bold">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <Filter className="w-4 h-4 text-blue-400" />
                </div>
                <span className="hidden md:inline">{config.title || 'Filters'}</span>
                <span className="md:hidden">Filters</span>
                {hasActiveFilters && (
                  <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full font-medium shadow-lg">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {activeFilterCount}
                  </span>
                )}
                {isLoading && (
                  <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs rounded-full flex items-center gap-1 font-medium shadow-lg">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </span>
                )}
              </CardTitle>
              
              <div className="flex items-center gap-2">
                {/* Expand/Collapse Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                >
                  {isExpanded ? (
                    <>
                      <Minus className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Collapse</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Expand</span>
                    </>
                  )}
                </Button>
                
                {/* Clear All Button */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleClearAll}
                    size="sm"
                    className="border-red-400/30 text-red-300 hover:bg-red-500/10 hover:border-red-400 transition-all duration-200"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Clear</span>
                  </Button>
                )}
              </div>
            </div>
            
            {config.showToggle && (
              <Button
                variant="outline"
                size="sm"
                className="md:hidden mt-3 w-full border-gray-600/50 text-gray-300 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {isFiltersOpen ? (
                  <>
                    <span>Hide Filters</span>
                    <X className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    <span>Show Filters</span>
                    <Plus className="w-4 h-4 ml-2" />
                  </>
                )}
                {hasActiveFilters && (
                  <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Compact search always visible */}
        {config.fields.some(f => f.type === 'search') && (
          <div className="mt-3">
            {config.fields
              .filter(f => f.type === 'search')
              .map(field => (
                <div key={field.key} className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    placeholder={field.placeholder || 'Search...'}
                    value={filters[field.key] || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="pl-10 pr-10 py-2.5 h-auto bg-gray-800/30 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all duration-200 hover:border-gray-500"
                  />
                  {filters[field.key] && (
                    <button
                      onClick={() => handleFieldChange(field.key, '')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            }
          </div>
        )}
        
        {/* Results summary */}
        {searchQuery && resultCount !== undefined && (
          <div className="mt-2 text-sm text-blue-300">
            🎯 {resultCount.toLocaleString()} results found
          </div>
        )}
      </CardHeader>

      {/* Expandable Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isExpanded ? "max-h-[1000px] opacity-100 overflow-visible" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        {isExpanded && (
          <CardContent className="pt-0 pb-4 overflow-visible">
            <div className="space-y-4 overflow-visible">
              {/* Filter fields */}
              {config.fields.some(f => f.type !== 'search' && f.type !== 'toggle') && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-full border-t border-gray-700/50"></div>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap px-2">Advanced Filters</span>
                    <div className="w-full border-t border-gray-700/50"></div>
                  </div>
                  <div className="flex flex-wrap gap-3 overflow-visible">
                    {config.fields
                      .filter(f => f.type !== 'search' && f.type !== 'toggle')
                      .map(field => renderField(field))
                    }
                  </div>
                </div>
              )}
              
              {/* Active filters chips - only show if expanded and has filters */}
              {hasActiveFilters && (
                <div className="pt-3 border-t border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-400">Active:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {FilterManager.getActiveFilterEntries(filters as FilterState)
                      .map(([key, value]) => {
                        // Special handling for sort fields - combine them
                        if (key === 'sort_by' && (filters as FilterState).sort_order) {
                          const sortLabel = FilterManager.getSortOptionLabel(
                            config, 
                            value, 
                            (filters as FilterState).sort_order as string
                          );
                          
                          return (
                            <span
                              key="sort"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-md border border-blue-500/30"
                            >
                              <span>Sort: {sortLabel}</span>
                              <button
                                onClick={() => {
                                  const updatedFilters = FilterManager.clearSort(filters);
                                  onFiltersChange(updatedFilters);
                                }}
                                className="text-blue-400 hover:text-blue-200"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        }
                        
                        // Skip sort_order if we've already handled it above
                        if (key === 'sort_order') return null;
                        
                        return (
                          <span
                            key={key}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-md border border-blue-500/30"
                          >
                            <span className="capitalize">
                              {FilterManager.getFilterDisplayLabel(key)}: {FilterManager.getFilterValueDisplay(key, value, config)}
                            </span>
                            <button
                              onClick={() => handleFieldChange(key, '')}
                              className="text-blue-400 hover:text-blue-200"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })
                      .filter(Boolean) // Remove null values
                    }
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </div>
    </Card>
    </>
  );
}

export default Filters;
