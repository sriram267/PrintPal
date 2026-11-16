import * as React from "react"
import { createPortal } from "react-dom"
import {
  Check,
  Download,
  FileText,
  AlertCircle,
  AlertTriangle,
  Info,
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

/** The notch as a control bar for a document sheet (title, Download, Close). Stays until closed. */
export interface PalNotchDocumentOptions {
  title: string
  subtitle?: string
  downloadLabel?: string
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

function defaultDuration(variant: PalNotchVariant, hasAction: boolean): number {
  if (variant === "loading") return 0
  if (hasAction || variant === "error" || variant === "warning") return 5000
  return 3600
}

function emitPush(options: PalNotchOptions): string {
  const id = options.id || nextId()
  const variant = options.variant || "info"
  const item: PalNotchNotification = {
    ...options,
    id,
    variant,
    duration: options.duration ?? defaultDuration(variant, Boolean(options.action)),
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

/* Calm, muted tones: the toast is a quiet black pill, the colour lives only in the small icon disc. */
const VARIANT_META: Record<PalNotchVariant, { color: string; disc: string }> = {
  success: { color: "#6FD39A", disc: "rgba(111, 211, 154, 0.14)" },
  error: { color: "#F08A80", disc: "rgba(240, 138, 128, 0.14)" },
  warning: { color: "#EDBA6B", disc: "rgba(237, 186, 107, 0.14)" },
  info: { color: "#8DB4F0", disc: "rgba(141, 180, 240, 0.14)" },
  workshop: { color: "#EE7A4A", disc: "rgba(238, 122, 74, 0.14)" },
  loading: { color: "#C4CAD3", disc: "rgba(196, 202, 211, 0.12)" },
}

function VariantIcon({ variant }: { variant: PalNotchVariant }) {
  const size = 15
  const color = VARIANT_META[variant].color
  const stroke = 2.4
  if (variant === "success" || variant === "workshop") return <Check size={size} color={color} strokeWidth={stroke} />
  if (variant === "error") return <AlertCircle size={size} color={color} strokeWidth={stroke} />
  if (variant === "warning") return <AlertTriangle size={size} color={color} strokeWidth={stroke} />
  if (variant === "loading") return <Loader2 size={size} color={color} strokeWidth={stroke} className="animate-spin" />
  return <Info size={size} color={color} strokeWidth={stroke} />
}

// ── Coucou Mochi Entrance Animation Kinematics & Pure 2D Canvas Engine ──
const GREETING_W = 440
const GREETING_H = 104
const C0 = { x: 220, y: 58 }
const HB = 42
const ASPECT = 1.34
const CARD = { x: 8, y: 14, w: 424, h: 84, r: 16 }

const GT = {
  pop0: 1.3,
  pop1: 1.45,
  content0: 2.4,
  tuck0: 2.45,
  tuck1: 2.7,
  down0: 2.85,
  down1: 3.45,
  blink2: 3.7,
  tint0: 3.85,
  tint1: 4.15,
  end: 4.4,
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)

const E = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  in: (t: number) => t * t * t,
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  back: (t: number) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
}

interface WarpStreak {
  xNorm: number
  speed: number
  len: number
  thick: number
  alpha: number
  t0: number
}
interface RingDot {
  a: number
  j: number
  s: number
  al: number
}

const PARTICLES = (() => {
  let seed = 7
  const rnd = () => {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
  const warps: WarpStreak[] = Array.from({ length: 70 }, () => ({
    xNorm: rnd(),
    speed: 400 + rnd() * 300,
    len: 6 + rnd() * 16,
    thick: 1 + rnd() * 0.5,
    alpha: 0.25 + rnd() * 0.55,
    t0: rnd() * 0.35,
  }))
  const ring: RingDot[] = Array.from({ length: 90 }, () => ({
    a: rnd() * Math.PI * 2,
    j: (rnd() - 0.5) * 0.22,
    s: 0.7 + rnd() * 0.9,
    al: 0.45 + rnd() * 0.55,
  }))
  return { warps, ring }
})()

function mochiSquirclePath(hw: number, hh: number): Path2D {
  const n = 3.2
  const p = new Path2D()
  const steps = 96
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI
    const ca = Math.cos(a)
    const sa = Math.sin(a)
    const px = hw * (ca < 0 ? -1 : 1) * Math.pow(Math.abs(ca), 2 / n)
    const py = hh * (sa < 0 ? -1 : 1) * Math.pow(Math.abs(sa), 2 / n)
    if (i === 0) p.moveTo(px, py)
    else p.lineTo(px, py)
  }
  p.closePath()
  return p
}

interface GreetingPose {
  hb: number
  x: number
  y: number
  sx: number
  sy: number
  tilt: number
  eye: "dot" | "happy" | "content"
  open: number
  eyeRoll: number
  lookX: number
  lookY: number
  handL: number
  handR: number
  wave: number
  tint: number
  halo: number
  haloBlue: number
  card: number
  iw: number
}

function getGreetingPose(t: number): GreetingPose {
  const gx = seg(t, 0, 0.5)
  const g = Math.sin((Math.PI * gx) / 2) + 0.04 * Math.sin(Math.PI * gx) * gx
  const iw = lerp(216, GREETING_W, g)

  const cx = C0.x
  const cy = C0.y
  const hb = t < 0.2 ? 0 : lerp(HB * 0.15, HB, E.back(seg(t, 0.2, 0.6)))

  const landY = cy + 0.12 * HB
  const peakY = cy - 0.15 * HB
  const dipY = cy + 0.36 * HB
  const springY = cy - 0.1 * HB
  const sinkY = cy + 0.3 * HB
  const drift1 = cx - 0.16 * HB
  const drift2 = cx - 0.45 * HB
  const drift3 = cx - 0.57 * HB
  const drift4 = cx - 0.85 * HB

  let x: number
  if (t < 0.85) x = cx
  else if (t < 1.2) x = lerp(cx, drift1, E.inOut(seg(t, 0.85, 1.2)))
  else if (t < 1.3) x = lerp(drift1, drift2, E.in(seg(t, 1.2, 1.3)))
  else if (t < 1.45) x = lerp(drift2, drift3, E.inOut(seg(t, 1.3, 1.45)))
  else if (t < 2.4) x = lerp(drift3, drift4, E.inOut(seg(t, 1.45, 2.4)))
  else if (t < 2.85) x = drift4
  else x = lerp(drift4, cx, E.inOut(seg(t, 2.85, 3.45)))

  let y: number
  if (t < 0.2) y = 12
  else if (t < 0.6) y = lerp(12, landY, E.in(seg(t, 0.2, 0.6)))
  else if (t < 0.73) y = lerp(landY, peakY, E.out(seg(t, 0.6, 0.73)))
  else if (t < 0.9) y = lerp(peakY, cy, E.inOut(seg(t, 0.73, 0.9)))
  else if (t < 1.2) y = cy
  else if (t < 1.3) y = lerp(cy, dipY, E.in(seg(t, 1.2, 1.3)))
  else if (t < 1.45) y = lerp(dipY, springY, E.out(seg(t, 1.3, 1.45)))
  else if (t < 1.6) y = lerp(springY, cy, E.inOut(seg(t, 1.45, 1.6)))
  else if (t < 2.4) y = cy
  else if (t < 2.7) y = lerp(cy, sinkY, E.inOut(seg(t, 2.4, 2.7)))
  else if (t < 2.85) y = sinkY
  else y = lerp(sinkY, cy, E.inOut(seg(t, 2.85, 3.45)))

  if (t >= GT.pop1 && t < GT.tuck0) {
    const w = t - GT.pop1
    y += Math.sin(w * 2 * Math.PI * 5) * 0.02 * HB * clamp(w / 0.08, 0, 1)
  }

  const landSqK = t >= 0.52 && t < 0.68 ? Math.sin(Math.PI * seg(t, 0.52, 0.68)) : 0
  const bounceK = t >= 0.62 && t < 0.84 ? Math.sin(Math.PI * seg(t, 0.62, 0.84)) : 0
  let sx = 1 + 0.14 * landSqK - 0.1 * bounceK
  let sy = 1 - 0.14 * landSqK + 0.18 * bounceK

  const plungeK = t >= 1.18 && t < 1.42 ? Math.sin(Math.PI * seg(t, 1.18, 1.42)) : 0
  const springK = t >= 1.3 && t < 1.46 ? Math.sin(Math.PI * seg(t, 1.3, 1.46)) : 0
  sx += 0.12 * plungeK - 0.18 * springK
  sy -= 0.12 * plungeK - 0.25 * springK

  let sinkK = 0
  if (t >= 2.38 && t < 2.7) sinkK = E.inOut(seg(t, 2.38, 2.7))
  else if (t >= 2.7 && t < 2.85) sinkK = 1 - E.inOut(seg(t, 2.7, 2.85))
  sx += 0.18 * sinkK
  sy -= 0.14 * sinkK

  let eye: "dot" | "happy" | "content" = "dot"
  if (t >= 0.55 && t < 0.8) eye = "happy"
  if (t >= GT.content0 && t < GT.tuck1) eye = "content"
  if (t >= GT.down0 && t < GT.down1) eye = "content"

  const blink = (tb: number) => {
    const k = seg(t, tb, tb + 0.12)
    return k > 0 && k < 1 ? 1 - Math.sin(Math.PI * k) * 0.94 : 1
  }
  const open = Math.min(blink(1.95), blink(3.05), blink(GT.blink2))

  let lookX = 0
  let lookY = 0
  if (t >= GT.pop1 && t < GT.content0) {
    lookX = 0.55
    lookY = -0.45
  } else if (t >= GT.content0 && t < GT.down0) {
    lookX = -0.3
    lookY = 0.6
  } else if (t >= GT.down0 && t < GT.down1) {
    lookX = 0.3
    lookY = 0.6
  } else if (t >= GT.down1) {
    const k = E.inOut(seg(t, GT.down1, GT.down1 + 0.35))
    lookX = lerp(0.3, 0, k)
    lookY = lerp(0.6, 0, k)
  }

  const handL =
    t < GT.tuck0
      ? E.back(seg(t, GT.pop0, GT.pop0 + 0.14))
      : 1 - E.in(seg(t, GT.tuck0, GT.tuck1 - 0.03))
  const handR =
    t < GT.tuck0
      ? E.back(seg(t, GT.pop0 + 0.04, GT.pop0 + 0.18))
      : 1 - E.in(seg(t, GT.tuck0 + 0.03, GT.tuck1))
  const wave = t >= GT.pop1 && t < GT.tuck0 ? t - GT.pop1 : -1

  return {
    hb,
    x,
    y,
    sx,
    sy,
    tilt: 0,
    eye,
    open,
    eyeRoll: 0,
    lookX,
    lookY,
    handL,
    handR,
    wave,
    tint: 0.6 * E.inOut(seg(t, GT.tint0, GT.tint1)),
    halo: E.out(seg(t, 0.3, 0.7)),
    haloBlue: seg(t, GT.tint0, GT.tint1),
    card: seg(t, 0.18, 0.45),
    iw,
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function whiteBodyFill(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number
) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1)
  g.addColorStop(0, "rgb(251, 251, 252)")
  g.addColorStop(1, "rgb(231, 233, 236)")
  ctx.fillStyle = g
  ctx.fill(path)
}

function drawMochiHandL(
  ctx: CanvasRenderingContext2D,
  hw: number,
  hh: number,
  p: GreetingPose
) {
  if (p.handL <= 0.01) return
  const hb = hh * 2
  const r = hb * 0.15 * p.handL
  const hx = lerp(-hw * 0.35, -hw - hb * 0.22, p.handL)
  let hy = lerp(hh * 0.85, hh * 0.62, p.handL)
  if (p.wave >= 0) {
    const rampIn = clamp(p.wave / 0.08, 0, 1)
    const rampOut = 1 - clamp((p.wave - (GT.tuck0 - GT.pop1)) / (GT.tuck1 - GT.tuck0), 0, 1)
    hy += Math.sin(p.wave * 2 * Math.PI * 5) * hb * 0.14 * rampIn * rampOut
  }
  ctx.save()
  ctx.translate(hx, hy)
  const circ = new Path2D()
  circ.ellipse(0, 0, r, r, 0, 0, Math.PI * 2)
  whiteBodyFill(ctx, circ, r, -r, -r, r)
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)"
  ctx.lineWidth = 0.8
  ctx.stroke(circ)
  ctx.restore()
}

function drawMochiHandR(
  ctx: CanvasRenderingContext2D,
  hw: number,
  hh: number,
  p: GreetingPose
) {
  if (p.handR <= 0.01) return
  const hb = hh * 2
  const L = hb * 0.4 * p.handR
  const T = hb * 0.22 * p.handR
  const hx = lerp(hw * 0.35, hw + hb * 0.2, p.handR)
  const hy = lerp(hh * 0.85, hh * 0.2, p.handR)
  const ang = p.wave >= 0 ? -0.61 + Math.sin(p.wave * 2 * Math.PI * 2.5) * 0.04 : -0.61

  ctx.save()
  ctx.translate(hx, hy)
  ctx.rotate(ang)
  roundRect(ctx, -L / 2, -T / 2, L, T, T / 2)
  const g = ctx.createLinearGradient(L / 2, -T / 2, -L / 2, T / 2)
  g.addColorStop(0, "rgb(251, 251, 252)")
  g.addColorStop(1, "rgb(231, 233, 236)")
  ctx.fillStyle = g
  ctx.fill()
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)"
  ctx.lineWidth = 0.8
  ctx.stroke()
  ctx.restore()
}

function drawGreetingMochi(ctx: CanvasRenderingContext2D, p: GreetingPose) {
  const hh = p.hb / 2
  const hw = hh * ASPECT
  if (hh <= 0.4) return

  // Halo: golden to cyan-blue aura
  if (p.halo > 0) {
    const bl = p.haloBlue
    const cr = Math.round(lerp(232, 59, bl))
    const cg = Math.round(lerp(195, 158, bl))
    const cb = Math.round(lerp(154, 255, bl))
    for (const [R, alpha] of [
      [hw * 2.6, 0.22],
      [hw * 4.2, 0.08],
    ] as const) {
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R)
      g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha * p.halo})`)
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(p.x, p.y, R, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.tilt)
  ctx.scale(p.sx, p.sy)

  // Hands behind body
  drawMochiHandL(ctx, hw, hh, p)
  drawMochiHandR(ctx, hw, hh, p)

  // Body
  const body = mochiSquirclePath(hw, hh)
  whiteBodyFill(ctx, body, hw * 0.6, -hh, -hw * 0.6, hh)

  if (p.tint > 0) {
    const g = ctx.createLinearGradient(0, hh, 0, -hh * 0.1)
    g.addColorStop(0, `rgba(127, 180, 234, ${p.tint})`)
    g.addColorStop(1, "rgba(127, 180, 234, 0)")
    ctx.fillStyle = g
    ctx.fill(body)
  }

  // Eyes & Cheeks
  ctx.save()
  ctx.clip(body)
  ctx.fillStyle = "#16171A"
  ctx.strokeStyle = "#16171A"
  const er = p.hb * 0.06
  const sp = p.hb * 0.19
  const lx = p.lookX * hw * 0.42
  const ly = p.lookY * hh * 0.28 + hh * 0.12 + p.eyeRoll * hh * 1.25

  for (const sd of [-1, 1]) {
    ctx.save()
    ctx.translate(sd * sp + lx, ly)
    if (p.eye === "happy") {
      ctx.lineWidth = er * 0.95
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.arc(0, er * 0.6, er * 1.25, Math.PI * 1.15, Math.PI * 1.85)
      ctx.stroke()
    } else if (p.eye === "content") {
      ctx.lineWidth = er * 0.95
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.arc(0, -er * 0.5, er * 1.25, Math.PI * 0.15, Math.PI * 0.85)
      ctx.stroke()
    } else {
      ctx.scale(1, Math.max(0.12, p.open))
      ctx.beginPath()
      ctx.arc(0, 0, er, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  // Cute blushing cheeks
  if (p.eye === "happy" || p.eye === "content") {
    for (const sd of [-1, 1]) {
      ctx.save()
      ctx.translate(sd * (sp + er * 1.1) + lx, ly + er * 1.5)
      ctx.fillStyle = "rgba(255, 120, 150, 0.4)"
      ctx.beginPath()
      ctx.ellipse(0, 0, er * 1.2, er * 0.75, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  ctx.restore()
  ctx.restore()
}

function drawGreetingParticles(ctx: CanvasRenderingContext2D, t: number, p: GreetingPose) {
  // Warp streaks: white vertical lines falling down through notch
  if (t < 0.55) {
    const fadeOut = 1 - seg(t, 0.4, 0.55)
    ctx.lineCap = "butt"
    for (const s of PARTICLES.warps) {
      if (t < s.t0) continue
      const yBot = (t - s.t0) * s.speed
      const yTop = yBot - s.len
      if (yBot <= 0) continue
      const sx = C0.x - p.iw / 2 + s.xNorm * p.iw
      ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha * fadeOut})`
      ctx.lineWidth = s.thick
      ctx.beginPath()
      ctx.moveTo(sx, Math.max(0, yTop))
      ctx.lineTo(sx, Math.min(GREETING_H, yBot))
      ctx.stroke()
    }
  }

  // Expanding particle ring burst
  const kRing = seg(t, 0.45, 0.45 + 1.35)
  if (kRing > 0 && kRing < 1) {
    const rx = lerp(10, 260, E.out(kRing))
    const ry = rx * 0.32
    const fade = (1 - kRing) * (kRing < 0.08 ? kRing / 0.08 : 1) * p.card
    for (const dot of PARTICLES.ring) {
      const r = 1 + dot.j
      ctx.fillStyle = `rgba(255, 255, 255, ${dot.al * fade})`
      ctx.fillRect(C0.x + Math.cos(dot.a) * rx * r, C0.y + Math.sin(dot.a) * ry * r, dot.s, dot.s)
    }
  }
}

export function MochiGreetingCanvas({ onComplete }: { onComplete: () => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const completedRef = React.useRef(false)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = GREETING_W
    const height = GREETING_H
    canvas.width = width * dpr
    canvas.height = height * dpr

    let animId: number
    const startMs = performance.now()

    const render = (now: number) => {
      const t = (now - startMs) / 1000

      if (t >= GT.end) {
        if (!completedRef.current) {
          completedRef.current = true
          onComplete()
        }
        return
      }

      const p = getGreetingPose(t)
      const clientWidth = canvas.parentElement?.clientWidth || width
      const scale = Math.min(1, clientWidth / width)

      ctx.save()
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, ((clientWidth - width * scale) / 2) * dpr, 0)
      ctx.clearRect(0, 0, width, height)

      // Coucou Card background
      if (p.card > 0) {
        ctx.save()
        ctx.globalAlpha = p.card
        roundRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, CARD.r)
        ctx.fillStyle = "#141518"
        ctx.fill()
        ctx.restore()

        ctx.save()
        roundRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, CARD.r)
        ctx.clip()
        drawGreetingParticles(ctx, t, p)
        ctx.restore()
      }

      drawGreetingMochi(ctx, p)
      ctx.restore()

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [onComplete])

  return (
    <div
      style={{
        width: "100%",
        height: 104,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          maxWidth: 440,
          height: 104,
          display: "block",
        }}
      />
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
  const [isPaused, setIsPaused] = React.useState(false)
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
        pendingToastRef.current = activeToast ?? fresh
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
        // Mutually exclusive: immediately replaces Mochi greeting, active toast, and confirm modal
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

  React.useEffect(() => {
    clearTimer()
    if (!activeToast || activeToast.duration <= 0 || Boolean(activeConfirm) || Boolean(activePrompt)) return

    remainingRef.current = activeToast.duration
    startedAtRef.current = Date.now()

    if (!isPaused) {
      timerRef.current = window.setTimeout(() => {
        setActiveToast(null)
      }, remainingRef.current)
    }

    return clearTimer
  }, [activeToast, activeConfirm, activePrompt, toastRevision, clearTimer])

  React.useEffect(() => {
    clearTimer()
    if (!activeToast || activeToast.duration <= 0 || Boolean(activeConfirm) || Boolean(activePrompt)) return

    if (isPaused) {
      const elapsed = Date.now() - startedAtRef.current
      remainingRef.current = Math.max(400, remainingRef.current - elapsed)
    } else {
      startedAtRef.current = Date.now()
      timerRef.current = window.setTimeout(() => {
        setActiveToast(null)
      }, remainingRef.current)
    }

    return clearTimer
  }, [isPaused, activeToast, activeConfirm, activePrompt, clearTimer])

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
  const meta = activeToast ? VARIANT_META[activeToast.variant] : null

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
        {/* Coucou Native Dynamic Island Stylesheet */}
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

          /* Coucou Fluid Spring Wrapper: cubic-bezier(.32, 1.22, .42, 1) */
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
          .pal-content-coucou-hidden {
            width: 100% !important;
            box-sizing: border-box !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }

          /* Coucou Concave Top-Edge Ears (ONLY visible when docked to bezel in idle or toast) */
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
            background: radial-gradient(120% 90% at 50% 120%, rgba(52, 211, 153, 0.40), transparent 70%), #000000 !important;
            color: #F5F6F8 !important;
            box-shadow: 0 16px 40px -6px rgba(0, 0, 0, 0.65), 0 4px 16px rgba(0, 0, 0, 0.35), inset 0 -1px 0 rgba(255, 255, 255, 0.08) !important;
            cursor: pointer !important;
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
          .pal-content-coucou-in {
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
            .pal-content-coucou-in,
            .pal-content-fade-out,
            .pal-content-spring-in,
            .pal-progress-drain {
              animation: none !important;
              transition: none !important;
            }
          }
        `}</style>

        {/* Main Island Wrapper with Coucou Spring Transitions */}
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
          }}
          onMouseEnter={() => {
            if (isToast) setIsPaused(true)
          }}
          onMouseLeave={() => {
            if (isToast) setIsPaused(false)
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
                ? "radial-gradient(120% 90% at 50% 120%, rgba(52, 211, 153, 0.40), transparent 70%), #000000"
                : "#000000",
            }}
          >
          {/* ── COUCOU MOCHI ENTRANCE GREETING ANIMATION (Center Stage with Wash & Warp Particles) ── */}
          {isGreetingActive && (
            <MochiGreetingCanvas onComplete={() => setIsGreeting(false)} />
          )}

          {/* ── IDLE COMPACT NOTCH (Coucou Top Bezel Pill) ── */}
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
                {/* Glowing Emerald Status Dot with Radar Ping */}
                <span
                  style={{
                    position: "relative",
                    display: "flex",
                    height: 8,
                    width: 8,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      display: "inline-flex",
                      height: "100%",
                      width: "100%",
                      borderRadius: "50%",
                      opacity: 0.75,
                      backgroundColor: "#34D399",
                      animation: "ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite",
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      height: 8,
                      width: 8,
                      borderRadius: "50%",
                      backgroundColor: "#22C55E",
                      boxShadow: "0 0 8px #22C55E",
                    }}
                  />
                </span>

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
                  ? "pal-content-coucou-hidden"
                  : "pal-content-coucou-in"
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
                  ? "pal-content-coucou-hidden"
                  : "pal-content-coucou-in"
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
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                minHeight: 58,
                padding: "10px 12px 12px 16px",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <FileText size={16} color="#E6E9EE" strokeWidth={2.2} />
              </div>

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
          )}

          {/* ── ACTIVE TOAST: a calm black pill. Colour lives only in the small icon disc. ── */}
          {isToast && activeToast && meta && (
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
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    backgroundColor: meta.disc,
                  }}
                >
                  <VariantIcon variant={activeToast.variant} />
                </div>

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
                      animationDuration: `${activeToast.duration}ms`,
                      animationPlayState: isPaused ? "paused" : "running",
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
