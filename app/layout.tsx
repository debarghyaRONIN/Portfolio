import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnimationInitializer from "./AnimationInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Debarghya Saha | ML Engineer & MLOps Enthusiast",
  description: "Portfolio of Debarghya, a Machine Learning Engineer and MLOps Enthusiast passionate about building AI-driven solutions.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#1C1C1C] overflow-y-scroll overflow-x-hidden`}
      >
        <AnimationInitializer />
        {children}
      </body>
    </html>
  );
}