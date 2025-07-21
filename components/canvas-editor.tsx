"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { fabric } from "fabric"
import { Toolbar } from "./toolbar"
import { SidePanel } from "./side-panel"
import { Button } from "@/components/ui/button"
import { Download, Save, Upload, Moon, Sun, History, GitCommit } from "lucide-react"
import { useTheme } from "next-themes"
import { VersionControlPanel } from "./version-control/version-control-panel"

export interface CanvasObject extends fabric.Object {
  id?: string
  name?: string
}

export function CanvasEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [selectedObjects, setSelectedObjects] = useState<CanvasObject[]>([])
  const [objects, setObjects] = useState<CanvasObject[]>([])
  const { theme, setTheme } = useTheme()
  const [showVersionControl, setShowVersionControl] = useState(false)

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#ffffff",
    })

    // Enable object controls
    fabricCanvas.selection = true
    fabricCanvas.preserveObjectStacking = true

    // Add selection events
    fabricCanvas.on("selection:created", (e) => {
      const selected = e.selected as CanvasObject[]
      setSelectedObjects(selected || [])
    })

    fabricCanvas.on("selection:updated", (e) => {
      const selected = e.selected as CanvasObject[]
      setSelectedObjects(selected || [])
    })

    fabricCanvas.on("selection:cleared", () => {
      setSelectedObjects([])
    })

    // Update objects list when canvas changes
    fabricCanvas.on("object:added", updateObjectsList)
    fabricCanvas.on("object:removed", updateObjectsList)
    fabricCanvas.on("object:modified", updateObjectsList)

    setCanvas(fabricCanvas)

    // Load saved canvas state
    loadCanvasState(fabricCanvas)

    return () => {
      fabricCanvas.dispose()
    }
  }, [])

  const updateObjectsList = useCallback(() => {
    if (!canvas) return
    const canvasObjects = canvas.getObjects() as CanvasObject[]
    setObjects([...canvasObjects])
  }, [canvas])

  const addText = () => {
    if (!canvas) return

    const text = new fabric.Text("Click to edit", {
      left: 100,
      top: 100,
      fontFamily: "Arial",
      fontSize: 20,
      fill: "#000000",
    }) as CanvasObject

    text.id = `text_${Date.now()}`
    text.name = "Text"

    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  const addRectangle = () => {
    if (!canvas) return

    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 100,
      height: 100,
      fill: "#3b82f6",
      stroke: "#1e40af",
      strokeWidth: 2,
    }) as CanvasObject

    rect.id = `rect_${Date.now()}`
    rect.name = "Rectangle"

    canvas.add(rect)
    canvas.setActiveObject(rect)
    canvas.renderAll()
  }

  const addCircle = () => {
    if (!canvas) return

    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 50,
      fill: "#ef4444",
      stroke: "#dc2626",
      strokeWidth: 2,
    }) as CanvasObject

    circle.id = `circle_${Date.now()}`
    circle.name = "Circle"

    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.renderAll()
  }

  const addImage = () => {
    if (!canvas) return

    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string
        fabric.Image.fromURL(imgUrl, (img) => {
          img.scaleToWidth(200)
          img.set({
            left: 100,
            top: 100,
          })

          const imgObject = img as CanvasObject
          imgObject.id = `image_${Date.now()}`
          imgObject.name = "Image"

          canvas.add(img)
          canvas.setActiveObject(img)
          canvas.renderAll()
        })
      }
      reader.readAsDataURL(file)
    }

    input.click()
  }

  const deleteSelected = () => {
    if (!canvas) return

    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => canvas.remove(obj))
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }

  const bringForward = () => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.bringForward(activeObject)
      canvas.renderAll()
    }
  }

  const sendBackward = () => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      canvas.sendBackwards(activeObject)
      canvas.renderAll()
    }
  }

  const exportToPNG = () => {
    if (!canvas) return

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    })

    const link = document.createElement("a")
    link.download = "canvas-export.png"
    link.href = dataURL
    link.click()
  }

  const saveCanvasState = () => {
    if (!canvas) return

    const canvasData = JSON.stringify(canvas.toJSON())
    localStorage.setItem("canvasState", canvasData)

    // Also trigger download
    const blob = new Blob([canvasData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.download = "canvas-state.json"
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const loadCanvasState = (fabricCanvas?: fabric.Canvas) => {
    const targetCanvas = fabricCanvas || canvas
    if (!targetCanvas) return

    const savedState = localStorage.getItem("canvasState")
    if (savedState) {
      try {
        targetCanvas.loadFromJSON(savedState, () => {
          targetCanvas.renderAll()
          updateObjectsList()
        })
      } catch (error) {
        console.error("Failed to load canvas state:", error)
      }
    }
  }

  const loadFromFile = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !canvas) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string
          canvas.loadFromJSON(jsonData, () => {
            canvas.renderAll()
            updateObjectsList()
          })
        } catch (error) {
          console.error("Failed to load canvas from file:", error)
        }
      }
      reader.readAsText(file)
    }

    input.click()
  }

  const updateObjectProperty = (property: string, value: any) => {
    if (!canvas || selectedObjects.length === 0) return

    selectedObjects.forEach((obj) => {
      obj.set(property, value)
    })

    canvas.renderAll()
    updateObjectsList()
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Canvas Editor - Media Git</h1>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowVersionControl(true)}>
              <History className="h-4 w-4 mr-2" />
              History
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowVersionControl(true)}>
              <GitCommit className="h-4 w-4 mr-2" />
              Commit
            </Button>

            <Button variant="outline" size="sm" onClick={loadFromFile}>
              <Upload className="h-4 w-4 mr-2" />
              Load
            </Button>

            <Button variant="outline" size="sm" onClick={saveCanvasState}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>

            <Button variant="default" size="sm" onClick={exportToPNG}>
              <Download className="h-4 w-4 mr-2" />
              Export PNG
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 pt-20">
        {/* Toolbar */}
        <div className="h-[calc(100vh-5rem)] overflow-y-auto">
          <Toolbar
            onAddText={addText}
            onAddRectangle={addRectangle}
            onAddCircle={addCircle}
            onAddImage={addImage}
            onDelete={deleteSelected}
            onBringForward={bringForward}
            onSendBackward={sendBackward}
            selectedObjects={selectedObjects}
            onUpdateProperty={updateObjectProperty}
          />
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex items-center justify-center p-8 bg-muted/20">
          <div className="bg-white rounded-2xl shadow-xl p-4">
            <canvas ref={canvasRef} className="border border-border rounded-lg" />
          </div>
        </div>

        {/* Side Panel */}
        <SidePanel
          objects={objects}
          selectedObjects={selectedObjects}
          canvas={canvas}
          onUpdateProperty={updateObjectProperty}
          onSelectObject={(obj) => {
            if (canvas) {
              canvas.setActiveObject(obj)
              canvas.renderAll()
            }
          }}
        />
      </div>
      {/* Version Control Panel */}
      <VersionControlPanel canvas={canvas} isOpen={showVersionControl} onClose={() => setShowVersionControl(false)} />
    </div>
  )
}
