"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "reactflow"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import {
  GitBranch,
  Eye,
  RotateCcw,
  GitMerge,
  AlertTriangle,
  Clock,
  User,
  CheckCircle,
  Trash2,
  GitCompare,
} from "lucide-react"
import type { VersionControlCommit } from "@/lib/version-control"
import { formatDistanceToNow } from "@/lib/date-utils"

interface CommitNodeData {
  commit: VersionControlCommit
  isLatest: boolean
  hasConflicts: boolean
  isMerged: boolean
  canDelete: boolean
  isSelected: boolean
  onView: (commitId: string) => void
  onBranchFrom: (commitId: string) => void
  onRevert: (commitId: string) => void
  onCompare: (commitId: string) => void
  onDelete: (commitId: string) => void
}

export const CommitNode = memo(({ data, selected }: NodeProps<CommitNodeData>) => {
  const { commit, isLatest, hasConflicts, isMerged, canDelete, onView, onBranchFrom, onRevert, onCompare, onDelete } =
    data

  const getNodeBorderColor = () => {
    if (hasConflicts) return "border-red-500"
    if (isMerged) return "border-green-500"
    if (isLatest) return "border-blue-500"
    return "border-border"
  }

  const getStatusBadge = () => {
    if (isLatest) return { text: "Latest", variant: "default" as const, icon: CheckCircle }
    if (hasConflicts) return { text: "Conflicts", variant: "destructive" as const, icon: AlertTriangle }
    if (isMerged) return { text: "Merged", variant: "secondary" as const, icon: GitMerge }
    return null
  }

  const statusBadge = getStatusBadge()

  return (
    <TooltipProvider>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="relative">
            {/* Input handle */}
            <Handle
              type="target"
              position={Position.Left}
              className="w-3 h-3 !bg-muted-foreground border-2 border-background"
            />

            {/* Output handle */}
            <Handle
              type="source"
              position={Position.Right}
              className="w-3 h-3 !bg-muted-foreground border-2 border-background"
            />

            <Card
              className={`w-80 transition-all duration-200 select-none ${getNodeBorderColor()} ${
                selected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
              }`}
            >
              <CardContent className="p-4">
                {/* Header with Delete Button */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{commit.id.slice(-8)}</code>
                      {statusBadge && (
                        <Badge variant={statusBadge.variant} className="text-xs flex items-center gap-1">
                          <statusBadge.icon className="h-3 w-3" />
                          {statusBadge.text}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium text-sm leading-tight mb-2 line-clamp-2">{commit.message}</h3>
                  </div>

                  <div className="flex items-center gap-2 ml-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={commit.author.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{commit.author.initials}</AvatarFallback>
                    </Avatar>
                    {canDelete && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDelete(commit.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete commit</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                {/* Canvas Thumbnail */}
                {commit.thumbnail && (
                  <div className="mb-3">
                    <img
                      src={commit.thumbnail || "/placeholder.svg"}
                      alt="Canvas preview"
                      className="w-full h-20 object-cover rounded border bg-muted"
                      draggable={false}
                    />
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {commit.author.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(commit.timestamp, { addSuffix: true })}
                  </div>
                </div>

                {/* Changes Summary */}
                <div className="flex items-center gap-3 text-xs mb-3">
                  <span className="text-green-600">+{commit.changes.added}</span>
                  <span className="text-blue-600">~{commit.changes.modified}</span>
                  <span className="text-red-600">-{commit.changes.deleted}</span>
                </div>

                {/* Tags */}
                {commit.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {commit.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onView(commit.id)
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View commit details</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onBranchFrom(commit.id)
                        }}
                      >
                        <GitBranch className="h-3 w-3 mr-1" />
                        Branch
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create branch from here</TooltipContent>
                  </Tooltip>

                  {!isLatest && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onRevert(commit.id)
                          }}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Revert
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Revert to this version</TooltipContent>
                    </Tooltip>
                  )}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCompare(commit.id)
                        }}
                      >
                        <GitCompare className="h-3 w-3 mr-1" />
                        Compare
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Compare with other commits</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem onClick={() => onView(commit.id)}>
            <Eye className="h-4 w-4 mr-2" />
            View commit
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onBranchFrom(commit.id)}>
            <GitBranch className="h-4 w-4 mr-2" />
            Start new branch
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onCompare(commit.id)}>
            <GitCompare className="h-4 w-4 mr-2" />
            Compare commits
          </ContextMenuItem>
          {!isLatest && (
            <ContextMenuItem onClick={() => onRevert(commit.id)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Revert to this commit
            </ContextMenuItem>
          )}
          {canDelete && (
            <ContextMenuItem onClick={() => onDelete(commit.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete commit
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </TooltipProvider>
  )
})

CommitNode.displayName = "CommitNode"
