"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useMotionPreference } from "@/lib/motion";

interface LoaderProps {
  onFinish: () => void;
}

export default function Loader({ onFinish }: LoaderProps) {
  const reduced = useMotionPreference();
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const finish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      document.body.style.overflow = "";
      gsap.to(rootRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          if (rootRef.current) rootRef.current.style.display = "none";
          onFinish();
        },
      });
    };

    if (reduced) {
      const t = setTimeout(finish, 400);
      return () => clearTimeout(t);
    }

    gsap.to(markRef.current, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" });

    const t = setTimeout(finish, 3400);
    return () => clearTimeout(t);
  }, [reduced, onFinish]);

  return (
    <div id="loader" ref={rootRef}>
      <div className="mark" ref={markRef} style={{ opacity: reduced ? 1 : 0, transform: reduced ? "scale(1)" : undefined }}>
        <img
          className="loader-logo"
          src="/assets/odysen-logo/odysen-logo-name-slogan.png"
          alt="Odysen"
          draggable={false}
        />
      </div>
    </div>
  );
}
