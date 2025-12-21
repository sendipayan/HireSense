import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

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
}

/**
 * Reusable form field with label and validation
 * - Proper label association for accessibility
 * - Error state with aria-describedby
 * - Support for input and textarea
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
}: FormFieldProps) {
  const inputId = `field-${name}`
  const descriptionId = description ? `${inputId}-description` : undefined
  const errorId = error ? `${inputId}-error` : undefined

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={inputId} className="text-sm font-medium">
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
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
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
          aria-invalid={error ? "true" : undefined}
          className={cn(error && "border-destructive focus-visible:ring-destructive")}
        />
      ) : (
        <Input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}
          aria-invalid={error ? "true" : undefined}
          className={cn(error && "border-destructive focus-visible:ring-destructive")}
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
