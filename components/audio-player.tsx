"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, Volume2, Download, Mic } from "lucide-react"
import type { AudioRecording } from "@/hooks/use-audio-recorder"

interface AudioPlayerProps {
  recording: AudioRecording
  className?: string
}

export function AudioPlayer({ recording, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(recording.duration || 0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => {
      // Use stored duration if available, otherwise fallback to audio metadata
      if (recording.duration && recording.duration > 0) {
        setDuration(recording.duration)
      } else if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
      }
    }
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("loadeddata", updateDuration)
    audio.addEventListener("canplay", updateDuration)
    audio.addEventListener("canplaythrough", updateDuration)
    audio.addEventListener("durationchange", updateDuration)
    audio.addEventListener("ended", handleEnded)

    // Set src and load
    audio.src = recording.url
    audio.load()
    
    // Use stored duration immediately if available
    if (recording.duration && recording.duration > 0) {
      setDuration(recording.duration)
    }

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("loadeddata", updateDuration)
      audio.removeEventListener("canplay", updateDuration)
      audio.removeEventListener("canplaythrough", updateDuration)
      audio.removeEventListener("durationchange", updateDuration)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [recording.url, recording.duration])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration || isNaN(duration)) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width
    const newTime = (clickX / width) * duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const downloadRecording = () => {
    const link = document.createElement("a")
    link.href = recording.url
    link.download = `recording-${new Date().toISOString().slice(0, 19)}.webm`
    link.click()
  }

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds === Number.POSITIVE_INFINITY) {
      return "00:00"
    }
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={`bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-4 shadow-lg border border-zinc-700/50 ${className}`}>
      <audio ref={audioRef} preload="metadata" />
      
      {/* Track Info */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-white">Audio Note</span>
        </div>
        <p className="text-xs text-zinc-400">Recording • {formatTime(duration)}</p>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="cursor-pointer group" onClick={handleProgressClick}>
          <div className="relative h-1 bg-zinc-600 rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-150"
              style={{ width: `${duration && duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 w-3 h-3 bg-white rounded-full transform -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={downloadRecording} 
          className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-full transition-all"
        >
          <Download className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={togglePlayPause} 
          className="h-12 w-12 p-0 bg-primary hover:bg-orange-300 text-black rounded-full transition-all hover:scale-105 shadow-lg"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            const audio = audioRef.current
            if (!audio) return
            audio.muted = !audio.muted
          }}
          className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-full transition-all"
        >
          {audioRef.current?.muted ? <Volume2 className="h-4 w-4 text-zinc-600 relative after:content-[''] after:absolute after:w-[140%] after:h-[2px] after:bg-zinc-600 after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:-rotate-45" /> : <Volume2 className="h-4 w-4" />}        </Button>      </div>
    </div>
  )
}
