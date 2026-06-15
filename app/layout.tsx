import type { Metadata } from 'next'
import { AppThemeProvider } from '@/components/shared/AppThemeProvider'
import { DisableServiceWorkerInDev } from '@/components/shared/DisableServiceWorkerInDev'
import { RegisterServiceWorker } from '@/components/shared/RegisterServiceWorker'
import '@/app/globals.css'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { AntdThemeProvider } from '@/components/shared/AntdThemeProvider'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'પેપરલી — સમાચાર સહાયક',
  description: 'ગુજરાતી સમાચાર લખવા માટે AI સહાયક — લખો, સુધારો, કોપી કરો.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Paperly" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <DisableServiceWorkerInDev />
        <RegisterServiceWorker />
        <AppThemeProvider defaultTheme="system">
          <AntdRegistry>
            <AntdThemeProvider>
              {children}
            </AntdThemeProvider>
          </AntdRegistry>
        </AppThemeProvider>
      </body>
    </html>
  )
}
