"use client"

import { useState, useRef, useEffect } from "react"
import { Editor } from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Download, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  onLanguageChange?: (language: string) => void // Added callback for language changes
  className?: string
  readOnly?: boolean
}

const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
]

const DEFAULT_CODE_TEMPLATES = {
  javascript: `// JavaScript Solution
function solution() {
    // Your code here
    
}

// Test cases
console.log(solution());`,
  typescript: `// TypeScript Solution
function solution(): any {
    // Your code here
    
}

// Test cases
console.log(solution());`,
  python: `# Python Solution
def solution():
    # Your code here
    pass

# Test cases
print(solution())`,
  java: `// Java Solution
public class Solution {
    public static void main(String[] args) {
        // Your code here
        
    }
}`,
  cpp: `// C++ Solution
#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Your code here
    
    return 0;
}`,
  c: `// C Solution
#include <stdio.h>

int main() {
    // Your code here
    
    return 0;
}`,
  go: `// Go Solution
package main

import "fmt"

func main() {
    // Your code here
    
}`,
  rust: `// Rust Solution
fn main() {
    // Your code here
    
}`,
}

export function CodeEditor({
  value,
  onChange,
  language = "javascript",
  onLanguageChange, // Added onLanguageChange prop
  className,
  readOnly = false,
}: CodeEditorProps) {
  const [currentLanguage, setCurrentLanguage] = useState(language)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    setCurrentLanguage(language)
  }, [language])

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
  }

  const handleLanguageChange = (newLanguage: string) => {
    setCurrentLanguage(newLanguage)
    onLanguageChange?.(newLanguage)
    if (!value || value.trim() === "") {
      onChange(DEFAULT_CODE_TEMPLATES[newLanguage as keyof typeof DEFAULT_CODE_TEMPLATES] || "")
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  const handleDownloadCode = () => {
    const fileExtensions = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      cpp: "cpp",
      c: "c",
      go: "go",
      rust: "rs",
    }

    const extension = fileExtensions[currentLanguage as keyof typeof fileExtensions] || "txt"
    const blob = new Blob([value], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `solution.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    const template = DEFAULT_CODE_TEMPLATES[currentLanguage as keyof typeof DEFAULT_CODE_TEMPLATES] || ""
    onChange(template)
  }

  return (
    <Card className={cn("w-full", className, "py-2 gap-2")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Code Editor</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={currentLanguage} onValueChange={handleLanguageChange} disabled={readOnly}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!readOnly && (
              <>
                <Button variant="ghost" size="sm" onClick={handleReset} title="Reset to template">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCopyCode} title="Copy code">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDownloadCode} title="Download code">
                  <Download className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="border-t">
          <Editor
            height="400px"
            language={currentLanguage}
            value={value}
            onChange={(newValue) => onChange(newValue || "")}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              wordWrap: "on",
              contextmenu: true,
              selectOnLineNumbers: true,
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
