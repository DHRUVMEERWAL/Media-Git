"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { GitCommit, GitBranch, RotateCcw, Eye, GitMerge, Clock, User, Tag } from "lucide-react"
import type { VersionControlCommit, Branch } from "@/lib/version-control"
import { formatDistanceToNow } from "@/lib/date-utils"

interface VersionTimelineProps {
  commits: VersionControlCommit[]
  branches: Branch[]
  currentBranch: Branch
  onRevert: (commitId: string) => void
  onCompare: (commitId: string) => void
  onBranchFrom: (commitId: string) => void
  onPreview: (commitId: string) => void
  selectedCommitId?: string
}

export function VersionTimeline({
  commits,
  branches,
  currentBranch,
  onRevert,
  onCompare,
  onBranchFrom,
  onPreview,
  selectedCommitId,
}: VersionTimelineProps) {
  const [hoveredCommit, setHoveredCommit] = useState<string | null>(null)

  const getCommitBranch = (commit: VersionControlCommit): Branch | undefined => {
    return branches.find((branch) => branch.headCommitId === commit.id)
  }

  const isLatestCommit = (commitId: string): boolean => {
    return currentBranch.headCommitId === commitId
  }

  const getCommitIcon = (commit: VersionControlCommit) => {
    if (commit.parentIds.length > 1) {
      return <GitMerge className="h-4 w-4" />
    }
    return <GitCommit className="h-4 w-4" />
  }

  const getCommitColor = (commit: VersionControlCommit) => {
    if (commit.parentIds.length > 1) return "text-purple-500"
    if (commit.author.name !== "Designer") return "text-blue-500"
    return "text-green-500"
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 h-[54rem] overflow-y-auto"> {/* Add height and scroll */}
        {commits.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <GitCommit className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No commits yet</p>
            <p className="text-sm">Make your first commit to start tracking changes</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            {commits.map((commit, index) => {
              const branch = getCommitBranch(commit)
              const isLatest = isLatestCommit(commit.id)
              const isSelected = selectedCommitId === commit.id
              const isHovered = hoveredCommit === commit.id

              return (
                <div
                  key={commit.id}
                  className={`relative flex gap-4 pb-6 ${isSelected ? "bg-accent/50 -mx-4 px-4 rounded-lg" : ""}`}
                  onMouseEnter={() => setHoveredCommit(commit.id)}
                  onMouseLeave={() => setHoveredCommit(null)}
                >
                  {/* Timeline node */}
                  <div
                    className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-2 bg-background flex items-center justify-center ${getCommitColor(commit)} border-current`}
                  >
                    {getCommitIcon(commit)}
                  </div>

                  {/* Commit content */}
                  <div className="flex-1 min-w-0">
                    <Card className={`transition-all ${isHovered ? "shadow-md" : ""}`}>
                      <CardContent className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm leading-tight mb-1">{commit.message}</h3>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {commit.author.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(commit.timestamp, { addSuffix: true })}
                              </div>
                              {branch && (
                                <div className="flex items-center gap-1">
                                  <GitBranch className="h-3 w-3" />
                                  {branch.name}
                                </div>
                              )}
                            </div>
                          </div>

                          <Avatar className="h-8 w-8">
                            <AvatarImage src={commit.author.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{commit.author.initials}</AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Thumbnail */}
                        <div className="mb-3">
                          <button onClick={() => onPreview(commit.id)} className="block w-full">
                            <img
                              src={commit.thumbnail || "/placeholder.svg"}
                              alt="Canvas preview"
                              className="w-full h-24 object-cover rounded border bg-muted hover:opacity-80 transition-opacity"
                            />
                          </button>
                        </div>

                        {/* Changes summary */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span className="text-green-600">+{commit.changes.added}</span>
                          <span className="text-blue-600">~{commit.changes.modified}</span>
                          <span className="text-red-600">-{commit.changes.deleted}</span>
                        </div>

                        {/* Tags */}
                        {commit.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {commit.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                <Tag className="h-2 w-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => onCompare(commit.id)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Compare
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Compare with current version</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={() => onBranchFrom(commit.id)}>
                                <GitBranch className="h-4 w-4 mr-1" />
                                Branch
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Create branch from this commit</TooltipContent>
                          </Tooltip>

                          {!isLatest && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => onRevert(commit.id)}>
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  Revert
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Revert to this version</TooltipContent>
                            </Tooltip>
                          )}

                          {isLatest && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
