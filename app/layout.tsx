import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
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
  title: "Odysen - Crescimento digital",
  description:
    "A Odysen constrói, automatiza e eleva negócios digitais através de websites, chatbots inteligentes, tráfego pago e marketing.",
  icons: { icon: "/assets/odysen-logo/odysen-favicon.png" },
  openGraph: {
    title: "Odysen — Digital creation. Intelligent automation. Business growth.",
    description: "A Odysen constrói, automatiza e eleva negócios digitais.",
    type: "website",
    images: ["/assets/odysen-logo/odysen-logo.png"],
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
      data-theme="dark"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("odysen-theme");var t=(s==="light"||s==="dark")?s:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
