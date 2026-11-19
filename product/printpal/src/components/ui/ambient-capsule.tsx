import { Phone, PhoneOff, ShieldCheck, Flame, Cpu } from "lucide-react"
import { cn } from "@/shared/utils"
import { Button } from "@/components/ui/button"

export type CapsuleState = "idle" | "live_job" | "inbound_call" | "thermal_derate" | "advance_gate"

export interface AmbientCapsuleProps {
  state?: CapsuleState
  onStateChange?: (state: CapsuleState) => void
  jobProgress?: number
  callerName?: string
  callerLtv?: string
  powerWatts?: number
  className?: string
}

export function AmbientCapsule({
  state = "idle",
  onStateChange,
  jobProgress = 68,
  callerName = "Adani Infra (K. Sharma)",
  callerLtv = "₹18.4L LTV",
  powerWatts = 345,
  className,
}: AmbientCapsuleProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* State Switcher pills for testing and demonstration */}
      {onStateChange && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-full bg-slate-900 border border-border/80 text-[11px]">
          {(["idle", "live_job", "inbound_call", "thermal_derate", "advance_gate"] as CapsuleState[]).map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => onStateChange(st)}
                className={cn(
                  "rounded-full px-2.5 py-1 font-medium transition-colors",
                  state === st ? "bg-cyan-500 text-black font-semibold shadow-sm" : "text-muted-foreground hover:text-white"
                )}
              >
                {st.replace("_", " ")}
              </button>
            )
          )}
        </div>
      )}

      {/* The Ambient Island Capsule */}
      <div
        className={cn(
          "relative flex items-center justify-between rounded-full bg-black/95 text-white border border-white/10 px-4 py-2.5 shadow-2xl backdrop-blur-2xl transition-all duration-500 select-none",
          state === "idle" && "w-64 h-11",
          state === "live_job" && "w-80 h-14 bg-black/95 border-cyan-500/40 shadow-cyan-500/10",
          state === "inbound_call" && "w-96 h-16 bg-slate-950 border-emerald-500/40 shadow-emerald-500/10",
          state === "thermal_derate" && "w-96 h-16 bg-amber-950/90 border-amber-500/60 shadow-amber-500/20",
          state === "advance_gate" && "w-88 h-14 bg-rose-950/90 border-rose-500/60 shadow-rose-500/20"
        )}
      >
        {/* IDLE STATE */}
        {state === "idle" && (
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold tracking-wide">PAL AMBIENT</span>
            </div>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
              100% HEALTH
            </span>
          </div>
        )}

        {/* LIVE JOB STATE */}
        {state === "live_job" && (
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                <Cpu className="h-4 w-4 animate-spin" />
              </div>
              <div>
                <div className="text-xs font-semibold">CNC Spindle #02 Cut</div>
                <div className="text-[10px] text-cyan-400/80 font-mono">Job #ORD-4091 • {jobProgress}%</div>
              </div>
            </div>
            <div className="w-20 bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${jobProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* INBOUND CALL STATE */}
        {state === "inbound_call" && (
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 animate-bounce">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-semibold truncate max-w-[140px]">{callerName}</div>
                <div className="text-[10px] text-emerald-400 font-mono font-medium">{callerLtv}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px] bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30">
                <PhoneOff className="h-3 w-3 mr-1" /> Decline
              </Button>
              <Button size="sm" className="h-7 px-3 text-[11px] bg-emerald-500 text-black font-semibold hover:bg-emerald-400">
                <Phone className="h-3 w-3 mr-1" /> Answer
              </Button>
            </div>
          </div>
        )}

        {/* THERMAL DERATE STATE */}
        {state === "thermal_derate" && (
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                <Flame className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-300">1.25x Thermal Derate Exceeded</div>
                <div className="text-[10px] text-amber-200/80 font-mono">
                  {powerWatts}W on 350W SMPS (Limit 280W continuous)
                </div>
              </div>
            </div>
            <span className="rounded bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5">
              ADD 2ND SMPS
            </span>
          </div>
        )}

        {/* ADVANCE GATE STATE */}
        {state === "advance_gate" && (
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-rose-300">50% Advance Gate Locked</div>
                <div className="text-[10px] text-rose-200/70 font-mono">CNC vector release blocked</div>
              </div>
            </div>
            <span className="rounded bg-rose-500/20 border border-rose-500/50 text-rose-300 text-[10px] font-bold px-2 py-1">
              RECORD ₹42.5K
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
