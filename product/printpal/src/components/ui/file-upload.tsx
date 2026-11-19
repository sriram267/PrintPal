import * as React from "react"
import { UploadCloud, File, X, CheckCircle2 } from "lucide-react"
import { cn } from "@/shared/utils"

export interface UploadedFile {
  name: string
  size: number
  type: string
  progress?: number
}

export interface FileUploadProps {
  accept?: string
  maxSizeMB?: number
  multiple?: boolean
  onFilesSelected?: (files: File[]) => void
  className?: string
  disabled?: boolean
}

export function FileUpload({
  accept = "*",
  maxSizeMB = 10,
  multiple = true,
  onFilesSelected,
  className,
  disabled,
}: FileUploadProps) {
  const [dragOver, setDragOver] = React.useState(false)
  const [files, setFiles] = React.useState<UploadedFile[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return
    const fileList = Array.from(selectedFiles)
    const validFiles = fileList.filter((f) => f.size <= maxSizeMB * 1024 * 1024)

    setFiles((prev) => [
      ...prev,
      ...validFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        progress: 100,
      })),
    ])

    onFilesSelected?.(validFiles)
  }

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (!disabled) handleFiles(e.dataTransfer.files)
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
          dragOver
            ? "border-cyan-500 bg-cyan-500/10"
            : "border-muted-foreground/30 hover:border-muted-foreground/60 bg-muted/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="rounded-full bg-cyan-500/10 p-3 text-cyan-400 mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>
        <div className="text-sm font-semibold text-foreground">
          Click to upload or drag and drop
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Vector DXF, AI, PDF, SVG, or images up to {maxSizeMB}MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-md border border-border bg-card p-2.5 text-sm"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <File className="h-4 w-4 shrink-0 text-cyan-400" />
                <div className="truncate">
                  <div className="truncate font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { ImageUpload } from "./image-upload"
export type { ImageUploadItem, ImageUploadProps } from "./image-upload"
