import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/shared/utils"
import { Kbd } from "@/components/ui/kbd"

export interface CommandItemDef {
  id: string
  label: string
  shortcut?: string
  icon?: React.ReactNode
  onSelect?: () => void
}

export interface CommandGroupDef {
  heading: string
  items: CommandItemDef[]
}

export interface CommandProps {
  groups: CommandGroupDef[]
  placeholder?: string
  className?: string
  onSelect?: (item: CommandItemDef) => void
}

export function Command({
  groups,
  placeholder = "Type a command or search...",
  className,
  onSelect,
}: CommandProps) {
  const [query, setQuery] = React.useState("")

  const filteredGroups = groups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-lg border border-[#DCE1E5] bg-white text-[#202428] shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="flex items-center border-b border-[#DCE1E5] px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 text-[#737B84]" />
        <input
          className="flex h-10 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-[#737B84]"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-[#737B84] hover:text-[#202428] shrink-0 p-1 cursor-pointer"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto p-2">
        {filteredGroups.length === 0 ? (
          <div className="py-6 text-center text-sm text-[#737B84]">
            No matching commands found.
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.heading} className="mb-2">
              <div className="px-2 py-1 text-[11px] font-semibold text-[#737B84] uppercase tracking-wider">
                {group.heading}
              </div>
              {group.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    item.onSelect?.()
                    onSelect?.(item)
                  }}
                  className="flex cursor-pointer select-none items-center justify-between rounded-md px-2 py-2 text-xs transition-colors hover:bg-[#F3F5F7] hover:text-[#202428]"
                >
                  <div className="flex items-center gap-2">
                    {item.icon && <span className="text-[#2878D0]">{item.icon}</span>}
                    <span>{item.label}</span>
                  </div>
                  {item.shortcut && <Kbd size="sm">{item.shortcut}</Kbd>}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export interface CommandDialogProps extends CommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandDialog({
  open,
  onOpenChange,
  className,
  ...props
}: CommandDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg">
        <Command className={cn("shadow-2xl border-[#DCE1E5]", className)} {...props} />
      </div>
    </div>
  )
}
