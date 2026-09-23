import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://odysen.com"),
  title: "Odysen — Criação, automação e crescimento digital",
  description:
    "A Odysen constrói, automatiza e eleva negócios digitais através de websites, chatbots inteligentes, tráfego pago e marketing.",
  icons: { icon: "/assets/odysen-logo.png" },
  openGraph: {
    title: "Odysen — Digital creation. Intelligent automation. Business growth.",
    description: "A Odysen constrói, automatiza e eleva negócios digitais.",
    type: "website",
    images: ["/assets/odysen-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Odysen",
    description: "A Odysen constrói, automatiza e eleva negócios digitais.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
