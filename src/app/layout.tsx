import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stormsplitter Calculator",
  description: "Calculate Copies and Power",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicons */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900 px-4 py-3 shadow-md flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-red-300"
          >
            🧙 Magic Rechner
          </Link>
          <div className="flex space-x-6 text-sm">
            <Link
              href="/stormsplitter"
              className="text-gray-300 hover:text-red-400"
            >
              Stormsplitter
            </Link>
            <Link href="/bruenor" className="text-gray-300 hover:text-blue-400">
              Bruenor
            </Link>
          </div>
        </nav>

        {/* Hauptinhalt */}
        <main className="pt-[54x] min-h-screen">{children}</main>
      </body>
    </html>
  );
}
