import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PerformanceMonitor from "@/components/PerformanceMonitor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Car Insurance Renewal | Get Best Quotes Online",
  description: "Compare and renew your car insurance online. Get instant quotes from top providers like Etiqa, Allianz, and Liberty. Fast, secure, and hassle-free insurance renewal.",
  keywords: "car insurance, motorcycle insurance, insurance renewal, Malaysia insurance, Etiqa, Allianz, Liberty",
  authors: [{ name: "Insurance Renewal Platform" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="smooth-scroll">
      <head>
        <meta name="theme-color" content="#FF6B35" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased touch-manipulation`}
      >
       
        <PerformanceMonitor />
        {children}

      </body>
    </html>
  );
}
