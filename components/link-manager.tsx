"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link2, Plus, X, ExternalLink, Globe, FileText, Video, Book } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkItem {
  url: string
  title?: string
  description?: string
  type?: "article" | "video" | "documentation" | "course" | "other"
}

interface LinkManagerProps {
  links: string[]
  onLinksChange: (links: string[]) => void
  className?: string
}

const linkTypeIcons = {
  article: FileText,
  video: Video,
  documentation: Book,
  course: Book,
  other: Globe,
}

const linkTypeColors = {
  article: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  video: "bg-red-500/20 text-red-300 border-red-500/30",
  documentation: "bg-green-500/20 text-green-300 border-green-500/30",
  course: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  other: "bg-gray-500/20 text-gray-300 border-gray-500/30",
}

export function LinkManager({ links, onLinksChange, className }: LinkManagerProps) {
  const [newLink, setNewLink] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const detectLinkType = (url: string): LinkItem["type"] => {
    const lowerUrl = url.toLowerCase()

    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be") || lowerUrl.includes("vimeo.com")) {
      return "video"
    }
    if (lowerUrl.includes("docs.") || lowerUrl.includes("documentation") || lowerUrl.includes("api.")) {
      return "documentation"
    }
    if (lowerUrl.includes("course") || lowerUrl.includes("udemy") || lowerUrl.includes("coursera")) {
      return "course"
    }
    if (lowerUrl.includes("blog") || lowerUrl.includes("article") || lowerUrl.includes("medium.com")) {
      return "article"
    }

    return "other"
  }

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "")
    } catch {
      return url
    }
  }

  const addLink = () => {
    if (newLink.trim()) {
      const updatedLinks = [...links, newLink.trim()]
      onLinksChange(updatedLinks)
      setNewLink("")
    }
  }

  const removeLink = (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index)
    onLinksChange(updatedLinks)
  }

  const linkItems: LinkItem[] = links.map((url) => ({
    url,
    type: detectLinkType(url),
    title: extractDomain(url),
  }))

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Resources & Links</label>
        {links.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-xs">
            {isExpanded ? "Collapse" : "Expand"} ({links.length})
          </Button>
        )}
      </div>

      {/* Add New Link */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="Add a resource link (https://...)"
            className="pl-10 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addLink()}
          />
        </div>
        <Button onClick={addLink} size="sm" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Links List */}
      {links.length > 0 && (
        <div className="space-y-2">
          {linkItems.slice(0, isExpanded ? undefined : 3).map((linkItem, index) => {
            const IconComponent = linkTypeIcons[linkItem.type || "other"]

            return (
              <Card key={index} className="p-3 bg-muted/30 border-border/50">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={linkItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline truncate flex items-center gap-1"
                      >
                        {linkItem.title}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLink(index)}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300 flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={cn("text-xs", linkTypeColors[linkItem.type || "other"])}>
                        {linkItem.type || "link"}
                      </Badge>

                      <span className="text-xs text-muted-foreground truncate">{linkItem.url}</span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}

          {!isExpanded && links.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="w-full text-xs text-muted-foreground"
            >
              Show {links.length - 3} more links...
            </Button>
          )}
        </div>
      )}

      {links.length === 0 && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <Link2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No resources added yet</p>
          <p className="text-xs">Add helpful links, articles, or documentation</p>
        </div>
      )}
    </div>
  )
}
