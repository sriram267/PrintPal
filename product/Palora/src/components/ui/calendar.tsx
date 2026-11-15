import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface CalendarProps {
  mode?: "single"
  selected?: Date | string
  onSelect?: (date: Date | undefined) => void
  className?: string
  initialFocus?: boolean
  disabled?: (date: Date) => boolean
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function Calendar({
  selected,
  onSelect,
  className,
  disabled,
}: CalendarProps) {
  // Parse selected date
  const selectedDate = React.useMemo(() => {
    if (!selected) return undefined
    if (selected instanceof Date) return isNaN(selected.getTime()) ? undefined : selected
    const parsed = new Date(selected)
    return isNaN(parsed.getTime()) ? undefined : parsed
  }, [selected])

  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    return selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date()
  })

  // Synchronize current view if selected changes externally
  React.useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
  }, [selectedDate])

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const isSameDay = (d1?: Date, d2?: Date) => {
    if (!d1 || !d2) return false
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }

  const today = new Date()

  // Generate calendar days
  const calendarCells = React.useMemo(() => {
    const cells: Array<{
      date: Date
      isCurrentMonth: boolean
      dayNumber: number
    }> = []

    // Previous month leading days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i
      cells.push({
        date: new Date(year, month - 1, dayNum),
        isCurrentMonth: false,
        dayNumber: dayNum,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        dayNumber: i,
      })
    }

    // Next month trailing days to complete 35 or 42 grid
    const remaining = (7 - (cells.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        dayNumber: i,
      })
    }

    return cells
  }, [year, month, firstDayOfWeek, daysInCurrentMonth, daysInPrevMonth])

  return (
    <div
      className={cn(
        "p-3 rounded-lg border border-[#DCE1E5] bg-white text-[#202428] shadow-md select-none w-[280px]",
        className
      )}
    >
      {/* Header Month / Year & Navigation */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-semibold text-[#202428] tracking-tight">
          {MONTH_NAMES[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-7 w-7 p-0 border-[#DCE1E5] bg-white hover:bg-[#F3F5F7] text-[#202428]"
            )}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-7 w-7 p-0 border-[#DCE1E5] bg-white hover:bg-[#F3F5F7] text-[#202428]"
            )}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 mb-1 text-center">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="text-[11px] font-medium text-[#737B84] h-7 flex items-center justify-center"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map(({ date, isCurrentMonth, dayNumber }, idx) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const isCurrentToday = isSameDay(date, today)
          const isDisabled = disabled ? disabled(date) : false

          return (
            <button
              key={`${date.toISOString()}-${idx}`}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (!isDisabled) {
                  onSelect?.(date)
                }
              }}
              className={cn(
                "h-8 w-8 text-xs font-normal rounded-md flex items-center justify-center transition-colors cursor-pointer",
                !isCurrentMonth && "text-[#737B84]/40 hover:text-[#202428] hover:bg-[#F3F5F7]",
                isCurrentMonth && !isSelected && "text-[#202428] hover:bg-[#F3F5F7]",
                isCurrentToday && !isSelected && "font-semibold text-[#2878D0] bg-[#2878D0]/10",
                isSelected &&
                  "bg-[#2878D0] text-white font-medium hover:bg-[#2878D0] hover:text-white shadow-none",
                isDisabled && "opacity-30 cursor-not-allowed pointer-events-none"
              )}
            >
              {dayNumber}
            </button>
          )
        })}
      </div>
    </div>
  )
}
