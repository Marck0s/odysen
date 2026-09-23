"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register the plugin exactly once, in a single module, so every component and
// hook imports the same GSAP + ScrollTrigger instances (no duplicate bundles,
// no repeated plugin registration).
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };