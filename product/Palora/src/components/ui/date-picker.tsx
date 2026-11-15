import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

export interface DatePickerProps {
  date?: Date | string
  onDateChange?: (date: Date | undefined, dateString: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  id?: string
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "dd-mm-yyyy",
  className,
  disabled,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Parse string or Date prop into valid Date object
  const dateObj = React.useMemo(() => {
    if (!date) return undefined
    if (date instanceof Date) return isNaN(date.getTime()) ? undefined : date
    // Try YYYY-MM-DD or DD-MM-YYYY or ISO
    const parts = String(date).split("-")
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const [y, m, d] = parts.map(Number)
        return new Date(y, m - 1, d)
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        const [d, m, y] = parts.map(Number)
        return new Date(y, m - 1, d)
      }
    }
    const parsed = new Date(date)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }, [date])

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const formatted = format(selectedDate, "yyyy-MM-dd")
      onDateChange?.(selectedDate, formatted)
    } else {
      onDateChange?.(undefined, "")
    }
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "printpal-datepicker-btn w-full justify-start text-left font-normal h-9 border-[#DCE1E5] bg-white text-sm text-[#202428] shadow-none hover:bg-white hover:text-[#202428] focus:outline-none focus:border-[#2878D0] focus:ring-0 focus-visible:outline-none focus-visible:border-[#2878D0] focus-visible:ring-0",
            !dateObj && "text-[#737B84]",
            open && "border-[#2878D0]",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#737B84] shrink-0" />
          {dateObj ? (
            <span className="text-[#202428]">{format(dateObj, "dd MMM yyyy")}</span>
          ) : (
            <span className="text-[#737B84]">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border border-[#DCE1E5] bg-white rounded-lg shadow-lg z-[9999]"
        align="start"
      >
        <Calendar
          mode="single"
          selected={dateObj}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
