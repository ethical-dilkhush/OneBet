import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { WalletContextProvider } from "@/components/wallet-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteSidebar } from "@/components/site-sidebar"
import { BottomNavigation } from "@/components/bottom-navigation"

export const metadata: Metadata = {
  title: "One Bets",
  description: "Play games and win SOL on Solana blockchain with One Bets",
  icons: {
    icon: '/images/hl.webp',
    shortcut: '/images/hl.webp',
    apple: '/images/hl.webp',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Jersey+10&display=swap" rel="stylesheet" />
      </head>
              <body
          className="jersey-10-regular min-h-screen flex flex-col relative"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,0,0,0.5) 200%)'
          }}
        >

        <WalletContextProvider>
          <div className="flex flex-col min-h-screen relative z-10">
            <SiteHeader />
            <div className="flex flex-1 pt-16">
              <SiteSidebar />
              <main className="flex-1 overflow-hidden md:ml-64">
                <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide p-4 md:p-6 lg:p-8 pb-32">
                  <div className="page-transition">
                    {children}
                  </div>
                </div>
              </main>
            </div>
            <BottomNavigation />
          </div>
        </WalletContextProvider>
      </body>
    </html>
  )
}
