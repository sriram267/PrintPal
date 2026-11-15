import * as React from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CodeSnippetProps {
  code: string
  language?: string
  title?: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeSnippet({
  code,
  language = "bash",
  title,
  showLineNumbers = false,
  className,
}: CodeSnippetProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.trim().split("\n")

  return (
    <div
      className={cn(
        "relative rounded-lg border border-border bg-slate-950 text-slate-100 font-mono text-xs overflow-hidden shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/60 px-4 py-2">
        <span className="text-muted-foreground text-[11px] font-medium">
          {title || language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-xs text-muted-foreground hover:text-white"
        >
          {copied ? (
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <Check className="h-3 w-3" /> Copied
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Copy className="h-3 w-3" /> Copy
            </span>
          )}
        </Button>
      </div>

      <div className="overflow-x-auto p-4">
        <pre className="flex">
          {showLineNumbers && (
            <div className="select-none pr-4 text-slate-600 text-right">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <code className="flex-1">{code.trim()}</code>
        </pre>
      </div>
    </div>
  )
}
