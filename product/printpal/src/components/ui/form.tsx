import * as React from "react"
import { cn } from "@/shared/utils"
import { Label } from "@/components/ui/label"

export interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("space-y-2", className)} {...props} />
  }
)
FormItem.displayName = "FormItem"

export interface FormLabelProps extends React.ComponentPropsWithoutRef<typeof Label> {
  error?: boolean
  required?: boolean
}

export const FormLabel = React.forwardRef<React.ElementRef<typeof Label>, FormLabelProps>(
  ({ className, error, required, children, ...props }, ref) => {
    return (
      <Label
        ref={ref}
        className={cn(error && "text-destructive font-medium", className)}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
    )
  }
)
FormLabel.displayName = "FormLabel"

export interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("text-xs text-muted-foreground", className)} {...props} />
    )
  }
)
FormDescription.displayName = "FormDescription"

export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode
}

export const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    if (!children) return null
    return (
      <p
        ref={ref}
        className={cn("text-xs font-medium text-destructive animate-in fade-in-50", className)}
        {...props}
      >
        {children}
      </p>
    )
  }
)
FormMessage.displayName = "FormMessage"

export const Form = React.forwardRef<HTMLFormElement, React.FormHTMLAttributes<HTMLFormElement>>(
  ({ className, ...props }, ref) => (
    <form ref={ref} className={cn("space-y-4", className)} {...props} />
  )
)
Form.displayName = "Form"

export const FormField = FormItem

export const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("relative", className)} {...props} />
)
FormControl.displayName = "FormControl"

