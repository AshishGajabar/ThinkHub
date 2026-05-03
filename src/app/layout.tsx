import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ThinkHub | Where Thinkers Solve Problems Faster",
  description:
    "ThinkHub is an interactive Q&A community for real-time knowledge sharing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-slate-50 min-h-screen text-slate-900`}
      >
        <div className="relative flex flex-col min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Navbar />
          <main className="flex-1 w-full relative z-10 pt-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
