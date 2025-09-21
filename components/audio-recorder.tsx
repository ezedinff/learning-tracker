"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAudioRecorder, type AudioRecording } from "@/hooks/use-audio-recorder"
import { Mic, Square, Play, Pause, Trash2, Save, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AudioRecorderProps {
  taskId: string
  onSave: (taskId: string, recording: AudioRecording) => Promise<void>
  onCancel: () => void
  existingRecording?: AudioRecording
}

export function AudioRecorder({ taskId, onSave, onCancel, existingRecording }: AudioRecorderProps) {
  const [savedRecording, setSavedRecording] = useState<AudioRecording | null>(existingRecording || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const {
    isRecording,
    isPaused,
    recordingTime,
    audioLevel,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    formatTime,
  } = useAudioRecorder()

  const handleStartRecording = async () => {
    try {
      await startRecording()
    } catch (error) {
      console.error("Recording failed:", error)
      alert("Failed to start recording. Please check your microphone permissions.")
    }
  }

  const handleStopRecording = async () => {
    try {
      const recording = await stopRecording()
      setSavedRecording(recording)
    } catch (error) {
      console.error("Failed to stop recording:", error)
    }
  }

  const handleSaveRecording = async () => {
    if (savedRecording) {
      await onSave(taskId, savedRecording)
      onCancel()
    }
  }

  const handlePlayPause = () => {
    if (!savedRecording) return

    if (!audioElement) {
      const audio = new Audio(savedRecording.url)
      audio.addEventListener("timeupdate", () => {
        setPlaybackTime(audio.currentTime)
      })
      audio.addEventListener("ended", () => {
        setIsPlaying(false)
        setPlaybackTime(0)
      })
      audio.addEventListener("loadedmetadata", () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setSavedRecording((prev) => (prev ? { ...prev, duration: audio.duration } : null))
        }
      })
      setAudioElement(audio)
      audio.play()
      setIsPlaying(true)
    } else {
      if (isPlaying) {
        audioElement.pause()
        setIsPlaying(false)
      } else {
        audioElement.play()
        setIsPlaying(true)
      }
    }
  }

  const handleDeleteRecording = () => {
    if (audioElement) {
      audioElement.pause()
      setAudioElement(null)
    }
    setSavedRecording(null)
    setIsPlaying(false)
    setPlaybackTime(0)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Audio Recording
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recording Controls */}
        {!savedRecording && (
          <div className="space-y-4">
            {/* Audio Level Visualization */}
            {isRecording && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Recording...</span>
                  <span className="font-mono">{formatTime(recordingTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Progress value={audioLevel * 100} className="flex-1 h-2" />
                </div>
                <div className="flex justify-center">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full transition-all duration-150",
                      audioLevel > 0.1 ? "bg-red-500 animate-pulse" : "bg-red-500/30",
                    )}
                    style={{
                      transform: `scale(${1 + audioLevel * 0.5})`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Recording Buttons */}
            <div className="flex justify-center gap-2">
              {!isRecording ? (
                <Button onClick={handleStartRecording} className="flex-1">
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <>
                  {isPaused ? (
                    <Button onClick={resumeRecording} variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Resume
                    </Button>
                  ) : (
                    <Button onClick={pauseRecording} variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={handleStopRecording} variant="default">
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                  <Button onClick={cancelRecording} variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Playback Controls */}
        {savedRecording && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Recording ready • {formatTime(savedRecording.duration)}</p>
            </div>

            {/* Playback Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{formatTime(Math.floor(playbackTime))}</span>
                <span>{formatTime(savedRecording.duration)}</span>
              </div>
              <Progress
                value={savedRecording.duration > 0 ? (playbackTime / savedRecording.duration) * 100 : 0}
                className="h-2"
              />
            </div>

            {/* Playback Buttons */}
            <div className="flex justify-center gap-2">
              <Button onClick={handlePlayPause} variant="outline">
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              <Button onClick={handleDeleteRecording} variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>

            {/* Save/Cancel */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveRecording} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Recording
              </Button>
              <Button onClick={onCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
