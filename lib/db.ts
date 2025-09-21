export interface Task {
  id: string
  date: string
  focusArea: string // Changed from union type to string to allow custom categories
  title: string
  details: string
  timeEstimate: string
  status: "todo" | "in-progress" | "completed" | "skipped"
  notes?: string
  audioRecording?: Blob
  audioRecordingDuration?: number // Added to store audio duration separately
  links?: string[]
  code?: string
  codeLanguage?: string
  isDSA?: boolean
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  color: string
  createdAt: string
}

// ProgressStats interface remains unchanged
export interface ProgressStats {
  totalTasks: number
  completedTasks: number
  streakDays: number
  focusAreaStats: Record<string, { completed: number; total: number }>
}

class LearningDB {
  private db: IDBDatabase | null = null
  private readonly dbName = "LearningTracker"
  private readonly version = 3 // Incremented version for schema changes

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Tasks store
        if (!db.objectStoreNames.contains("tasks")) {
          const taskStore = db.createObjectStore("tasks", { keyPath: "id" })
          taskStore.createIndex("date", "date", { unique: false })
          taskStore.createIndex("focusArea", "focusArea", { unique: false })
          taskStore.createIndex("status", "status", { unique: false })
          taskStore.createIndex("isDSA", "isDSA", { unique: false })
        }

        // Audio recordings store
        if (!db.objectStoreNames.contains("audio")) {
          const audioStore = db.createObjectStore("audio", { keyPath: "taskId" })
          audioStore.createIndex("duration", "duration", { unique: false })
        }

        if (!db.objectStoreNames.contains("categories")) {
          const categoryStore = db.createObjectStore("categories", { keyPath: "id" })
          categoryStore.createIndex("name", "name", { unique: true })
        }
      }
    })
  }

  async addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task> {
    if (!this.db) throw new Error("Database not initialized")

    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["tasks"], "readwrite")
      const store = transaction.objectStore("tasks")
      const request = store.add(newTask)

      request.onsuccess = () => resolve(newTask)
      request.onerror = () => reject(request.error)
    })
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    if (!this.db) throw new Error("Database not initialized")

    const task = await this.getTask(id)
    if (!task) throw new Error("Task not found")

    const updatedTask: Task = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["tasks"], "readwrite")
      const store = transaction.objectStore("tasks")
      const request = store.put(updatedTask)

      request.onsuccess = () => resolve(updatedTask)
      request.onerror = () => reject(request.error)
    })
  }

  async getTask(id: string): Promise<Task | null> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["tasks"], "readonly")
      const store = transaction.objectStore("tasks")
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllTasks(): Promise<Task[]> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["tasks"], "readonly")
      const store = transaction.objectStore("tasks")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getTasksByDateRange(startDate: string, endDate: string): Promise<Task[]> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["tasks"], "readonly")
      const store = transaction.objectStore("tasks")
      const index = store.index("date")
      const range = IDBKeyRange.bound(startDate, endDate)
      const request = index.getAll(range)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async saveAudioRecording(taskId: string, audioBlob: Blob, duration: number): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["audio"], "readwrite")
      const store = transaction.objectStore("audio")
      const request = store.put({ taskId, audioBlob, duration })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getAudioRecording(taskId: string): Promise<{ blob: Blob; duration: number } | null> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["audio"], "readonly")
      const store = transaction.objectStore("audio")
      const request = store.get(taskId)

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? { blob: result.audioBlob, duration: result.duration } : null)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async addCategory(category: Omit<Category, "id" | "createdAt">): Promise<Category> {
    if (!this.db) throw new Error("Database not initialized")

    const existingCategories = await this.getAllCategories()
    const existingCategory = existingCategories.find((cat) => cat.name.toLowerCase() === category.name.toLowerCase())

    if (existingCategory) {
      throw new Error(`Category with name "${category.name}" already exists`)
    }

    const newCategory: Category = {
      ...category,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["categories"], "readwrite")
      const store = transaction.objectStore("categories")
      const request = store.add(newCategory)

      request.onsuccess = () => resolve(newCategory)
      request.onerror = () => reject(request.error)
    })
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    if (!this.db) throw new Error("Database not initialized")

    const category = await this.getCategory(id)
    if (!category) throw new Error("Category not found")

    if (updates.name) {
      const existingCategories = await this.getAllCategories()
      const conflictingCategory = existingCategories.find(
        (cat) => cat.id !== id && cat.name.toLowerCase() === updates.name!.toLowerCase(),
      )

      if (conflictingCategory) {
        throw new Error(`Category with name "${updates.name}" already exists`)
      }
    }

    const updatedCategory: Category = {
      ...category,
      ...updates,
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["categories"], "readwrite")
      const store = transaction.objectStore("categories")
      const request = store.put(updatedCategory)

      request.onsuccess = () => resolve(updatedCategory)
      request.onerror = () => reject(request.error)
    })
  }

  async getCategory(id: string): Promise<Category | null> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["categories"], "readonly")
      const store = transaction.objectStore("categories")
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllCategories(): Promise<Category[]> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["categories"], "readonly")
      const store = transaction.objectStore("categories")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteCategory(id: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized")

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["categories"], "readwrite")
      const store = transaction.objectStore("categories")
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getProgressStats(): Promise<ProgressStats> {
    const tasks = await this.getAllTasks()
    const completed = tasks.filter((t) => t.status === "completed")

    const focusAreaStats = tasks.reduce(
      (acc, task) => {
        if (!acc[task.focusArea]) {
          acc[task.focusArea] = { completed: 0, total: 0 }
        }
        acc[task.focusArea].total++
        if (task.status === "completed") {
          acc[task.focusArea].completed++
        }
        return acc
      },
      {} as Record<string, { completed: number; total: number }>,
    )

    // Calculate streak (simplified - consecutive days with completed tasks)
    const completedDates = Array.from(new Set(completed.map((t) => t.date))).sort()
    let streakDays = 0
    const today = new Date().toISOString().split("T")[0]

    for (let i = completedDates.length - 1; i >= 0; i--) {
      const date = new Date(completedDates[i])
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - streakDays)

      if (date.toISOString().split("T")[0] === expectedDate.toISOString().split("T")[0]) {
        streakDays++
      } else {
        break
      }
    }

    return {
      totalTasks: tasks.length,
      completedTasks: completed.length,
      streakDays,
      focusAreaStats,
    }
  }
}

export const db = new LearningDB()
