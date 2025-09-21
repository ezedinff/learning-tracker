"use client"

import { useEffect, useState } from "react"
import { db, type Task, type ProgressStats, type Category } from "@/lib/db"

export function useLearningDB() {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    db.init().then(() => setIsInitialized(true))
  }, [])

  return { db, isInitialized }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { db: database, isInitialized } = useLearningDB()

  const refreshTasks = async () => {
    if (!isInitialized) return
    try {
      const allTasks = await database.getAllTasks()
      setTasks(allTasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTasks()
  }, [isInitialized])

  const addTask = async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask = await database.addTask(task)
    setTasks((prev) => [...prev, newTask].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    return newTask
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updatedTask = await database.updateTask(id, updates)
    setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)))
    return updatedTask
  }

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    refreshTasks,
  }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { db: database, isInitialized } = useLearningDB()

  const refreshCategories = async () => {
    if (!isInitialized) return
    try {
      const allCategories = await database.getAllCategories()
      setCategories(allCategories)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCategories()
  }, [isInitialized])

  const addCategory = async (category: Omit<Category, "id" | "createdAt">) => {
    const newCategory = await database.addCategory(category)
    setCategories((prev) => [...prev, newCategory])
    return newCategory
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const updatedCategory = await database.updateCategory(id, updates)
    setCategories((prev) => prev.map((c) => (c.id === id ? updatedCategory : c)))
    return updatedCategory
  }

  const deleteCategory = async (id: string) => {
    await database.deleteCategory(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
  }
}

export function useProgressStats() {
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const { db: database, isInitialized } = useLearningDB()

  const refreshStats = async () => {
    if (!isInitialized) return
    try {
      const progressStats = await database.getProgressStats()
      setStats(progressStats)
    } catch (error) {
      console.error("Failed to fetch progress stats:", error)
    }
  }

  useEffect(() => {
    refreshStats()
  }, [isInitialized])

  return { stats, refreshStats }
}
