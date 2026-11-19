import * as React from "react"
import { cn } from "@/shared/utils"

export interface InputOTPProps {
  length?: number
  value?: string
  onChange?: (value: string) => void
  disabled?: boolean
  masked?: boolean
  className?: string
}

export function InputOTP({
  length = 6,
  value = "",
  onChange,
  disabled,
  masked = false,
  className,
}: InputOTPProps) {
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const char = e.target.value.slice(-1)
    const valArr = value.split("")
    valArr[idx] = char
    const newVal = valArr.join("").slice(0, length)
    onChange?.(newVal)

    if (char && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").trim().slice(0, length)
    onChange?.(pasted)
    const nextIdx = Math.min(pasted.length, length - 1)
    inputsRef.current[nextIdx]?.focus()
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)} onPaste={handlePaste}>
      {Array.from({ length }).map((_, idx) => {
        const char = value[idx] || ""
        const isActive = value.length === idx

        return (
          <input
            key={idx}
            ref={(el) => (inputsRef.current[idx] = el)}
            type={masked ? "password" : "text"}
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            value={char}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              "h-12 w-10 text-center text-lg font-mono font-semibold rounded-md border border-input bg-background transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50",
              isActive && "border-cyan-500 ring-2 ring-cyan-500/30",
              char && "border-primary"
            )}
          />
        )
      })}
    </div>
  )
}
