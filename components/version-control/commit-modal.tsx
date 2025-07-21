"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Tag, GitCommit } from "lucide-react"

interface CommitModalProps {
  open: boolean
  onClose: () => void
  onCommit: (message: string, tags: string[]) => void
  isLoading?: boolean
}

export function CommitModal({ open, onClose, onCommit, isLoading }: CommitModalProps) {
  const [message, setMessage] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = () => {
    if (message.trim()) {
      onCommit(message.trim(), tags)
      setMessage("")
      setTags([])
      setTagInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCommit className="h-5 w-5" />
            Commit Changes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="commit-message">Commit Message *</Label>
            <Textarea
              id="commit-message"
              placeholder="Describe your changes..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="mt-1 min-h-[80px]"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="tag-input">Tags (optional)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="tag-input"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddTag} disabled={!tagInput.trim()}>
                <Tag className="h-4 w-4" />
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!message.trim() || isLoading}>
            {isLoading ? "Committing..." : "Commit"}
          </Button>
        </DialogFooter>

        <div className="text-xs text-muted-foreground mt-2">Tip: Press Ctrl+Enter to commit quickly</div>
      </DialogContent>
    </Dialog>
  )
}
