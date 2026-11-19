import * as React from "react"
import { ChevronDown } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/shared/utils"

export interface SplitButtonProps {
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
  className?: string
  dropdownContent: React.ReactNode
}

export function SplitButton({
  label,
  onClick,
  disabled,
  variant = "default",
  size = "default",
  className,
  dropdownContent,
}: SplitButtonProps) {
  return (
    <div className={cn("inline-flex items-center rounded-md shadow-sm", className)}>
      <Button
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={onClick}
        className="rounded-r-none border-r-0 focus:z-10"
      >
        {label}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={disabled}
            className="rounded-l-none px-2 focus:z-10"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">{dropdownContent}</DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
