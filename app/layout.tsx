import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { HydrationFix } from "@/components/hydration-fix"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Jeep Adventures Express",
  description: "Scan & Go Rental - Rent Jeeps in Puerto Rico",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <HydrationFix />
        {children}
      </body>
    </html>
  )
}

