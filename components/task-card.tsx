"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { AudioRecorder } from "./audio-recorder"
import { AudioPlayer } from "./audio-player"
import { RichTextEditor } from "./rich-text-editor"
import { LinkManager } from "./link-manager"
import { CodeEditor } from "./code-editor"
import { MarkdownRenderer } from "./markdown-renderer"
import type { Database } from "@/lib/supabase"
import type { AudioRecording } from "@/hooks/use-audio-recorder"
import { createClient } from "@/lib/supabase"

type Task = Database['public']['Tables']['tasks']['Row']
type Category = Database['public']['Tables']['categories']['Row']
import { Clock, Edit3, Save, X, Mic, FileText, Link2, Code2, CheckCircle, Pause, SkipForward } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  categories: Category[]
  onUpdate: (id: string, updates: Partial<Task>) => Promise<void>
  onUploadAudio?: (taskId: string, audioBlob: Blob) => Promise<void>
}

const statusColors = {
  todo: "bg-muted text-muted-foreground",
  "in-progress": "bg-primary/20 text-primary border-primary/30",
  completed: "bg-green-500/20 text-green-300 border-green-500/30",
  skipped: "bg-orange-500/20 text-orange-300 border-orange-500/30",
}

export function TaskCard({ task, categories, onUpdate, onUploadAudio }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTask, setEditedTask] = useState(task)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)
  const [audioRecording, setAudioRecording] = useState<AudioRecording | null>(null)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    notes: false,
    links: false,
    code: false,
  })
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [activeTab, setActiveTab] = useState("notes")

  const taskCategory = categories.find((cat) => cat.name === task.focus_area)
  const categoryColor = taskCategory?.color || "#6b7280"

  useEffect(() => {
    const loadAudioRecording = async () => {
      if (task.audio_path) {
        try {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          
          const response = await fetch(`/api/audio/${encodeURIComponent(task.audio_path)}`, {
            headers: {
              'Authorization': `Bearer ${session?.access_token}`,
            },
          })
          
          if (response.ok) {
            const audioBlob = await response.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            setAudioRecording({
              blob: audioBlob,
              url: audioUrl,
              duration: task.audio_duration || 0,
            })
          }
        } catch (error) {
          console.error("Failed to load audio recording:", error)
        }
      }
    }
    loadAudioRecording()
  }, [task.audio_path])

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isTimerActive && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerActive(false)
            // Auto-complete task when timer reaches 0
            handleStatusChange("completed")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerActive, timeRemaining])

  // Parse time estimate to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    const time = timeStr.toLowerCase()
    if (time.includes('min')) {
      return parseInt(time) * 60
    } else if (time.includes('hour')) {
      const hours = parseFloat(time)
      return hours * 3600
    }
    return 1800 // default 30 minutes
  }

  // Format seconds to display time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleSave = async () => {
    await onUpdate(task.id, editedTask)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTask(task)
    setIsEditing(false)
  }

  const handleStatusChange = async (status: Task["status"]) => {
    const updates: Partial<Task> = { status }
    if (status === "completed") {
      updates.completed_at = new Date().toISOString()
      setIsTimerActive(false)
      setTimeRemaining(null)
    } else if (status === "in-progress") {
      // Start timer
      const seconds = parseTimeToSeconds(task.time_estimate)
      setTimeRemaining(seconds)
      setIsTimerActive(true)
    } else {
      // Pause/Stop timer
      setIsTimerActive(false)
    }
    await onUpdate(task.id, updates)
  }

  const handlePauseTimer = () => {
    setIsTimerActive(false)
    handleStatusChange("todo")
  }

  const handleSkipTask = () => {
    setIsTimerActive(false)
    setTimeRemaining(null)
    handleStatusChange("skipped")
  }

  const handleLinksChange = (links: string[]) => {
    const updatedTask = { ...editedTask, links }
    setEditedTask(updatedTask)
    if (!isEditing) {
      onUpdate(task.id, { links })
    }
  }

  const handleSaveAudioRecording = async (taskId: string, recording: AudioRecording) => {
    try {
      await onUploadAudio?.(taskId, recording.blob)
      setAudioRecording(recording)
      setShowAudioRecorder(false)
    } catch (error) {
      console.error("Failed to save audio recording:", error)
      alert("Failed to save audio recording")
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const hasContent =
    (isEditing ? editedTask.notes : task.notes) ||
    task.links?.length ||
    audioRecording ||
    (isEditing ? editedTask.code : task.code)

  // Render header section with task info and controls
  const renderHeader = () => (
    <CardHeader className="pb-3 border-b">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className="border"
              style={{
                backgroundColor: `${categoryColor}20`,
                borderColor: `${categoryColor}50`,
                color: categoryColor,
              }}
            >
              {task.focus_area}
            </Badge>
            <Badge variant="outline" className={statusColors[task.status]}>
              {task.status.replace("-", " ")}
            </Badge>
            {task.is_dsa && (
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-300 border-blue-500/30"
              >
                <Code2 className="h-3 w-3 mr-1" />
                DSA
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.time_estimate}
            </div>

            {hasContent && (
              <div className="flex items-center gap-1">
                {task.notes && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    <FileText className="h-3 w-3 mr-1" />
                    Notes
                  </Badge>
                )}
                {task.links?.length && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    <Link2 className="h-3 w-3 mr-1" />
                    {task.links.length}
                  </Badge>
                )}
                {audioRecording && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    <Mic className="h-3 w-3 mr-1" />
                    Audio
                  </Badge>
                )}
                {task.code && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    <Code2 className="h-3 w-3 mr-1" />
                    Code
                  </Badge>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">{new Date(task.date).toLocaleDateString()}</p>
        </div>

        <div className="flex items-center gap-1">
                      {/* Timer and Action Buttons */}
          <div className="flex items-center gap-2 mr-4">
            {/* Timer Display */}
            {(task.status === "in-progress" || timeRemaining !== null) && (
              <div className={cn(
                "px-3 py-1 rounded-md text-sm font-mono border",
                timeRemaining !== null && timeRemaining <= 300 && timeRemaining > 0 
                  ? "bg-orange-500/20 text-orange-300 border-orange-500/30" 
                  : "bg-primary/20 text-primary border-primary/30"
              )}>
                {timeRemaining !== null ? formatTime(timeRemaining) : task.time_estimate}
              </div>
            )}

            {/* Start Button */}
            {task.status === "todo" && (
              <Button 
                onClick={() => handleStatusChange("in-progress")} 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
              >
                <Clock className="h-4 w-4 mr-1" />
                Start
              </Button>
            )}

            {/* Complete Button */}
            {task.status === "in-progress" && (
              <Button 
                onClick={() => handleStatusChange("completed")} 
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}

            {/* Pause Button */}
            {task.status === "in-progress" && (
              <Button 
                onClick={handlePauseTimer}
                variant="outline" 
                size="sm"
              >
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}

            {/* Skip Button */}
            {(task.status === "todo" || task.status === "in-progress") && (
              <Button
                onClick={handleSkipTask}
                variant="outline"
                size="sm"
                className="text-orange-400 hover:text-orange-300 border-orange-500/30 hover:border-orange-500/50"
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Skip
              </Button>
            )}

            {/* Reset Button */}
            {(task.status === "completed" || task.status === "skipped") && (
              <Button onClick={() => handleStatusChange("todo")} variant="outline" size="sm">
                Reset
              </Button>
            )}
          </div>
          
          <Dialog open={showAudioRecorder} onOpenChange={setShowAudioRecorder}>
            <DialogTrigger>
              <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0", audioRecording && "text-primary")}>
                <Mic className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent {...({ className: "sm:max-w-md" } as any)}>
              <AudioRecorder
                taskId={task.id}
                onSave={handleSaveAudioRecording}
                onCancel={() => setShowAudioRecorder(false)}
                existingRecording={audioRecording || undefined}
              />
            </DialogContent>
          </Dialog>

          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0 text-green-400 hover:text-green-300"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="h-8 w-8 p-0">
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  )

  // Render left side with task description and details
  const renderLeftSide = () => (
    <div className="space-y-4 h-full flex flex-col">
      {isEditing ? (
        <div className="space-y-3 flex-1">
          <Input
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className="font-semibold text-lg"
            placeholder="Task title"
          />
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Description</label>
            <RichTextEditor
              value={editedTask.details || ""}
              onChange={(details) => setEditedTask({ ...editedTask, details })}
              placeholder="Task details... Supports **bold**, *italic*, `code`, and [links](url)"
              className="min-h-[300px]"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={editedTask.is_dsa || false}
              onCheckedChange={(checked) => setEditedTask({ ...editedTask, is_dsa: checked })}
            />
            <label className="text-sm font-medium">
              DSA Question (includes code editor)
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={editedTask.date}
              onChange={(e) => setEditedTask({ ...editedTask, date: e.target.value })}
            />
            <Select
              value={editedTask.focus_area}
              onValueChange={(value: string) => setEditedTask({ ...editedTask, focus_area: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Select
            value={editedTask.time_estimate}
            onValueChange={(value: string) => setEditedTask({ ...editedTask, time_estimate: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15 min">15 minutes</SelectItem>
              <SelectItem value="30 min">30 minutes</SelectItem>
              <SelectItem value="45 min">45 minutes</SelectItem>
              <SelectItem value="1 hour">1 hour</SelectItem>
              <SelectItem value="1.5 hours">1.5 hours</SelectItem>
              <SelectItem value="2 hours">2 hours</SelectItem>
              <SelectItem value="3 hours">3 hours</SelectItem>
              <SelectItem value="4 hours">4 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-semibold text-xl leading-tight mb-3">{task.title}</h3>
            <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
              {task.details ? (
                <MarkdownRenderer content={task.details} />
              ) : (
                <span className="italic">No description...</span>
              )}
            </div>
          </div>

          <LinkManager links={task.links || []} onLinksChange={handleLinksChange} />
        </div>
      )}
    </div>
  )

  // Render right side with solution, notes, and audio using tabs
  const renderRightSide = () => {
    const tabs = [
      ...((isEditing ? editedTask.is_dsa : task.is_dsa)
        ? [
            {
              id: "code",
              label: "Code Solution",
              icon: <Code2 className="h-4 w-4" />,
              hasContent: !!(isEditing ? editedTask.code : task.code),
            },
          ]
        : []),
      {
        id: "notes",
        label: "Notes",
        icon: <FileText className="h-4 w-4" />,
        hasContent: !!task.notes,
      },
      ...(audioRecording
        ? [
            {
              id: "audio",
              label: "Audio",
              icon: <Mic className="h-4 w-4" />,
              hasContent: true,
            },
          ]
        : []),
    ]

    return (
      <div className="h-full flex flex-col">
        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground",
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.hasContent && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0">
          {/* Code Solution Tab */}
          {activeTab === "code" && (isEditing ? editedTask.is_dsa : task.is_dsa) && (
            <div className="h-full">
              <CodeEditor
                value={isEditing ? editedTask.code || "" : task.code || ""}
                onChange={(code) => setEditedTask({ ...editedTask, code })}
                language={(isEditing ? editedTask.code_language : task.code_language) || "javascript"}
                onLanguageChange={(language) => setEditedTask({ ...editedTask, code_language: language })}
                readOnly={!isEditing}
              />
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="h-full flex flex-col">
              {isEditing ? (
                <div className="h-full">
                  <RichTextEditor
                    value={editedTask.notes || ""}
                    onChange={(notes) => setEditedTask({ ...editedTask, notes })}
                    placeholder="Add your notes here... Supports **bold**, *italic*, `code`, and [links](url)"
                  />
                </div>
              ) : (
                <div className="h-full overflow-auto">
                  <div className="p-4 bg-muted/50 rounded-md text-sm h-full">
                    {task.notes ? (
                      <MarkdownRenderer content={task.notes} />
                    ) : (
                      <span className="text-muted-foreground italic">No notes yet...</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audio Tab */}
          {activeTab === "audio" && audioRecording && (
            <div className="p-4">
              <AudioPlayer recording={audioRecording} />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-lg border-border/50 h-full",
        task.status === "completed" && "opacity-75",
      )}
    >
      {renderHeader()}

      <CardContent className="p-0 flex-1 flex flex-col">
        {/* Mobile Layout - Stacked */}
        <div className="lg:hidden p-6 space-y-6">
          {renderLeftSide()}
          {renderRightSide()}
        </div>

        {/* Desktop Layout - Split */}
        <div className="hidden lg:flex h-full min-h-[600px]">
          {/* Left Side - Description */}
          <div className="flex-1 p-6 border-r">{renderLeftSide()}</div>

          {/* Right Side - Solution & Notes */}
          <div className="flex-1 p-6">{renderRightSide()}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskCard
