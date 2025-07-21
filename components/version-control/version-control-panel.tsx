"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GitCommit, History, GitBranch, RefreshCw, Database } from "lucide-react"
import type { fabric } from "fabric"
import { VersionControlManager } from "@/lib/version-control-manager"
import type { VersionControlCommit, Branch } from "@/lib/version-control"
import { CommitModal } from "./commit-modal"
import { VersionTimeline } from "./version-timeline"
import { BranchManager } from "./branch-manager"
import { ViewCommitDialog, BranchFromDialog, RevertCommitDialog, CompareCommitsDialog } from "./action-dialogs"
import { DraggableCommitGraph } from "./draggable-commit-graph"

interface VersionControlPanelProps {
  canvas: fabric.Canvas | null
  isOpen: boolean
  onClose: () => void
}

export function VersionControlPanel({ canvas, isOpen, onClose }: VersionControlPanelProps) {
  const [vcManager, setVcManager] = useState<VersionControlManager | null>(null)
  const [commits, setCommits] = useState<VersionControlCommit[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null)
  const [showCommitModal, setShowCommitModal] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)
  const [selectedCommitId, setSelectedCommitId] = useState<string>()
  const [conflictData, setConflictData] = useState<any | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("timeline")

  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showBranchDialog, setShowBranchDialog] = useState(false)
  const [showRevertDialog, setShowRevertDialog] = useState(false)
  const [showCompareDialog, setShowCompareDialog] = useState(false)
  const [selectedCommitForAction, setSelectedCommitForAction] = useState<VersionControlCommit | null>(null)

  // Initialize version control manager
  useEffect(() => {
    if (canvas && !vcManager) {
      const manager = new VersionControlManager(canvas)
      setVcManager(manager)
      refreshData(manager)
    }
  }, [canvas, vcManager])

  const refreshData = (manager: VersionControlManager = vcManager!) => {
    if (!manager) return

    const commitHistory = manager.getCommitHistory()
    const branchList = manager.getBranches()
    const current = manager.getCurrentBranch()

    setCommits(commitHistory)
    setBranches(branchList)
    setCurrentBranch(current || null)
  }

  const handleCommit = async (message: string, tags: string[]) => {
    if (!vcManager) return

    setIsCommitting(true)
    try {
      await vcManager.createCommit(message, tags)
      refreshData()
      setShowCommitModal(false)
    } catch (error) {
      console.error("Failed to create commit:", error)
    } finally {
      setIsCommitting(false)
    }
  }

  const handleView = (commitId: string) => {
    const commit = commits.find((c) => c.id === commitId)
    if (commit) {
      setSelectedCommitForAction(commit)
      setShowViewDialog(true)
    }
  }

  const handleBranchFrom = (commitId: string) => {
    const commit = commits.find((c) => c.id === commitId)
    if (commit) {
      setSelectedCommitForAction(commit)
      setShowBranchDialog(true)
    }
  }

  const handleRevert = (commitId: string) => {
    const commit = commits.find((c) => c.id === commitId)
    if (commit) {
      setSelectedCommitForAction(commit)
      setShowRevertDialog(true)
    }
  }

  const handleCompare = (commitId: string) => {
    const commit = commits.find((c) => c.id === commitId)
    if (commit) {
      setSelectedCommitForAction(commit)
      setShowCompareDialog(true)
    }
  }

  const handleDelete = (commitId: string) => {
    if (!vcManager) return

    if (confirm("Are you sure you want to delete this commit? This action cannot be undone.")) {
      // TODO: Implement commit deletion in the manager
      console.log("Delete commit:", commitId)
    }
  }

  const handleActualRevert = () => {
    if (!vcManager || !selectedCommitForAction) return

    vcManager.revertToCommit(selectedCommitForAction.id)
    refreshData()
  }

  const handleActualBranchCreate = (name: string) => {
    if (!vcManager || !selectedCommitForAction) return

    vcManager.createBranch(name, selectedCommitForAction.id)
    refreshData()
  }

  const handleSwitchBranch = (branchId: string) => {
    if (!vcManager) return

    vcManager.switchToBranch(branchId)
    refreshData()
  }

  const handleCreateBranch = (name: string, fromCommitId?: string) => {
    if (!vcManager) return

    vcManager.createBranch(name, fromCommitId)
    refreshData()
  }

  const handleMergeBranches = (sourceBranchId: string, targetBranchId: string) => {
    if (!vcManager) return

    // TODO: Implement proper merge with conflict resolution
    console.log("Merge branches:", sourceBranchId, "->", targetBranchId)
  }

  const handleDeleteBranch = (branchId: string) => {
    // TODO: Implement branch deletion
    console.log("Delete branch:", branchId)
  }

  const handleShowConflicts = (commitId: string) => {
    // TODO: Implement conflict resolution UI
    console.log("Show conflicts for commit:", commitId)
  }

  const handleCreateSampleData = async () => {
    if (!vcManager) return

    await vcManager.createSampleData()
    refreshData()
  }

  const handleClearData = () => {
    if (!vcManager) return

    if (confirm("Are you sure you want to clear all version control data? This cannot be undone.")) {
      vcManager.clearAllData()
      refreshData()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[800px] bg-background border-l shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <h2 className="font-semibold">Version Control</h2>
            {currentBranch && (
              <Badge variant="outline" className="ml-2">
                <GitBranch className="h-3 w-3 mr-1" />
                {currentBranch.name}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refreshData()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearData}>
              <Database className="h-4 w-4" />
            </Button>
            <Button variant="default" size="sm" onClick={() => setShowCommitModal(true)}>
              <GitCommit className="h-4 w-4 mr-2" />
              Commit
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="graph">Graph</TabsTrigger>
              <TabsTrigger value="branches">Branches</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="flex-1 m-4 mt-2">
              <ScrollArea className="h-full">
                <VersionTimeline
                  commits={commits}
                  branches={branches}
                  currentBranch={currentBranch!}
                  onRevert={handleRevert}
                  onCompare={handleCompare}
                  onBranchFrom={handleBranchFrom}
                  onPreview={handleView}
                  selectedCommitId={selectedCommitId}
                />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="graph" className="flex-1 m-4 mt-2">
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  <DraggableCommitGraph
                    commits={commits}
                    branches={branches}
                    currentBranch={currentBranch!}
                    onView={handleView}
                    onBranchFrom={handleBranchFrom}
                    onRevert={handleRevert}
                    onCompare={handleCompare}
                    onDelete={handleDelete}
                    onCreateSampleData={handleCreateSampleData}
                    selectedCommitId={selectedCommitId}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branches" className="flex-1 m-4 mt-2">
              <BranchManager
                branches={branches}
                currentBranch={currentBranch!}
                onSwitchBranch={handleSwitchBranch}
                onCreateBranch={handleCreateBranch}
                onMergeBranches={handleMergeBranches}
                onDeleteBranch={handleDeleteBranch}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Commit Modal */}
      <CommitModal
        open={showCommitModal}
        onClose={() => setShowCommitModal(false)}
        onCommit={handleCommit}
        isLoading={isCommitting}
      />

      {/* Action Dialogs */}
      <ViewCommitDialog
        open={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        commit={selectedCommitForAction}
      />

      <BranchFromDialog
        open={showBranchDialog}
        onClose={() => setShowBranchDialog(false)}
        onCreateBranch={handleActualBranchCreate}
        commit={selectedCommitForAction}
      />

      <RevertCommitDialog
        open={showRevertDialog}
        onClose={() => setShowRevertDialog(false)}
        onRevert={handleActualRevert}
        commit={selectedCommitForAction}
      />

      <CompareCommitsDialog
        open={showCompareDialog}
        onClose={() => setShowCompareDialog(false)}
        commits={commits}
        selectedCommit={selectedCommitForAction}
      />
    </>
  )
}
