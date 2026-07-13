import type { Metadata } from "next";
import { Bodoni_Moda, Manrope, Pinyon_Script } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";
import "./home-landing.css";
import "./marketing-landing.css";

const bodoni = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const pinyonScript = Pinyon_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Memoora — Dijital Hatıra Ağacı",
  description:
    "Her mesaj ağaca bir yaprak ekler. NFC ile açılan premium dijital hatıra ağacı.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${bodoni.variable} ${manrope.variable} ${pinyonScript.variable} h-full`}
    >
      <body className="min-h-full overflow-x-hidden bg-[#050706] antialiased text-[#F5F1E8]">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
