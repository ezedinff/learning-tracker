"use client"

import { useEffect, useState } from "react"
import { supabase, type Database } from "@/lib/supabase"
import { useAuth } from "./use-auth"

type Task = Database['public']['Tables']['tasks']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type TaskInsert = Database['public']['Tables']['tasks']['Insert']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']

export function useSupabaseTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const refreshTasks = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTasks()
  }, [user])

  const addTask = async (task: Omit<TaskInsert, 'user_id'>) => {
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    setTasks(prev => [...prev, data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
    return data
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    setTasks(prev => prev.map(t => t.id === id ? data : t))
    return data
  }

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    refreshTasks,
  }
}

export function useSupabaseCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const refreshCategories = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCategories()
  }, [user])

  const addCategory = async (category: Omit<CategoryInsert, 'user_id'>) => {
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    setCategories(prev => [...prev, data])
    return data
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    setCategories(prev => prev.map(c => c.id === id ? data : c))
    return data
  }

  const deleteCategory = async (id: string) => {
    if (!user) throw new Error('User not authenticated')
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
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