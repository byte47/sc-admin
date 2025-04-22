import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdminNav from "@/components/AdminNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Dashboard - Access Monitor",
  description: "Admin dashboard for the Access Monitor application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <div className='flex min-h-screen'>
              <aside className='w-64 border-r'>
                <AdminNav />
              </aside>
              <main className='flex-1 p-8'>{children}</main>
            </div>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
