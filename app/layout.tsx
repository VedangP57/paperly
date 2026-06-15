import type { Metadata } from 'next'
import { AppThemeProvider } from '@/components/shared/AppThemeProvider'
import { DisableServiceWorkerInDev } from '@/components/shared/DisableServiceWorkerInDev'
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
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <DisableServiceWorkerInDev />
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
