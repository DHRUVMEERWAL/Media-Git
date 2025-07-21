"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GitBranch, RotateCcw, Eye, GitCompare, Clock, User, AlertTriangle } from "lucide-react"
import type { VersionControlCommit } from "@/lib/version-control"
import { formatDistanceToNow } from "@/lib/date-utils"

interface ViewCommitDialogProps {
  open: boolean
  onClose: () => void
  commit: VersionControlCommit | null
}

export function ViewCommitDialog({ open, onClose, commit }: ViewCommitDialogProps) {
  if (!commit) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            View Commit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Commit Info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-2">{commit.message}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {commit.author.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDistanceToNow(commit.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={commit.author.avatar || "/placeholder.svg"} />
                <AvatarFallback>{commit.author.initials}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded font-mono">{commit.id.slice(-8)}</code>
              {commit.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Canvas Preview */}
          <div className="space-y-2">
            <Label>Canvas Preview</Label>
            <div className="border rounded-lg p-4 bg-muted/50">
              <img
                src={commit.thumbnail || "/placeholder.svg"}
                alt="Canvas preview"
                className="w-full max-h-96 object-contain rounded border bg-white"
              />
            </div>
          </div>

          {/* Changes Summary */}
          <div className="space-y-2">
            <Label>Changes</Label>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600">+{commit.changes.added} added</span>
              <span className="text-blue-600">~{commit.changes.modified} modified</span>
              <span className="text-red-600">-{commit.changes.deleted} deleted</span>
            </div>
            {commit.changes.details.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {commit.changes.details.map((detail, index) => (
                  <div key={index}>• {detail}</div>
                ))}
              </div>
            )}
          </div>

          {/* Conflict Resolutions */}
          {commit.conflictResolutions && commit.conflictResolutions.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Conflict Resolutions
              </Label>
              <div className="space-y-2">
                {commit.conflictResolutions.map((resolution, index) => (
                  <div key={index} className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded">
                    Object {resolution.objectId} - {resolution.conflictType} conflict resolved by{" "}
                    <strong>{resolution.resolution}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface BranchFromDialogProps {
  open: boolean
  onClose: () => void
  onCreateBranch: (name: string) => void
  commit: VersionControlCommit | null
}

export function BranchFromDialog({ open, onClose, onCreateBranch, commit }: BranchFromDialogProps) {
  const [branchName, setBranchName] = useState("")

  const handleCreate = () => {
    if (branchName.trim()) {
      onCreateBranch(branchName.trim())
      setBranchName("")
      onClose()
    }
  }

  if (!commit) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Create Branch
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-1">Creating branch from:</div>
            <div className="text-sm text-muted-foreground">
              {commit.message} ({commit.id.slice(-8)})
            </div>
          </div>

          <div>
            <Label htmlFor="branch-name">Branch Name</Label>
            <Input
              id="branch-name"
              placeholder="feature/new-feature"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreate()
                }
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!branchName.trim()}>
            Create Branch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface RevertCommitDialogProps {
  open: boolean
  onClose: () => void
  onRevert: () => void
  commit: VersionControlCommit | null
}

export function RevertCommitDialog({ open, onClose, onRevert, commit }: RevertCommitDialogProps) {
  const handleRevert = () => {
    onRevert()
    onClose()
  }

  if (!commit) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Revert to Commit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Warning</span>
            </div>
            <div className="text-sm text-yellow-700">
              This will revert your canvas to the state of this commit. Any unsaved changes will be lost.
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reverting to:</Label>
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium text-sm mb-1">{commit.message}</div>
              <div className="text-xs text-muted-foreground">
                {commit.id.slice(-8)} • {formatDistanceToNow(commit.timestamp, { addSuffix: true })}
              </div>
            </div>
          </div>

          {commit.thumbnail && (
            <div className="space-y-2">
              <Label>Canvas Preview</Label>
              <img
                src={commit.thumbnail || "/placeholder.svg"}
                alt="Canvas preview"
                className="w-full h-32 object-cover rounded border bg-muted"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleRevert} variant="destructive">
            Revert Canvas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface CompareCommitsDialogProps {
  open: boolean
  onClose: () => void
  commits: VersionControlCommit[]
  selectedCommit: VersionControlCommit | null
}

export function CompareCommitsDialog({ open, onClose, commits, selectedCommit }: CompareCommitsDialogProps) {
  const [compareWithId, setCompareWithId] = useState("")
  const [showComparison, setShowComparison] = useState(false)

  const compareWithCommit = commits.find((c) => c.id === compareWithId)

  const handleCompare = () => {
    if (compareWithId) {
      setShowComparison(true)
    }
  }

  const handleReset = () => {
    setShowComparison(false)
    setCompareWithId("")
  }

  if (!selectedCommit) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Compare Commits
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {!showComparison ? (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-1">Comparing from:</div>
                <div className="text-sm">
                  {selectedCommit.message} ({selectedCommit.id.slice(-8)})
                </div>
              </div>

              <div>
                <Label>Compare with:</Label>
                <Select value={compareWithId} onValueChange={setCompareWithId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select commit to compare with..." />
                  </SelectTrigger>
                  <SelectContent>
                    {commits
                      .filter((commit) => commit.id !== selectedCommit.id)
                      .map((commit) => (
                        <SelectItem key={commit.id} value={commit.id}>
                          {commit.message} ({commit.id.slice(-8)}) •{" "}
                          {formatDistanceToNow(commit.timestamp, { addSuffix: true })}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Comparison Header */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium text-blue-600 mb-1">Original</div>
                  <div className="text-sm">{selectedCommit.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedCommit.id.slice(-8)} • {formatDistanceToNow(selectedCommit.timestamp, { addSuffix: true })}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium text-green-600 mb-1">Comparing with</div>
                  <div className="text-sm">{compareWithCommit?.message}</div>
                  <div className="text-xs text-muted-foreground">
                    {compareWithCommit?.id.slice(-8)} •{" "}
                    {compareWithCommit && formatDistanceToNow(compareWithCommit.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-blue-600">Original Canvas</Label>
                  <div className="border rounded-lg p-2 bg-blue-50">
                    <img
                      src={selectedCommit.thumbnail || "/placeholder.svg"}
                      alt="Original canvas"
                      className="w-full h-64 object-contain rounded bg-white"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Changes: +{selectedCommit.changes.added} ~{selectedCommit.changes.modified} -
                    {selectedCommit.changes.deleted}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-green-600">Comparing Canvas</Label>
                  <div className="border rounded-lg p-2 bg-green-50">
                    <img
                      src={compareWithCommit?.thumbnail || "/placeholder.svg"}
                      alt="Comparing canvas"
                      className="w-full h-64 object-contain rounded bg-white"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Changes: +{compareWithCommit?.changes.added} ~{compareWithCommit?.changes.modified} -
                    {compareWithCommit?.changes.deleted}
                  </div>
                </div>
              </div>

              {/* Differences Summary */}
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Key Differences</div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>
                    • Time difference:{" "}
                    {compareWithCommit &&
                    selectedCommit &&
                    Math.abs(compareWithCommit.timestamp - selectedCommit.timestamp) > 0
                      ? formatDistanceToNow(Math.abs(compareWithCommit.timestamp - selectedCommit.timestamp))
                      : "Same time"}
                  </div>
                  <div>
                    • Author: {selectedCommit.author.name} vs {compareWithCommit?.author.name}
                  </div>
                  <div>
                    • Objects: {selectedCommit.changes.added} vs {compareWithCommit?.changes.added}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!showComparison ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleCompare} disabled={!compareWithId}>
                Compare
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleReset}>
                Back to Selection
              </Button>
              <Button onClick={onClose}>Close</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
