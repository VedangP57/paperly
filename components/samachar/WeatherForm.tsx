'use client'

import { useState } from 'react'
import { Input, Button } from 'antd'
import { Zap } from 'lucide-react'
import { parseWeatherData } from './weatherParser'
import { VoiceButton } from './VoiceButton'

interface WeatherFields {
  rawPaste: string
  date: string
  maxTemp: string
  minTemp: string
  humidity: string
  pressure: string
  windDir: string
  windSpeed: string
  additionalInfo: string
}

interface Props {
  data: Partial<WeatherFields>
  onChange: (d: Partial<WeatherFields>) => void
}

const fields: { key: keyof WeatherFields; label: string; placeholder: string }[] = [
  { key: 'date',       label: 'તારીખ',                  placeholder: 'દા.ત. ૧૫ જૂન ૨૦૨૬' },
  { key: 'maxTemp',    label: 'મહત્તમ તાપમાન (°C)',      placeholder: 'દા.ત. 35.2' },
  { key: 'minTemp',    label: 'ન્યૂનતમ તાપમાન (°C)',     placeholder: 'દા.ત. 28.8' },
  { key: 'humidity',   label: 'ભેજ (RH %)',              placeholder: 'દા.ત. 66' },
  { key: 'pressure',   label: 'હવાનું દબાણ (hPa)',       placeholder: 'દા.ત. 1005.2' },
  { key: 'windDir',    label: 'પવનની દિશા',              placeholder: 'દા.ત. દક્ષિણ-પશ્ચિમ' },
  { key: 'windSpeed',  label: 'પવનની ઝડપ (km/h)',        placeholder: 'દા.ત. 12' },
]

export function WeatherForm({ data, onChange }: Props) {
  const [parsing, setParsing] = useState(false)

  function handleParse() {
    if (!data.rawPaste) return
    setParsing(true)
    const parsed = parseWeatherData(data.rawPaste)
    onChange({ ...data, ...parsed })
    setParsing(false)
  }

  function handleVoice(key: keyof WeatherFields, text: string) {
    onChange({ ...data, [key]: ((data as Record<string, string>)[key] ?? '') + text + ' ' })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-[#5b5fc7]/40 bg-[#5b5fc7]/5 p-4 space-y-3">
        <p className="text-sm font-semibold text-[#5b5fc7]">ડેટા paste કરો (auto-parse)</p>
        <Input.TextArea
          rows={3}
          value={data.rawPaste ?? ''}
          onChange={(e) => onChange({ ...data, rawPaste: e.target.value })}
          placeholder="Maxi :- 35.2  Mini :- 28.8  RH :- 066%  PP :- 1005.2 hpa  Wind :- SW (12 kmph)"
          className="font-mono text-sm"
        />
        <Button
          icon={<Zap className="h-3.5 w-3.5" />}
          loading={parsing}
          onClick={handleParse}
          className="!rounded-lg !text-[#5b5fc7] !border-[#5b5fc7]/40 hover:!bg-[#5b5fc7]/10"
        >
          Auto Parse
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">{label}</label>
              <VoiceButton onResult={(t) => handleVoice(key, t)} />
            </div>
            <Input
              value={(data as Record<string, string>)[key] ?? ''}
              onChange={(e) => onChange({ ...data, [key]: e.target.value })}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">વધારાની માહિતી (optional)</label>
          <VoiceButton onResult={(t) => onChange({ ...data, additionalInfo: (data.additionalInfo ?? '') + t + ' ' })} />
        </div>
        <Input.TextArea
          rows={2}
          value={data.additionalInfo ?? ''}
          onChange={(e) => onChange({ ...data, additionalInfo: e.target.value })}
          placeholder="જો કોઈ વિશેષ ઘટના, ચેતવણી, અથવા impact..."
        />
      </div>
    </div>
  )
}
