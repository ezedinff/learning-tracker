"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit3, Trash2, Save, X, Palette } from "lucide-react"
import { useApiCategories } from "@/hooks/use-api"
import type { Database } from "@/lib/supabase"

type Category = Database['public']['Tables']['categories']['Row']

interface CategoryManagerProps {
  onCategoriesChange?: (categories: Category[]) => void
}

const PRESET_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#ef4444", // red
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#ec4899", // pink
  "#6366f1", // indigo
]

export function CategoryManager({ onCategoriesChange }: CategoryManagerProps) {
  const { categories, addCategory, updateCategory, deleteCategory } = useApiCategories()
  const [isOpen, setIsOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])



  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      await addCategory({
        name: newCategoryName.trim(),
        color: selectedColor,
      })
      onCategoriesChange?.(categories)
      setNewCategoryName("")
      setSelectedColor(PRESET_COLORS[0])
    } catch (error) {
      console.error("Failed to add category:", error)
      alert("Failed to add category")
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) return

    try {
      await updateCategory(editingCategory.id, {
        name: newCategoryName.trim(),
        color: selectedColor,
      })
      onCategoriesChange?.(categories)
      setEditingCategory(null)
      setNewCategoryName("")
      setSelectedColor(PRESET_COLORS[0])
    } catch (error) {
      console.error("Failed to update category:", error)
      alert("Failed to update category")
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      await deleteCategory(categoryId)
      onCategoriesChange?.(categories)
    } catch (error) {
      console.error("Failed to delete category:", error)
      alert("Failed to delete category")
    }
  }

  const startEditing = (category: Category) => {
    setEditingCategory(category)
    setNewCategoryName(category.name)
    setSelectedColor(category.color)
  }

  const cancelEditing = () => {
    setEditingCategory(null)
    setNewCategoryName("")
    setSelectedColor(PRESET_COLORS[0])
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-4 w-4 mr-2" />
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add/Edit Category Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{editingCategory ? "Edit Category" : "Add New Category"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    editingCategory ? handleUpdateCategory() : handleAddCategory()
                  }
                }}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        selectedColor === color ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                {editingCategory ? (
                  <>
                    <Button onClick={handleUpdateCategory} size="sm" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                    <Button onClick={cancelEditing} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleAddCategory} size="sm" className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Existing Categories */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Existing Categories</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEditing(category)} className="h-6 w-6 p-0">
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
