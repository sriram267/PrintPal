import * as React from "react"
import { Image as ImageIcon, Plus, Trash2, FileText } from "lucide-react"
import { cn } from "@/shared/utils"

export interface ImageUploadItem {
  id: string
  url: string
  name?: string
  size?: number
  isUploading?: boolean
  progress?: number // 0 - 100
  file?: File
}

export interface ImageUploadProps {
  value?: (string | ImageUploadItem)[]
  defaultValue?: (string | ImageUploadItem)[]
  onChange?: (images: ImageUploadItem[]) => void
  onFilesSelected?: (files: File[]) => void
  onRemove?: (id: string, index: number) => void
  maxFiles?: number
  maxSizeMB?: number
  accept?: string
  simulateUpload?: boolean
  uploadDurationMs?: number
  className?: string
  disabled?: boolean
  title?: string
  helperText?: string
}

function normalizeItem(item: string | ImageUploadItem, index: number): ImageUploadItem {
  if (typeof item === "string") {
    return {
      id: `img-${index}-${item.slice(-10)}`,
      url: item,
      name: `Image ${index + 1}`,
      isUploading: false,
      progress: 100,
    }
  }
  return {
    ...item,
    progress: item.progress ?? (item.isUploading ? 30 : 100),
  }
}

export function ImageUpload({
  value,
  defaultValue = [],
  onChange,
  onFilesSelected,
  onRemove,
  maxFiles = 10,
  maxSizeMB = 10,
  accept = "image/png,image/jpeg,image/jpg,image/webp,image/gif",
  simulateUpload = true,
  uploadDurationMs = 1200,
  className,
  disabled = false,
  title = "Click to upload",
  helperText,
}: ImageUploadProps) {
  // Internal state is always the source of truth for in-flight items & progresses
  const [items, setItems] = React.useState<ImageUploadItem[]>(() => {
    const initial = value !== undefined ? value : defaultValue
    return initial.map((item, idx) => normalizeItem(item, idx))
  })

  const [isDragOver, setIsDragOver] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const itemsRef = React.useRef<ImageUploadItem[]>(items)
  itemsRef.current = items

  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange

  // Synchronize when external value changes (e.g. form reset or pre-population)
  React.useEffect(() => {
    if (value !== undefined) {
      const normalized = value.map((item, idx) => normalizeItem(item, idx))
      // Only sync if different to prevent wiping in-flight upload states
      const isDifferent =
        normalized.length !== itemsRef.current.length ||
        normalized.some((n, idx) => n.id !== itemsRef.current[idx]?.id || n.url !== itemsRef.current[idx]?.url)

      if (isDifferent) {
        setItems(normalized)
        itemsRef.current = normalized
      }
    }
  }, [value])

  const handleFiles = (incomingFiles: FileList | File[] | null) => {
    if (!incomingFiles || disabled) return
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    const fileArray = Array.from(incomingFiles).filter((f) => {
      const isAllowed = f.type
        ? f.type.startsWith("image/") ||
          f.type.includes("pdf") ||
          f.type.includes("postscript") ||
          f.type.includes("illustrator") ||
          Boolean(f.name && f.name.match(/\.(ai|cdr|dxf|eps|svg|pdf|png|jpe?g|webp)$/i))
        : true
      const isWithinSize = f.size ? f.size <= maxSizeBytes : true
      return isAllowed && isWithinSize
    })
    if (fileArray.length === 0) return

    onFilesSelected?.(fileArray)

    const currentItems = itemsRef.current
    const remainingSlots = maxFiles - currentItems.length
    if (remainingSlots <= 0) return

    const allowedFiles = fileArray.slice(0, remainingSlots)

    const newItems: ImageUploadItem[] = allowedFiles.map((f, idx) => ({
      id: `upload-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      url: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
      isUploading: simulateUpload,
      progress: simulateUpload ? 15 : 100,
      file: f,
    }))

    // Atomically append new items
    setItems((prev) => {
      const next = [...prev, ...newItems]
      itemsRef.current = next
      onChangeRef.current?.(next)
      return next
    })

    // Simulate smooth progress loader
    if (simulateUpload) {
      newItems.forEach((newItem) => {
        const startTime = Date.now()
        const timer = setInterval(() => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(100, Math.round((elapsed / uploadDurationMs) * 100))

          setItems((prev) => {
            const next = prev.map((it) =>
              it.id === newItem.id
                ? {
                    ...it,
                    progress,
                    isUploading: progress < 100,
                  }
                : it
            )
            itemsRef.current = next
            // Notify parent on completion
            if (progress >= 100) {
              onChangeRef.current?.(next)
            }
            return next
          })

          if (progress >= 100) {
            clearInterval(timer)
          }
        }, 50)
      })
    }
  }

  const handleRemove = (e: React.MouseEvent, id: string, index: number) => {
    e.stopPropagation()
    if (disabled) return

    setItems((prev) => {
      const removedItem = prev.find((it) => it.id === id) || prev[index]
      const next = prev.filter((it, idx) => (it.id ? it.id !== id : idx !== index))
      itemsRef.current = next
      onChangeRef.current?.(next)
      if (removedItem) {
        onRemove?.(id, index)
      }
      return next
    })
  }

  const triggerPicker = () => {
    if (!disabled && items.length < maxFiles) {
      inputRef.current?.click()
    }
  }

  const hasItems = items.length > 0

  return (
    <div className={cn("w-full select-none", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        disabled={disabled || items.length >= maxFiles}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = "" // Reset to allow re-uploading same file
        }}
      />

      {!hasItems ? (
        /* 1. Empty Dropzone State — Hover ONLY changes border color, NOT card background! */
        <div
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragOver(false)
            if (!disabled) handleFiles(e.dataTransfer.files)
          }}
          onClick={triggerPicker}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-3.5 text-center transition-colors duration-200 cursor-pointer bg-white h-full min-h-[115px]",
            isDragOver
              ? "border-[#2878D0]"
              : "border-[#DCE1E5] hover:border-[#2878D0]",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          {/* Stroke-based Image Icon with soft blue pill container matching reference - Static (no enlarge) */}
          <div className="mb-1.5 rounded-lg bg-[#EFF5FB] p-1.5 text-[#2878D0]">
            <ImageIcon className="h-5 w-5 stroke-[1.8]" />
          </div>

          <div className="text-[12px] font-medium text-[#202428]">
            <span className="text-[#2878D0] hover:underline font-semibold">{title}</span> or drag and drop
          </div>
          {helperText ? <p className="mt-0.5 text-[11px] text-[#737B84]">{helperText}</p> : null}
        </div>
      ) : (
        /* 2. Uploaded / Uploading Thumbnails Grid + Add More Box — Hover ONLY changes border color, NOT card background! */
        <div
          onDragOver={(e) => {
            e.preventDefault()
            if (!disabled) setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragOver(false)
            if (!disabled) handleFiles(e.dataTransfer.files)
          }}
          className={cn(
            "relative flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed p-4 transition-colors duration-200 bg-white",
            isDragOver
              ? "border-[#2878D0]"
              : "border-[#DCE1E5] hover:border-[#2878D0]"
          )}
        >
          {items.map((item, index) => {
            const isUploading = item.isUploading && (item.progress ?? 0) < 100

            return (
              <div
                key={item.id || index}
                className="group relative h-20 w-20 shrink-0"
              >
                {/* Inner image container with rounded corners and border */}
                <div className="relative h-full w-full overflow-hidden rounded-xl border border-[#DCE1E5] bg-[#202428] shadow-xs">
                  {item.name && item.name.match(/\.(ai|cdr|dxf|eps|pdf)$/i) ? (
                    <div className="flex flex-col items-center justify-center h-full w-full bg-[#1e293b] text-white p-1 select-none">
                      <FileText className="h-6 w-6 text-[#38BDF8] mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                        {item.name.split(".").pop()}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name || `Upload ${index + 1}`}
                      className={cn(
                        "h-full w-full object-cover transition-all duration-200",
                        isUploading ? "opacity-40 blur-[1px]" : "group-hover:blur-[2.5px]"
                      )}
                    />
                  )}

                  {isUploading ? (
                    /* Uploading State: Dim overlay, "Uploading" text, green progress loader (#22C55E) */
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 bg-black/50 backdrop-blur-[1px]">
                      <span className="text-[11px] font-medium text-white tracking-wide mb-1.5 drop-shadow-xs">
                        Uploading
                      </span>
                      <div className="h-1.5 w-[80%] overflow-hidden rounded-full bg-white/30 backdrop-blur-xs">
                        <div
                          className="h-full bg-[#22C55E] rounded-full transition-all duration-100 ease-out"
                          style={{ width: `${Math.max(8, item.progress ?? 0)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Ready State: Hover subtle dark overlay */
                    <div className="absolute inset-0 bg-black/15 opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none" />
                  )}
                </div>

                {/* Floating circular cut delete button on the right top curve corner */}
                {!isUploading && (
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, item.id, index)}
                    title="Delete image"
                    className="absolute -top-2 -right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#737B84] shadow-md border border-[#DCE1E5] opacity-0 group-hover:opacity-100 hover:text-[#EF4444] hover:border-[#EF4444] cursor-pointer transition-colors duration-150"
                  >
                    <Trash2 className="h-3.5 w-3.5 stroke-[1.8]" />
                  </button>
                )}
              </div>
            )
          })}

          {/* 3. Box-shaped "Upload more images" component at the end — Hover ONLY changes border color, static icon */}
          {items.length < maxFiles && (
            <button
              type="button"
              onClick={triggerPicker}
              title="Add more images"
              disabled={disabled}
              className={cn(
                "group relative flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#2878D0] bg-white transition-colors duration-200 hover:border-[#1E60A8] cursor-pointer shadow-xs",
                disabled && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2878D0] text-white shadow-xs transition-colors duration-200 group-hover:bg-[#1E60A8]">
                <Plus className="h-4 w-4 stroke-[2.4]" />
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
