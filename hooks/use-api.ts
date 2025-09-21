"use client"

import { useEffect, useState } from "react"
import { useAuth } from "./use-auth"
import { createClient } from "@/lib/supabase"

type Task = {
  id: string
  user_id: string
  date: string
  focus_area: string
  title: string
  details: string
  time_estimate: string
  status: 'todo' | 'in-progress' | 'completed' | 'skipped'
  notes: string | null
  links: string[] | null
  code: string | null
  code_language: string | null
  is_dsa: boolean
  completed_at: string | null
  audio_path: string | null
  audio_duration: number | null
  created_at: string
  updated_at: string
}

type Category = {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export function useApiTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const refreshTasks = async () => {
    if (!user) return
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTasks()
  }, [user])

  const addTask = async (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(task),
    })
    
    if (!response.ok) throw new Error('Failed to add task')
    const data = await response.json()
    setTasks(prev => [...prev, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    return data
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(updates),
    })
    
    if (!response.ok) throw new Error('Failed to update task')
    const data = await response.json()
    setTasks(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  const deleteTask = async (id: string) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
      },
    })
    
    if (!response.ok) throw new Error('Failed to delete task')
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const deleteTasks = async (ids: string[]) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    await Promise.all(ids.map(id => 
      fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })
    ))
    
    setTasks(prev => prev.filter(t => !ids.includes(t.id)))
  }

  const uploadAudio = async (taskId: string, audioBlob: Blob, duration?: number) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')
    if (duration) {
      formData.append('duration', duration.toString())
    }
    
    const response = await fetch(`/api/tasks/${taskId}/audio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: formData,
    })
    
    if (!response.ok) throw new Error('Failed to upload audio')
    const data = await response.json()
    setTasks(prev => prev.map(t => t.id === taskId ? data : t))
    return data
  }

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    deleteTasks,
    uploadAudio,
    refreshTasks,
  }
}

export function useApiCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const refreshCategories = async () => {
    if (!user) return
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCategories()
  }, [user])

  const addCategory = async (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(category),
    })
    
    if (!response.ok) throw new Error('Failed to add category')
    const data = await response.json()
    setCategories(prev => [...prev, data])
    return data
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(updates),
    })
    
    if (!response.ok) throw new Error('Failed to update category')
    const data = await response.json()
    setCategories(prev => prev.map(c => c.id === id ? data : c))
    return data
  }

  const deleteCategory = async (id: string) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    const response = await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
      },
    })
    
    if (!response.ok) throw new Error('Failed to delete category')
    setCategories(prev => prev.filter(c => c.id !== id))
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