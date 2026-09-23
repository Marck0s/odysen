"use client";

import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useWhatsappStory, type BubbleConfig } from "@/hooks/useWhatsappStory";
import DollyGallery from "@/components/ui/DollyGallery";
import {
  WebsiteMiniVisual,
  ChatbotMiniVisual,
  AdsMiniVisual,
  MarketingMiniVisual,
} from "./MiniVisuals";

/**
 * The scripted WhatsApp exchange is authored content for the Odysen brand
 * story and is intentionally kept in Portuguese regardless of the site's
 * language toggle — same as a real customer conversation would be.
 */
const CUSTOMER_MSG_1 = "Quero saber mais.";
const ODYSEN_REPLY =
  "Olá, somos da Odysen, uma empresa especialista em digitalizar negócios. Como podemos ajudar?";
const PRODUCTS = [
  { name: "Websites", desc: "Criação de sites profissionais." },
  { name: "Chatbot", desc: "Atendimento inteligente e automatizado." },
  { name: "Tráfego pago", desc: "Esteja em alta no mercado." },
  { name: "Marketing", desc: "Eleve o nível visual do seu negócio." },
];
const CUSTOMER_MSG_2 = "Quero um pacote customizado com todos os serviços";
const ODYSEN_REPLY_2 = "Claro!";

export default function Story() {
  const { t } = useLanguage();

  const sectionRef = useRef<HTMLElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const inputbarRef = useRef<HTMLDivElement>(null);
  const blackTransitionRef = useRef<HTMLDivElement>(null);
  const backwholeRef = useRef<HTMLDivElement>(null);

  const b1 = useRef<HTMLDivElement>(null);
  const b2 = useRef<HTMLDivElement>(null);
  const b7 = useRef<HTMLDivElement>(null);
  const b8 = useRef<HTMLDivElement>(null);

  const p1 = useRef<HTMLDivElement>(null);
  const p2 = useRef<HTMLDivElement>(null);
  const p3 = useRef<HTMLDivElement>(null);
  const p4 = useRef<HTMLDivElement>(null);

  const bubbles: BubbleConfig[] = [
    { ref: b1, text: CUSTOMER_MSG_1, mode: "type" },
    { ref: b2, text: ODYSEN_REPLY, mode: "reveal" },
    { ref: b7, text: CUSTOMER_MSG_2, mode: "type" },
    { ref: b8, text: ODYSEN_REPLY_2, mode: "reveal" },
  ];

  useWhatsappStory({
    sectionRef,
    chatListRef,
    bodyRef,
    boxRef,
    cameraRef,
    galleryRef,
    inputbarRef,
    blackTransitionRef,
    backwholeRef,
    captionRef,
    bubbles,
    products: [p1, p2, p3, p4],
    headline1: t("story.headline1"),
    headline2: t("story.headline2"),
  });

  return (
    <section className="story" ref={sectionRef} id="storySection">
      <div className="story-stage">
        <div className="story-caption" ref={captionRef}>
          <div className="eyebrow">
            <span className="dot" />
            <span>{t("story.eyebrow")}</span>
          </div>
          <h2 data-story-headline data-state={t("story.headline1")}>
            {t("story.headline1")}
          </h2>
        </div>
        <div className="story-camera" ref={cameraRef}>
          <div className="story-black-transition" ref={blackTransitionRef} />
          <div
            className="story-backwhole"
            ref={backwholeRef}
            aria-hidden="true"
          >
            <div className="story-bg-glow" />
            <div className="story-bg-grain" />
          </div>
          <DollyGallery
            ref={galleryRef}
            className="story-dolly-gallery h-full w-full"
            images={[
              "/assets/odysen-banners/odysen-websites.png",
              "/assets/odysen-banners/odysen-chatbots.png",
              "/assets/odysen-banners/odysen-trafego-pago.png",
              "/assets/odysen-banners/odysen-marketing.png",
            ]}
            infinite={false}
            itemWidth={900}
            aspectRatio={0.52}
            borderRadius={7}
            grayscale={0}
            perspective={1000}
            spacing={1000}
            spread={0.50}
            scatter={0.1}
            revealRange={1.5}
            passRange={1}
            parallaxX={0.12}
            parallaxY={0.06}
            parallaxSmooth={0.85}
            tilt={4}
            pulse={0.03}
            drift={0.08}
            smooth={0.97}
            wheelSpeed={1}
            dragSpeed={1.5}
            autoScroll={0}
            pauseOnHover
          />

          <div className="story-phone-wrap">
          <div className="story-visual-box">
            <div className="odysen-cell-interaction" ref={boxRef}>
              <div className="cell-screen">
                <div className="phone-statusbar">
                  <span className="statusbar-time">13:42</span>
                  <div className="statusbar-icons">
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <rect x="2" y="14" width="3" height="6" rx="1" />
                      <rect x="7" y="10" width="3" height="10" rx="1" />
                      <rect x="12" y="6" width="3" height="14" rx="1" />
                      <rect x="17" y="2" width="3" height="18" rx="1" />
                    </svg>
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                      <line x1="12" y1="20" x2="12.01" y2="20" />
                    </svg>
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="1" y="7" width="17" height="10" rx="2" />
                      <path d="M22 11v2" />
                      <rect x="3" y="9" width="11" height="6" rx="1" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                </div>
                <div className="phone-topbar">
                  <div className="phone-avatar">
                    <img src="/assets/odysen-logo/odysen-logo.png" alt="Odysen" />
                  </div>
                  <div className="phone-contact">
                    <div className="name">Odysen</div>
                    <div className="status">online</div>
                  </div>
                  <div className="phone-topbar-actions">
                    <button type="button" aria-label="Chamada de vídeo">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M15 8.5v-1A2.5 2.5 0 0 0 12.5 5h-7A2.5 2.5 0 0 0 3 7.5v9A2.5 2.5 0 0 0 5.5 19h7a2.5 2.5 0 0 0 2.5-2.5v-1l5 3V5.5l-5 3Z" />
                      </svg>
                    </button>
                    <button type="button" aria-label="Chamada de voz">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7.2 4.5 9.4 4a1.5 1.5 0 0 1 1.7.9l1.1 2.7a1.5 1.5 0 0 1-.4 1.7l-1.3 1.1a12.2 12.2 0 0 0 4.1 4.1l1.1-1.3a1.5 1.5 0 0 1 1.7-.4l2.7 1.1a1.5 1.5 0 0 1 .9 1.7l-.5 2.2a1.8 1.8 0 0 1-1.8 1.4C11.1 19.2 4.8 12.9 4.8 5.4A1.8 1.8 0 0 1 6.2 3.6Z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="phone-body" ref={bodyRef}>
                  <div className="phone-scrollbar" aria-hidden="true">
                    <div className="phone-scrollbar-track">
                      <div className="phone-scrollbar-thumb" />
                    </div>
                  </div>
                  <div className="chat-list" ref={chatListRef} aria-hidden="true">
                    <div className="chat-date">Hoje</div>
                    <div className="chat-row out">
                      <div className="bubble out" ref={b1} />
                      <span className="bubble-time">13:42</span>
                    </div>
                    <div className="chat-row in">
                      <div className="bubble in" ref={b2} />
                    </div>
                    <div className="chat-row in">
                      <div className="product-card" ref={p1}>
                        <div className="product-visual">
                          <WebsiteMiniVisual />
                        </div>
                        <div className="product-info">
                          <div className="product-name">{PRODUCTS[0].name}</div>
                          <div className="product-desc">{PRODUCTS[0].desc}</div>
                        </div>
                      </div>
                    </div>
                    <div className="chat-row in">
                      <div className="product-card" ref={p2}>
                        <div className="product-visual">
                          <ChatbotMiniVisual />
                        </div>
                        <div className="product-info">
                          <div className="product-name">{PRODUCTS[1].name}</div>
                          <div className="product-desc">{PRODUCTS[1].desc}</div>
                        </div>
                      </div>
                    </div>
                    <div className="chat-row in">
                      <div className="product-card" ref={p3}>
                        <div className="product-visual">
                          <AdsMiniVisual />
                        </div>
                        <div className="product-info">
                          <div className="product-name">{PRODUCTS[2].name}</div>
                          <div className="product-desc">{PRODUCTS[2].desc}</div>
                        </div>
                      </div>
                    </div>
                    <div className="chat-row in">
                      <div className="product-card" ref={p4}>
                        <div className="product-visual">
                          <MarketingMiniVisual />
                        </div>
                        <div className="product-info">
                          <div className="product-name">{PRODUCTS[3].name}</div>
                          <div className="product-desc">{PRODUCTS[3].desc}</div>
                        </div>
                      </div>
                    </div>
                    <div className="chat-row out">
                      <div className="bubble out" ref={b7} />
                      <span className="bubble-time">13:47</span>
                    </div>
                    <div className="chat-row in">
                      <div className="bubble in" ref={b8} />
                    </div>
                  </div>
                </div>
                <div className="phone-inputbar">
                  <button className="inputbar-btn" type="button" aria-label="Anexar arquivo">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                  <div className="inputbar-field" ref={inputbarRef}>
                    <span className="inputbar-caret" />
                  </div>
                  <button className="inputbar-btn" type="button" aria-label="Câmera">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                  <button className="inputbar-btn" type="button" aria-label="Microfone">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </button>
                </div>
                <div className="phone-homebar">
                  <span className="home-indicator" />
                </div>
              </div>
              <img
                className="cell-mold"
                src="/assets/odysen-cell-interaction.png"
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            </div>
          </div>

        <div className="story-banners" aria-hidden="true">
          <img
            src="/assets/odysen-banners/odysen-websites.png"
            alt=""
            loading="lazy"
            draggable={false}
          />
          <img
            src="/assets/odysen-banners/odysen-chatbots.png"
            alt=""
            loading="lazy"
            draggable={false}
          />
          <img
            src="/assets/odysen-banners/odysen-trafego-pago.png"
            alt=""
            loading="lazy"
            draggable={false}
          />
          <img
            src="/assets/odysen-banners/odysen-marketing.png"
            alt=""
            loading="lazy"
            draggable={false}
          />
        </div>
        </div>
      </div>
      </div>
    </section>
  );
}