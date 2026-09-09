import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Tajawal } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { getServerLang } from "@/lib/i18n/server";
import { dirFor } from "@/lib/i18n/dictionaries";

// Display serif for Latin headings — editorial, high-contrast, distinctly
// fashion-forward rather than the default Playfair.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

// Quiet geometric sans for UI + body (Latin).
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

// Clean Arabic face used across the whole UI in RTL mode.
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Walid Style — Élégance algérienne",
    template: "%s — Walid Style",
  },
  description:
    "Walid Style — prêt-à-porter élégant et intemporel. Paiement à la livraison dans les 58 wilayas d'Algérie.",
  keywords: ["Walid Style", "mode Algérie", "vêtements", "abaya", "costume", "livraison Algérie"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = getServerLang();
  return (
    <html
      lang={lang}
      dir={dirFor(lang)}
      className={`${cormorant.variable} ${jost.variable} ${tajawal.variable}`}
    >
      <body className="min-h-screen bg-cream text-ink antialiased">
        <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
