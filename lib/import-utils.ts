export const parseCSV = (text: string) => {
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

export const importTasks = async (
  tasksToImport: any[],
  categories: any[],
  addCategory: (category: any) => Promise<any>,
  addTask: (task: any) => Promise<any>
) => {
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

  return { categories: uniqueAreas.length, tasks: tasksToImport.length }
}

export const loadSampleData = async (onTaskAdded: (task: any) => void | Promise<any>) => {
  const response = await fetch(process.env.NEXT_PUBLIC_SAMPLE_CSV_URL || 'https://cpgghmisukyrvtgeplep.supabase.co/storage/v1/object/public/assets/tasks.csv')
  const text = await response.text()
  const tasksToImport = parseCSV(text)
  
  for (const task of tasksToImport) {
    if (task.date && task.title) {
      onTaskAdded(task)
    }
  }
}