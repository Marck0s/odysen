"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import SplitSection from "@/components/shared/SplitSection";

export default function Ambition() {
  const { t } = useLanguage();

  return (
    <SplitSection statementHtml={t("ambition.statement")} eyebrow={t("ambition.eyebrow")}>
      <p>{t("ambition.p1")}</p>
      <p>{t("ambition.p2")}</p>
    </SplitSection>
  );
}
