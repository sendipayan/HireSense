import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ChangeEvent } from "react"

interface FormFieldProps {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  description?: string
  error?: string
  className?: string
  rows?: number
  as?: "input" | "textarea"

  /** NEW */
  value?: string
  onChange?: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  disabled?: boolean
}

/**
 * Reusable form field with label and validation
 * - Controlled input support
 * - Accessible (label + aria)
 * - Input & textarea support
 */
export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  description,
  error,
  className,
  rows = 4,
  as = "input",
  value,
  onChange,
  disabled = false,
}: FormFieldProps) {
  const inputId = `field-${name}`
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  const ariaDescribedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={inputId} className="text-sm font-medium">
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      {as === "textarea" ? (
        <Textarea
          id={inputId}
          name={name}
          placeholder={placeholder}
          required={required}
          rows={rows}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
          aria-invalid={error ? "true" : undefined}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        />
      ) : (
        <Input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-describedby={ariaDescribedBy}
          aria-invalid={error ? "true" : undefined}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        />
      )}

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
