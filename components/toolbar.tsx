"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Type,
  Square,
  Circle,
  ImageIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
} from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { useState } from "react"
import type { CanvasObject } from "./canvas-editor"

interface ToolbarProps {
  onAddText: () => void
  onAddRectangle: () => void
  onAddCircle: () => void
  onAddImage: () => void
  onDelete: () => void
  onBringForward: () => void
  onSendBackward: () => void
  selectedObjects: CanvasObject[]
  onUpdateProperty: (property: string, value: any) => void
}

export function Toolbar({
  onAddText,
  onAddRectangle,
  onAddCircle,
  onAddImage,
  onDelete,
  onBringForward,
  onSendBackward,
  selectedObjects,
  onUpdateProperty,
}: ToolbarProps) {
  const [fillColor, setFillColor] = useState("#3b82f6")
  const [strokeColor, setStrokeColor] = useState("#1e40af")

  const selectedObject = selectedObjects[0]
  const isTextSelected = selectedObject?.type === "text"
  const hasSelection = selectedObjects.length > 0

  const handleFillColorChange = (color: string) => {
    setFillColor(color)
    onUpdateProperty("fill", color)
  }

  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color)
    onUpdateProperty("stroke", color)
  }

  return (
    <div className="w-16 bg-background border-r flex flex-col items-center py-4 gap-2">
      {/* Add Elements */}
      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="icon" onClick={onAddText} className="h-12 w-12" title="Add Text">
          <Type className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onAddRectangle} className="h-12 w-12" title="Add Rectangle">
          <Square className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onAddCircle} className="h-12 w-12" title="Add Circle">
          <Circle className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={onAddImage} className="h-12 w-12" title="Add Image">
          <ImageIcon className="h-5 w-5" />
        </Button>
      </div>

      <Separator className="my-2" />

      {/* Colors */}
      <div className="flex flex-col gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 relative"
              title="Fill Color"
              disabled={!hasSelection}
            >
              <Palette className="h-5 w-5" />
              <div
                className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: fillColor }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" side="right">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Fill Color</h4>
              <HexColorPicker color={fillColor} onChange={handleFillColorChange} />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border" style={{ backgroundColor: fillColor }} />
                <span className="text-sm font-mono">{fillColor}</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 relative"
              title="Stroke Color"
              disabled={!hasSelection}
            >
              <Square className="h-5 w-5" />
              <div
                className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: strokeColor }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" side="right">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Stroke Color</h4>
              <HexColorPicker color={strokeColor} onChange={handleStrokeColorChange} />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded border" style={{ backgroundColor: strokeColor }} />
                <span className="text-sm font-mono">{strokeColor}</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Separator className="my-2" />

      {/* Text Formatting */}
      {isTextSelected && (
        <>
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={() => {
                const currentWeight = selectedObject.fontWeight || "normal"
                onUpdateProperty("fontWeight", currentWeight === "bold" ? "normal" : "bold")
              }}
              title="Bold"
            >
              <Bold className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={() => {
                const currentStyle = selectedObject.fontStyle || "normal"
                onUpdateProperty("fontStyle", currentStyle === "italic" ? "normal" : "italic")
              }}
              title="Italic"
            >
              <Italic className="h-5 w-5" />
            </Button>
          </div>

          <Separator className="my-2" />

          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={() => onUpdateProperty("textAlign", "left")}
              title="Align Left"
            >
              <AlignLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={() => onUpdateProperty("textAlign", "center")}
              title="Align Center"
            >
              <AlignCenter className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={() => onUpdateProperty("textAlign", "right")}
              title="Align Right"
            >
              <AlignRight className="h-5 w-5" />
            </Button>
          </div>

          <Separator className="my-2" />
        </>
      )}

      {/* Layer Controls */}
      {hasSelection && (
        <>
          <div className="flex flex-col gap-2">
            <Button variant="ghost" size="icon" className="h-12 w-12" onClick={onBringForward} title="Bring Forward">
              <ArrowUp className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" className="h-12 w-12" onClick={onSendBackward} title="Send Backward">
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>

          <Separator className="my-2" />

          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 text-destructive hover:text-destructive"
            onClick={onDelete}
            title="Delete"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </>
      )}
    </div>
  )
}
