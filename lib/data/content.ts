export interface CaseStudy {
  number: string;
  name: string;
  tag: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  { number: "01", name: "Verdê Alimentos", tag: "Websites & Marketing" },
  { number: "02", name: "Grupo Marall Imóveis", tag: "Chatbot & Automação" },
  { number: "03", name: "Vittá Clínicas", tag: "Tráfego pago" },
  { number: "04", name: "Nortek Distribuidora", tag: "Websites & Chatbot" },
];

export interface Project {
  id: string;
  name: string;
  image: string;
  url: string;
}

export const PROJECTS: Project[] = [
  {
    id: "nutri-fernanda",
    name: "Nutri Fernanda",
    image: "/assets/projects-work/nutri-fernanda.webp",
    // TODO: substituir pelo link real do deploy quando estiver no ar.
    url: "https://nutriferranda.com.br",
  },
  {
    id: "serralheria-kaiser",
    name: "Serralheria Kaiser",
    image: "/assets/projects-work/serralheria-kaiser.webp",
    url: "https://serralheriakaiser.com.br/",
  },
];

export interface Testimonial {
  initials: string;
  quote: string;
  name: string;
  company: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    initials: "JP",
    quote: "A Odysen entendeu o negócio antes de propor qualquer solução. Isso mudou o resultado.",
    name: "João Pereira",
    company: "Verdê Alimentos",
  },
  {
    initials: "CM",
    quote: "O chatbot reduziu nosso tempo de resposta de horas para segundos, sem perder o tom da marca.",
    name: "Camila Marall",
    company: "Grupo Marall Imóveis",
  },
  {
    initials: "RV",
    quote: "Pela primeira vez, sabíamos exatamente para onde o investimento em mídia estava indo.",
    name: "Rodrigo Vittá",
    company: "Vittá Clínicas",
  },
  {
    initials: "AN",
    quote: "Sentimos que ganhamos um time interno, não contratamos um fornecedor.",
    name: "Ana Nortek",
    company: "Nortek Distribuidora",
  },
];

export const PROCESS_STEPS = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;

export const FAQ_ITEMS = ["1", "2", "3", "4", "5", "6"] as const;
