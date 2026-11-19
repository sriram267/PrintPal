import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/shared/utils"
import { Button } from "@/components/ui/button"

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) {
  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3
    const totalBlocks = totalNumbers + 2

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const startPage = Math.max(2, page - siblingCount)
    const endPage = Math.min(totalPages - 1, page + siblingCount)

    const pages: (number | "dots")[] = [1]

    if (startPage > 2) {
      pages.push("dots")
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages - 1) {
      pages.push("dots")
    }

    pages.push(totalPages)
    return pages
  }

  const pages = getPageNumbers()

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    >
      <ul className="flex flex-row items-center gap-1">
        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="gap-1 pl-2.5 h-8 text-xs"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
        </li>

        {pages.map((p, idx) => {
          if (p === "dots") {
            return (
              <li key={`dots-${idx}`} className="flex h-8 w-8 items-center justify-center">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </li>
            )
          }

          const isCurrent = p === page
          return (
            <li key={p}>
              <Button
                variant={isCurrent ? "outline" : "ghost"}
                size="sm"
                onClick={() => onPageChange(p as number)}
                className={cn(
                  "h-8 w-8 p-0 text-xs",
                  isCurrent && "border-cyan-500 text-cyan-400 bg-cyan-500/10"
                )}
              >
                {p}
              </Button>
            </li>
          )
        })}

        <li>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="gap-1 pr-2.5 h-8 text-xs"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </li>
      </ul>
    </nav>
  )
}
