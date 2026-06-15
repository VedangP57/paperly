'use client'

import { useState, useEffect } from 'react'
import { Cloud, MapPin, Landmark, ShieldAlert, CarFront, PartyPopper, Building2, HeartPulse, GraduationCap, ScrollText } from 'lucide-react'
import { NoiseTexture } from '@/components/ui/noise-texture'

export const CATEGORIES = [
  { id: 'weather',   value: 'હવામાન',             icon: Cloud,          hex: '#0f6cbd', bg: '#eaf2fb' },
  { id: 'local',     value: 'સ્થાનિક સમાચાર',     icon: MapPin,         hex: '#5b5fc7', bg: '#ecebfb' },
  { id: 'politics',  value: 'રાજકારણ',             icon: Landmark,       hex: '#835b00', bg: '#fbf3d6' },
  { id: 'crime',     value: 'ગુના સમાચાર',         icon: ShieldAlert,    hex: '#bc2f32', bg: '#fbe1e1' },
  { id: 'accident',  value: 'અકસ્માત',             icon: CarFront,       hex: '#9a5b00', bg: '#fdeacb' },
  { id: 'festival',  value: 'તહેવાર / સામાજિક',   icon: PartyPopper,    hex: '#0e700e', bg: '#e3f3e4' },
  { id: 'civic',     value: 'વહીવટ / સરકારી',     icon: Building2,      hex: '#2d6a9f', bg: '#e5f0fb' },
  { id: 'health',    value: 'આરોગ્ય',              icon: HeartPulse,     hex: '#c4314b', bg: '#fce8ec' },
  { id: 'education', value: 'શિક્ષણ',              icon: GraduationCap,  hex: '#744da9', bg: '#f2eefb' },
  { id: 'other',     value: 'અન્ય',               icon: ScrollText,     hex: '#6b7280', bg: '#f3f4f6' },
] as const

export type Category = (typeof CATEGORIES)[number]['value']

interface Props {
  selected: Category | null
  onChange: (c: Category) => void
}

export function CategoryPicker({ selected, onChange }: Props) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const checkDark = () => setIsDark(root.classList.contains('dark'))
    checkDark()
    const observer = new MutationObserver(checkDark)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {CATEGORIES.map(({ id, value, icon: Icon, hex, bg }) => {
        const isActive = selected === value
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className="relative overflow-hidden flex items-center justify-between gap-2 px-3 py-1.5 rounded-md border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-left transition-all cursor-pointer shadow-sm hover:border-[#c7c7c7] dark:hover:border-white/20"
            style={isActive
              ? {
                  borderColor: hex,
                  borderBottomWidth: '2px',
                  backgroundColor: isDark
                    ? `color-mix(in srgb, ${hex} 18%, #1a1a1a)`
                    : bg,
                }
              : undefined}
          >
            <NoiseTexture id={`samachar-cat-${id}`} className="absolute inset-0 z-0 stat-card-noise" baseFrequency={0.65} />
            <div className="relative z-[1] flex items-center gap-1.5 min-w-0">
              <span className="shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: hex }} />
              <span
                className={`text-xs truncate${isActive ? '' : ' text-muted-foreground'}`}
                style={isActive ? { color: hex, fontWeight: 600 } : undefined}
              >
                {value}
              </span>
            </div>
            <Icon
              className={`relative z-[1] h-3.5 w-3.5 shrink-0${isActive ? '' : ' text-muted-foreground'}`}
              style={isActive ? { color: hex } : undefined}
              strokeWidth={1.75}
            />
          </button>
        )
      })}
    </div>
  )
}
