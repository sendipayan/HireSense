"use client"

import { useEffect, useRef, useState } from "react"
import { X, Search, Loader2, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type MultiSelectOption = { value: string; label: string }
type MultiSelectSelected = MultiSelectOption[] | string[] | null

interface MultiSelectProps {
  label: string
  name: string
  options: MultiSelectOption[]
  selected: MultiSelectSelected
  onChange: (selected: MultiSelectOption[]) => void
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
 
  setQuery,
  loading = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCustomOpen, setIsCustomOpen] = useState(false)
  const [customValue, setCustomValue] = useState("")
  const customInputRef = useRef<HTMLInputElement | null>(null)
  const inputId = `field-${name}`

  useEffect(() => {
    if (isOpen) {
      
      if (setQuery) {
        setQuery("")
      }
    }
  }, [isOpen])

  // Use controlled query if provided, otherwise use internal state
  

  const normalizedSelected = (selected ?? []).map((item) =>
    typeof item === "string" ? { value: item, label: item } : item,
  )

  // Merge selected items with options so they're always visible
  const mergedOptions = [...normalizedSelected]
  options.forEach((option) => {
    if (!normalizedSelected.find((s) => s.value === option.value)) {
      mergedOptions.push(option)
    }
  })

  

  const removeOption = (value: string) => {
    onChange(normalizedSelected.filter((s) => s.value !== value))
  }

  const commitCustomValue = (shouldClose: boolean) => {
    const trimmed = customValue.trim()
    if (trimmed.length > 0) {
      const exists = normalizedSelected.some((s) => s.value === trimmed)
      if (!exists) {
        onChange([...normalizedSelected, { value: trimmed, label: trimmed }])
      }
    }
    if (shouldClose) {
      setIsCustomOpen(false)
      setCustomValue("")
    }
  }

  useEffect(() => {
    if (isCustomOpen) {
      setIsOpen(true)
      const id = setTimeout(() => customInputRef.current?.focus(), 0)
      return () => clearTimeout(id)
    }
  }, [isCustomOpen])

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
            "w-full flex items-center gap-2 p-2 border rounded-md bg-background text-foreground cursor-pointer",
            "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary",
            error && "border-destructive focus:ring-destructive",
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex flex-1 flex-wrap gap-2">
            {normalizedSelected.length > 0 ? (
              normalizedSelected.map((val) => {
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
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsCustomOpen(true)
              }}
              className="inline-flex items-center justify-center rounded-md border border-border bg-background p-1 text-foreground hover:bg-accent"
              aria-label="Add custom value"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 border border-border rounded-md bg-popover shadow-lg">
            {isCustomOpen && (
              <div className="p-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <input
                    ref={customInputRef}
                    type="text"
                    placeholder="Add custom value..."
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        commitCustomValue(true)
                      }
                      if (e.key === "Escape") {
                        e.preventDefault()
                        setIsCustomOpen(false)
                        setCustomValue("")
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Custom value"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      commitCustomValue(true)
                    }}
                    className="inline-flex items-center justify-center rounded-md border border-border bg-background p-2 text-foreground hover:bg-accent"
                    aria-label="Confirm custom value"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            
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
