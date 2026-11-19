import * as React from "react"
import { createPortal } from "react-dom"
import {
  Download,
  Loader2,
  Trash2,
  X,
  Layers,
  Palette,
  Plus,
  Edit3,
} from "lucide-react"
import {
  ModalIconBadge,
  ModalTitle,
  ModalDescription,
  ModalButton,
} from "./modal-system"
import { PalMascot, type PalTone } from "./pal-mascot"
import { GREETING_MS, MASCOT_PX, rigFrom, runPalGreeting } from "./pal-greeting"
import "./pal-mascot.css"

export type PalNotchVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "workshop"
  | "loading"

export interface PalNotchAction {
  label: string
  onClick: () => void
}

export interface PalNotchCustomerCard {
  name: string
  contactPerson?: string
  phone?: string
  email?: string
}

export interface PalNotchOptions {
  id?: string
  title: string
  description?: string
  variant?: PalNotchVariant
  duration?: number
  badge?: string
  customerCard?: PalNotchCustomerCard
  action?: PalNotchAction
}

export interface PalNotchNotification extends PalNotchOptions {
  id: string
  variant: PalNotchVariant
  duration: number
  createdAt: number
}

export interface PalNotchConfirmOptions {
  id?: string
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  badge?: string
  variant?: "destructive" | "warning" | "default"
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

export interface PalNotchConfirmItem extends PalNotchConfirmOptions {
  id: string
}

export interface PalNotchPromptOptions {
  id?: string
  title: string
  description?: string
  inputLabel?: string
  inputPlaceholder?: string
  defaultValue?: string
  submitText?: string
  cancelText?: string
  badge?: string
  icon?: "material" | "finish" | "edit" | "plus" | "default"
  variant?: "brand" | "destructive" | "warning" | "gray" | "success"
  errorMessage?: string
  onSubmit: (value: string) => void | Promise<void>
  onCancel?: () => void
}

export interface PalNotchPromptItem extends PalNotchPromptOptions {
  id: string
}

/* Printer geometry (px). The machine floats DOC_TOP below the screen edge; the paper is clipped at the
   slot's bottom edge (DOC_CLIP_Y), so it slides out of the slot over the machine's lower lip. */
export const DOC_RIM = 28 // paper edge → machine edge, each side
export const DOC_TOP = 10 // gap above the machine
export const DOC_PAD = 8 // body padding around the screen
export const DOC_BAR_H = 56 // inner screen height
export const DOC_GAP = 10 // screen → slot
export const DOC_SLOT_H = 12 // slot height
export const DOC_LIP = 14 // body below the slot
export const DOC_CLIP_Y = DOC_TOP + DOC_PAD + DOC_BAR_H + DOC_GAP + DOC_SLOT_H

/** The notch as a control bar for a document sheet (title, Download, Close). Stays until closed. */
export interface PalNotchDocumentOptions {
  title: string
  subtitle?: string
  downloadLabel?: string
  /** Width of the paper that will come out, so the notch can size its slot to it. */
  paperWidth: number
  onDownload: () => void
  onClose: () => void
}

type NotchListener = (
  action:
    | { type: "push"; item: PalNotchNotification }
    | { type: "document"; item: PalNotchDocumentOptions }
    | { type: "documentClose" }
    | { type: "confirm"; item: PalNotchConfirmItem }
    | { type: "prompt"; item: PalNotchPromptItem }
    | { type: "greeting" }
    | { type: "dismiss"; id?: string }
) => void

const listeners = new Set<NotchListener>()

function nextId(): string {
  return `pal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/* How long a toast stays: long enough to read once, no longer. Good news goes fast; problems linger a little;
   anything with a button gets a moment to be pressed; longer text earns a few extra seconds. */
const TOAST_BASE_MS = { success: 2000, info: 2200, workshop: 2200, warning: 3200, error: 4000 } as const
const TOAST_HOVER_MS = 1100 // once the pointer is on a toast it wraps up quickly (it never freezes)

function defaultDuration(variant: PalNotchVariant, hasAction: boolean, textLength: number): number {
  if (variant === "loading") return 0
  const base = TOAST_BASE_MS[variant]
  const extra = Math.max(0, textLength - 40) * 30
  return Math.min(6000, Math.max(hasAction ? 3500 : 0, base + extra))
}

function emitPush(options: PalNotchOptions): string {
  const id = options.id || nextId()
  const variant = options.variant || "info"
  const item: PalNotchNotification = {
    ...options,
    id,
    variant,
    duration:
      options.duration ??
      defaultDuration(
        variant,
        Boolean(options.action),
        (options.title?.length ?? 0) + (options.description?.length ?? 0)
      ),
    createdAt: Date.now(),
  }
  if (item.duration > 0) lastToast = item
  listeners.forEach((fn) => fn({ type: "push", item }))
  return id
}

/* The most recent timed toast, so a document opened in the same breath can hold it until it closes. */
let lastToast: PalNotchNotification | null = null

export const palNotch = {
  document: (options: PalNotchDocumentOptions) => {
    listeners.forEach((fn) => fn({ type: "document", item: options }))
  },
  closeDocument: () => {
    listeners.forEach((fn) => fn({ type: "documentClose" }))
  },
  notify: (options: PalNotchOptions) => emitPush(options),
  confirm: (options: PalNotchConfirmOptions): string => {
    const id = options.id || nextId()
    const item: PalNotchConfirmItem = { ...options, id }
    listeners.forEach((fn) => fn({ type: "confirm", item }))
    return id
  },
  prompt: (options: PalNotchPromptOptions): string => {
    const id = options.id || nextId()
    const item: PalNotchPromptItem = { ...options, id }
    listeners.forEach((fn) => fn({ type: "prompt", item }))
    return id
  },
  success: (title: string, description?: string, action?: PalNotchAction, badge?: string) =>
    emitPush({ title, description, variant: "success", action, badge }),
  error: (title: string, description?: string, action?: PalNotchAction, badge?: string) =>
    emitPush({ title, description, variant: "error", action, badge }),
  warning: (title: string, description?: string, action?: PalNotchAction, badge?: string) =>
    emitPush({ title, description, variant: "warning", action, badge }),
  info: (title: string, description?: string, action?: PalNotchAction, badge?: string) =>
    emitPush({ title, description, variant: "info", action, badge }),
  workshop: (title: string, description?: string, action?: PalNotchAction, badge?: string) =>
    emitPush({ title, description, variant: "workshop", action, badge: badge || "PRINTPAL" }),
  greeting: () => {
    listeners.forEach((fn) => fn({ type: "greeting" }))
  },
  greet: () => {
    listeners.forEach((fn) => fn({ type: "greeting" }))
  },
  dismiss: (id?: string) => {
    listeners.forEach((fn) => fn({ type: "dismiss", id }))
  },
  promise: async <T,>(
    promise: Promise<T>,
    msgs: {
      loading: { title: string; description?: string }
      success: (val: T) => { title: string; description?: string }
      error: (err: unknown) => { title: string; description?: string }
    }
  ): Promise<T> => {
    const id = emitPush({
      title: msgs.loading.title,
      description: msgs.loading.description,
      variant: "loading",
    })
    try {
      const result = await promise
      const ok = msgs.success(result)
      emitPush({ id, title: ok.title, description: ok.description, variant: "success" })
      return result
    } catch (err) {
      const fail = msgs.error(err)
      emitPush({ id, title: fail.title, description: fail.description, variant: "error" })
      throw err
    }
  },
}

/* The toast is a calm black pill. Instead of an icon it shows Pal's face: a white Pal whose base carries
   a subtle wash of the state's colour (blue info, green success, amber warning, red error, grey loading). */
const VARIANT_TONE: Record<PalNotchVariant, PalTone> = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
  workshop: "warm",
  loading: "neutral",
}

// ── Pal greeting: the canvas entrance (see pal-greeting.ts) ──
function PalGreeting({ onComplete }: { onComplete: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const stageRef = React.useRef<HTMLDivElement | null>(null)
  const palRef = React.useRef<HTMLDivElement | null>(null)
  const doneRef = React.useRef(onComplete)
  doneRef.current = onComplete

  React.useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    const pal = palRef.current
    if (!canvas || !stage || !pal) return
    const finish = () => doneRef.current()
    const stop = runPalGreeting(canvas, stage, rigFrom(pal), finish)
    // Safety net: if animation frames pause (background tab), still close.
    const fallback = window.setTimeout(finish, GREETING_MS + 600)
    return () => {
      stop()
      window.clearTimeout(fallback)
    }
  }, [])

  return (
    <div className="pal-greeting">
      <canvas ref={canvasRef} className="pal-greeting-canvas" aria-hidden="true" />
      <div ref={stageRef} className="pal-stage" aria-hidden="true">
        <div ref={palRef} className="pal-stage-pal">
          <PalMascot size={MASCOT_PX} mode="rig" />
        </div>
      </div>
    </div>
  )
}

export interface PalNotchProps {
  activeModuleLabel?: string
}

type ConfirmStage = "idle" | "widening" | "expanding" | "open" | "closing"

export function PalNotch({ activeModuleLabel = "Ready" }: PalNotchProps) {
  const [activeToast, setActiveToast] = React.useState<PalNotchNotification | null>(null)
  const [activeConfirm, setActiveConfirm] = React.useState<PalNotchConfirmItem | null>(null)
  const [activePrompt, setActivePrompt] = React.useState<PalNotchPromptItem | null>(null)
  const [activeDoc, setActiveDoc] = React.useState<PalNotchDocumentOptions | null>(null)
  const [promptValue, setPromptValue] = React.useState<string>("")
  const [promptError, setPromptError] = React.useState<string | null>(null)
  const [isPromptSubmitting, setIsPromptSubmitting] = React.useState<boolean>(false)
  const [confirmStage, setConfirmStage] = React.useState<ConfirmStage>("idle")
  const [measuredConfirmH, setMeasuredConfirmH] = React.useState<number>(254)
  const [isGreeting, setIsGreeting] = React.useState<boolean>(false)
  const [, setIsPaused] = React.useState(false)
  const [hoverCutMs, setHoverCutMs] = React.useState<number | null>(null)
  const [toastRevision, setToastRevision] = React.useState(0)
  const [progressKey, setProgressKey] = React.useState(0)

  const timerRef = React.useRef<number | null>(null)
  const remainingRef = React.useRef<number>(0)
  const startedAtRef = React.useRef<number>(0)
  const stageTimerRef = React.useRef<number | null>(null)
  const confirmCardRef = React.useRef<HTMLDivElement | null>(null)
  const wrapperRef = React.useRef<HTMLDivElement | null>(null)
  const promptInputRef = React.useRef<HTMLInputElement | null>(null)
  const pendingToastRef = React.useRef<PalNotchNotification | null>(null)

  React.useEffect(() => {
    return () => {
      if (stageTimerRef.current !== null) {
        window.clearTimeout(stageTimerRef.current)
      }
    }
  }, [])

  React.useLayoutEffect(() => {
    if (
      confirmCardRef.current &&
      (confirmStage === "widening" || confirmStage === "expanding" || confirmStage === "open")
    ) {
      const h = confirmCardRef.current.offsetHeight
      if (h > 60) {
        setMeasuredConfirmH(h + 18) // 8px top + 10px bottom bezel padding
      }
    }
  }, [confirmStage, activeConfirm, activePrompt])

  React.useEffect(() => {
    if (!confirmCardRef.current || (confirmStage !== "expanding" && confirmStage !== "open")) return
    const ro = new ResizeObserver(() => {
      if (confirmCardRef.current) {
        const h = confirmCardRef.current.offsetHeight
        if (h > 60) {
          setMeasuredConfirmH(h + 18)
        }
      }
    })
    ro.observe(confirmCardRef.current)
    return () => ro.disconnect()
  }, [confirmStage])

  React.useEffect(() => {
    if (confirmStage === "open" && activePrompt && promptInputRef.current) {
      promptInputRef.current.focus()
      promptInputRef.current.select()
    }
  }, [confirmStage, activePrompt])

  const handleDismissConfirm = React.useCallback(
    (action: "confirm" | "cancel") => {
      if (!activeConfirm || confirmStage === "closing" || confirmStage === "idle") return

      if (stageTimerRef.current !== null) {
        window.clearTimeout(stageTimerRef.current)
        stageTimerRef.current = null
      }

      setConfirmStage("closing")

      const targetAction = action === "confirm" ? activeConfirm.onConfirm : activeConfirm.onCancel

      if (action === "confirm") {
        void targetAction?.()
      } else {
        pendingToastRef.current = null
        targetAction?.()
      }

      stageTimerRef.current = window.setTimeout(() => {
        setActiveConfirm(null)
        setConfirmStage("idle")
        stageTimerRef.current = null

        if (action === "confirm" && pendingToastRef.current) {
          const queuedToast = pendingToastRef.current
          pendingToastRef.current = null
          setActiveToast(queuedToast)
          setToastRevision((r) => r + 1)
          setProgressKey((k) => k + 1)
          setIsPaused(false)
        } else {
          pendingToastRef.current = null
        }
      }, 300)
    },
    [activeConfirm, confirmStage]
  )

  const handleDismissPrompt = React.useCallback(
    (action: "submit" | "cancel") => {
      if (!activePrompt || confirmStage === "closing" || confirmStage === "idle") return

      if (stageTimerRef.current !== null) {
        window.clearTimeout(stageTimerRef.current)
        stageTimerRef.current = null
      }

      setConfirmStage("closing")

      if (action === "cancel") {
        pendingToastRef.current = null
        activePrompt.onCancel?.()
      }

      stageTimerRef.current = window.setTimeout(() => {
        setActivePrompt(null)
        setPromptValue("")
        setPromptError(null)
        setIsPromptSubmitting(false)
        setConfirmStage("idle")
        stageTimerRef.current = null

        if (action === "submit" && pendingToastRef.current) {
          const queuedToast = pendingToastRef.current
          pendingToastRef.current = null
          setActiveToast(queuedToast)
          setToastRevision((r) => r + 1)
          setProgressKey((k) => k + 1)
          setIsPaused(false)
        } else {
          pendingToastRef.current = null
        }
      }, 300)
    },
    [activePrompt, confirmStage]
  )

  const handlePromptSubmit = React.useCallback(async () => {
    if (!activePrompt || confirmStage === "closing" || confirmStage === "idle" || isPromptSubmitting) return

    const trimmed = promptValue.trim()
    if (!trimmed) {
      setPromptError(
        activePrompt.errorMessage ||
          `Please enter a ${activePrompt.inputLabel ? activePrompt.inputLabel.toLowerCase().replace("*", "").trim() : "name"}`
      )
      promptInputRef.current?.focus()
      return
    }

    try {
      setIsPromptSubmitting(true)
      await activePrompt.onSubmit(trimmed)
      handleDismissPrompt("submit")
    } catch {
      setIsPromptSubmitting(false)
    }
  }, [activePrompt, confirmStage, isPromptSubmitting, promptValue, handleDismissPrompt])

  const clearTimer = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  React.useEffect(() => {
    const handler: NotchListener = (event) => {
      if (event.type === "document") {
        // A toast fired just before the sheet opened (e.g. "Quotation created") waits until the sheet closes.
        const fresh = lastToast && Date.now() - lastToast.createdAt < 1500 ? lastToast : null
        pendingToastRef.current = activeToast ?? fresh ?? pendingToastRef.current
        lastToast = null
        if (stageTimerRef.current !== null) {
          window.clearTimeout(stageTimerRef.current)
          stageTimerRef.current = null
        }
        setIsGreeting(false)
        setActiveToast(null)
        setActiveConfirm(null)
        setActivePrompt(null)
        setConfirmStage("idle")
        setActiveDoc(event.item)
        setToastRevision((r) => r + 1)
      } else if (event.type === "documentClose") {
        setActiveDoc(null)
        const queued = pendingToastRef.current
        pendingToastRef.current = null
        if (queued) {
          setActiveToast(queued)
          setToastRevision((r) => r + 1)
          setProgressKey((k) => k + 1)
          setIsPaused(false)
        }
      } else if (event.type === "push") {
        if (activeDoc) {
          pendingToastRef.current = event.item
          return
        }
        if (confirmStage !== "idle") {
          pendingToastRef.current = event.item
          return
        }
        pendingToastRef.current = null
        if (stageTimerRef.current !== null) {
          window.clearTimeout(stageTimerRef.current)
          stageTimerRef.current = null
        }
        setConfirmStage("idle")
        setIsGreeting(false)
        setActiveConfirm(null)
        setActivePrompt(null)
        setActiveToast(event.item)
        setToastRevision((r) => r + 1)
        setProgressKey((k) => k + 1)
        setIsPaused(false)
      } else if (event.type === "confirm") {
        pendingToastRef.current = null
        if (stageTimerRef.current !== null) {
          window.clearTimeout(stageTimerRef.current)
          stageTimerRef.current = null
        }
        setIsGreeting(false)
        setActiveToast(null)
        setActivePrompt(null)
        setActiveConfirm(event.item)
        setToastRevision((r) => r + 1)
        setIsPaused(true)
        setConfirmStage("widening")

        // Stage 1 (0-220ms): Width stretches from 216px to 440px horizontally, height held at 34px
        stageTimerRef.current = window.setTimeout(() => {
          // Read natural height of modal card at 440px width
          if (confirmCardRef.current) {
            const h = confirmCardRef.current.offsetHeight
            if (h > 60) {
              setMeasuredConfirmH(h + 18) // 8px top + 10px bottom padding
            }
          }
          setConfirmStage("expanding")

          // Stage 2 (220ms-500ms): Height unfolds downwards to measuredConfirmH
          stageTimerRef.current = window.setTimeout(() => {
            setConfirmStage("open") // Locks to natural height: auto with zero bottom gap
            stageTimerRef.current = null
          }, 280)
        }, 220)
      } else if (event.type === "prompt") {
        pendingToastRef.current = null
        if (stageTimerRef.current !== null) {
          window.clearTimeout(stageTimerRef.current)
          stageTimerRef.current = null
        }
        // Mutually exclusive: immediately replaces the Pal greeting, active toast, and confirm modal
        setIsGreeting(false)
        setActiveToast(null)
        setActiveConfirm(null)
        setActivePrompt(event.item)
        setPromptValue(event.item.defaultValue || "")
        setPromptError(null)
        setIsPromptSubmitting(false)
        setToastRevision((r) => r + 1)
        setIsPaused(true)
        setConfirmStage("widening")

        // Stage 1 (0-220ms): Width stretches horizontally first from 216px to 440px, height held at 34px
        stageTimerRef.current = window.setTimeout(() => {
          // Read natural height of modal card at 440px width
          if (confirmCardRef.current) {
            const h = confirmCardRef.current.offsetHeight
            if (h > 60) {
              setMeasuredConfirmH(h + 18) // 8px top + 10px bottom bezel padding
            }
          }
          setConfirmStage("expanding")

          // Stage 2 (220ms-500ms): Height unfolds vertically downwards to measuredConfirmH
          stageTimerRef.current = window.setTimeout(() => {
            setConfirmStage("open") // Settles into stable open state with zero bottom gap
            stageTimerRef.current = null
          }, 280)
        }, 220)
      } else if (event.type === "greeting") {
        // If confirmation dialog, prompt modal or document sheet is active, greeting cannot override it
        if (confirmStage !== "idle" || activeDoc) {
          return
        }
        pendingToastRef.current = null
        setActiveToast(null)
        setActiveConfirm(null)
        setActivePrompt(null)
        setConfirmStage("idle")
        setIsGreeting(true)
      } else if (event.type === "dismiss") {
        if (event.id && pendingToastRef.current?.id === event.id) {
          pendingToastRef.current = null
        }
        setActiveToast((curr) => (!event.id || curr?.id === event.id ? null : curr))
        if (!event.id || activeConfirm?.id === event.id) {
          handleDismissConfirm("cancel")
        }
        if (!event.id || activePrompt?.id === event.id) {
          handleDismissPrompt("cancel")
        }
      }
    }
    listeners.add(handler)
    return () => {
      listeners.delete(handler)
    }
  }, [confirmStage, activeConfirm, activePrompt, activeDoc, activeToast, handleDismissConfirm, handleDismissPrompt])

  // Arm the dismiss timer whenever a toast appears. It is never paused.
  React.useEffect(() => {
    clearTimer()
    setHoverCutMs(null)
    if (!activeToast || activeToast.duration <= 0 || Boolean(activeConfirm) || Boolean(activePrompt)) return

    startedAtRef.current = Date.now()
    remainingRef.current = activeToast.duration
    timerRef.current = window.setTimeout(() => {
      setActiveToast(null)
    }, activeToast.duration)

    return clearTimer
  }, [activeToast, activeConfirm, activePrompt, toastRevision, clearTimer])

  // Pointer on the toast = "I've seen it": wrap up fast instead of freezing it in place.
  const speedUpToast = React.useCallback(() => {
    if (!activeToast || activeToast.duration <= 0 || hoverCutMs !== null) return
    const elapsed = Date.now() - startedAtRef.current
    const left = activeToast.duration - elapsed
    if (left <= TOAST_HOVER_MS) return
    clearTimer()
    timerRef.current = window.setTimeout(() => {
      setActiveToast(null)
    }, TOAST_HOVER_MS)
    // The countdown bar keeps its place and just finishes sooner.
    setHoverCutMs(elapsed + TOAST_HOVER_MS)
  }, [activeToast, hoverCutMs, clearTimer])

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (activeConfirm && confirmStage !== "closing" && confirmStage !== "idle") {
        if (e.key === "Escape") {
          e.preventDefault()
          handleDismissConfirm("cancel")
        } else if (e.key === "Enter") {
          e.preventDefault()
          handleDismissConfirm("confirm")
        }
        return
      }

      if (activePrompt && confirmStage !== "closing" && confirmStage !== "idle") {
        if (e.key === "Escape") {
          e.preventDefault()
          handleDismissPrompt("cancel")
        }
        return
      }

      if (isGreeting && e.key === "Escape") {
        setIsGreeting(false)
        return
      }

      if (activeToast && e.key === "Escape") {
        setActiveToast(null)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [activeToast, activeConfirm, activePrompt, isGreeting, confirmStage, handleDismissConfirm, handleDismissPrompt])

  const isConfirm = Boolean(activeConfirm) && confirmStage !== "idle"
  const isPrompt = Boolean(activePrompt) && confirmStage !== "idle"
  const isModalActive = isConfirm || isPrompt
  const isConfirmWidening = confirmStage === "widening"
  const isConfirmExpanding = confirmStage === "expanding"
  const isConfirmOpen = confirmStage === "open"
  const isConfirmClosing = confirmStage === "closing"

  const isDoc = Boolean(activeDoc) && !isModalActive
  const isToast = Boolean(activeToast) && !isModalActive && !isDoc
  const isGreetingActive = isGreeting && !isModalActive && !isToast && !isDoc
  const isExpanded = isModalActive || isToast || isDoc || isGreetingActive || isConfirmClosing
  const toastTone = activeToast ? VARIANT_TONE[activeToast.variant] : null

  const islandClass = isConfirmWidening
    ? "pal-confirm-widening"
    : isConfirmExpanding
    ? "pal-confirm-expanding"
    : isConfirmOpen
    ? "is-confirm"
    : isConfirmClosing
    ? "pal-confirm-closing"
    : isDoc
    ? "is-doc"
    : isToast
    ? "is-toast"
    : isGreetingActive
    ? "is-greeting"
    : "is-idle"

  return (
    <>
      {/* Real Viewport Backdrop Overlay Portal (Blurred Dimming on Background App Alone) */}
      {(isModalActive || isConfirmClosing) &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99980,
              backgroundColor: "rgba(12, 17, 29, 0.45)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              pointerEvents: isConfirmClosing ? "none" : "auto",
              animation: isConfirmClosing
                ? "palBackdropOut 0.20s ease both"
                : "palBackdropIn 0.20s cubic-bezier(0.16, 1, 0.3, 1) both",
            }}
            onClick={() => {
              if (!isConfirmClosing) {
                if (activePrompt) {
                  handleDismissPrompt("cancel")
                } else {
                  handleDismissConfirm("cancel")
                }
              }
            }}
            aria-hidden="true"
          />,
          document.body
        )}

      <aside className="printpal-notch-dock" aria-live="polite" aria-atomic="true">
        {/* Pal notch stylesheet */}
        <style>{`
          .printpal-notch-dock {
            position: fixed !important;
            top: 0 !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            z-index: 99999 !important;
            pointer-events: none !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }

          /* Fluid spring wrapper: cubic-bezier(.32, 1.22, .42, 1) */
          .pal-island-wrapper {
            position: relative !important;
            pointer-events: auto !important;
            transform-origin: top center !important;
            transition: width 0.36s cubic-bezier(0.32, 1.22, 0.42, 1),
                        height 0.36s cubic-bezier(0.32, 1.22, 0.42, 1),
                        box-shadow 0.30s ease !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            box-sizing: border-box !important;
          }

          .pal-island-wrapper.is-idle {
            width: 216px !important;
            height: 34px !important;
            transition: width 0.35s cubic-bezier(0.32, 1.22, 0.42, 1),
                        height 0.35s cubic-bezier(0.32, 1.22, 0.42, 1),
                        margin-top 0.3s ease,
                        box-shadow 0.20s ease !important;
          }

          .pal-island-wrapper.is-greeting {
            width: min(440px, calc(100vw - 28px)) !important;
            height: 104px !important;
            transition: width 0.38s cubic-bezier(0.32, 1.22, 0.42, 1),
                        height 0.38s cubic-bezier(0.32, 1.22, 0.42, 1),
                        box-shadow 0.30s ease !important;
          }

          .pal-island-wrapper.is-toast,
          .pal-island-wrapper.is-doc {
            width: min(400px, calc(100vw - 28px)) !important;
            height: auto !important;
            min-height: 58px !important;
            transition: width 0.38s cubic-bezier(0.32, 1.22, 0.42, 1),
                        height 0.38s cubic-bezier(0.32, 1.22, 0.42, 1),
                        margin-top 0.3s ease,
                        box-shadow 0.30s ease !important;
          }

          /* ── CONFIRM STAGE 1: WIDENING (Width 216px -> 440px horizontally, Height stays 34px) ── */
          .pal-island-wrapper.pal-confirm-widening {
            width: min(440px, calc(100vw - 28px)) !important;
            height: 34px !important;
            transition: width 0.22s cubic-bezier(0.32, 1.22, 0.42, 1) !important;
          }

          .pal-island-surface.pal-confirm-widening {
            height: 34px !important;
            border-radius: 0 0 16px 16px !important;
            background: #000000 !important;
            padding: 0 14px !important;
            overflow: hidden !important;
          }

          /* ── CONFIRM STAGE 2: EXPANDING (Height unfolds vertically to measured height) ── */
          .pal-island-wrapper.pal-confirm-expanding {
            width: min(440px, calc(100vw - 28px)) !important;
            height: var(--confirm-target-h, 254px) !important;
            transition: height 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }

          .pal-island-surface.pal-confirm-expanding {
            height: 100% !important;
            border-radius: 0 0 24px 24px !important;
            background: #000000 !important;
            padding: 8px 8px 10px 8px !important;
            box-shadow: 0 24px 56px -8px rgba(0, 0, 0, 0.72), 0 4px 20px rgba(0, 0, 0, 0.45), inset 0 -1px 0 rgba(255, 255, 255, 0.08) !important;
            overflow: hidden !important;
          }

          /* ── CONFIRM STAGE 3: OPEN (Settled into exact measured height, zero extra bottom spacing) ── */
          .pal-island-wrapper.is-confirm {
            width: min(440px, calc(100vw - 28px)) !important;
            height: var(--confirm-target-h, 254px) !important;
          }

          .pal-island-surface.is-confirm {
            height: 100% !important;
            border-radius: 0 0 24px 24px !important;
            background: #000000 !important;
            padding: 8px 8px 10px 8px !important;
            box-shadow: 0 24px 56px -8px rgba(0, 0, 0, 0.72), 0 4px 20px rgba(0, 0, 0, 0.45), inset 0 -1px 0 rgba(255, 255, 255, 0.08) !important;
            cursor: default !important;
            overflow: hidden !important;
          }

          /* ── CONFIRM CLOSING: Height collapses first, width snaps second ── */
          .pal-island-wrapper.pal-confirm-closing {
            width: 216px !important;
            height: 34px !important;
            transition: height 0.18s cubic-bezier(0.4, 0, 0.2, 1) 0s,
                        width 0.20s cubic-bezier(0.4, 0, 0.2, 1) 0.10s,
                        box-shadow 0.20s ease !important;
          }

          .pal-island-surface.pal-confirm-closing {
            height: 34px !important;
            border-radius: 0 0 16px 16px !important;
            background: #000000 !important;
            padding: 0 14px !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.38), 0 2px 6px rgba(0, 0, 0, 0.22), inset 0 -1px 0 rgba(255, 255, 255, 0.12) !important;
            transition: height 0.18s cubic-bezier(0.4, 0, 0.2, 1) 0s,
                        border-radius 0.20s ease 0.10s,
                        padding 0.16s ease !important;
            overflow: hidden !important;
          }

          /* Invisible during widening stage so user only sees the sleek black expanding pill */
          .pal-content-hidden {
            width: 100% !important;
            box-sizing: border-box !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }

          /* Concave top-edge ears (ONLY visible when docked to bezel in idle or toast) */
          .pal-ear-l, .pal-ear-r {
            position: absolute !important;
            top: 0 !important;
            width: 14px !important;
            height: 14px !important;
            pointer-events: none !important;
            z-index: 10 !important;
          }
          .pal-ear-l {
            left: -14px !important;
            background: radial-gradient(circle at 0 14px, transparent 13.5px, #000000 14px) !important;
          }
          .pal-ear-r {
            right: -14px !important;
            background: radial-gradient(circle at 14px 14px, transparent 13.5px, #000000 14px) !important;
          }

          /* Island Surface */
          .pal-island-surface {
            position: relative !important;
            z-index: 2 !important;
            width: 100% !important;
            height: 100% !important;
            transition: border-radius 0.35s ease,
                        box-shadow 0.30s ease,
                        background-color 0.25s ease !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
          }

          .pal-island-surface.is-idle {
            height: 34px !important;
            border-radius: 0 0 16px 16px !important;
            padding: 0 14px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            background: #000000 !important;
            color: #F5F6F8 !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.38), 0 2px 6px rgba(0, 0, 0, 0.22), inset 0 -1px 0 rgba(255, 255, 255, 0.12) !important;
            cursor: pointer !important;
            transition: height 0.24s cubic-bezier(0.4, 0, 0.2, 1),
                        border-radius 0.20s ease,
                        padding 0.18s ease !important;
          }

          .pal-island-surface.is-greeting {
            height: 104px !important;
            border-radius: 0 0 22px 22px !important;
            background: radial-gradient(120% 90% at 50% 120%, rgba(215, 68, 14, 0.16), transparent 70%), #000000 !important;
            color: #F5F6F8 !important;
            box-shadow: 0 16px 40px -6px rgba(0, 0, 0, 0.65), 0 4px 16px rgba(0, 0, 0, 0.35), inset 0 -1px 0 rgba(255, 255, 255, 0.08) !important;
            cursor: pointer !important;
          }

          /* Pal greeting: canvas scene + vector Pal on top, both a fixed 440 x 104 box */
          .pal-greeting {
            --pal-stage-w: min(440px, calc(100vw - 28px));
            position: relative;
            display: block;
            width: 100%;
            height: 104px;
            overflow: hidden;
          }
          .pal-greeting-canvas {
            position: absolute;
            top: 0;
            left: 50%;
            display: block;
            width: var(--pal-stage-w);
            height: 104px;
            transform: translateX(-50%);
          }
          .pal-stage {
            position: absolute;
            top: 0;
            left: 50%;
            width: 440px;
            height: 104px;
            margin-left: calc(var(--pal-stage-w) / -2);
            transform-origin: 0 0;
            pointer-events: none;
          }
          .pal-stage-pal {
            position: absolute;
            top: 0;
            left: 0;
            transform-origin: 50% 50%;
            opacity: 0;
          }
          .pal-doc-mascot {
            flex-shrink: 0;
            margin: 0 -2px 0 -6px;
          }
          .pal-toast-mascot {
            flex-shrink: 0;
            margin: -2px 0 -2px -2px;
          }
          .pal-idle-mascot {
            display: block;
            flex-shrink: 0;
            margin-left: -3px;
          }

          .pal-island-surface.is-toast,
          .pal-island-surface.is-doc {
            height: auto !important;
            min-height: 58px !important;
            border-radius: 0 0 22px 22px !important;
            background: #000000 !important;
            color: #F5F6F8 !important;
            box-shadow: 0 14px 32px -8px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.25), inset 0 -1px 0 rgba(255, 255, 255, 0.08) !important;
            cursor: default !important;
          }

          /* Document mode: the notch widens into a small printer body, a little wider than the paper.
             These come after the toast rules on purpose so they win. */
          .pal-island-wrapper.is-doc {
            width: var(--pal-doc-w, 440px) !important;
            min-height: 0 !important;
            margin-top: ${DOC_TOP}px !important;
            transition: width 0.42s cubic-bezier(0.32, 1.22, 0.42, 1),
                        height 0.42s cubic-bezier(0.32, 1.22, 0.42, 1),
                        margin-top 0.36s cubic-bezier(0.32, 1.22, 0.42, 1) !important;
          }
          /* A free-standing machine: all corners rounded, lifted body, no bezel ears. */
          .pal-island-wrapper.is-doc .pal-ear-l,
          .pal-island-wrapper.is-doc .pal-ear-r { display: none !important; }
          .pal-island-surface.is-doc {
            min-height: 0 !important;
            border-radius: 24px !important;
            padding: ${DOC_PAD}px ${DOC_PAD}px ${DOC_LIP}px ${DOC_PAD}px !important;
            background: linear-gradient(180deg, #2C2D32 0%, #1B1C20 100%) !important;
            box-shadow: 0 22px 34px -12px rgba(0, 0, 0, 0.6),
                        0 4px 10px rgba(0, 0, 0, 0.35),
                        inset 0 1px 0 rgba(255, 255, 255, 0.14),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.06) !important;
          }

          @keyframes palBackdropIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes palBackdropOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }

          /* Modal content enters simultaneously as width & height expand */
          .pal-content-in {
            width: 100% !important;
            box-sizing: border-box !important;
            animation: palModalDropIn 0.30s cubic-bezier(0.16, 1, 0.3, 1) both !important;
          }

          .pal-content-fade-out {
            width: 100% !important;
            box-sizing: border-box !important;
            animation: palModalFadeOut 0.16s cubic-bezier(0.4, 0, 0.2, 1) both !important;
          }

          @keyframes palModalDropIn {
            0% {
              opacity: 0;
              transform: translateY(-6px) scale(0.98);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes palModalFadeOut {
            0% {
              opacity: 1;
              transform: scale(1);
            }
            100% {
              opacity: 0;
              transform: scale(0.97);
            }
          }

          /* Toast Content Spring Animation */
          .pal-content-spring-in {
            width: 100% !important;
            height: 100% !important;
            box-sizing: border-box !important;
            animation: palContentIn 0.34s cubic-bezier(0.32, 1.22, 0.42, 1) 0.08s both !important;
          }

          @keyframes palContentIn {
            0% {
              opacity: 0;
              transform: translateY(-6px) scale(0.98);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* Draining Progress Bar */
          .pal-progress-drain {
            width: 100% !important;
            animation-name: palDrainCountdown !important;
            animation-timing-function: linear !important;
            animation-fill-mode: forwards !important;
            transform-origin: left center !important;
          }

          @keyframes palDrainCountdown {
            0% {
              transform: scaleX(1);
            }
            100% {
              transform: scaleX(0);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .pal-island-wrapper,
            .pal-island-surface,
            .pal-content-in,
            .pal-content-fade-out,
            .pal-content-spring-in,
            .pal-progress-drain {
              animation: none !important;
              transition: none !important;
            }
          }
        `}</style>

        {/* Main island wrapper with spring transitions */}
        <div
          ref={wrapperRef}
          className={`pal-island-wrapper ${islandClass}`}
          onClick={() => {
            if (!activeConfirm && !activePrompt && !activeToast && !activeDoc && confirmStage === "idle") {
              setIsGreeting((prev) => !prev)
            }
          }}
          style={{
            cursor: !isExpanded || isGreetingActive ? "pointer" : "default",
            ...((isConfirmExpanding || isModalActive || isConfirmClosing)
              ? ({ "--confirm-target-h": `${measuredConfirmH}px` } as React.CSSProperties)
              : {}),
            ...(isDoc && activeDoc
              ? ({ "--pal-doc-w": `${activeDoc.paperWidth + DOC_RIM * 2}px` } as React.CSSProperties)
              : {}),
          }}
          onMouseEnter={() => {
            if (isToast) speedUpToast()
          }}
        >
          {/* Concave Ears (Flush Bezel Transition) */}
          <div className="pal-ear-l" aria-hidden="true" />
          <div className="pal-ear-r" aria-hidden="true" />

          {/* Island Surface Container */}
          <div
            className={`pal-island-surface ${islandClass}`}
            style={{
              background: (isModalActive || isConfirmClosing)
                ? "#000000"
                : isGreetingActive
                ? "radial-gradient(120% 90% at 50% 120%, rgba(215, 68, 14, 0.16), transparent 70%), #000000"
                : "#000000",
            }}
          >
          {/* ── PAL GREETING: the mascot says hi ── */}
          {isGreetingActive && (
            <PalGreeting onComplete={() => setIsGreeting(false)} />
          )}

          {/* ── IDLE COMPACT NOTCH ── */}
          {!isExpanded && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <PalMascot size={22} hands={false} className="pal-idle-mascot" />

                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  PAL
                </span>

                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 500,
                    color: "#94A3B8",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activeModuleLabel}
                </span>
              </div>

              {/* Ambient Camera / Sensor Lens Dot */}
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#111418",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  flexShrink: 0,
                }}
              />
            </>
          )}

          {/* ── INTERACTIVE DELETE CONFIRMATION MODAL INSIDE THE NOTCH INTERNAL CONTAINER ── */}
          {isConfirm && activeConfirm && (
            <div
              ref={confirmCardRef}
              key={`confirm-${toastRevision}`}
              className={
                isConfirmClosing
                  ? "pal-content-fade-out"
                  : isConfirmWidening
                  ? "pal-content-hidden"
                  : "pal-content-in"
              }
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                backgroundColor: "#FFFFFF",
                padding: "20px 20px 18px 20px",
                position: "relative",
                boxSizing: "border-box",
                borderRadius: 16,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 0 0 1px #EAECF0",
              }}
            >
              {/* Close Button X in Top Right */}
              <button
                type="button"
                onClick={() => handleDismissConfirm("cancel")}
                aria-label="Close dialog"
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#98A2B3",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#344054"
                  e.currentTarget.style.backgroundColor = "#F2F4F7"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#98A2B3"
                  e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                <X size={16} />
              </button>

              {/* Untitled UI Dual-Ring Destructive Badge */}
              <div style={{ marginBottom: 16 }}>
                <ModalIconBadge variant="destructive">
                  <Trash2 className="h-5 w-5 stroke-[2.2]" />
                </ModalIconBadge>
              </div>

              {/* Modal Title */}
              <ModalTitle
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#101828",
                  lineHeight: 1.35,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {activeConfirm.title}
              </ModalTitle>

              {/* Modal Description */}
              {activeConfirm.description && (
                <ModalDescription
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#475467",
                    lineHeight: 1.5,
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  {activeConfirm.description}
                </ModalDescription>
              )}

              {/* Modal Actions Footer: Clean Untitled UI Buttons WITHOUT Icons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 12,
                  marginTop: 24,
                  paddingTop: 16,
                  borderTop: "1px solid #EAECF0",
                }}
              >
                <ModalButton
                  variant="secondary"
                  onClick={() => handleDismissConfirm("cancel")}
                  style={{ minWidth: 92 }}
                >
                  {activeConfirm.cancelText || "Cancel"}
                </ModalButton>

                <ModalButton
                  variant="destructive"
                  onClick={() => handleDismissConfirm("confirm")}
                  style={{ minWidth: 92 }}
                >
                  {activeConfirm.confirmText || "Delete"}
                </ModalButton>
              </div>
            </div>
          )}

          {/* ── INTERACTIVE PROMPT MODAL (ADD/EDIT MATERIAL, FINISH, ETC.) INSIDE PAL NOTCH ── */}
          {isPrompt && activePrompt && (
            <div
              ref={confirmCardRef}
              key={`prompt-${toastRevision}`}
              className={
                isConfirmClosing
                  ? "pal-content-fade-out"
                  : isConfirmWidening
                  ? "pal-content-hidden"
                  : "pal-content-in"
              }
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                backgroundColor: "#FFFFFF",
                padding: "20px 20px 18px 20px",
                position: "relative",
                boxSizing: "border-box",
                borderRadius: 16,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 0 0 1px #EAECF0",
              }}
            >
              {/* Close Button X in Top Right */}
              <button
                type="button"
                onClick={() => handleDismissPrompt("cancel")}
                aria-label="Close dialog"
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#98A2B3",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#344054"
                  e.currentTarget.style.backgroundColor = "#F2F4F7"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#98A2B3"
                  e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                <X size={16} />
              </button>

              {/* Untitled UI Dual-Ring Brand Badge */}
              <div style={{ marginBottom: 16 }}>
                <ModalIconBadge variant={activePrompt.variant || "brand"}>
                  {activePrompt.icon === "material" ? (
                    <Layers className="h-5 w-5 stroke-[2.2]" />
                  ) : activePrompt.icon === "finish" ? (
                    <Palette className="h-5 w-5 stroke-[2.2]" />
                  ) : activePrompt.icon === "edit" ? (
                    <Edit3 className="h-5 w-5 stroke-[2.2]" />
                  ) : (
                    <Plus className="h-5 w-5 stroke-[2.2]" />
                  )}
                </ModalIconBadge>
              </div>

              {/* Modal Title */}
              <ModalTitle
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#101828",
                  lineHeight: 1.35,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {activePrompt.title}
              </ModalTitle>

              {/* Modal Description */}
              {activePrompt.description && (
                <ModalDescription
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#475467",
                    lineHeight: 1.5,
                    marginTop: 8,
                    marginBottom: 0,
                  }}
                >
                  {activePrompt.description}
                </ModalDescription>
              )}

              {/* Form Input Field */}
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                {activePrompt.inputLabel && (
                  <label
                    htmlFor="pal-prompt-input"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#344054",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>{activePrompt.inputLabel}</span>
                    <span style={{ color: "#EF4444" }}>*</span>
                  </label>
                )}
                <input
                  id="pal-prompt-input"
                  ref={promptInputRef}
                  type="text"
                  value={promptValue}
                  onChange={(e) => {
                    setPromptValue(e.target.value)
                    if (promptError) setPromptError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handlePromptSubmit()
                    } else if (e.key === "Escape") {
                      e.preventDefault()
                      handleDismissPrompt("cancel")
                    }
                  }}
                  placeholder={activePrompt.inputPlaceholder || "Enter name..."}
                  style={{
                    height: 40,
                    width: "100%",
                    borderRadius: 8,
                    border: promptError ? "1.5px solid #EF4444" : "1px solid #D0D5DD",
                    backgroundColor: "#FFFFFF",
                    padding: "0 12px",
                    fontSize: 14,
                    color: "#101828",
                    outline: "none",
                    boxSizing: "border-box",
                    boxShadow: promptError
                      ? "0 1px 2px rgba(16, 24, 40, 0.05), 0 0 0 3px rgba(239, 68, 68, 0.15)"
                      : "0 1px 2px rgba(16, 24, 40, 0.05)",
                    transition: "all 0.15s ease",
                  }}
                  onFocus={(e) => {
                    if (!promptError) {
                      e.currentTarget.style.borderColor = "#D7440E"
                      e.currentTarget.style.boxShadow =
                        "0 1px 2px rgba(16, 24, 40, 0.05), 0 0 0 3px rgba(215, 68, 14, 0.15)"
                    }
                  }}
                  onBlur={(e) => {
                    if (!promptError) {
                      e.currentTarget.style.borderColor = "#D0D5DD"
                      e.currentTarget.style.boxShadow = "0 1px 2px rgba(16, 24, 40, 0.05)"
                    }
                  }}
                />
                {promptError && (
                  <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 500 }}>
                    {promptError}
                  </span>
                )}
              </div>

              {/* Modal Actions Footer: Cancel & Primary Brand Save Button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 12,
                  marginTop: 20,
                  paddingTop: 16,
                  borderTop: "1px solid #EAECF0",
                }}
              >
                <ModalButton
                  variant="secondary"
                  onClick={() => handleDismissPrompt("cancel")}
                  style={{ minWidth: 92 }}
                  disabled={isPromptSubmitting}
                >
                  {activePrompt.cancelText || "Cancel"}
                </ModalButton>

                <ModalButton
                  variant="primary"
                  onClick={handlePromptSubmit}
                  style={{ minWidth: 92 }}
                  disabled={isPromptSubmitting}
                >
                  {isPromptSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    activePrompt.submitText || "Save"
                  )}
                </ModalButton>
              </div>
            </div>
          )}

          {/* ── DOCUMENT BAR: the notch is the printer slot and the control bar for the sheet ── */}
          {isDoc && activeDoc && (
            <div
              key={`doc-${toastRevision}`}
              className="pal-content-spring-in"
              style={{ position: "relative", width: "100%", boxSizing: "border-box" }}
            >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                height: DOC_BAR_H,
                padding: "0 12px 0 16px",
                boxSizing: "border-box",
                borderRadius: 16,
                background: "#0D0E10",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              {/* Pal at work: its mouth opens like a printer slot and a sheet comes out while the PDF slides down */}
              <PalMascot size={42} hands={false} tone="info" mode="work" className="pal-doc-mascot" />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#F5F6F8",
                    lineHeight: 1.3,
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {activeDoc.title}
                </p>
                {activeDoc.subtitle && (
                  <p
                    style={{
                      fontSize: 12,
                      color: "#9AA3AF",
                      lineHeight: 1.3,
                      margin: "1px 0 0 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {activeDoc.subtitle}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  activeDoc.onDownload()
                }}
                style={{
                  height: 32,
                  padding: "0 14px",
                  borderRadius: 9999,
                  backgroundColor: "#D7440E",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#C23B0A")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D7440E")}
              >
                <Download size={14} strokeWidth={2.4} />
                {activeDoc.downloadLabel || "Download"}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  activeDoc.onClose()
                }}
                aria-label="Close"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#9AA3AF",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#FFFFFF"
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#9AA3AF"
                  e.currentTarget.style.backgroundColor = "transparent"
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* The slot: a dark recess in the machine face, wider than the paper that slides out of it. */}
            <div
              aria-hidden="true"
              style={{
                marginTop: DOC_GAP,
                height: DOC_SLOT_H,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: activeDoc.paperWidth + 20,
                  height: DOC_SLOT_H,
                  borderRadius: DOC_SLOT_H / 2,
                  background: "#08080A",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.95), 0 1px 0 rgba(255,255,255,0.09)",
                }}
              />
            </div>
            </div>
          )}

          {/* ── ACTIVE TOAST: a calm black pill. Colour lives only in Pal's subtle tint. ── */}
          {isToast && activeToast && toastTone && (
            <div
              key={toastRevision}
              className="pal-content-spring-in"
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                width: "100%",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: activeToast.description || activeToast.badge || activeToast.customerCard ? "flex-start" : "center",
                  gap: 12,
                  padding: "13px 12px 14px 16px",
                  minHeight: 56,
                  boxSizing: "border-box",
                }}
              >
                <PalMascot size={32} hands={false} tone={toastTone} className="pal-toast-mascot" />

                <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
                  {activeToast.badge && (
                    <div style={{ fontSize: 11, fontWeight: 500, color: "#8A93A0", marginBottom: 2 }}>
                      {activeToast.badge.charAt(0) + activeToast.badge.slice(1).toLowerCase()}
                    </div>
                  )}
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#F5F6F8",
                      lineHeight: 1.35,
                      margin: 0,
                      letterSpacing: "-0.005em",
                      wordBreak: "break-word",
                    }}
                  >
                    {activeToast.title}
                  </p>

                  {activeToast.description && (
                    <p
                      style={{
                        fontSize: 12.5,
                        color: "#9AA3AF",
                        lineHeight: 1.45,
                        margin: "2px 0 0 0",
                        wordBreak: "break-word",
                      }}
                    >
                      {activeToast.description}
                    </p>
                  )}

                  {activeToast.customerCard && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: "8px 10px",
                        borderRadius: 10,
                        backgroundColor: "rgba(255, 255, 255, 0.06)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#F5F6F8",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {activeToast.customerCard.name}
                      </span>
                      {(activeToast.customerCard.phone || activeToast.customerCard.email) && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            alignItems: "center",
                            columnGap: 12,
                            fontSize: 12,
                            color: "#9AA3AF",
                          }}
                        >
                          {activeToast.customerCard.phone && <span>{activeToast.customerCard.phone}</span>}
                          {activeToast.customerCard.email && <span>{activeToast.customerCard.email}</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  {activeToast.action && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        activeToast.action?.onClick()
                        setActiveToast(null)
                      }}
                      style={{
                        height: 28,
                        padding: "0 12px",
                        borderRadius: 9999,
                        backgroundColor: "rgba(255, 255, 255, 0.12)",
                        border: "none",
                        color: "#FFFFFF",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                        whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)")}
                    >
                      {activeToast.action.label}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveToast(null)
                    }}
                    aria-label="Dismiss notification"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#7C8591",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#FFFFFF"
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#7C8591"
                      e.currentTarget.style.backgroundColor = "transparent"
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Hairline countdown along the bottom edge, neutral so it never competes with the message */}
              {activeToast.duration > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: 18,
                    right: 18,
                    bottom: 5,
                    height: 2,
                    borderRadius: 9999,
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    key={progressKey}
                    className="pal-progress-drain"
                    style={{
                      height: "100%",
                      borderRadius: 9999,
                      backgroundColor: "rgba(255, 255, 255, 0.32)",
                      animationDuration: `${hoverCutMs ?? activeToast.duration}ms`,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </aside>
    </>
  )
}
