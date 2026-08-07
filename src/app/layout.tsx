import type { Metadata, Viewport } from "next";
import { Archivo, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { SmoothScroll } from "@/lib/motion/SmoothScroll";
import "./globals.css";

/**
 * Three roles, three faces:
 * display — Bricolage Grotesque: editorial grotesk with character at
 *   large optical sizes; used with restraint at display scale only
 * body/UI — Archivo: neutral, legible, disappears behind the content
 * data    — JetBrains Mono: tabular figures for prices + micro-labels
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bitra — Trade stocks with crypto",
  description:
    "The crypto-native exchange for live equities. Trade stocks with crypto, borrow against your balance, stake, swap, and spend anywhere with the Bitra card.",
};

export const viewport: Viewport = {
  themeColor: "#050508",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${archivo.variable} ${jetbrains.variable}`}
    >
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
