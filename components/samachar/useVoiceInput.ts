'use client'

import { useState, useRef, useCallback } from 'react'

export function useVoiceInput(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [supported] = useState(() => typeof window !== 'undefined' && 'webkitSpeechRecognition' in window)
  const recognitionRef = useRef<InstanceType<typeof window.webkitSpeechRecognition> | null>(null)

  const startListening = useCallback(() => {
    if (!supported) return

    const SpeechRecognition = window.webkitSpeechRecognition
    const rec = new SpeechRecognition()
    rec.lang = 'gu-IN'
    rec.continuous = false
    rec.interimResults = false

    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    rec.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
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
