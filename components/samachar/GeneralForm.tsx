'use client'

import { Input } from 'antd'
import type { Category } from './CategoryPicker'
import { VoiceButton } from './VoiceButton'

type FieldDef = { key: string; label: string; placeholder: string; multiline?: boolean }

const CATEGORY_FIELDS: Record<string, FieldDef[]> = {
  'સ્થાનિક સમાચાર': [
    { key: 'location', label: 'સ્થળ / વિસ્તાર', placeholder: 'દા.ત. રાંદેર, સુરત' },
    { key: 'event', label: 'ઘટના / મુખ્ય વિષય', placeholder: 'શું બન્યું?' },
    { key: 'when', label: 'ક્યારે', placeholder: 'દા.ત. ગઈ કાલ સાંજે, ૧૫ જૂને' },
    { key: 'involved', label: 'કોણ સામેલ', placeholder: 'વ્યક્તિ, સંસ્થા, સરકાર...' },
    { key: 'impact', label: 'અસર / Impact', placeholder: 'લોકો, ટ્રાફિક, આરોગ્ય...' },
    { key: 'quote', label: 'Source Quote (optional)', placeholder: '"..." — XXX, પ્રમુખ, ...', multiline: true },
    { key: 'extra', label: 'વધારાની વિગત', placeholder: 'background, numbers, context...', multiline: true },
  ],
  'રાજકારણ': [
    { key: 'person', label: 'નેતા / પક્ષ', placeholder: 'દા.ત. ભારતીય જનતા પક્ષ / X ધારાસભ્ય' },
    { key: 'event', label: 'ઘટના / બેઠક / નિવેદન', placeholder: 'શું બન્યું?' },
    { key: 'location', label: 'સ્થળ', placeholder: 'દા.ત. સુરત, ગાંધીનગર' },
    { key: 'when', label: 'ક્યારે', placeholder: 'તારીખ / સમય' },
    { key: 'impact', label: 'રાજકીય અસર', placeholder: 'Election, policy, public reaction...' },
    { key: 'quote', label: 'Quote / નિવેદન', placeholder: '"..." — XXX', multiline: true },
    { key: 'extra', label: 'Background', placeholder: 'Past context, numbers...', multiline: true },
  ],
  'ગુના સમાચાર': [
    { key: 'crimeType', label: 'ગુનાનો પ્રકાર', placeholder: 'દા.ત. ચોરી, છેતરપિંડી, હત્યા...' },
    { key: 'location', label: 'ઘટનાસ્થળ', placeholder: 'દા.ત. ઉધના, સુરત' },
    { key: 'when', label: 'ઘટનાનો સમય', placeholder: 'દા.ત. ગઈ રાત ૧૧ વાગ્યે' },
    { key: 'victim', label: 'પીડિત (partial name / age)', placeholder: 'દા.ત. ૪૫ વર્ષીય વ્યક્તિ' },
    { key: 'accused', label: 'આરોપી (if known)', placeholder: 'નામ / description' },
    { key: 'policeStation', label: 'પોલીસ સ્ટેશન', placeholder: 'દા.ત. ઉધના પોલીસ સ્ટેશન' },
    { key: 'caseInfo', label: 'FIR / Case number (optional)', placeholder: 'Section, case number' },
    { key: 'extra', label: 'વધારાની વિગત', placeholder: 'Modus operandi, amount, context...', multiline: true },
  ],
  'અકસ્માત': [
    { key: 'accidentType', label: 'અકસ્માતનો પ્રકાર', placeholder: 'દા.ત. ટ્રક-બાઈક અથડામણ' },
    { key: 'location', label: 'સ્થળ / રસ્તો', placeholder: 'દા.ત. NH-48, ઉધના ઓવરબ્રિજ પાસે' },
    { key: 'when', label: 'સમય', placeholder: 'દા.ત. આજ સવારે ૭ વાગ્યે' },
    { key: 'vehicles', label: 'વાહન(ો)', placeholder: 'Type, number plate if known' },
    { key: 'casualties', label: 'જાનહાનિ / ઈજાગ્રસ્ત', placeholder: 'X ઈજાગ્રસ્ત, X ઘટનાસ્થળ...' },
    { key: 'hospital', label: 'હોસ્પિટલ', placeholder: 'નૂતન રક્ત, SMIMER...' },
    { key: 'policeStation', label: 'પોલીસ સ્ટેશન', placeholder: 'કઈ પોલીસ ઘટના handle કરી' },
    { key: 'cause', label: 'કારણ (if known)', placeholder: 'ઝડપ, ફોન, ઊંઘ...' },
  ],
  'તહેવાર / સામાજિક': [
    { key: 'festivalName', label: 'તહેવાર / કાર્યક્રમ', placeholder: 'દા.ત. ગણેશ ઉત્સવ, ૨૬ ઓગસ્ટ' },
    { key: 'location', label: 'સ્થળ / venue', placeholder: 'દા.ત. ગ્રીન ચોક, ઉધના' },
    { key: 'organizer', label: 'આયોજક / સંસ્થા', placeholder: 'સ્થાનિક સ્વ-સહાય જૂથ...' },
    { key: 'attendance', label: 'ભાગ લેનારા / ભીડ', placeholder: 'દા.ત. ૫૦૦+ નગરજનો' },
    { key: 'highlight', label: 'ખાસ ક્ષણ / Highlight', placeholder: 'શું special હતું?' },
    { key: 'guest', label: 'મુખ્ય મહેમાન (optional)', placeholder: 'ધારાસભ્ય, કોર્પોરેટર...' },
    { key: 'sentiment', label: 'ભાવના / Atmosphere', placeholder: 'ઉત્સાહ, ભક્તિ, આનંદ...' },
    { key: 'extra', label: 'વધારાની વિગત', placeholder: 'Food stalls, competitions...', multiline: true },
  ],
  'વહીવટ / સરકારી': [
    { key: 'location', label: 'સ્થળ / જિલ્લો', placeholder: 'દા.ત. સુરત, દક્ષિણ ગુજરાત' },
    { key: 'department', label: 'વિભાગ / કચેરી', placeholder: 'દા.ત. મ્યુ. કોર્પો., જિ.પં., PWD...' },
    { key: 'decision', label: 'નિર્ણય / યોજના / કાર્ય', placeholder: 'શું નક્કી થયું / થઈ રહ્યું છે?' },
    { key: 'impact', label: 'જન-અસર / Impact', placeholder: 'કેટલા લોકોને ફાયદો / અસર?' },
    { key: 'effectiveDate', label: 'અમલ / તારીખ', placeholder: 'દા.ત. ૧ જુલાઈ ૨૦૨૬ થી' },
    { key: 'officialStatement', label: 'અધિકારીનું નિવેદન (optional)', placeholder: '"..." — અધિકારીનું નામ, હોદ્દો', multiline: true },
  ],
  'આરોગ્ય': [
    { key: 'location', label: 'સ્થળ / હોસ્પિટલ', placeholder: 'દા.ત. SMIMER, સ્મીમેર, સુરત' },
    { key: 'topic', label: 'વિષય / રોગ / ઘટના', placeholder: 'દા.ત. ડેન્ગ્યૂ, ઓપરેશન, રક્તદાન...' },
    { key: 'details', label: 'વિગત', placeholder: 'શું બન્યું? ક્યારે? ક્યાં?' },
    { key: 'affectedCount', label: 'અસરગ્રસ્ત / Cases', placeholder: 'દા.ત. ૩૫ દર્દી, ૨ ગ્રામ...' },
    { key: 'authorityResponse', label: 'તંત્રની પ્રતિક્રિયા', placeholder: 'ડૉક્ટર, AMC, આરોગ્ય વિભાગ...' },
    { key: 'publicAdvisory', label: 'જાહેર સૂચના (optional)', placeholder: 'સ્વ-બચાવ ટિપ્સ, ક્યાં જવું...', multiline: true },
  ],
  'શિક્ષણ': [
    { key: 'location', label: 'સ્થળ / શહેર', placeholder: 'દા.ત. સુરત, ગ્રાન્ટ રોડ' },
    { key: 'institution', label: 'શૈક્ષણિક સંસ્થા', placeholder: 'દા.ત. સ.વ. NIT, SMS School...' },
    { key: 'topic', label: 'વિષય / ઘટના', placeholder: 'દા.ત. પ્રવેશ, પરિણામ, ધોરણ...' },
    { key: 'details', label: 'વિગત', placeholder: 'શું ઘોષણા / ઘટના / ફેરફાર?' },
    { key: 'studentImpact', label: 'વિદ્યાર્થીઓ પર અસર', placeholder: 'દા.ત. ૧૨,૦૦૦ વિદ્યાર્થીઓ, ધો. ૧૦-૧૨' },
    { key: 'statement', label: 'નિવેદન / Quote (optional)', placeholder: '"..." — આચાર્ય / અધિકારી', multiline: true },
  ],
  'અન્ય': [
    { key: 'topic', label: 'વિષય / ઘટના', placeholder: 'આ સમાચાર શેના વિષે છે?' },
    { key: 'location', label: 'સ્થળ (optional)', placeholder: 'દા.ત. સુરત, ગ્રામ, જિ...' },
    { key: 'when', label: 'ક્યારે (optional)', placeholder: 'તારીખ / સમય' },
    { key: 'details', label: 'સંપૂર્ણ વિગત', placeholder: 'જે જાણ્યું — facts, numbers, names — બધું અહીં લખો', multiline: true },
    { key: 'quote', label: 'Quote / નિવેદન (optional)', placeholder: '"..." — નામ, હોદ્દો', multiline: true },
  ],
}

interface Props {
  category: Category
  data: Record<string, string>
  onChange: (d: Record<string, string>) => void
}

export function GeneralForm({ category, data, onChange }: Props) {
  const fieldDefs = CATEGORY_FIELDS[category] ?? []

  function handleVoice(key: string, text: string) {
    onChange({ ...data, [key]: (data[key] ?? '') + text + ' ' })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fieldDefs.map(({ key, label, placeholder, multiline }) => (
        <div key={key} className={multiline ? 'sm:col-span-2 space-y-1' : 'space-y-1'}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <VoiceButton onResult={(t) => handleVoice(key, t)} />
          </div>
          {multiline ? (
            <Input.TextArea
              rows={2}
              value={data[key] ?? ''}
              onChange={(e) => onChange({ ...data, [key]: e.target.value })}
              placeholder={placeholder}
            />
          ) : (
            <Input
              value={data[key] ?? ''}
              onChange={(e) => onChange({ ...data, [key]: e.target.value })}
              placeholder={placeholder}
            />
          )}
        </div>
      ))}
    </div>
  )
}
