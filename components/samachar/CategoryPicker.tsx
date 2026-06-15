'use client'

import { Cloud, MapPin, Landmark, ShieldAlert, CarFront, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils'

export const CATEGORIES = [
  { value: 'હવામાન', icon: Cloud, color: '#0f6cbd', bg: '#eaf2fb' },
  { value: 'સ્થાનિક સમાચાર', icon: MapPin, color: '#5b5fc7', bg: '#ecebfb' },
  { value: 'રાજકારણ', icon: Landmark, color: '#835b00', bg: '#fbf3d6' },
  { value: 'ગુના સમાચાર', icon: ShieldAlert, color: '#bc2f32', bg: '#fbe1e1' },
  { value: 'અકસ્માત', icon: CarFront, color: '#9a5b00', bg: '#fdeacb' },
  { value: 'તહેવાર / સામાજિક', icon: PartyPopper, color: '#0e700e', bg: '#e3f3e4' },
] as const

export type Category = (typeof CATEGORIES)[number]['value']

interface Props {
  selected: Category | null
  onChange: (c: Category) => void
}

export function CategoryPicker({ selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {CATEGORIES.map(({ value, icon: Icon, color, bg }) => {
        const isActive = selected === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className={cn(
              'relative flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition-all cursor-pointer',
              isActive
                ? 'border-2 shadow-md'
                : 'border border-[#e6e6e6] dark:border-white/10 bg-white dark:bg-[#1a1a1a] hover:border-[#c7c7c7] dark:hover:border-white/20 hover:shadow-sm'
            )}
            style={isActive
              ? { borderColor: color, backgroundColor: bg }
              : undefined
            }
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: isActive ? color : '#f5f5f5' }}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: isActive ? '#fff' : '#737373' }}
                strokeWidth={1.75}
              />
            </span>
            <span
              className="text-sm font-semibold leading-tight"
              style={isActive ? { color } : undefined}
            >
              {value}
            </span>
          </button>
        )
      })}
    </div>
  )
}
