import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/shared/utils"

export interface BreadcrumbItem {
  label: React.ReactNode
  href?: string
  current?: boolean
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
}

export function Breadcrumb({
  items,
  separator = <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-xs", className)} {...props}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1

          return (
            <React.Fragment key={idx}>
              <li className="inline-flex items-center">
                {item.current || isLast ? (
                  <span
                    aria-current="page"
                    className="font-medium text-foreground select-none"
                  >
                    {item.label}
                  </span>
                ) : item.href ? (
                  <a
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{item.label}</span>
                )}
              </li>
              {!isLast && <li className="inline-flex items-center select-none">{separator}</li>}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
