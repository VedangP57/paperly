'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { App } from 'antd'

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

function getMicErrorArgs(errorCode: string): { title: string; description: string } {
  switch (errorCode) {
    case 'service-not-allowed':
      return {
        title: 'Voice input not supported',
        description: 'Voice input only works in Safari on iPhone. Please open Paperly in Safari.',
      }
    case 'not-allowed':
      return {
        title: 'Microphone access denied',
        description: 'Go to Settings → Chrome → Microphone and allow access.',
      }
    case 'network':
      return {
        title: 'Network error',
        description: 'Network error during voice input. Please check your connection and try again.',
      }
    default:
      return {
        title: 'Voice input error',
        description: 'Please try again.',
      }
  }
}

export function useVoiceInput(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<AnySpeechRecognition>(null)
  const { notification } = App.useApp()
  const notificationRef = useRef(notification)
  useEffect(() => { notificationRef.current = notification }, [notification])

  useEffect(() => {
    setSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  }, [])

  const startListening = useCallback(async () => {
    if (!supported) return
    const Ctor = window.webkitSpeechRecognition ?? window.SpeechRecognition
    if (!Ctor) return

    // Guard: some old Android WebViews expose no mediaDevices API at all
    if (!navigator.mediaDevices?.getUserMedia) {
      notificationRef.current.warning(getMicErrorArgs('service-not-allowed'))
      return
    }

    // getUserMedia triggers the native mic permission dialog on mobile browsers
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
    } catch (err: unknown) {
      const code =
        (err as { name?: string })?.name === 'NotAllowedError'
          ? 'not-allowed'
          : 'service-not-allowed'
      notificationRef.current.warning(getMicErrorArgs(code))
      return
    }

    const rec = new Ctor()
    rec.lang = 'gu-IN'
    rec.continuous = false
    rec.interimResults = false

    rec.onstart = () => setListening(true)
    rec.onend = () => setListening(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (event: any) => {
      setListening(false)
      notificationRef.current.warning(getMicErrorArgs(event.error ?? ''))
    }
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
