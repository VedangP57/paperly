'use client'

import { useState, useRef, useCallback } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition?: any
  }
}

export function useVoiceInput(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [supported] = useState(
    () => typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  )
  const recognitionRef = useRef<AnySpeechRecognition>(null)

  const startListening = useCallback(() => {
    if (!supported) return
    const Ctor = window.webkitSpeechRecognition ?? window.SpeechRecognition
    if (!Ctor) return

    const rec = new Ctor()
    rec.lang = 'gu-IN'
    rec.continuous = false
    rec.interimResults = false

    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      const transcript: string = event.results[0]?.[0]?.transcript ?? ''
      if (transcript) onResult(transcript)
    }

    recognitionRef.current = rec
    rec.start()
  }, [supported, onResult])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  return { listening, supported, startListening, stopListening }
}
