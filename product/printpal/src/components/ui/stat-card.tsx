import * as React from "react"
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { MetricSparkline } from "@/components/ui/metric-sparkline"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  change?: string
  trend?: "up" | "down" | "neutral"
  trendLabel?: string
  sparklineData?: number[]
  sparklineColor?: string
  icon?: React.ReactNode
}

export function StatCard({
  title,
  value,
  change,
  trend,
  trendLabel = "vs last month",
  sparklineData,
  sparklineColor,
  icon,
  className,
  ...props
}: StatCardProps) {
  const getTrendColor = () => {
    if (trend === "up") return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    if (trend === "down") return "text-rose-400 bg-rose-500/10 border-rose-500/20"
    return "text-muted-foreground bg-muted border-border"
  }

  const defaultSparkColor = trend === "down" ? "#f43f5e" : "#10b981"

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card/60 p-5 backdrop-blur-md shadow-sm transition-all hover:border-border hover:shadow-md",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
        <span>{title}</span>
        {icon && <div className="rounded-lg bg-muted/60 p-2 text-foreground">{icon}</div>}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
          {value}
        </div>
        {sparklineData && (
          <MetricSparkline
            data={sparklineData}
            color={sparklineColor || defaultSparkColor}
            width={90}
            height={32}
          />
        )}
      </div>

      {(change || trend) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 font-semibold",
              getTrendColor()
            )}
          >
            {trend === "up" && <ArrowUpRight className="h-3 w-3" />}
            {trend === "down" && <ArrowDownRight className="h-3 w-3" />}
            {trend === "neutral" && <Minus className="h-3 w-3" />}
            {change}
          </span>
          <span className="text-muted-foreground">{trendLabel}</span>
        </div>
      )}
    </div>
  )
}
