import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TagInputProps {
  tags?: string[]
  onChange?: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
  disabled?: boolean
  className?: string
}

export function TagInput({
  tags = [],
  onChange,
  placeholder = "Add tag & press Enter...",
  maxTags = 10,
  disabled,
  className,
}: TagInputProps) {
  const [inputVal, setInputVal] = React.useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && inputVal.trim()) {
      e.preventDefault()
      const newTag = inputVal.trim().replace(/^,+|,+$/g, "")
      if (newTag && !tags.includes(newTag) && tags.length < maxTags) {
        const next = [...tags, newTag]
        onChange?.(next)
      }
      setInputVal("")
    } else if (e.key === "Backspace" && !inputVal && tags.length > 0) {
      onChange?.(tags.slice(0, -1))
    }
  }

  const removeTag = (idx: number) => {
    onChange?.(tags.filter((_, i) => i !== idx))
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-1.5 min-h-10 text-sm focus-within:ring-2 focus-within:ring-cyan-500",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-muted-foreground hover:text-foreground rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
      <input
        type="text"
        disabled={disabled || tags.length >= maxTags}
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent outline-none placeholder:text-muted-foreground text-sm px-1"
      />
    </div>
  )
}
