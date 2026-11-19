import * as React from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { cn } from "../lib/cn";

export interface FileDropzoneProps {
  /** Called with the files that were dropped or picked. */
  onFiles: (files: File[]) => void;
  /** e.g. "image/*,.pdf" */
  accept?: string;
  multiple?: boolean;
  title?: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

/** A dashed box to drop files on, or click to pick them (logos, artwork, site photos). */
export function FileDropzone({ onFiles, accept, multiple = true, title = "Drop files here or browse", hint, disabled, className }: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [over, setOver] = React.useState(false);
  const take = (list: FileList | null) => list && list.length && onFiles(Array.from(list));
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !disabled && (e.preventDefault(), inputRef.current?.click())}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) take(e.dataTransfer.files);
      }}
      className={cn(
        "flex min-h-[84px] cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line bg-white px-5 py-4 text-center transition-colors duration-base",
        "hover:border-solid hover:border-accent hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 active:bg-accent-tint",
        over && "border-solid border-accent bg-surface-2",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <UploadCloud className="size-5 text-muted" />
      <div className="text-sm font-medium text-ink">{title}</div>
      {hint && <div className="text-xs text-muted">{hint}</div>}
      <input ref={inputRef} type="file" hidden accept={accept} multiple={multiple} onChange={(e) => take(e.target.files)} />
    </div>
  );
}

/** One uploaded file, with an × to remove it. */
export function FileChip({ name, onRemove }: { name: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-xs border border-line bg-surface px-2 py-[3px] text-2xs text-ink">
      <FileText className="size-3 shrink-0 text-muted" />
      <span className="truncate">{name}</span>
      {onRemove && (
        <button type="button" aria-label={`Remove ${name}`} onClick={onRemove} className="ml-0.5 grid size-3.5 place-items-center rounded-full text-muted hover:bg-black/10 hover:text-ink">
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}
