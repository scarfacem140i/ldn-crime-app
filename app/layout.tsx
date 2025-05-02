import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "London Crime Map",
  description: "Interactive map of crime data in London",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <QueryProvider>
          <ThemeProvider defaultTheme="dark" attribute="class">
            {children}
          </ThemeProvider>
        </QueryProvider>
        <Toaster position="top-center" closeButton={true} />
      </body>
    </html>
  );
}
