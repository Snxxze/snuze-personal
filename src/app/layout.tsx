import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Snuze | Personal AI Dashboard",
  description: "วันนี้ต้องรู้อะไร — สรุปตารางชีวิต โน้ตความจำ และข่าวสาร AI",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={cn(
        "h-full", "antialiased", inter.variable, "font-sans"
      )}
    >
      <body className="bg-zen-sand min-h-screen flex justify-center items-start">
        
        <div className="
          w-full max-w-md
          h-[100dvh] max-h-[100dvh]
          flex flex-col relative
          bg-zen-sand 
          shadow-xl md:shadow-2xl
          border-x border-zen-pebble/30
          overflow-hidden
        ">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      
      </body>
    </html>
  )
}