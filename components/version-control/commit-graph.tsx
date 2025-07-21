"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
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
  ZoomIn,
  ZoomOut,
  Move,
  GitCommit,
  Plus,
} from "lucide-react"
import type { VersionControlCommit, Branch } from "@/lib/version-control"
import { formatDistanceToNow } from "@/lib/date-utils"

interface CommitNodeProps {
  commit: VersionControlCommit
  position: { x: number; y: number }
  isLatest: boolean
  hasConflicts: boolean
  isMerged: boolean
  isSelected: boolean
  onView: (commitId: string) => void
  onBranchFrom: (commitId: string) => void
  onRevert: (commitId: string) => void
  onCompare: (commitId: string) => void
  onMerge: (commitId: string) => void
  onShowConflicts: (commitId: string) => void
  onSelect: (commitId: string) => void
  scale: number
}

function CommitNode({
  commit,
  position,
  isLatest,
  hasConflicts,
  isMerged,
  isSelected,
  onView,
  onBranchFrom,
  onRevert,
  onCompare,
  onMerge,
  onShowConflicts,
  onSelect,
  scale,
}: CommitNodeProps) {
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
          <div
            className="absolute"
            style={{
              left: position.x,
              top: position.y,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <Card
              className={`w-80 transition-all duration-200 cursor-pointer ${getNodeBorderColor()} ${
                isSelected ? "ring-2 ring-primary shadow-lg scale-105" : "hover:shadow-md"
              }`}
              onClick={() => onSelect(commit.id)}
            >
              <CardContent className="p-4">
                {/* Header */}
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

                  <Avatar className="h-8 w-8 ml-2">
                    <AvatarImage src={commit.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{commit.author.initials}</AvatarFallback>
                  </Avatar>
                </div>

                {/* Canvas Thumbnail */}
                {commit.thumbnail && (
                  <div className="mb-3">
                    <img
                      src={commit.thumbnail || "/placeholder.svg"}
                      alt="Canvas preview"
                      className="w-full h-20 object-cover rounded border bg-muted"
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
                    <TooltipContent>Load this version</TooltipContent>
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
                        Compare
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Compare with current</TooltipContent>
                  </Tooltip>

                  {hasConflicts && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onShowConflicts(commit.id)
                          }}
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Conflicts
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>View conflict details</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          <ContextMenuItem onClick={() => onBranchFrom(commit.id)}>
            <GitBranch className="h-4 w-4 mr-2" />
            Start new branch
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onCompare(commit.id)}>
            <Eye className="h-4 w-4 mr-2" />
            Compare with current
          </ContextMenuItem>
          {!isLatest && (
            <ContextMenuItem onClick={() => onRevert(commit.id)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Revert to this commit
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </TooltipProvider>
  )
}

interface CommitEdgeProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  hasConflicts?: boolean
  isMerged?: boolean
  scale: number
}

function CommitEdge({ from, to, hasConflicts, isMerged, scale }: CommitEdgeProps) {
  const getEdgeColor = () => {
    if (hasConflicts) return "#ef4444"
    if (isMerged) return "#22c55e"
    return "#6b7280"
  }

  const getEdgeWidth = () => {
    if (hasConflicts || isMerged) return 3
    return 2
  }

  // Calculate control points for bezier curve
  const controlPoint1 = { x: from.x + 100, y: from.y }
  const controlPoint2 = { x: to.x - 100, y: to.y }

  const pathData = `M ${from.x} ${from.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${to.x} ${to.y}`

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <g transform={`scale(${scale})`} style={{ transformOrigin: "0 0" }}>
            <path
              d={pathData}
              stroke={getEdgeColor()}
              strokeWidth={getEdgeWidth()}
              fill="none"
              markerEnd="url(#arrowhead)"
              className="transition-all duration-200"
            />
            {/* Edge label for special cases */}
            {(hasConflicts || isMerged) && (
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 10}
                textAnchor="middle"
                fontSize="12"
                fill={getEdgeColor()}
                className="font-medium"
              >
                {hasConflicts ? "⚠️" : "✅"}
              </text>
            )}
          </g>
        </TooltipTrigger>
        <TooltipContent>
          {hasConflicts && "⚠️ Merge with conflicts"}
          {isMerged && "✅ Clean merge"}
          {!hasConflicts && !isMerged && "Standard commit"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface CommitGraphProps {
  commits: VersionControlCommit[]
  branches: Branch[]
  currentBranch: Branch
  onView: (commitId: string) => void
  onBranchFrom: (commitId: string) => void
  onRevert: (commitId: string) => void
  onCompare: (commitId: string) => void
  onMerge: (commitId: string) => void
  onShowConflicts: (commitId: string) => void
  onCreateSampleData?: () => void
  selectedCommitId?: string
}

export function CommitGraph({
  commits,
  branches,
  currentBranch,
  onView,
  onBranchFrom,
  onRevert,
  onCompare,
  onMerge,
  onShowConflicts,
  onCreateSampleData,
  selectedCommitId,
}: CommitGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedCommit, setSelectedCommit] = useState<string | undefined>(selectedCommitId)

  // Handle mouse events for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        // Left mouse button
        setIsDragging(true)
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      }
    },
    [pan],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    },
    [isDragging, dragStart],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Handle zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale((prev) => Math.max(0.1, Math.min(3, prev * delta)))
  }, [])

  // Zoom controls
  const zoomIn = () => setScale((prev) => Math.min(3, prev * 1.2))
  const zoomOut = () => setScale((prev) => Math.max(0.1, prev / 1.2))
  const resetView = () => {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }

  // Show empty state if no commits
  if (commits.length === 0) {
    return (
      <div className="w-full h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <GitCommit className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">No commits yet</h3>
            <p className="text-muted-foreground max-w-md">
              Start by making your first commit or create some sample data to see how the commit graph works.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            {onCreateSampleData && (
              <Button onClick={onCreateSampleData} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Sample Data
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Calculate node positions
  const nodePositions = new Map<string, { x: number; y: number }>()
  const edges: Array<{
    from: { x: number; y: number }
    to: { x: number; y: number }
    hasConflicts?: boolean
    isMerged?: boolean
  }> = []

  // Sort commits by timestamp and assign positions
  const sortedCommits = [...commits].sort((a, b) => a.timestamp - b.timestamp)
  const nodeSpacing = 400

  sortedCommits.forEach((commit, index) => {
    const position = {
      x: index * nodeSpacing + 50,
      y: 100,
    }
    nodePositions.set(commit.id, position)
  })

  // Create edges
  sortedCommits.forEach((commit) => {
    const toPos = nodePositions.get(commit.id)
    if (!toPos) return

    commit.parentIds.forEach((parentId) => {
      const fromPos = nodePositions.get(parentId)
      if (fromPos) {
        const hasConflicts = commit.conflictResolutions && commit.conflictResolutions.length > 0
        const isMerged = commit.parentIds.length > 1

        edges.push({
          from: { x: fromPos.x + 320, y: fromPos.y + 100 }, // Right side of parent node
          to: { x: toPos.x, y: toPos.y + 100 }, // Left side of current node
          hasConflicts,
          isMerged,
        })
      }
    })
  })

  return (
    <div className="w-full h-full bg-background relative overflow-hidden" ref={containerRef}>
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button variant="outline" size="sm" onClick={zoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={zoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={resetView}>
          <Move className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm border rounded-lg p-3 space-y-2 z-10">
        <h4 className="font-medium text-sm">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span>Latest commit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span>Has conflicts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>Merged commit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded" />
            <span>Regular commit</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm border rounded-lg p-3 z-10">
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Right-click nodes for context menu</div>
          <div>• Click and drag to pan</div>
          <div>• Use mouse wheel to zoom</div>
          <div>• Zoom: {Math.round(scale * 100)}%</div>
        </div>
      </div>

      {/* Graph Container */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}
      >
        {/* SVG for edges */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
          </defs>
          {edges.map((edge, index) => (
            <CommitEdge
              key={index}
              from={edge.from}
              to={edge.to}
              hasConflicts={edge.hasConflicts}
              isMerged={edge.isMerged}
              scale={scale}
            />
          ))}
        </svg>

        {/* Commit Nodes */}
        {sortedCommits.map((commit) => {
          const position = nodePositions.get(commit.id)
          if (!position) return null

          const isLatest = currentBranch.headCommitId === commit.id
          const hasConflicts = commit.conflictResolutions && commit.conflictResolutions.length > 0
          const isMerged = commit.parentIds.length > 1
          const isSelected = selectedCommit === commit.id

          return (
            <CommitNode
              key={commit.id}
              commit={commit}
              position={position}
              isLatest={isLatest}
              hasConflicts={hasConflicts}
              isMerged={isMerged}
              isSelected={isSelected}
              onView={onView}
              onBranchFrom={onBranchFrom}
              onRevert={onRevert}
              onCompare={onCompare}
              onMerge={onMerge}
              onShowConflicts={onShowConflicts}
              onSelect={setSelectedCommit}
              scale={scale}
            />
          )
        })}
      </div>
    </div>
  )
}
