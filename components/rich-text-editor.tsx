"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "./markdown-renderer"
import { Bold, Italic, List, ListOrdered, Quote, Code, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = (before: string, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border border-border rounded-md bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("**", "**")}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("*", "*")}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("`", "`")}
          className="h-8 w-8 p-0"
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("- ")}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("1. ")}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("&gt;", "")}
          className="h-8 w-8 p-0"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertText("[", "](url)")}
          className="h-8 w-8 p-0"
          title="Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Button
          type="button"
          variant={isPreview ? "default" : "ghost"}
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="text-xs"
        >
          {isPreview ? "Edit" : "Preview"}
        </Button>
      </div>

      {/* Editor/Preview */}
      {isPreview ? (
        <div className="min-h-[120px] p-3 border border-border rounded-md bg-background">
          <MarkdownRenderer content={value} />
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[120px] font-mono text-sm"
        />
      )}

      {!isPreview && (
        <div className="text-xs text-muted-foreground">
          Supports **bold**, *italic*, `code`, &gt; quotes, - lists, and [links](url)
        </div>
      )}
    </div>
  )
}
