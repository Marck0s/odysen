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
  const videoRef = useRef<HTMLVideoElement>(null);
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

    const video = videoRef.current;
    if (video) {
      video.playbackRate = 2.1; // full mark + wordmark settles in ~3.4s instead of 8s
      video.play().catch(() => {
        /* autoplay can be blocked in some browsers; the timeout below still fires */
      });
    }

    const t = setTimeout(finish, 3400);
    return () => clearTimeout(t);
  }, [reduced, onFinish]);

  return (
    <div id="loader" ref={rootRef}>
      <div className="mark" ref={markRef} style={{ opacity: reduced ? 1 : 0, transform: reduced ? "scale(1)" : undefined }}>
        <video
          ref={videoRef}
          className="loader-video"
          src="/assets/odysen-logo/odysen-logo-name-slogan.png"
          poster="/assets/odysen-logo/odysen-logo-name-slogan.png"
          autoPlay
          muted
          playsInline
        />
      </div>
    </div>
  );
}
