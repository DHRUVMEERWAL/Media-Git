"use client"

import { memo } from "react"
import { type EdgeProps, getBezierPath } from "reactflow"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CustomEdgeData {
  hasConflicts?: boolean
  isMerged?: boolean
}

export const CustomEdge = memo(
  ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data }: EdgeProps<CustomEdgeData>) => {
    const { hasConflicts, isMerged } = data || {}

    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })

    const getEdgeColor = () => {
      if (hasConflicts) return "#ef4444"
      if (isMerged) return "#22c55e"
      return "#6b7280"
    }

    const getEdgeWidth = () => {
      if (hasConflicts || isMerged) return 3
      return 2
    }

    const getTooltipText = () => {
      if (hasConflicts) return "⚠️ Merge with conflicts"
      if (isMerged) return "✅ Clean merge"
      return "Standard commit"
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <g>
              <path
                id={id}
                d={edgePath}
                stroke={getEdgeColor()}
                strokeWidth={getEdgeWidth()}
                fill="none"
                className="transition-all duration-200"
              />

              {/* Edge label for special cases */}
              {(hasConflicts || isMerged) && (
                <text
                  x={labelX}
                  y={labelY - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fill={getEdgeColor()}
                  className="font-medium pointer-events-none select-none"
                >
                  {hasConflicts ? "⚠️" : "✅"}
                </text>
              )}

              {/* Invisible wider path for better hover detection */}
              <path d={edgePath} stroke="transparent" strokeWidth={20} fill="none" className="cursor-pointer" />
            </g>
          </TooltipTrigger>
          <TooltipContent>{getTooltipText()}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  },
)

CustomEdge.displayName = "CustomEdge"
