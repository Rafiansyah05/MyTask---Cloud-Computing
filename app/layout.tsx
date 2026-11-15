import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MyTask - Student Task Management System",
  description: "Aplikasi web mahasiswa untuk mengelola mata kuliah, tugas perkuliahan, subtugas, tenggat waktu, dan progres.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans antialiased min-h-screen">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
