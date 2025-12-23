"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  label: string
  name: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  required?: boolean
  description?: string
  error?: string
}

/**
 * Multi-select component for selecting multiple options
 * - Accessible with proper ARIA labels
 * - Shows selected items as removable tags
 * - Dropdown with checkboxes for selection
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
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const inputId = `field-${name}`

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    onChange(newSelected)
  }

  const removeOption = (value: string) => {
    onChange(selected.filter((v) => v !== value))
  }

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
            "w-full flex items-center flex-wrap gap-2 p-2 border rounded-md bg-background text-foreground",
            "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary",
            error && "border-destructive focus:ring-destructive",
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {selected.length > 0 ? (
            selected.map((value) => {
              const option = options.find((opt) => opt.value === value)
              return (
                <div
                  key={value}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-sm"
                >
                  {option?.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeOption(value)
                    }}
                    className="hover:bg-primary/80 rounded p-0.5"
                    aria-label={`Remove ${option?.label}`}
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
            <div className="p-2 space-y-1 max-h-64 overflow-y-auto" role="listbox">
              {options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                    className="w-4 h-4 rounded border-border bg-background cursor-pointer"
                    aria-label={option.label}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
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
