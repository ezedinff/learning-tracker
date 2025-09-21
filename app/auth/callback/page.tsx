"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      // Wait a moment for the session to be automatically set by Supabase
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          router.push('/app')
        } else {
          router.push('/login?error=auth_callback_error')
        }
      }, 2000)
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-white">Completing sign in...</p>
      </div>
    </div>
  )
}