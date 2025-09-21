"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Save, X } from "lucide-react"
import { db, type Task, type Category } from "@/lib/db"

interface TaskFormProps {
  onTaskAdded?: (task: Task) => void
  categories: Category[]
}

export function TaskForm({ onTaskAdded, categories }: TaskFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    focusArea: "",
    title: "",
    details: "",
    timeEstimate: "30 min",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.focusArea) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const newTask = await db.addTask({
        ...formData,
        status: "todo" as const,
      })

      onTaskAdded?.(newTask)
      setIsOpen(false)
      setFormData({
        date: new Date().toISOString().split("T")[0],
        focusArea: "",
        title: "",
        details: "",
        timeEstimate: "30 min",
      })
    } catch (error) {
      console.error("Failed to add task:", error)
      alert("Failed to add task")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select value={formData.focusArea} onValueChange={(value) => handleInputChange("focusArea", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Details</label>
            <Textarea
              placeholder="Task details and description"
              value={formData.details}
              onChange={(e) => handleInputChange("details", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Time Estimate</label>
            <Select value={formData.timeEstimate} onValueChange={(value) => handleInputChange("timeEstimate", value)}>
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

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Add Task
            </Button>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
