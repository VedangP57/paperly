export interface WeatherData {
  maxTemp: string
  minTemp: string
  humidity: string
  pressure: string
  windDir: string
  windSpeed: string
}

const WIND_DIR_GUJARATI: Record<string, string> = {
  N: 'ઉત્તર',
  S: 'દક્ષિણ',
  E: 'પૂર્વ',
  W: 'પશ્ચિમ',
  NE: 'ઉત્તર-પૂર્વ',
  NW: 'ઉત્તર-પશ્ચિમ',
  SE: 'દક્ષિણ-પૂર્વ',
  SW: 'દક્ષિણ-પશ્ચિમ',
}

export function parseWeatherData(raw: string): Partial<WeatherData> {
  if (!raw.trim()) return {}

  const maxTemp = raw.match(/maxi\s*:?-?\s*([\d.]+)/i)?.[1] ?? ''
  const minTemp = raw.match(/mini\s*:?-?\s*([\d.]+)/i)?.[1] ?? ''
  const humidity = raw.match(/RH\s*:?-?\s*(\d+)/i)?.[1] ?? ''
  const pressure = raw.match(/PP\s*:?-?\s*([\d.]+)/i)?.[1] ?? ''
  const windDirRaw = raw.match(/Wind\s*:?-?\s*([A-Z]+)\s*\(/i)?.[1] ?? ''
  const windSpeed = raw.match(/\((\d+)\s*kmph\)/i)?.[1] ?? ''

  return {
    maxTemp,
    minTemp,
    humidity,
    pressure,
    windDir: WIND_DIR_GUJARATI[windDirRaw.toUpperCase()] ?? windDirRaw,
    windSpeed,
  }
}
