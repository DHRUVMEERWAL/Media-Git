"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GitBranch, Plus, GitMerge, Check, AlertTriangle, Trash2 } from "lucide-react"
import type { Branch, MergeConflict } from "@/lib/version-control"
import { formatDistanceToNow } from "@/lib/date-utils"

interface BranchManagerProps {
  branches: Branch[]
  currentBranch: Branch
  onSwitchBranch: (branchId: string) => void
  onCreateBranch: (name: string, fromCommitId?: string) => void
  onMergeBranches: (sourceBranchId: string, targetBranchId: string) => void
  onDeleteBranch: (branchId: string) => void
  conflicts?: MergeConflict[]
}

export function BranchManager({
  branches,
  currentBranch,
  onSwitchBranch,
  onCreateBranch,
  onMergeBranches,
  onDeleteBranch,
  conflicts = [],
}: BranchManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showMergeDialog, setShowMergeDialog] = useState(false)
  const [newBranchName, setNewBranchName] = useState("")
  const [sourceBranch, setSourceBranch] = useState("")
  const [targetBranch, setTargetBranch] = useState("")

  const handleCreateBranch = () => {
    if (newBranchName.trim()) {
      onCreateBranch(newBranchName.trim())
      setNewBranchName("")
      setShowCreateDialog(false)
    }
  }

  const handleMerge = () => {
    if (sourceBranch && targetBranch) {
      onMergeBranches(sourceBranch, targetBranch)
      setSourceBranch("")
      setTargetBranch("")
      setShowMergeDialog(false)
    }
  }

  const canDeleteBranch = (branch: Branch) => {
    return branch.id !== "main" && branch.id !== currentBranch.id
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Branches
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowMergeDialog(true)}>
                <GitMerge className="h-4 w-4 mr-1" />
                Merge
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 h-[48rem] overflow-y-auto">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                branch.id === currentBranch.id ? "bg-primary/10 border-primary/20" : "hover:bg-muted/50"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{branch.name}</span>
                  {branch.id === currentBranch.id && (
                    <Badge variant="default" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Current
                    </Badge>
                  )}
                  {branch.id === "main" && (
                    <Badge variant="outline" className="text-xs">
                      Main
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Created {formatDistanceToNow(branch.createdAt, { addSuffix: true })}
                  {branch.createdBy && ` by ${branch.createdBy}`}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {branch.id !== currentBranch.id && (
                  <Button variant="ghost" size="sm" onClick={() => onSwitchBranch(branch.id)}>
                    Switch
                  </Button>
                )}

                {canDeleteBranch(branch) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteBranch(branch.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Create Branch Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Branch name..."
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateBranch()
                  }
                }}
                autoFocus
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Branch will be created from current commit on {currentBranch.name}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBranch} disabled={!newBranchName.trim()}>
              Create Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Merge Branches</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Source Branch</label>
              <Select value={sourceBranch} onValueChange={setSourceBranch}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select source branch..." />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Target Branch</label>
              <Select value={targetBranch} onValueChange={setTargetBranch}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select target branch..." />
                </SelectTrigger>
                <SelectContent>
                  {branches
                    .filter((branch) => branch.id !== sourceBranch)
                    .map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {conflicts.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Merge Conflicts Detected</span>
                </div>
                <div className="text-sm text-yellow-700">
                  {conflicts.length} conflict{conflicts.length > 1 ? "s" : ""} need to be resolved before merging.
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMerge} disabled={!sourceBranch || !targetBranch || sourceBranch === targetBranch}>
              {conflicts.length > 0 ? "Resolve & Merge" : "Merge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
