import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const lato = Lato({
  variable: "--font-lato",
  weight: "400",
});

export const metadata: Metadata = {
  title: "IG Split",
  description: "Make grids, carousels, and reel thumbnails for your IG page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lato.className}>
      {children}
    </html>
  );
}
