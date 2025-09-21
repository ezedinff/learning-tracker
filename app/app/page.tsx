"use client"

import { TaskList } from "@/components/task-list"
import { useApiTasks, useApiCategories } from "@/hooks/use-api"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Brain, Settings, BarChart3, Upload } from "lucide-react"
import Link from "next/link"
import { useRef, useState } from "react"

export default function AppPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { tasks, loading: tasksLoading, updateTask, addTask, deleteTasks, refreshTasks } = useApiTasks()
  const { categories, loading: categoriesLoading, refreshCategories, addCategory } = useApiCategories()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting] = useState(false)

  const loading = authLoading || tasksLoading || categoriesLoading

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-2xl font-bold">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to access the app.</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Loading your learning progress...</p>
        </div>
      </div>
    )
  }

  const handleTaskAdded = (task: any) => {
    refreshTasks()
  }

  const handleCategoriesChange = (updatedCategories: any) => {
    refreshCategories()
  }

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    return lines.slice(1).map(line => {
      const values = line.split(',')
      const task: any = {}
      headers.forEach((header, index) => {
        const key = header.trim().toLowerCase()
        const value = values[index]?.trim() || ''
        if (key.includes('date')) task.date = value
        else if (key.includes('focus') || key.includes('area')) task.focus_area = value
        else if (key.includes('task') && !key.includes('details')) task.title = value
        else if (key.includes('details') || key.includes('resources')) task.details = value
        else if (key.includes('time')) task.time_estimate = value
      })
      return {
        ...task,
        status: 'todo',
        notes: null,
        links: null,
        code: null,
        code_language: null,
        is_dsa: task.focus_area?.toLowerCase().includes('dsa') || false,
        completed_at: null
      }
    })
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const text = await file.text()
      let tasksToImport: any[] = []

      if (file.name.endsWith('.csv')) {
        tasksToImport = parseCSV(text)
      } else if (file.name.endsWith('.json')) {
        const data = JSON.parse(text)
        tasksToImport = Array.isArray(data) ? data : data.tasks || []
      }

      // Create categories first
      const uniqueAreas = Array.from(new Set(tasksToImport.map(t => t.focus_area).filter(Boolean)))
      const existingCategoryNames = categories.map(c => c.name)
      const categoryColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4']
      
      for (const area of uniqueAreas) {
        if (!existingCategoryNames.includes(area)) {
          await addCategory({
            name: area,
            color: categoryColors[Math.floor(Math.random() * categoryColors.length)]
          })
        }
      }

      // Then create tasks
      for (const task of tasksToImport) {
        if (task.date && task.title) {
          await addTask(task)
        }
      }

      alert(`Successfully imported ${uniqueAreas.length} categories and ${tasksToImport.length} tasks!`)
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import tasks. Please check the file format.')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Logo and Title - Responsive sizing */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">Learning Tracker</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden xs:block">
                  Master your learning journey
                </p>
              </div>
            </div>

            {/* Navigation Buttons - Responsive layout */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-2 sm:px-3" 
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-2">{importing ? 'Importing...' : 'Import'}</span>
              </Button>
              <Link href="/app/progress">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline sm:ml-2">Progress</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="px-2 sm:px-3" onClick={() => signOut()}>
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline sm:ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Welcome Section - Mobile optimized */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="leading-tight">Welcome to Your Learning Journey</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Track your progress across custom learning categories. Create tasks, record audio notes, add links, and
                stay consistent with your learning goals.
                <span className="hidden sm:inline"> Master your skills one task at a time.</span>
              </p>
            </CardContent>
          </Card>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileImport}
            className="hidden"
          />

          {/* Task List - Will inherit mobile responsiveness from TaskList component */}
          <TaskList
            tasks={tasks}
            categories={categories}
            onUpdateTask={updateTask}
            onDeleteTasks={deleteTasks}
            onTaskAdded={handleTaskAdded}
            onCategoriesChange={handleCategoriesChange}
          />
        </div>
      </main>
    </div>
  )
}