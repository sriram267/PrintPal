import * as React from "react"
import { Calculator, ArrowRight } from "lucide-react"
import { cn } from "@/shared/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface QuoteCalculatorCardProps {
  initialWidthFt?: number
  initialHeightFt?: number
  className?: string
}

export function QuoteCalculatorCard({
  initialWidthFt = 10,
  initialHeightFt = 4,
  className,
}: QuoteCalculatorCardProps) {
  const [width, setWidth] = React.useState(initialWidthFt)
  const [height, setHeight] = React.useState(initialHeightFt)
  const [margin, setMargin] = React.useState(42) // 42% target margin
  const [acpReturn, setAcpReturn] = React.useState(true) // 50mm folding return
  const [scaffolding, setScaffolding] = React.useState(false)

  // Dimensional calculations
  const sqft = width * height
  const acpSheets = Math.ceil((width * height * (acpReturn ? 1.25 : 1.0)) / 32) // 8x4 ft = 32 sqft sheet
  const rawAcpCost = acpSheets * 1850 // ₹1850 / sheet
  const acrylicLetters = Math.round(width * 1.5) // ~15 letters
  const acrylicCost = acrylicLetters * 650 // ₹650 / 3D letter
  const ledModules = Math.round(sqft * 12) // 12 Samsung modules per sqft
  const ledWatts = ledModules * 1.2 // 1.2W per module
  const smpsUnits = Math.ceil((ledWatts * 1.25) / 350) // 80% continuous load headroom rule (1.25x derate)
  const electricalCost = ledModules * 24 + smpsUnits * 1450
  const structuralLaborCost = sqft * 120 + (scaffolding ? 6500 : 0)

  const directCost = rawAcpCost + acrylicCost + electricalCost + structuralLaborCost
  const finalPrice = Math.round(directCost / (1 - margin / 100))
  const grossProfit = finalPrice - directCost
  const advanceRequired = Math.round(finalPrice * 0.5)

  return (
    <Card className={cn("border-border/80 bg-card/60 backdrop-blur-xl shadow-xl", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="cyan" className="gap-1 font-mono">
            <Calculator className="h-3 w-3" /> Workshop Estimator
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">ACP & Acrylic LED</span>
        </div>
        <CardTitle className="text-lg">Dimensional Signboard Quote</CardTitle>
        <CardDescription>
          Live sheet nesting, 1.25x thermal SMPS derating, and profit defense.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Width & Height Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Sign Width (Feet)</Label>
            <Input
              type="number"
              min={1}
              value={width}
              onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
              className="font-mono h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Sign Height (Feet)</Label>
            <Input
              type="number"
              min={1}
              value={height}
              onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
              className="font-mono h-9"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-foreground">50mm Folding Returns</div>
              <div className="text-[11px] text-muted-foreground">+25% ACP perimeter allowance</div>
            </div>
            <Switch checked={acpReturn} onCheckedChange={setAcpReturn} />
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <div>
              <div className="font-semibold text-foreground">Night Scaffolding Permit</div>
              <div className="text-[11px] text-muted-foreground">Municipal site hoist (₹6,500)</div>
            </div>
            <Switch checked={scaffolding} onCheckedChange={setScaffolding} />
          </div>
        </div>

        {/* Margin Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">Target Gross Margin:</span>
            <span className="font-mono font-bold text-cyan-400">{margin}%</span>
          </div>
          <Slider
            value={[margin]}
            min={20}
            max={65}
            step={1}
            onValueChange={(vals: number[]) => setMargin(vals[0] ?? 42)}
          />
        </div>

        {/* Technical BOM Summary Grid */}
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-black/40 p-3 text-center font-mono text-xs border border-white/5">
          <div>
            <div className="text-[10px] text-muted-foreground">AREA</div>
            <div className="font-bold text-white mt-0.5">{sqft} sq.ft</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">ACP SHEETS</div>
            <div className="font-bold text-cyan-400 mt-0.5">{acpSheets} sheets</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground">350W SMPS</div>
            <div className="font-bold text-amber-400 mt-0.5">{smpsUnits} units</div>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3.5 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Final Quoted Price:</span>
            <span className="text-xl font-bold font-mono text-cyan-400">
              ₹{finalPrice.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>Direct Workshop Cost: ₹{directCost.toLocaleString("en-IN")}</span>
            <span className="text-emerald-400 font-semibold">
              Profit: ₹{grossProfit.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-xs">
            <span className="font-semibold text-rose-300">50% Advance Required:</span>
            <span className="font-mono font-bold text-rose-300">
              ₹{advanceRequired.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button className="w-full gap-2 bg-cyan-500 text-black font-semibold hover:bg-cyan-400">
          <span>Lock Quote & Issue Proforma</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
