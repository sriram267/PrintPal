import * as React from "react"
import { cn } from "@/lib/utils"

export interface MetricSparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  gradient?: boolean
  className?: string
}

export function MetricSparkline({
  data,
  width = 120,
  height = 36,
  color = "#06b6d4", // Cyan
  gradient = true,
  className,
}: MetricSparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const padding = 2

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - padding * 2) + padding
    const y = height - padding - ((val - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const pathD = `M ${points.join(" L ")}`
  const fillD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`
  const gradId = React.useId()

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible shrink-0", className)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      {gradient && <path d={fillD} fill={`url(#${gradId})`} />}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
