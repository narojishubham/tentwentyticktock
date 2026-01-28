// app/layout.tsx
// ← NO "use client" here — keep this as a Server Component

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // ← import here
import Providers from "./Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Timesheet App",
  description: "Small Timesheet Management SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased shadow-none`}>
        <Providers>          {/* ← wrap children with the client provider */}
          {children}
        </Providers>
      </body>
    </html>
  );
}