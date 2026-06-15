import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { PAPERLY_LOGO_SRC } from '@/lib/constants/brand'
import { Button } from '@/components/ui/button'
import { TrackedCtaLink } from '@/components/shared/TrackedCtaLink'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Newspaper,
  CloudSun,
  Mic,
  Camera,
  MessageSquare,
  PenLine,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Smartphone,
  Copy,
  History,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'પેપરલી — સમાચાર સહાયક',
  description:
    'છપાઈ માટે તૈયાર ગુજરાતી લેખ લખવા માટેનો સહાયક. શ્રેણી પસંદ કરો, ફોર્મ ભરો, અને તમારો લેખ તૈયાર.',
  openGraph: {
    title: 'પેપરલી — સમાચાર સહાયક',
    description:
      'છપાઈ માટે તૈયાર ગુજરાતી લેખ — ઝડપથી, સરળતાથી.',
    images: ['/og-image.png'],
  },
}

const features = [
  {
    icon: Newspaper,
    title: '૧૦ શ્રેણીના સ્માર્ટ ફોર્મ',
    description:
      'હવામાન, સ્થાનિક, રાજકારણ, ગુના, અકસ્માત, તહેવાર, વહીવટ, આરોગ્ય, શિક્ષણ અને અન્ય — દરેક શ્રેણી માટે અલગ ફીલ્ડ અને અલગ લેખન શૈલી.',
  },
  {
    icon: CloudSun,
    title: 'હવામાન ડેટા પાર્સર',
    description:
      'Maxi, Mini, RH, PP, Wind જેવો કાચો ડેટા પેસ્ટ કરો — ફીલ્ડ આપમેળે ભરાઈ જાય છે.',
  },
  {
    icon: Mic,
    title: 'ગુજરાતી વૉઇસ ઇનપુટ',
    description:
      'ટાઇપ કરવાને બદલે બોલો. તમારી ભાષામાં, તમારી ગતિએ લખો.',
  },
  {
    icon: Camera,
    title: 'ફોટો અપલોડ',
    description:
      'કેમેરાથી અથવા ફાઇલથી ફોટો મોકલો — લેખમાં જરૂરી વિગતો આપમેળે ઉમેરાય છે.',
  },
  {
    icon: PenLine,
    title: 'પત્રકારિત શૈલી',
    description:
      'વરિષ્ઠ સંપાદકની દૃષ્ટિ — ૧૦૦% ગુજરાતી, છપાઈ માટે તૈયાર લેખ.',
  },
  {
    icon: MessageSquare,
    title: 'લેખ સુધારણા ચેટ',
    description:
      '"ટૂંકું કરો", "નવું શીર્ષક આપો" — સંપૂર્ણ લેખની સમજ સાથે, ન્યૂઝરૂમ સહાયક જેવી વાતચીત.',
  },
]

const steps = [
  {
    number: '01',
    title: 'શ્રેણી પસંદ કરો',
    description:
      'નવો લેખ શરૂ કરો અને શ્રેણી પસંદ કરો — હવામાનથી લઈને સ્થાનિક સમાચાર સુધી.',
  },
  {
    number: '02',
    title: 'ફોર્મ ભરો',
    description:
      'ટાઇપ કરો, બોલો, અથવા ફોટો મોકલો. હવામાન ડેટા પેસ્ટ કરો અથવા શબ્દ મર્યાદા પસંદ કરો — ૧૦૦, ૧૫૦, ૨૦૦ અથવા ૩૦૦.',
  },
  {
    number: '03',
    title: 'લેખ તૈયાર કરો અને સુધારો',
    description:
      'ફોર્મ સંકોચાય છે, તૈયાર લેખ દેખાય છે. નીચે ચેટથી શીર્ષક, લંબાઈ અથવા શૈલી સુધારો — એક ટેપમાં કોપી કરો.',
  },
]

const categories = [
  'હવામાન',
  'સ્થાનિક',
  'રાજકારણ',
  'ગુના',
  'અકસ્માત',
  'તહેવાર',
  'વહીવટ',
  'આરોગ્ય',
  'શિક્ષણ',
  'અન્ય',
]

const highlights = [
  {
    icon: Copy,
    title: 'એક ટેપમાં કોપી',
    description: 'શીર્ષક, ઉપશીર્ષક અને મુખ્ય લેખ — સ્વચ્છ ફોર્મેટમાં તૈયાર.',
  },
  {
    icon: History,
    title: 'લેખનો ઇતિહાસ',
    description: 'દરેક લેખ સાચવાય છે. દરેક ચેટ એક લેખ અને તેની સુધારણાઓ છે.',
  },
  {
    icon: Smartphone,
    title: 'મોબાઇલ પ્રથમ',
    description: 'ફોન પરથી સીધું લખો. ગુજરાતી ઇન્ટરફેસ, ડાર્ક અને લાઇટ મોડ.',
  },
]

const testimonials = [
  {
    name: 'સુરત, સ્થાનિક વિભાગ',
    role: 'સ્થાનિક સમાચાર રિપોર્ટર',
    content:
      'પહેલાં બાહ્ય લેખન સાધન માટે લાંબા સૂચનો લખતો. હવે શ્રેણી પસંદ કરું, ફોર્મ ભરું, અને અખબાર જેવો લેખ મળે. ફોન પરથી જ કામ થઈ જાય છે.',
    rating: 5,
  },
  {
    name: 'હવામાન વિભાગ',
    role: 'હવામાન વિભાગ',
    content:
      'કાચો હવામાન ડેટા પેસ્ટ કરું તો ફીલ્ડ આપમેળે ભરાય. લેખન શૈલી એકદમ અખબાર જેવી — સંપાદકને ઓછું સુધારવું પડે છે.',
    rating: 5,
  },
  {
    name: 'મેદાનમાંથી',
    role: 'ઘટનાસ્થળ રિપોર્ટિંગ',
    content:
      'ફોનથી ફોટો મોકલું, બોલીને વિગત આપું — લેખ તૈયાર. "ટૂંકું કરો" કહું તો ચેટમાં સુધારાય. ન્યૂઝરૂમ સહાયક જેવું લાગે છે.',
    rating: 5,
  },
]

const faqs = [
  {
    question: 'આ શું છે?',
    answer:
      'સમાચાર સહાયક એ રિપોર્ટર માટે બનાવેલ લેખન સહાયક છે. તમે શ્રેણી પસંદ કરો, ઝડપી ફોર્મ ભરો, અને છપાઈ માટે તૈયાર ગુજરાતી લેખ મેળવો — પછી ચેટથી સુધારો.',
  },
  {
    question: 'કઈ શ્રેણીઓ ઉપલબ્ધ છે?',
    answer:
      'હવામાન, સ્થાનિક, રાજકારણ, ગુના, અકસ્માત, તહેવાર, વહીવટ, આરોગ્ય, શિક્ષણ અને અન્ય — દરેક માટે અલગ ફોર્મ અને લેખન શૈલી.',
  },
  {
    question: 'શું મારા જૂના લેખ સાચવાય છે?',
    answer:
      'હા. દરેક લેખ ઇતિહાસમાં સાચવાય છે — શીર્ષક દ્વારા શોધી શકાય. દરેક ચેટ એક લેખ અને તેની સુધારણાઓ છે.',
  },
  {
    question: 'ફોન પર ચાલે છે?',
    answer:
      'હા. આ સાધન મોબાઇલ રિપોર્ટર માટે બનાવવામાં આવ્યું છે — ફોન પરથી લખો, બોલો, ફોટો મોકલો, અને લેખ કોપી કરો.',
  },
  {
    question: 'લેખની લંબાઈ કેવી રીતે નક્કી કરું?',
    answer:
      'ફોર્મમાં ૧૦૦, ૧૫૦, ૨૦૦ અથવા ૩૦૦ શબ્દની મર્યાદા પસંદ કરી શકો. પછી ચેટમાં "ટૂંકું કરો" કહીને સુધારી શકો.',
  },
  {
    question: 'શૈલી કેવી છે?',
    answer:
      'લેખ અખબારની શૈલીમાં લખાય — વરિષ્ઠ સંપાદકની દૃષ્ટિ, શ્રેણી મુજબની શૈલી, અને ૧૦૦% ગુજરાતી. મૂલ્ય એ છે કે સાધન તમારા વિષય અને લેખનની ભાષા જાણે છે.',
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="container flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium mb-6">
            <Zap className="h-3.5 w-3.5 text-primary" />
            રિપોર્ટર માટે લેખન સહાયક
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            સમાચાર લખો{' '}
            <span className="text-primary">ઝડપથી, સરળતાથી</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            શ્રેણી પસંદ કરો, ઝડપી ફોર્મ ભરો — ટાઇપ કરો, બોલો, અથવા ફોટો મોકલો —
            અને છપાઈ માટે તૈયાર ગુજરાતી લેખ મેળવો.
            પછી ચેટથી સુધારો, જાણે ન્યૂઝરૂમ સહાયક સાથે વાત કરો છો.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <TrackedCtaLink href="/signup">
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-11 px-8 min-w-[180px] transition-colors"
                style={{ backgroundColor: '#5e5cc5', color: '#ffffff' }}
              >
                શરૂ કરો
                <ArrowRight className="h-4 w-4" />
              </button>
            </TrackedCtaLink>
            <Button size="lg" variant="outline" asChild className="min-w-[180px]">
              <Link href="#features">વિશેષતાઓ જુઓ</Link>
            </Button>
          </div>
          <div className="mt-12 w-full max-w-5xl">
            <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 border-b px-4 py-3 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center text-xs text-muted-foreground">
                  પેપરલી — સમાચાર સહાયક
                </div>
              </div>
              <div className="aspect-[16/9] bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                <div className="text-center space-y-3 px-6">
                  <Image
                    src={PAPERLY_LOGO_SRC}
                    alt="પેપરલી"
                    width={64}
                    height={64}
                    className="mx-auto rounded-2xl object-cover shadow-md"
                  />
                  <p className="text-sm text-muted-foreground">
                    શ્રેણી પસંદ કરો → ફોર્મ ભરો → લેખ તૈયાર
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 scroll-mt-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              રિપોર્ટર માટે બનાવેલું
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              ટેક સાધન નહીં — ન્યૂઝરૂમ સાધન. તમારી ભાષા, તમારી શૈલી, તમારો અવાજ.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border bg-card transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              કેવી રીતે કામ કરે છે
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              ત્રણ સરળ પગલાં — લેખ તમારા હાથમાં.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-20 sm:py-24 scroll-mt-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              ૧૦ સમાચાર શ્રેણીઓ
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              દરેક શ્રેણી માટે અલગ ફોર્મ અને અલગ લેખન શૈલી.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
            {categories.map((category) => (
              <div
                key={category}
                className="flex items-center justify-center rounded-lg border bg-card px-4 py-3 text-sm font-medium text-center"
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              વધુ સુવિધાઓ
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              લખવાથી લઈને કોપી કરવા સુધી — બધું એક જગ્યાએ.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            {highlights.map((item) => (
              <Card key={item.title} className="border bg-card">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Insight */}
      <section className="py-20 sm:py-24">
        <div className="container max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            મૂલ્ય શું છે?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            મૂલ્ય એ નથી કે &ldquo;મશીન એ લખ્યું&rdquo; — મૂલ્ય એ છે કે આ સાધન તમારા
            વિષય, તમારી શૈલી અને તમારા અખબારના અવાજને જાણે છે.
            તે તમારા અવ્યવસ્થિત સૂચનોને બદલે એક સાધન આપે છે જે પહેલેથી
            જ જાણે છે કે સમાચાર કેવી રીતે લખાય છે.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              રિપોર્ટરો કહે છે
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              મેદાનમાંથી લખવાનો અનુભવ.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border bg-card">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-24 scroll-mt-16">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              વારંવાર પૂછાતા પ્રશ્નો
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              પ્રશ્નો છે? જવાબ અહીં છે.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 sm:py-24 bg-primary text-primary-foreground">
        <div className="container text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/10 mb-6">
            <Newspaper className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            તમારો પહેલો લેખ લખવા તૈયાર છો?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-xl mx-auto">
            શ્રેણી પસંદ કરો, ફોર્મ ભરો, અને છપાઈ માટે તૈયાર લેખ મેળવો.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <TrackedCtaLink href="/signup">
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-11 px-8 min-w-[180px] transition-colors"
                style={{ backgroundColor: '#ffffff', color: '#18181b' }}
              >
                શરૂ કરો
                <ArrowRight className="h-4 w-4" />
              </button>
            </TrackedCtaLink>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="min-w-[180px] border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/login">લૉગ ઇન</Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              મોબાઇલ પર ચાલે છે
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              તમારા લેખ સુરક્ષિત
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              ૧૦૦% ગુજરાતી
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
