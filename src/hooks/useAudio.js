import { useState, useRef } from 'react'
import { generateAudio } from '../utils/api'

export function useAudio() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateAndPlay = async (text, language) => {
    setLoading(true)
    setError(null)

    try {
      const audioUrl = await generateAudio(text, language)
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (err) {
      setError(err.message || 'Audio generation failed')
    } finally {
      setLoading(false)
    }
  }

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const downloadAudio = () => {
    if (audioRef.current?.src) {
      const a = document.createElement('a')
      a.href = audioRef.current.src
      a.download = 'prescription-audio.mp3'
      a.click()
    }
  }

  return {
    audioRef,
    isPlaying,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
    loading,
    error,
    generateAndPlay,
    play,
    pause,
    togglePlay,
    downloadAudio,
  }
}
