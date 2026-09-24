/**
 * Central, single-source configuration for the Odysen site.
 * Never hardcode the WhatsApp number (or other constants) inside components —
 * import them from here instead.
 */

export const WHATSAPP_NUMBER = "5511963806166";

export const whatsappLink = (message?: string) => {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

export const SITE = {
  name: "Odysen",
  defaultLocale: "pt-BR" as const,
  locales: ["pt-BR", "en-US"] as const,
  containerWidth: 1200,
};

export type Locale = (typeof SITE.locales)[number];
