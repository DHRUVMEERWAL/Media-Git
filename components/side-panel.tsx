"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Lock, Unlock, Trash2 } from "lucide-react"
import type { CanvasObject } from "./canvas-editor"
import type { fabric } from "fabric"

interface SidePanelProps {
  objects: CanvasObject[]
  selectedObjects: CanvasObject[]
  canvas: fabric.Canvas | null
  onUpdateProperty: (property: string, value: any) => void
  onSelectObject: (obj: CanvasObject) => void
}

export function SidePanel({ objects, selectedObjects, canvas, onUpdateProperty, onSelectObject }: SidePanelProps) {
  const selectedObject = selectedObjects[0]
  const isTextSelected = selectedObject?.type === "text"

  const toggleObjectVisibility = (obj: CanvasObject) => {
    if (!canvas) return
    obj.set("visible", !obj.visible)
    canvas.renderAll()
  }

  const toggleObjectLock = (obj: CanvasObject) => {
    if (!canvas) return
    obj.set("selectable", !obj.selectable)
    obj.set("evented", !obj.evented)
    canvas.renderAll()
  }

  const deleteObject = (obj: CanvasObject) => {
    if (!canvas) return
    canvas.remove(obj)
    canvas.renderAll()
  }

  const getObjectIcon = (type: string) => {
    switch (type) {
      case "text":
        return "📝"
      case "rect":
        return "⬜"
      case "circle":
        return "⭕"
      case "image":
        return "🖼️"
      default:
        return "📦"
    }
  }

  return (
    <div className="w-80 bg-background border-l flex flex-col">
      {/* Layers Panel */}
      <Card className="m-4 mb-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Layers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-48">
            <div className="space-y-1 p-3 pt-0">
              {objects.map((obj, index) => (
                <div
                  key={obj.id || index}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedObjects.includes(obj) ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                  }`}
                  onClick={() => onSelectObject(obj)}
                >
                  <span className="text-sm">{getObjectIcon(obj.type || "")}</span>
                  <span className="flex-1 text-sm truncate">{obj.name || `${obj.type} ${index + 1}`}</span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleObjectVisibility(obj)
                      }}
                    >
                      {obj.visible !== false ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleObjectLock(obj)
                      }}
                    >
                      {obj.selectable !== false ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteObject(obj)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {objects.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">No objects on canvas</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Properties Panel */}
      {selectedObject && (
        <Card className="m-4 mt-2 flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <span>{getObjectIcon(selectedObject.type || "")}</span>
              Properties
              <Badge variant="secondary" className="text-xs">
                {selectedObject.type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-96">
              <div className="space-y-4 pr-3 p-2">
                {/* Position & Size */}
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Position & Size
                  </Label>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="x" className="text-xs">
                        X
                      </Label>
                      <Input
                        id="x"
                        type="number"
                        value={Math.round(selectedObject.left || 0)}
                        onChange={(e) => onUpdateProperty("left", Number.parseInt(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="y" className="text-xs">
                        Y
                      </Label>
                      <Input
                        id="y"
                        type="number"
                        value={Math.round(selectedObject.top || 0)}
                        onChange={(e) => onUpdateProperty("top", Number.parseInt(e.target.value))}
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="width" className="text-xs">
                        Width
                      </Label>
                      <Input
                        id="width"
                        type="number"
                        value={Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1))}
                        onChange={(e) => {
                          const newWidth = Number.parseInt(e.target.value)
                          const scaleX = newWidth / (selectedObject.width || 1)
                          onUpdateProperty("scaleX", scaleX)
                        }}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height" className="text-xs">
                        Height
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        value={Math.round((selectedObject.height || 0) * (selectedObject.scaleY || 1))}
                        onChange={(e) => {
                          const newHeight = Number.parseInt(e.target.value)
                          const scaleY = newHeight / (selectedObject.height || 1)
                          onUpdateProperty("scaleY", scaleY)
                        }}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Opacity */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Opacity</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[(selectedObject.opacity || 1) * 100]}
                      onValueChange={([value]) => onUpdateProperty("opacity", value / 100)}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      {Math.round((selectedObject.opacity || 1) * 100)}%
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Text Properties */}
                {isTextSelected && (
                  <>
                    <div className="space-y-3">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Text</Label>

                      <div>
                        <Label htmlFor="text-content" className="text-xs">
                          Content
                        </Label>
                        <Input
                          id="text-content"
                          value={selectedObject.text || ""}
                          onChange={(e) => onUpdateProperty("text", e.target.value)}
                          className="h-8"
                        />
                      </div>

                      <div>
                        <Label htmlFor="font-family" className="text-xs">
                          Font Family
                        </Label>
                        <Select
                          value={selectedObject.fontFamily || "Arial"}
                          onValueChange={(value) => onUpdateProperty("fontFamily", value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Helvetica">Helvetica</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
                            <SelectItem value="Courier New">Courier New</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="font-size" className="text-xs">
                          Font Size
                        </Label>
                        <Input
                          id="font-size"
                          type="number"
                          value={selectedObject.fontSize || 20}
                          onChange={(e) => onUpdateProperty("fontSize", Number.parseInt(e.target.value))}
                          className="h-8"
                        />
                      </div>
                    </div>

                    <Separator />
                  </>
                )}

                {/* Rotation */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Rotation</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[selectedObject.angle || 0]}
                      onValueChange={([value]) => onUpdateProperty("angle", value)}
                      min={-180}
                      max={180}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      {Math.round(selectedObject.angle || 0)}°
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
