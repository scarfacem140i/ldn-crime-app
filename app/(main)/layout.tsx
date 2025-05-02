import { Header } from "@/components/header";
import { MapProvider } from "@/providers/MapProvider";
import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type React from "react";
import { Suspense } from "react";
import "../globals.css";

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
    <Suspense>
      <NuqsAdapter>
        <MapProvider>
          <div className="flex flex-col h-dvh">
            <Header />
            {children}
          </div>
        </MapProvider>
      </NuqsAdapter>
    </Suspense>
  );
}
