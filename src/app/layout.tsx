import type { Metadata } from "next";
import { Inter, Quicksand, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ClientWrapper } from "@/app/client-wrapper";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter'
});

const quicksand = Quicksand({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-quicksand'
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  display: 'swap',
  variable: '--font-noto-bengali',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME || '',
    template: process.env.NEXT_PUBLIC_APP_NAME ? `%s - ${process.env.NEXT_PUBLIC_APP_NAME}` : '%s'
  },
  description: '',
  keywords: process.env.NEXT_PUBLIC_DEFAULT_KEYWORDS?.split(',').filter(Boolean) || [],
  metadataBase: process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL) : undefined,
  openGraph: process.env.NEXT_PUBLIC_APP_NAME ? {
    type: 'website',
    locale: process.env.NEXT_PUBLIC_LOCALE || 'en_US',
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: '',
    siteName: process.env.NEXT_PUBLIC_APP_NAME,
    images: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE ? [{
      url: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE,
      width: 1200,
      height: 630,
      alt: process.env.NEXT_PUBLIC_APP_NAME
    }] : []
  } : undefined,
  twitter: process.env.NEXT_PUBLIC_APP_NAME ? {
    card: 'summary_large_image',
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: '',
    images: process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE ? [process.env.NEXT_PUBLIC_DEFAULT_OG_IMAGE] : []
  } : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${quicksand.variable} ${notoSansBengali.variable} font-sans antialiased`} suppressHydrationWarning>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
