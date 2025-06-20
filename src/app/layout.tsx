import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Formtastic",
  description: "Платформа для создания и проведения опросов и викторин.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-dvh flex flex-col bg-gray-50`}
      >
        <Header />
        <main className="grow container mx-auto py-8 px-4 lg:px-8 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
