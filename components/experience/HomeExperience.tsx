"use client";

import { useCallback, useState } from "react";
import { MotionPreferenceProvider } from "@/lib/motion";
import AtmosphereBackground from "@/components/shared/AtmosphereBackground";
import Loader from "@/components/shared/Loader";
import Nav from "@/components/nav/Nav";
import Hero from "@/components/hero/Hero";
import Story from "@/components/story/Story";
import ServicesSection from "@/components/services/ServicesSection";
import About from "@/components/about/About";
import Ambition from "@/components/about/Ambition";
import Portfolio from "@/components/portfolio/Portfolio";
import Process from "@/components/process/Process";
import Testimonials from "@/components/testimonials/Testimonials";
import Faq from "@/components/faq/Faq";
import FinalCta from "@/components/cta/FinalCta";
import Footer from "@/components/footer/Footer";
import WhatsappFloat from "@/components/whatsapp/WhatsappFloat";

/**
 * Single client island for the home experience.
 *
 * Holds the only root-level state (intro/loader synchronization) and provides
 * the reduced-motion preference to every section via context — sections no
 * longer receive `reduced` props from the root, and the page itself stays a
 * Server Component.
 */
export default function HomeExperience() {
  const [loaderDone, setLoaderDone] = useState(false);

  const handleLoaderFinish = useCallback(() => setLoaderDone(true), []);

  return (
    <MotionPreferenceProvider>
      <AtmosphereBackground />
      <Loader onFinish={handleLoaderFinish} />

      <Nav />

      <main>
        <Hero startIntro={loaderDone} />
        <Story />
        <ServicesSection />
        <About />
        <Ambition />
        <Portfolio />
        <Process />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>

      <Footer />
      <WhatsappFloat />
    </MotionPreferenceProvider>
  );
}