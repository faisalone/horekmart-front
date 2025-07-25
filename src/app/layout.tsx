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
  title: "ECommerce - Your Online Shopping Destination",
  description: "Discover amazing products at great prices. Shop electronics, clothing, home & garden, sports & more.",
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
