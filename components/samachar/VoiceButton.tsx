'use client'

import { Mic, MicOff } from 'lucide-react'
import { Button, Tooltip } from 'antd'
import { useVoiceInput } from './useVoiceInput'

interface Props {
  onResult: (text: string) => void
}

export function VoiceButton({ onResult }: Props) {
  const { listening, supported, startListening, stopListening } = useVoiceInput(onResult)

  if (!supported) return null

  return (
    <Tooltip title={listening ? 'રોકો' : 'ગુજરાતીમાં બોલો'}>
      <Button
        type="text"
        size="small"
        onClick={listening ? stopListening : startListening}
        className={listening
          ? '!text-red-500 !border-red-200 !bg-red-50 dark:!bg-red-500/10 animate-pulse'
          : '!text-[#5b5fc7] hover:!bg-[#5b5fc7]/10'
        }
        icon={listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
      >
        {listening ? 'સાંભળી રહ્યા છે...' : 'માઈક'}
      </Button>
    </Tooltip>
  )
}
