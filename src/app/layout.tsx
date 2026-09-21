import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { RegisterSW } from '@/components/pwa/register-sw'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FF5C00',
}

export const metadata: Metadata = {
  title: 'César IA CRM',
  description: 'CRM para gestão de clientes, agendamentos e tarefas',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('crm-tema')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body>
        <RegisterSW />
        {children}
      </body>
    </html>
  )
}
