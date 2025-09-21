"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { TaskForm } from "./task-form"
import { CategoryManager } from "./category-manager"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Database } from "@/lib/supabase"

type Task = Database['public']['Tables']['tasks']['Row']
type Category = Database['public']['Tables']['categories']['Row']
import { Search, Filter, Calendar, ExternalLink, Clock, CheckCircle, Circle, X, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

interface TaskListProps {
  tasks: Task[]
  categories: Category[]
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<Task>
  onDeleteTasks?: (ids: string[]) => Promise<void>
  onTaskAdded?: (task: Task) => void
  onCategoriesChange?: (categories: Category[]) => void
}

export function TaskList({ tasks, categories, onUpdateTask, onDeleteTasks, onTaskAdded, onCategoriesChange }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [focusAreaFilter, setFocusAreaFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())
  const router = useRouter()

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.details.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || task.status === statusFilter
      const matchesFocusArea = focusAreaFilter === "all" || task.focus_area === focusAreaFilter

      let matchesDate = true
      if (dateFilter !== "all") {
        const taskDate = new Date(task.date)
        const today = new Date()

        switch (dateFilter) {
          case "today":
            matchesDate = taskDate.toDateString() === today.toDateString()
            break
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = taskDate >= weekAgo
            break
          case "overdue":
            matchesDate = taskDate < today && task.status !== "completed"
            break
        }
      }

      return matchesSearch && matchesStatus && matchesFocusArea && matchesDate
    })
  }, [tasks, searchQuery, statusFilter, focusAreaFilter, dateFilter])

  const taskStats = useMemo(() => {
    const total = filteredTasks.length
    const completed = filteredTasks.filter((t) => t.status === "completed").length
    const inProgress = filteredTasks.filter((t) => t.status === "in-progress").length
    const overdue = filteredTasks.filter((t) => new Date(t.date) < new Date() && t.status !== "completed").length

    return { total, completed, inProgress, overdue }
  }, [filteredTasks])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-primary" />
      case "skipped":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-500/20 text-green-300 border-green-500/30",
      "in-progress": "bg-primary/20 text-primary border-primary/30",
      skipped: "bg-red-500/20 text-red-300 border-red-500/30",
      todo: "bg-muted/20 text-muted-foreground border-muted/30",
    }

    return (
      <Badge
        variant="outline"
        className={`px-2 py-1 text-xs ${variants[status as keyof typeof variants] || variants.todo}`}
      >
        <div className="flex items-center gap-1">
          {getStatusIcon(status)}
          {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
        </div>
      </Badge>
    )
  }

  const getCategoryBadge = (focusArea: string) => {
    const category = categories.find((c) => c.name === focusArea)
    return (
      <Badge variant="outline" className="px-2 py-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category?.color || "#666" }} />
          {focusArea}
        </div>
      </Badge>
    )
  }

  const handleRowClick = (taskId: string, event: React.MouseEvent) => {
    // Prevent navigation if clicking on interactive elements
    const target = event.target as HTMLElement
    if (target.closest("button") || target.closest("a") || target.closest("input[type='checkbox']")) {
      return
    }

    router.push(`/app/task/${taskId}`)
  }

  const handleSelectTask = (taskId: string, checked: boolean) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(taskId)
      } else {
        newSet.delete(taskId)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(new Set(filteredTasks.map(t => t.id)))
    } else {
      setSelectedTasks(new Set())
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedTasks.size === 0) return
    if (!confirm(`Delete ${selectedTasks.size} selected tasks?`)) return
    
    try {
      await onDeleteTasks?.(Array.from(selectedTasks))
      setSelectedTasks(new Set())
    } catch (error) {
      alert('Failed to delete tasks')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1">
          <TaskForm onTaskAdded={onTaskAdded as any} categories={categories as any} />
        </div>
        <CategoryManager onCategoriesChange={onCategoriesChange} />
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="skipped">Skipped</SelectItem>
            </SelectContent>
          </Select>

          <Select value={focusAreaFilter} onValueChange={setFocusAreaFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Focus Area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Areas</SelectItem>
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

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats and Actions */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-4 flex-wrap">
            <Badge variant="outline" className="px-3 py-1">
              Total: {taskStats.total}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 bg-green-500/20 text-green-300 border-green-500/30">
              Completed: {taskStats.completed}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 bg-primary/20 text-primary border-primary/30">
              In Progress: {taskStats.inProgress}
            </Badge>
            {taskStats.overdue > 0 && (
              <Badge variant="outline" className="px-3 py-1 bg-red-500/20 text-red-300 border-red-500/30">
                Overdue: {taskStats.overdue}
              </Badge>
            )}
          </div>
          
          {selectedTasks.size > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteSelected}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete {selectedTasks.size} selected
            </Button>
          )}
        </div>
      </div>

      {/* Task Groups */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-card/50">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedTasks.size === filteredTasks.length && filteredTasks.length > 0}
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[40px]">Status</TableHead>
              <TableHead className="min-w-[250px]">Task</TableHead>
              <TableHead className="w-[150px]">Category</TableHead>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead className="w-[80px]">Priority</TableHead>
              <TableHead className="w-[60px]">DSA</TableHead>
              <TableHead className="w-[60px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <p className="text-muted-foreground text-lg">No tasks found</p>
                  <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search query</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className="hover:bg-card/30 cursor-pointer group"
                  onClick={(e) => handleRowClick(task.id, e)}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedTasks.has(task.id)}
                      onChange={(checked) => handleSelectTask(task.id, checked)}
                    />
                  </TableCell>
                  <TableCell>{getStatusIcon(task.status)}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {task.title}
                      </div>
                      {task.details && <div className="text-sm text-muted-foreground truncate max-w-[200px]">{task.details}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(task.focus_area)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(task.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-xs bg-muted/20 text-muted-foreground border-muted/30"
                    >
                      Normal
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.is_dsa && (
                      <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                        DSA
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/app/task/${task.id}`)
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
