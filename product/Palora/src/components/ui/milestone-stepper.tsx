import { Check, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface Milestone {
  id: string
  title: string
  percentage: number
  amount: number
  status: "verified" | "current" | "locked"
  verificationNote?: string
}

export interface MilestoneStepperProps {
  milestones?: Milestone[]
  onVerifyCurrent?: () => void
  className?: string
}

const DEFAULT_MILESTONES: Milestone[] = [
  {
    id: "m1",
    title: "50% Booking Advance",
    percentage: 50,
    amount: 42500,
    status: "verified",
    verificationNote: "NEFT Bank Ref #HDFC-991240 - Credited",
  },
  {
    id: "m2",
    title: "30% Vector Proof Approval",
    percentage: 30,
    amount: 25500,
    status: "current",
    verificationNote: "Client WhatsApp Sign-off pending",
  },
  {
    id: "m3",
    title: "20% Handover & Dispatch",
    percentage: 20,
    amount: 17000,
    status: "locked",
    verificationNote: "Locked until site installation sign-off",
  },
]

export function MilestoneStepper({
  milestones = DEFAULT_MILESTONES,
  onVerifyCurrent,
  className,
}: MilestoneStepperProps) {
  return (
    <div className={cn("space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Cashflow Milestone Ledger</h4>
          <p className="text-xs text-muted-foreground">Enforcing Sadan Advance Milestone gates</p>
        </div>
        <Badge variant="cyan" className="font-mono text-xs">
          Total: ₹85,000
        </Badge>
      </div>

      <div className="space-y-3">
        {milestones.map((m, idx) => {
          const isVerified = m.status === "verified"
          const isCurrent = m.status === "current"
          const isLocked = m.status === "locked"

          return (
            <div
              key={m.id}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-lg border transition-all",
                isVerified && "border-emerald-500/30 bg-emerald-500/5",
                isCurrent && "border-cyan-500/40 bg-cyan-500/10 ring-1 ring-cyan-500/30",
                isLocked && "border-border/50 bg-muted/20 opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                    isVerified && "bg-emerald-500 text-white",
                    isCurrent && "bg-cyan-500 text-black animate-pulse",
                    isLocked && "bg-muted text-muted-foreground"
                  )}
                >
                  {isVerified ? <Check className="h-4 w-4" /> : isLocked ? <Lock className="h-3.5 w-3.5" /> : idx + 1}
                </div>

                <div>
                  <div className="text-xs font-semibold text-foreground flex items-center gap-2">
                    <span>{m.title}</span>
                    <span className="text-[10px] font-mono rounded bg-white/10 px-1.5 py-0.5">
                      {m.percentage}%
                    </span>
                  </div>
                  {m.verificationNote && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      {m.verificationNote}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-xs font-bold text-foreground">
                  ₹{m.amount.toLocaleString("en-IN")}
                </div>
                {isCurrent && onVerifyCurrent && (
                  <Button
                    size="sm"
                    onClick={onVerifyCurrent}
                    className="mt-1 h-6 px-2 text-[10px] bg-cyan-500 text-black font-semibold hover:bg-cyan-400"
                  >
                    Verify & Release
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
