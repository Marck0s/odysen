"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { whatsappLink } from "@/lib/config";

export default function WhatsappFloat() {
  const { t } = useLanguage();

  return (
    <a href={whatsappLink()} className="wa-float" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
      <span className="wa-tooltip">{t("wa.tooltip")}</span>
      <svg viewBox="0 0 24 24" fill="white">
        <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.9-.4-1.7-1-2.3-1.7-.6-.7-1-1.2-1.3-1.9-.1-.2 0-.4.1-.5.2-.2.4-.4.5-.6.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2 0 1.2.9 2.4 1 2.6.1.1 1.4 2.2 3.5 3.1 2 .9 2 .6 2.4.6.4 0 1.2-.5 1.4-1 .2-.5.2-.9.1-1z" />
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
      </svg>
    </a>
  );
}
