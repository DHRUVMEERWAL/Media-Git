"use client"

import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
  MiniMap,
  type NodeTypes,
  type EdgeTypes,
  MarkerType,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Home } from "lucide-react"
import type { VersionControlCommit, Branch } from "@/lib/version-control"
import { CommitNode } from "./commit-node"
import { CustomEdge } from "./custom-edge"

// Custom node types
const nodeTypes: NodeTypes = {
  commitNode: CommitNode,
}

// Custom edge types
const edgeTypes: EdgeTypes = {
  customEdge: CustomEdge,
}

interface ReactFlowCommitGraphProps {
  commits: VersionControlCommit[]
  branches: Branch[]
  currentBranch: Branch
  onView: (commitId: string) => void
  onBranchFrom: (commitId: string) => void
  onRevert: (commitId: string) => void
  onCompare: (commitId: string) => void
  onDelete: (commitId: string) => void
  onCreateSampleData?: () => void
  selectedCommitId?: string
}

export function DraggableCommitGraph({
  commits,
  branches,
  currentBranch,
  onView,
  onBranchFrom,
  onRevert,
  onCompare,
  onDelete,
  onCreateSampleData,
  selectedCommitId,
}: ReactFlowCommitGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(selectedCommitId)

  // Convert commits to React Flow nodes and edges
  const { flowNodes, flowEdges } = useMemo(() => {
    if (commits.length === 0) {
      return { flowNodes: [], flowEdges: [] }
    }

    // Sort commits by timestamp for consistent positioning
    const sortedCommits = [...commits].sort((a, b) => a.timestamp - b.timestamp)

    // Create a map to track branch positions
    const branchPositions = new Map<string, number>()
    let nextBranchY = 0

    // Calculate positions for commits
    const flowNodes: Node[] = sortedCommits.map((commit, index) => {
      // Determine which branch this commit belongs to
      let branchY = 0
      const commitBranch = branches.find((branch) => branch.headCommitId === commit.id)

      if (commitBranch) {
        if (!branchPositions.has(commitBranch.id)) {
          branchPositions.set(commitBranch.id, nextBranchY)
          nextBranchY += 300
        }
        branchY = branchPositions.get(commitBranch.id) || 0
      } else {
        // For commits not at branch heads, try to infer branch from parents
        const parentCommit = sortedCommits.find((c) => commit.parentIds.includes(c.id))
        if (parentCommit) {
          const parentBranch = branches.find((branch) => branch.headCommitId === parentCommit.id)
          if (parentBranch && branchPositions.has(parentBranch.id)) {
            branchY = branchPositions.get(parentBranch.id) || 0
          }
        }
      }

      const isLatest = currentBranch.headCommitId === commit.id
      const hasConflicts = commit.conflictResolutions && commit.conflictResolutions.length > 0
      const isMerged = commit.parentIds.length > 1
      const canDelete = !commits.some((c) => c.parentIds.includes(commit.id)) && !isLatest

      return {
        id: commit.id,
        type: "commitNode",
        position: {
          x: index * 400 + 50,
          y: branchY + 100,
        },
        data: {
          commit,
          isLatest,
          hasConflicts,
          isMerged,
          canDelete,
          isSelected: selectedNodeId === commit.id,
          onView,
          onBranchFrom,
          onRevert,
          onCompare,
          onDelete,
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      }
    })

    // Create edges
    const flowEdges: Edge[] = []

    commits.forEach((commit) => {
      commit.parentIds.forEach((parentId) => {
        const hasConflicts = commit.conflictResolutions && commit.conflictResolutions.length > 0
        const isMerged = commit.parentIds.length > 1

        flowEdges.push({
          id: `${parentId}-${commit.id}`,
          source: parentId,
          target: commit.id,
          type: "customEdge",
          data: {
            hasConflicts,
            isMerged,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: hasConflicts ? "#ef4444" : isMerged ? "#22c55e" : "#6b7280",
          },
          style: {
            stroke: hasConflicts ? "#ef4444" : isMerged ? "#22c55e" : "#6b7280",
            strokeWidth: hasConflicts || isMerged ? 3 : 2,
          },
        })
      })
    })

    return { flowNodes, flowEdges }
  }, [commits, branches, currentBranch, selectedNodeId, onView, onBranchFrom, onRevert, onCompare, onDelete])

  // Update nodes and edges when data changes
  useEffect(() => {
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [flowNodes, flowEdges, setNodes, setEdges])

  // Update selected node when prop changes
  useEffect(() => {
    setSelectedNodeId(selectedCommitId)
  }, [selectedCommitId])

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id)
  }, [])

  // Handle pane click to deselect
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(undefined)
  }, [])

  // Fit view to show all nodes
  const fitView = useCallback(() => {
    // This will be handled by the ReactFlow instance
  }, [])

  // Show empty state if no commits
  if (commits.length === 0) {
    return (
      <div className="w-full h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto text-muted-foreground opacity-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6" />
              <path d="m21 12-6-6-6 6-6-6" />
            </svg>
          </div>
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

  return (
    <div className="w-full h-full bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Strict}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls position="top-right" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          nodeColor={(node) => {
            const commit = commits.find((c) => c.id === node.id)
            if (!commit) return "#6b7280"

            const isLatest = currentBranch.headCommitId === commit.id
            const hasConflicts = commit.conflictResolutions && commit.conflictResolutions.length > 0
            const isMerged = commit.parentIds.length > 1

            if (hasConflicts) return "#ef4444"
            if (isMerged) return "#22c55e"
            if (isLatest) return "#3b82f6"
            return "#6b7280"
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        {/* Custom panels */}
        <Panel position="top-left" className="bg-background/90 backdrop-blur-sm border rounded-lg p-3 space-y-2">
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
        </Panel>

        <Panel position="bottom-left" className="bg-background/90 backdrop-blur-sm border rounded-lg p-3">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Drag nodes to reposition them</div>
            <div>• Right-click nodes for context menu</div>
            <div>• Use mouse wheel to zoom</div>
            <div>• Click and drag to pan</div>
            <div>• Use controls to navigate</div>
          </div>
        </Panel>

        {/* Additional controls */}
        <Panel position="top-right" className="flex gap-2 mt-16">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reset to fit view
              const reactFlowInstance = document.querySelector(".react-flow")
              if (reactFlowInstance) {
                // Trigger fit view programmatically
                fitView()
              }
            }}
          >
            <Home className="h-4 w-4" />
          </Button>

          {onCreateSampleData && commits.length === 0 && (
            <Button onClick={onCreateSampleData} variant="outline" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </Panel>

        {/* Current branch indicator */}
        {currentBranch && (
          <Panel position="bottom-center" className="bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2">
            <Badge variant="outline" className="text-xs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 mr-1">
                <line x1="6" y1="3" x2="6" y2="15" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="m18 9-12 12" />
              </svg>
              {currentBranch.name}
            </Badge>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
