import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NavItem {
  title: string
  href?: string
  description?: string
  children?: { title: string; href: string; description?: string }[]
}

export interface NavigationMenuProps {
  items: NavItem[]
  className?: string
}

export function NavigationMenu({ items, className }: NavigationMenuProps) {
  const [activeItem, setActiveItem] = React.useState<string | null>(null)

  return (
    <nav className={cn("relative z-20 flex max-w-max flex-1 items-center justify-center", className)}>
      <ul className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/80 p-1 backdrop-blur-md">
        {items.map((item) => {
          const hasChildren = Boolean(item.children && item.children.length > 0)
          const isOpen = activeItem === item.title

          return (
            <li
              key={item.title}
              className="relative"
              onMouseEnter={() => hasChildren && setActiveItem(item.title)}
              onMouseLeave={() => hasChildren && setActiveItem(null)}
            >
              {hasChildren ? (
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isOpen && "bg-accent text-accent-foreground"
                  )}
                >
                  <span>{item.title}</span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
              ) : (
                <a
                  href={item.href || "#"}
                  className="flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {item.title}
                </a>
              )}

              {/* Flyout panel */}
              {hasChildren && isOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-72 rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-lg animate-in fade-in-50 zoom-in-95">
                  <div className="grid gap-1">
                    {item.children!.map((sub) => (
                      <a
                        key={sub.title}
                        href={sub.href}
                        className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <div className="text-xs font-semibold leading-none">{sub.title}</div>
                        {sub.description && (
                          <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                            {sub.description}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
