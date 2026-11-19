import * as React from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { ChevronDown, Search, X, Check, Plus } from "lucide-react"

/* ═══════════════════════════════════════════════════════════════════
   ── SEARCHABLE ACTION SELECT (Search Bar + Action Footer) ──
   ═══════════════════════════════════════════════════════════════════ */

export interface SearchableActionOption {
  value: string
  label: string
}

export interface SearchableActionSelectProps {
  value?: string
  onChange: (value: string) => void
  options: SearchableActionOption[]
  placeholder?: string
  searchPlaceholder?: string
  addActionText: string
  onAddAction: () => void
  emptyMessage?: string
  error?: boolean
  disabled?: boolean
  className?: string
}

export const SearchableActionSelect: React.FC<SearchableActionSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  addActionText,
  onAddAction,
  emptyMessage = "No options found",
  error = false,
  disabled = false,
  className = "",
}) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => opt.label.toLowerCase().includes(q))
  }, [options, search])

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value)
  }, [options, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          disabled={disabled}
          className={`w-full h-9 px-3 bg-white border rounded-[6px] text-[13px] flex items-center justify-between transition-colors text-left outline-none ${disabled
            ? "opacity-60 cursor-not-allowed bg-[#F9FAFB] border-[#E5E7EB] text-[#737B84]"
            : error
              ? "border-red-500 text-[#202428] hover:border-red-600 focus:border-red-500"
              : open
                ? "border-[#2878D0] ring-1 ring-[#2878D0] text-[#202428]"
                : "border-[#DCE1E5] text-[#202428] hover:border-[#b5bfc7]"
            } ${className}`}
        >
          <span className={`truncate ${!selectedOption && !value ? "text-[#737B84]" : "text-[#202428]"}`}>
            {selectedOption ? selectedOption.label : value || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-[#737B84] shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0 bg-white border border-[#DCE1E5] shadow-xl rounded-[8px] overflow-hidden z-[9999]"
      >
        {/* Top Search Field */}
        <div className="flex items-center gap-2.5 border-b border-[#DCE1E5] px-3 h-[46px] bg-[#F8FAFC] rounded-t-[8px] w-full box-border overflow-hidden">
          <Search className="h-4 w-4 text-[#737B84] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 min-w-0 h-full text-[13px] text-[#202428] placeholder:text-[#737B84] outline-none bg-transparent"
            autoFocus
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-[#737B84] hover:text-[#202428] shrink-0 p-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Option List */}
        <div className="max-h-52 overflow-y-auto p-1.5 space-y-0.5 printpal-compact-scroll">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = opt.value === value
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                    setSearch("")
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-[6px] text-[13px] cursor-pointer select-none transition-colors ${isSelected
                    ? "bg-[#D7440E]/5 text-[#202428] font-medium"
                    : "text-[#202428] hover:bg-[#F3F5F7]"
                    }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-[#D7440E] shrink-0" />}
                </div>
              )
            })
          ) : (
            <div className="px-3 py-4 text-center text-[12px]/4 text-[#737B84]">
              {emptyMessage}
            </div>
          )}
        </div>

        {/* Bottom Add Action Button */}
        <div className="border-t border-[#DCE1E5] p-2 bg-[#F8FAFC]">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setSearch("")
              onAddAction()
            }}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#D7440E] hover:underline px-2 py-1 w-full text-left transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{addActionText}</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
