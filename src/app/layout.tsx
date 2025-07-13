import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Kaia DEX",
  description: "Kaia 블록체인 기반 DEX",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black min-h-screen">
        <Providers>
          <Header />
          <main className="max-w-3xl mx-auto py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
