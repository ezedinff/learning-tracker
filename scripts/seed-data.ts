import { db } from "@/lib/db"

const seedTasks = [
  {
    date: "2025-09-19",
    focusArea: "DSA",
    title: "Two Sum",
    details: "LeetCode #1",
    timeEstimate: "45 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-19",
    focusArea: "English",
    title: "Explain Two Sum aloud",
    details: "Record yourself",
    timeEstimate: "15 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-19",
    focusArea: "System Design",
    title: "Read about Load Balancers",
    details: "System Design Primer",
    timeEstimate: "30 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-20",
    focusArea: "DSA",
    title: "Contains Duplicate",
    details: "LeetCode #217",
    timeEstimate: "45 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-20",
    focusArea: "English",
    title: "Explain Contains Duplicate",
    details: 'Focus on "time complexity"',
    timeEstimate: "15 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-20",
    focusArea: "System Design",
    title: "Read about Caching (Redis)",
    details: "System Design Primer",
    timeEstimate: "45 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-21",
    focusArea: "DSA",
    title: "Best Time to Buy/Sell Stock",
    details: "LeetCode #121",
    timeEstimate: "45 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-21",
    focusArea: "English",
    title: "Explain Best Time to Buy Stock aloud",
    details: "Focus on O(n) solution",
    timeEstimate: "15 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-21",
    focusArea: "System Design",
    title: "Draw a simple diagram for Load Balancer + Cache",
    details: "Paper/Excalidraw",
    timeEstimate: "45 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-22",
    focusArea: "DSA",
    title: "Valid Anagram",
    details: "LeetCode #242",
    timeEstimate: "45 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-22",
    focusArea: "English",
    title: "Read solution aloud",
    details: "Record and listen",
    timeEstimate: "15 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-23",
    focusArea: "DSA",
    title: "Group Anagrams",
    details: "LeetCode #49",
    timeEstimate: "45 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-23",
    focusArea: "English",
    title: "Explain Grouping strategy aloud",
    details: "Hashmap",
    timeEstimate: "15 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-24",
    focusArea: "DSA",
    title: "Valid Palindrome",
    details: "LeetCode #125",
    timeEstimate: "45 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-24",
    focusArea: "English",
    title: 'Say: "I use two pointers because..."',
    details: "Practice",
    timeEstimate: "15 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-25",
    focusArea: "DSA",
    title: "Longest Substring Without Repeating Characters",
    details: "LeetCode #3",
    timeEstimate: "45 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-25",
    focusArea: "English",
    title: "Explain sliding window idea aloud",
    details: "Record",
    timeEstimate: "15 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-26",
    focusArea: "DSA",
    title: "Reverse Linked List",
    details: "LeetCode #206",
    timeEstimate: "45 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-26",
    focusArea: "English",
    title: "Explain iterative vs recursive aloud",
    details: "",
    timeEstimate: "15 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-27",
    focusArea: "DSA",
    title: "Merge Two Sorted Lists",
    details: "LeetCode #21",
    timeEstimate: "45 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-27",
    focusArea: "English",
    title: "Explain merge step aloud",
    details: "",
    timeEstimate: "15 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-27",
    focusArea: "System Design",
    title: "Read: Relational DB vs NoSQL",
    details: "System Design Primer",
    timeEstimate: "45 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-28",
    focusArea: "DSA",
    title: "Linked List Cycle",
    details: "LeetCode #141",
    timeEstimate: "45 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-28",
    focusArea: "English",
    title: "Explain Floyd's cycle detection aloud",
    details: "",
    timeEstimate: "15 min",
    status: "todo" as const,
  },
  {
    date: "2025-09-28",
    focusArea: "System Design",
    title: "Design URL Shortener",
    details: "Write 3–4 bullet points",
    timeEstimate: "1 hour",
    status: "todo" as const,
  },
]

const seedCategories = [
  { name: "DSA", color: "#00d4ff" },
  { name: "System Design", color: "#aa00ff" },
  { name: "English", color: "#00ff88" },
]

export async function seedDatabase() {
  try {
    await db.init()

    // Check if data already exists
    const existingTasks = await db.getAllTasks()
    const existingCategories = await db.getAllCategories()

    // Seed categories first if they don't exist
    if (existingCategories.length === 0) {
      for (const category of seedCategories) {
        await db.addCategory(category)
      }
      console.log(`Seeded ${seedCategories.length} categories`)
    }

    // Seed tasks if they don't exist
    if (existingTasks.length === 0) {
      for (const task of seedTasks) {
        await db.addTask(task)
      }
      console.log(`Seeded ${seedTasks.length} tasks`)
    } else {
      console.log("Database already seeded")
    }
  } catch (error) {
    console.error("Failed to seed database:", error)
  }
}

// Auto-run seeding in development
if (typeof window !== "undefined") {
  seedDatabase()
}
