import { Inter, Quicksand, Noto_Sans_Bengali } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ClientWrapper } from "@/app/client-wrapper";
import { GTM_ID, gtmScript, gtmNoscript } from "@/lib/gtm";
import { META_PIXEL_ID, metaPixelScript, metaPixelNoscript } from "@/lib/meta-pixel";
import { seoService } from "@/lib/seo";

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

export async function generateMetadata() {
  try {
    // Generate dynamic metadata using the seo service
    const metadata = await seoService.generateDefaultMetadata();
    return metadata;
  } catch (error) {
    console.error('Error generating dynamic metadata:', error);
    
    // Fallback to static metadata if API fails
    return {
      title: {
        template: '%s | Horekmart',
        default: 'Horekmart - Your trusted eCommerce platform'
      },
      description: 'Your trusted eCommerce platform for quality products',
      keywords: 'ecommerce,online shopping,electronics,fashion,home goods,quality products',
      authors: [{ name: 'Horekmart Team' }],
      openGraph: {
        title: 'Horekmart - Your trusted eCommerce platform',
        description: 'Your trusted eCommerce platform for quality products',
        url: 'http://localhost:3000',
        siteName: 'Horekmart',
        locale: 'en_US',
        type: 'website',
        images: [
          {
            url: 'http://localhost:8000/site-preview.jpg',
            width: 1200,
            height: 630,
            alt: 'Horekmart',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Horekmart - Your trusted eCommerce platform',
        description: 'Your trusted eCommerce platform for quality products',
        images: ['http://localhost:8000/site-preview.jpg'],
      },
      other: {
        'theme-color': '#f22540',
      },
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${quicksand.variable} ${notoSansBengali.variable} font-sans antialiased`} suppressHydrationWarning>
        {/* Google Tag Manager Script */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: gtmScript,
          }}
        />
        
        {/* Meta Pixel Script */}
        <Script
          id="meta-pixel-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: metaPixelScript,
          }}
        />
        
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <div dangerouslySetInnerHTML={{ __html: gtmNoscript }} />
        </noscript>
        
        {/* Meta Pixel (noscript) */}
        <noscript>
          <div dangerouslySetInnerHTML={{ __html: metaPixelNoscript }} />
        </noscript>
        
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
