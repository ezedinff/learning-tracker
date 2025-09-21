"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, BookOpen, BarChart3, Target, Menu, X } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen w-full relative bg-black">
      {/* Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 50% 35% at 50% 0%, rgba(59, 130, 246, 0.15), transparent 60%), #000000",
        }}
      />

      {/* Desktop Header */}
      <header
        className={`sticky top-4 z-[9999] mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full bg-background/80 md:flex backdrop-blur-sm border border-border/50 shadow-lg transition-all duration-300 ${
          isScrolled ? "max-w-3xl px-2" : "max-w-5xl px-4"
        } py-2`}
      >
        <Link href="/" className={`z-50 flex items-center justify-center gap-2 transition-all duration-300 ${
          isScrolled ? "ml-4" : ""
        }`}>
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">Learning Tracker</span>
        </Link>

        <div className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-muted-foreground transition duration-200 hover:text-foreground md:flex md:space-x-2">
          <a href="#features" className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <span className="relative z-20">Features</span>
          </a>
          <Link href="/app/progress" className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <span className="relative z-20">Progress</span>
          </Link>
          <Link href="/app" className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <span className="relative z-20">Dashboard</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/app" className="font-medium transition-colors hover:text-foreground text-muted-foreground text-sm cursor-pointer">
            Sign In
          </Link>
          <Link href="/app" className="rounded-md font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center bg-gradient-to-b from-primary to-primary/80 text-primary-foreground shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] px-4 py-2 text-sm">
            Get Started
          </Link>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-4 z-[9999] mx-4 flex w-auto flex-row items-center justify-between rounded-full bg-background/80 backdrop-blur-sm border border-border/50 shadow-lg md:hidden px-4 py-3">
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">Learning Tracker</span>
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-background/50 border border-border/50 transition-colors hover:bg-background/80"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm md:hidden">
          <div className="absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl p-6">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50">
                Features
              </a>
              <Link href="/app/progress" className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50">
                Progress
              </Link>
              <Link href="/app" className="text-left px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-background/50">
                Dashboard
              </Link>
              <div className="border-t border-border/50 pt-4 mt-4 flex flex-col space-y-3">
                <Link href="/app" className="px-4 py-3 text-lg font-bold text-center bg-gradient-to-b from-primary to-primary/80 text-primary-foreground rounded-lg shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                Master Your
                <br />
                Learning Journey
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Track progress, organize tasks, and achieve your learning goals with personalized insights and analytics.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/app">
                <Button size="lg" className="px-8 py-4 text-lg font-bold bg-gradient-to-b from-primary to-primary/80 hover:-translate-y-0.5 transition-all duration-200 shadow-lg">
                  Start Learning
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-border/50 bg-background/20 backdrop-blur-sm hover:bg-background/40 transition-all duration-200">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to accelerate your learning progress
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-background/20 backdrop-blur-sm border-border/50 hover:bg-background/30 transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  Smart Task Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Organize learning tasks with custom categories, priorities, audio notes, and detailed progress tracking.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/20 backdrop-blur-sm border-border/50 hover:bg-background/30 transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  Progress Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Visualize your learning journey with detailed analytics, streak tracking, and performance insights.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background/20 backdrop-blur-sm border-border/50 hover:bg-background/30 transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  Goal Achievement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Set meaningful learning objectives and track your progress with structured milestone management.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of learners who are already mastering their skills with Learning Tracker.
            </p>
            <Link href="/app">
              <Button size="lg" className="px-12 py-4 text-lg font-bold bg-gradient-to-b from-primary to-primary/80 hover:-translate-y-0.5 transition-all duration-200 shadow-lg">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}