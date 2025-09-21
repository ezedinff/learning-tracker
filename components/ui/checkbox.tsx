import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ checked = false, onChange, className, disabled = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "h-4 w-4 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
          checked
            ? "bg-primary border-primary text-primary-foreground"
            : "border-border bg-background hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {checked && (
          <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
        )}
      </button>
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }