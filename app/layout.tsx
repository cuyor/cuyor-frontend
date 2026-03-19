import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const Avenir = localFont({
  src: "./font/AvenirNext-Medium.ttf",
});

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cuyor | the visual gps for your mac",
  description:
    "stop searching for buttons. cuyor uses local vision ai to show you exactly where to click, guiding your hand without ever hijacking your mouse.",
  keywords: [
    "macos",
    "ai agent",
    "ui automation",
    "privacy-first ai",
    "developer tools",
  ],
  authors: [{ name: "umar ahmed" }],
  openGraph: {
    title: "cuyor | the visual gps for your mac",
    description:
      "navigate any app instantly. cuyor is a privacy-first macos agent that highlights the exact ui elements you need to click.",
    url: "https://cuyor.com",
    siteName: "cuyor",
    images: [
      {
        url: "https://cuyor.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "cuyor - the visual gps for your mac",
      },
    ],
    locale: "en_us",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "cuyor | the visual gps for your mac",
    description:
      "ai shouldn't hijack your mouse. it should guide your hand. get exclusive access to the closed beta.",
    images: ["https://cuyor.com/og-image.jpg"],
    creator: "@cuyor",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${interSans.variable} ${Avenir.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
