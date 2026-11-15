import * as React from "react"
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TreeNode {
  id: string
  label: string
  icon?: React.ReactNode
  children?: TreeNode[]
}

export interface TreeViewProps {
  data: TreeNode[]
  selectedId?: string
  onSelect?: (node: TreeNode) => void
  className?: string
}

function TreeItem({
  node,
  selectedId,
  onSelect,
  level = 0,
}: {
  node: TreeNode
  selectedId?: string
  onSelect?: (node: TreeNode) => void
  level?: number
}) {
  const [isOpen, setIsOpen] = React.useState(true)
  const hasChildren = Boolean(node.children && node.children.length > 0)
  const isSelected = selectedId === node.id

  return (
    <div>
      <div
        onClick={() => {
          if (hasChildren) setIsOpen(!isOpen)
          onSelect?.(node)
        }}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        className={cn(
          "flex items-center gap-2 py-1.5 pr-2 rounded-md text-xs cursor-pointer select-none transition-colors hover:bg-accent/60",
          isSelected && "bg-accent text-accent-foreground font-semibold"
        )}
      >
        {hasChildren ? (
          <span className="text-muted-foreground p-0.5">
            {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </span>
        ) : (
          <span className="w-4" />
        )}

        {node.icon || (
          hasChildren ? (
            isOpen ? <FolderOpen className="h-4 w-4 text-cyan-400" /> : <Folder className="h-4 w-4 text-cyan-400" />
          ) : (
            <File className="h-3.5 w-3.5 text-muted-foreground" />
          )
        )}

        <span className="truncate">{node.label}</span>
      </div>

      {hasChildren && isOpen && (
        <div className="space-y-0.5">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function TreeView({ data, selectedId, onSelect, className }: TreeViewProps) {
  return (
    <div className={cn("space-y-0.5 rounded-lg border border-border bg-card p-2", className)}>
      {data.map((node) => (
        <TreeItem key={node.id} node={node} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  )
}
