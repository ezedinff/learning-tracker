"use client"

import { useEffect } from "react"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { useApiTasks, useApiCategories } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share, MoreVertical } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ProgressPage() {
  const { tasks, loading: tasksLoading } = useApiTasks()
  const { categories, loading: categoriesLoading } = useApiCategories()



  const loading = tasksLoading || categoriesLoading

  // Convert API data to ProgressDashboard format
  const mapTasksForComponent = (apiTasks: any[]) => 
    apiTasks.map(task => ({
      ...task,
      focusArea: task.focus_area,
      timeEstimate: task.time_estimate,
      isDSA: task.is_dsa,
      completedAt: task.completed_at,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      codeLanguage: task.code_language,
    }))

  const mapCategoriesForComponent = (apiCategories: any[]) => 
    apiCategories.map(cat => ({
      ...cat,
      createdAt: cat.created_at,
    }))

  const exportData = () => {
    const dataStr = JSON.stringify({ tasks, categories }, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `learning-progress-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const shareProgress = () => {
    // Share functionality can be implemented here
    if (navigator.share) {
      navigator.share({
        title: 'Learning Progress',
        text: 'Check out my learning progress!',
        url: window.location.href
      }).catch(console.error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground text-sm sm:text-base">Loading progress data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Back Button + Title - Mobile optimized */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Link href="/app">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden xs:inline sm:ml-2">Back</span>
                  <span className="hidden sm:inline">to Tasks</span>
                </Button>
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold truncate">Progress Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Track your learning journey
                </p>
              </div>
            </div>

            {/* Action Buttons - Responsive layout */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Desktop: Show both buttons */}
              <div className="hidden sm:flex sm:items-center sm:gap-2">
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" size="sm" onClick={shareProgress}>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Mobile: Show dropdown menu */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="px-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={exportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareProgress}>
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <ProgressDashboard tasks={mapTasksForComponent(tasks)} categories={mapCategoriesForComponent(categories)} />
      </main>
    </div>
  )
}
