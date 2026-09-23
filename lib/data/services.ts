export type ServiceKey = "web" | "bot" | "ads" | "mkt";

export interface ServiceDef {
  id: ServiceKey;
  anchor: string;
  i18nPrefix: string;
  chipLabel: string;
}

export const SERVICES: ServiceDef[] = [
  { id: "web", anchor: "websites", i18nPrefix: "svc.web", chipLabel: "Websites" },
  { id: "bot", anchor: "chatbot", i18nPrefix: "svc.bot", chipLabel: "Chatbot" },
  { id: "ads", anchor: "trafego", i18nPrefix: "svc.ads", chipLabel: "Tráfego pago" },
  { id: "mkt", anchor: "marketing", i18nPrefix: "svc.mkt", chipLabel: "Marketing" },
];

export const explosionTargets = {
  desktop: [
    { x: -360, y: -190, rot: -6 },
    { x: 340, y: -160, rot: 5 },
    { x: -320, y: 200, rot: 4 },
    { x: 360, y: 210, rot: -5 },
  ],
  mobile: [
    { x: -90, y: -260, rot: -4 },
    { x: 90, y: -140, rot: 3 },
    { x: -90, y: 60, rot: 3 },
    { x: 90, y: 180, rot: -3 },
  ],
};

export interface PlanFeatures {
  "pt-BR": string[];
  "en-US": string[];
}

/** Feature bullet lists per service, indexed [plan 0|1|2]. Kept out of the
 * translation JSON since they're structural lists, not prose strings. */
export const PLAN_FEATURES: Record<ServiceKey, [PlanFeatures, PlanFeatures, PlanFeatures]> = {
  web: [
    {
      "pt-BR": ["Site institucional até 5 páginas", "Design responsivo", "Otimização básica de SEO"],
      "en-US": ["Institutional site, up to 5 pages", "Responsive design", "Basic SEO optimization"],
    },
    {
      "pt-BR": [
        "Site institucional ou landing avançada",
        "Animações e microinterações",
        "Integrações (CRM, WhatsApp, formulários)",
        "SEO técnico completo",
      ],
      "en-US": [
        "Institutional site or advanced landing page",
        "Animations and microinteractions",
        "Integrations (CRM, WhatsApp, forms)",
        "Full technical SEO",
      ],
    },
    {
      "pt-BR": ["Plataforma web complexa", "Sistemas e portais internos", "Suporte e evolução contínua"],
      "en-US": ["Complex web platform", "Internal systems and portals", "Ongoing support and evolution"],
    },
  ],
  bot: [
    {
      "pt-BR": ["Fluxo de atendimento único", "Integração com WhatsApp", "Relatório mensal"],
      "en-US": ["Single conversation flow", "WhatsApp integration", "Monthly report"],
    },
    {
      "pt-BR": ["Múltiplos fluxos e departamentos", "Qualificação de leads", "Integração com CRM"],
      "en-US": ["Multiple flows and departments", "Lead qualification", "CRM integration"],
    },
    {
      "pt-BR": ["IA treinada com sua base de conhecimento", "Automação de vendas e pós-venda", "Suporte dedicado"],
      "en-US": ["AI trained on your knowledge base", "Sales and after-sales automation", "Dedicated support"],
    },
  ],
  ads: [
    {
      "pt-BR": ["1 canal de anúncio", "Configuração de rastreamento", "Relatório mensal"],
      "en-US": ["1 ad channel", "Tracking setup", "Monthly report"],
    },
    {
      "pt-BR": ["Múltiplos canais", "Testes A/B contínuos", "Otimização semanal"],
      "en-US": ["Multiple channels", "Continuous A/B testing", "Weekly optimization"],
    },
    {
      "pt-BR": ["Estratégia multicanal completa", "Gestão de budget avançada", "Time dedicado"],
      "en-US": ["Full multichannel strategy", "Advanced budget management", "Dedicated team"],
    },
  ],
  mkt: [
    {
      "pt-BR": ["Calendário de conteúdo", "Peças para redes sociais", "Revisão mensal"],
      "en-US": ["Content calendar", "Social media assets", "Monthly review"],
    },
    {
      "pt-BR": ["Identidade visual completa", "Produção de conteúdo contínua", "Estratégia de marca"],
      "en-US": ["Full visual identity", "Ongoing content production", "Brand strategy"],
    },
    {
      "pt-BR": ["Marca, conteúdo e mídia integrados", "Direção de arte dedicada", "Acompanhamento estratégico"],
      "en-US": ["Integrated brand, content and media", "Dedicated art direction", "Strategic follow-up"],
    },
  ],
};
