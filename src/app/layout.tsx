import type { Metadata, Viewport } from "next";
import { Inter, Quicksand, Noto_Sans_Bengali } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ClientWrapper } from "@/app/client-wrapper";
import { generateMetadataFromSiteSettings, generateViewportFromSiteSettings } from "@/lib/metadata";
import { GTM_ID, gtmScript, gtmNoscript } from "@/lib/gtm";

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

export async function generateMetadata(): Promise<Metadata> {
  return await generateMetadataFromSiteSettings();
}

export async function generateViewport(): Promise<Viewport> {
  return await generateViewportFromSiteSettings();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager Script */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: gtmScript,
          }}
        />
      </head>
      <body className={`${inter.variable} ${quicksand.variable} ${notoSansBengali.variable} font-sans antialiased`} suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <div dangerouslySetInnerHTML={{ __html: gtmNoscript }} />
        </noscript>
        
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
