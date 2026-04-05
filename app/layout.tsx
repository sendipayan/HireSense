import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./global.css"
import { Navbar } from "@/components/navbar"
import { Toaster } from "react-hot-toast"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/authProvider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

/**
 * SEO: Root metadata for the entire application
 * - Defines default title template and description
 * - Open Graph and Twitter metadata for social sharing
 * - Proper canonical URLs and site verification
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://hiresense.app"),
  title: {
    default: "HireSense - AI-Powered Hiring & Resume Intelligence Platform",
    template: "%s | HireSense",
  },
  description:
    "Transform your hiring process with AI. HireSense matches top talent with perfect opportunities using advanced resume intelligence and smart job matching.",
  keywords: [
    "AI hiring",
    "resume intelligence",
    "job matching",
    "recruitment platform",
    "talent acquisition",
    "HR technology",
  ],
  authors: [{ name: "HireSense Team" }],
  creator: "HireSense",
  publisher: "HireSense",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hiresense.app",
    siteName: "HireSense",
    title: "HireSense - AI-Powered Hiring & Resume Intelligence Platform",
    description:
      "Transform your hiring process with AI. Match top talent with perfect opportunities using advanced resume intelligence.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HireSense - AI-Powered Hiring Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HireSense - AI-Powered Hiring & Resume Intelligence Platform",
    description:
      "Transform your hiring process with AI. Match top talent with perfect opportunities using advanced resume intelligence.",
    images: ["/og-image.png"],
    creator: "@hiresense",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  }
}

/**
 * Viewport configuration for optimal mobile experience
 * - Theme color for browser chrome
 * - Proper scaling settings
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
