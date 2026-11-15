import * as React from "react"
import { cn } from "@/lib/utils"

export interface MenubarItemDef {
  label: string
  shortcut?: string
  disabled?: boolean
  onClick?: () => void
  separator?: boolean
}

export interface MenubarMenuDef {
  trigger: string
  items: MenubarItemDef[]
}

export interface MenubarProps {
  menus: MenubarMenuDef[]
  className?: string
}

export function Menubar({ menus, className }: MenubarProps) {
  const [openMenu, setOpenMenu] = React.useState<string | null>(null)

  return (
    <div
      className={cn(
        "flex h-9 items-center space-x-1 rounded-md border border-border bg-background p-1 shadow-sm",
        className
      )}
    >
      {menus.map((menu) => {
        const isOpen = openMenu === menu.trigger

        return (
          <div
            key={menu.trigger}
            className="relative"
            onMouseEnter={() => openMenu && setOpenMenu(menu.trigger)}
          >
            <button
              type="button"
              onClick={() => setOpenMenu(isOpen ? null : menu.trigger)}
              className={cn(
                "flex cursor-pointer select-none items-center rounded-sm px-2.5 py-1 text-xs font-medium outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                isOpen && "bg-accent text-accent-foreground"
              )}
            >
              {menu.trigger}
            </button>

            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpenMenu(null)}
                />
                <div className="absolute left-0 top-full mt-1 z-50 min-w-[12rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-50">
                  {menu.items.map((item, idx) => {
                    if (item.separator) {
                      return <div key={idx} className="-mx-1 my-1 h-px bg-muted" />
                    }

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (!item.disabled) {
                            item.onClick?.()
                            setOpenMenu(null)
                          }
                        }}
                        className={cn(
                          "relative flex cursor-pointer select-none items-center justify-between rounded-sm px-2 py-1.5 text-xs outline-none hover:bg-accent hover:text-accent-foreground",
                          item.disabled && "pointer-events-none opacity-50"
                        )}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="ml-auto text-[10px] tracking-widest text-muted-foreground font-mono">
                            {item.shortcut}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
