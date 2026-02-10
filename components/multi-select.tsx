"use client"

import { useEffect, useState } from "react"
import { X, Search, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  label: string
  name: string
  options: { value: string; label: string }[]
  selected: { value: string; label: string; }[]
  onChange: (selected: { value: string; label: string }[]) => void
  placeholder?: string
  required?: boolean
  description?: string
  error?: string
  query?: string
  setQuery?: (query: string) => void
  loading?: boolean
}

/**
 * Multi-select component for selecting multiple options
 * - Accessible with proper ARIA labels
 * - Shows selected items as removable tags
 * - Dropdown with checkboxes for selection
 * - Search functionality to filter options
 * - Optional controlled search state via query/setQuery props
 * - Loading state with spinner animation
 */
export function MultiSelect({
  label,
  name,
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  required = false,
  description,
  error,
  query,
  setQuery,
  loading = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [internalSearchQuery, setInternalSearchQuery] = useState("")
  const inputId = `field-${name}`

  useEffect(() => {
    if (isOpen) {
      setInternalSearchQuery("")
      if (setQuery) {
        setQuery("")
      }
    }
  }, [isOpen])

  // Use controlled query if provided, otherwise use internal state
  const searchQuery = query !== undefined ? query : internalSearchQuery
  const handleSearchChange = (value: string) => {
    if (setQuery) {
      setQuery(value)
    } else {
      setInternalSearchQuery(value)
    }
  }

  // Merge selected items with options so they're always visible
  const mergedOptions = [...selected]
  options.forEach((option) => {
    if (!selected.find((s) => s.value === option.value)) {
      mergedOptions.push(option)
    }
  })

  const toggleOption = (option: { value: string; label: string }) => {
    const isSelected = selected.find((s) => s.value === option.value)
    const newSelected = isSelected
      ? selected.filter((s) => s.value !== option.value)
      : [...selected, option]
    onChange(newSelected)
  }

  const removeOption = (value: string) => {
    onChange(selected.filter((s) => s.value !== value))
  }

  // Filter options based on search query


  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      <div className="relative">
        <div
          id={inputId}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center flex-wrap gap-2 p-2 border rounded-md bg-background text-foreground cursor-pointer",
            "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary",
            error && "border-destructive focus:ring-destructive",
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {selected.length > 0 ? (
            selected.map((val) => {

              return (
                <div
                  key={val.value}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-sm"
                >
                  {val.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeOption(val.value)
                    }}
                    className="hover:bg-primary/80 rounded p-0.5"
                    aria-label={`Remove ${val.label}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )
            })
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 border border-border rounded-md bg-popover shadow-lg">
            {/* Search Input */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Search options"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto" role="listbox">
              {loading ? (
                <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : mergedOptions.length > 0 ? (
                mergedOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.find((s) => s.value === option.value) !== undefined}
                      onChange={() => toggleOption(option)}
                      className="w-4 h-4 rounded border-border bg-background cursor-pointer"
                      aria-label={option.label}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))
              ) : (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  No results found
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
