"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft, Mail } from "lucide-react"

export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Link
        href="/login"
        className="absolute top-6 left-6 z-20 text-zinc-400 hover:text-primary transition-colors duration-200 flex items-center space-x-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Login</span>
      </Link>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-white">Learning Tracker</span>
            </div>
          </Link>
        </div>

        {/* Confirmation Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8"
        >
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-zinc-400">
              We've sent you a confirmation link. Click the link in your email to activate your account.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <p className="text-sm text-zinc-300">
                <strong>Didn't receive the email?</strong>
              </p>
              <ul className="text-xs text-zinc-400 mt-2 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure you entered the correct email</li>
                <li>• Wait a few minutes and try again</li>
              </ul>
            </div>

            <Button
              asChild
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl transition-colors"
            >
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}