// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { shadesOfPurple } from "@clerk/themes";
import { Toaster } from "react-hot-toast";
import { AuthButtons } from "./components/AuthButton";
import { HeartPulse, MapPin } from "lucide-react";
import { clerkAppearance } from "./clerk-theme";
import BackButton from "./components/BackButton";
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
  title: "SnapAid",
  description: "AI triage for patients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadesOfPurple,
        ...clerkAppearance,
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-purple-50 to-white min-h-screen`}
        >
          <Toaster position="bottom-center" />
          <header className="sticky top-0 z-50 w-full border-b border-purple-100 bg-white/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between px-4 mx-auto">
              <div className="flex items-center gap-2 w-full">
                <BackButton />
                <HeartPulse className="h-6 w-6 text-purple-600" />
                <Link href="/" >
                  <span className="font-bold text-purple-900">SnapAid</span>
                </Link>
              </div>
              <div className="flex items-center gap-4">

                <span className="font-bold w-40 text-gray-900">Kumarswamy Layout</span>
                <MapPin className="text-gray-800 mr-4"/>
              <AuthButtons />
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
