import * as React from "react"
import { cn } from "@/shared/utils"

export interface ContextMenuItemDef {
  label: string
  shortcut?: string
  icon?: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  separator?: boolean
}

export interface ContextMenuProps {
  items: ContextMenuItemDef[]
  children: React.ReactNode
  className?: string
}

export function ContextMenu({ items, children, className }: ContextMenuProps) {
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
  }

  React.useEffect(() => {
    const handleOutsideClick = () => setPosition(null)
    if (position) {
      window.addEventListener("click", handleOutsideClick)
      window.addEventListener("contextmenu", handleOutsideClick)
    }
    return () => {
      window.removeEventListener("click", handleOutsideClick)
      window.removeEventListener("contextmenu", handleOutsideClick)
    }
  }, [position])

  return (
    <div onContextMenu={handleContextMenu} className={cn("inline-block w-full", className)}>
      {children}

      {position && (
        <div
          style={{ top: `${position.y}px`, left: `${position.x}px` }}
          className="fixed z-50 min-w-[10rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-50 zoom-in-95"
        >
          {items.map((item, idx) => {
            if (item.separator) {
              return <div key={idx} className="-mx-1 my-1 h-px bg-muted" />
            }

            return (
              <div
                key={idx}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.()
                    setPosition(null)
                  }
                }}
                className={cn(
                  "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground",
                  item.disabled && "pointer-events-none opacity-50"
                )}
              >
                {item.icon && <span className="h-3.5 w-3.5 shrink-0">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span className="text-[10px] text-muted-foreground font-mono">{item.shortcut}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
