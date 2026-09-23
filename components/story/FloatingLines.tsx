"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Timer,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

import "./FloatingLines.css";

const vertexShader = `
precision highp float;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;
uniform vec3 backgroundColor;
uniform bool lightMode;

const vec3 ACCENT = vec3(0.48, 0.16, 0.98);
const vec3 CYAN = vec3(0.12, 0.58, 0.78);

float line(float value, float width) {
  float distanceToLine = abs(fract(value) - 0.5);
  return 1.0 - smoothstep(width, width + 0.02, distanceToLine);
}

float node(vec2 point, vec2 uv) {
  return smoothstep(0.035, 0.0, distance(point, uv));
}

float orbit(float radius, float angle, float width) {
  float wobble = sin(angle * 3.0 + iTime * 0.7) * 0.012;
  return smoothstep(width, 0.0, abs(radius - 0.28 - wobble));
}

vec3 accentColor(float amount) {
  if (lineGradientCount > 0) {
    return mix(lineGradient[0], lineGradient[min(lineGradientCount - 1, 1)], amount);
  }
  return mix(ACCENT, CYAN, amount);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  vec2 centered = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  float time = iTime * animationSpeed;

  if (parallax) {
    centered += parallaxOffset;
    uv += parallaxOffset * 0.08;
  }

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }

  float cursorGlow = 0.0;
  if (interactive) {
    float cursorDistance = distance(centered, mouseUv);
    cursorGlow = exp(-cursorDistance * bendRadius * 0.45) * bendInfluence;
    centered += (mouseUv - centered) * cursorGlow * bendStrength * 0.025;
  }

  float aspect = iResolution.x / iResolution.y;
  vec3 col = vec3(0.004, 0.003, 0.009);
  float centralGlow = exp(-dot(centered * vec2(0.72, 1.0), centered * vec2(0.72, 1.0)) * 1.6);
  col += ACCENT * centralGlow * 0.055;

  vec2 blackHole = vec2(max(aspect * 0.48, 0.62), 0.02);
  vec2 holeUv = centered - blackHole;
  float radius = length(holeUv);
  float angle = atan(holeUv.y, holeUv.x);
  float eventHorizon = 1.0 - smoothstep(0.105, 0.14, radius);
  float photonRing = smoothstep(0.035, 0.0, abs(radius - 0.17));
  float accretion = orbit(radius, angle, 0.025) * (0.62 + 0.18 * sin(angle * 5.0 - time * 1.3));
  float farRing = smoothstep(0.012, 0.0, abs(radius - 0.38)) * 0.35;
  float ringLight = max(photonRing, accretion) + farRing;
  float directionalLight = 0.55 + 0.45 * sin(angle - time * 0.55);
  float logoSlash = smoothstep(0.022, 0.0, abs(holeUv.y - holeUv.x * 0.68 + 0.015));
  logoSlash *= smoothstep(0.58, 0.18, abs(holeUv.x));

  col += mix(ACCENT, CYAN, clamp((angle + 1.5) * 0.32, 0.0, 1.0))
    * ringLight * directionalLight;
  col += mix(ACCENT, vec3(0.68, 0.28, 1.0), 0.45) * logoSlash * 0.82;
  col += ACCENT * exp(-radius * 4.0) * 0.12;
  col *= 1.0 - eventHorizon * 0.96;

  float orbitalTrace = line(angle * 1.8 + radius * 8.0 - time * 0.12, 0.018);
  col += CYAN * orbitalTrace * smoothstep(0.5, 0.08, radius) * 0.08;
  col += accentColor(0.3) * cursorGlow * exp(-distance(centered, blackHole) * 3.0) * 0.16;

  float scan = smoothstep(0.08, 0.0, abs(fract(uv.y - time * 0.035) - 0.5));
  col += ACCENT * scan * centralGlow * 0.035;

  if (lightMode) {
    vec3 energy = max(col, vec3(0.0));
    float peak = max(energy.r, max(energy.g, energy.b));
    float coverage = smoothstep(0.018, 0.5, peak);
    vec3 chroma = clamp(energy / max(peak, 0.0001), 0.0, 1.0);
    chroma = pow(chroma, vec3(1.35));
    float chromaPeak = max(chroma.r, max(chroma.g, chroma.b));
    chroma /= max(chromaPeak, 0.0001);
    vec3 ink = mix(chroma, clamp(chroma * 0.82, 0.0, 1.0), smoothstep(0.5, 1.0, coverage));
    fragColor = vec4(mix(vec3(1.0), ink, coverage * 0.94), 1.0);
  } else {
    fragColor = vec4(col, 1.0);
  }
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

const MAX_GRADIENT_STOPS = 8;

function hexToVec3(hex: string): Vector3 {
  let value = hex.trim();

  if (value.startsWith("#")) {
    value = value.slice(1);
  }

  let r = 255;
  let g = 255;
  let b = 255;

  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }

  return new Vector3(r / 255, g / 255, b / 255);
}

interface WavePosition {
  x?: number;
  y?: number;
  rotate?: number;
}

interface FloatingLinesProps {
  linesGradient?: string[];
  enabledWaves?: Array<"top" | "middle" | "bottom">;
  lineCount?: number | number[];
  lineDistance?: number | number[];
  topWavePosition?: WavePosition;
  middleWavePosition?: WavePosition;
  bottomWavePosition?: WavePosition;
  animationSpeed?: number;
  interactive?: boolean;
  bendRadius?: number;
  bendStrength?: number;
  mouseDamping?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  mixBlendMode?: CSSProperties["mixBlendMode"];
  backgroundColor?: string;
  lightMode?: boolean;
  /** Pausa a animação (reduced motion). Renderiza um frame estático. */
  reduced?: boolean;
}

export default function FloatingLines({
  linesGradient,
  enabledWaves = ["top", "middle", "bottom"],
  lineCount = [6],
  lineDistance = [5],
  topWavePosition,
  middleWavePosition,
  bottomWavePosition = { x: 2.0, y: -0.7, rotate: -1 },
  animationSpeed = 1,
  interactive = true,
  bendRadius = 5.0,
  bendStrength = -0.5,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.2,
  mixBlendMode = "screen",
  backgroundColor = "#000000",
  lightMode = false,
  reduced = false,
}: FloatingLinesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetMouseRef = useRef(new Vector2(-1000, -1000));
  const currentMouseRef = useRef(new Vector2(-1000, -1000));
  const targetInfluenceRef = useRef(0);
  const currentInfluenceRef = useRef(0);
  const targetParallaxRef = useRef(new Vector2(0, 0));
  const currentParallaxRef = useRef(new Vector2(0, 0));

  const getLineCount = (waveType: string) => {
    if (typeof lineCount === "number") return lineCount;
    if (!enabledWaves.includes(waveType as "top" | "middle" | "bottom")) return 0;
    const index = enabledWaves.indexOf(waveType as "top" | "middle" | "bottom");
    return lineCount[index] ?? 6;
  };

  const getLineDistance = (waveType: string) => {
    if (typeof lineDistance === "number") return lineDistance;
    if (!enabledWaves.includes(waveType as "top" | "middle" | "bottom")) return 0.1;
    const index = enabledWaves.indexOf(waveType as "top" | "middle" | "bottom");
    return lineDistance[index] ?? 0.1;
  };

  const topLineCount = enabledWaves.includes("top") ? getLineCount("top") : 0;
  const middleLineCount = enabledWaves.includes("middle") ? getLineCount("middle") : 0;
  const bottomLineCount = enabledWaves.includes("bottom") ? getLineCount("bottom") : 0;

  const topLineDistance = enabledWaves.includes("top") ? getLineDistance("top") * 0.01 : 0.01;
  const middleLineDistance = enabledWaves.includes("middle") ? getLineDistance("middle") * 0.01 : 0.01;
  const bottomLineDistance = enabledWaves.includes("bottom") ? getLineDistance("bottom") * 0.01 : 0.01;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let active = true;

    const scene = new Scene();

    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const renderer = new WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Vector3(1, 1, 1) },
      animationSpeed: { value: animationSpeed },

      enableTop: { value: enabledWaves.includes("top") },
      enableMiddle: { value: enabledWaves.includes("middle") },
      enableBottom: { value: enabledWaves.includes("bottom") },

      topLineCount: { value: topLineCount },
      middleLineCount: { value: middleLineCount },
      bottomLineCount: { value: bottomLineCount },

      topLineDistance: { value: topLineDistance },
      middleLineDistance: { value: middleLineDistance },
      bottomLineDistance: { value: bottomLineDistance },

      topWavePosition: {
        value: new Vector3(topWavePosition?.x ?? 10.0, topWavePosition?.y ?? 0.5, topWavePosition?.rotate ?? -0.4),
      },
      middleWavePosition: {
        value: new Vector3(middleWavePosition?.x ?? 5.0, middleWavePosition?.y ?? 0.0, middleWavePosition?.rotate ?? 0.2),
      },
      bottomWavePosition: {
        value: new Vector3(bottomWavePosition?.x ?? 2.0, bottomWavePosition?.y ?? -0.7, bottomWavePosition?.rotate ?? 0.4),
      },

      iMouse: { value: new Vector2(-1000, -1000) },
      interactive: { value: interactive },
      bendRadius: { value: bendRadius },
      bendStrength: { value: bendStrength },
      bendInfluence: { value: 0 },

      parallax: { value: parallax },
      parallaxStrength: { value: parallaxStrength },
      parallaxOffset: { value: new Vector2(0, 0) },

      lineGradient: {
        value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new Vector3(1, 1, 1)),
      },
      lineGradientCount: { value: 0 },
      backgroundColor: { value: hexToVec3(backgroundColor) },
      lightMode: { value: lightMode },
    };

    if (linesGradient && linesGradient.length > 0) {
      const stops = linesGradient.slice(0, MAX_GRADIENT_STOPS);
      uniforms.lineGradientCount.value = stops.length;

      stops.forEach((hex, i) => {
        const color = hexToVec3(hex);
        uniforms.lineGradient.value[i].set(color.x, color.y, color.z);
      });
    }

    const material = new ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const timer = new Timer();

    const setSize = () => {
      if (!active) return;
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;

      renderer.setSize(width, height, false);

      const canvasWidth = renderer.domElement.width;
      const canvasHeight = renderer.domElement.height;
      uniforms.iResolution.value.set(canvasWidth, canvasHeight, 1);
    };

    setSize();

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (!active) return;
            setSize();
          })
        : null;

    if (ro) ro.observe(container);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const dpr = renderer.getPixelRatio();

      targetMouseRef.current.set(x * dpr, (rect.height - y) * dpr);
      targetInfluenceRef.current = 1.0;

      if (parallax) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = (x - centerX) / rect.width;
        const offsetY = -(y - centerY) / rect.height;
        targetParallaxRef.current.set(offsetX * parallaxStrength, offsetY * parallaxStrength);
      }
    };

    const handlePointerLeave = () => {
      targetInfluenceRef.current = 0.0;
    };

    if (interactive) {
      renderer.domElement.addEventListener("pointermove", handlePointerMove);
      renderer.domElement.addEventListener("pointerleave", handlePointerLeave);
    }

    let raf = 0;
    let running = true;

    const renderLoop = () => {
      if (!active || !running) return;

      timer.update();
      uniforms.iTime.value = timer.getElapsed();

      if (interactive) {
        currentMouseRef.current.lerp(targetMouseRef.current, mouseDamping);
        uniforms.iMouse.value.copy(currentMouseRef.current);

        currentInfluenceRef.current += (targetInfluenceRef.current - currentInfluenceRef.current) * mouseDamping;
        uniforms.bendInfluence.value = currentInfluenceRef.current;
      }

      if (parallax) {
        currentParallaxRef.current.lerp(targetParallaxRef.current, mouseDamping);
        uniforms.parallaxOffset.value.copy(currentParallaxRef.current);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(renderLoop);
    };

    // Pausa o loop quando a story sai da viewport (performance) e quando
    // reduced motion está ativo (renderiza um frame estático).
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              const visible = entries[0]?.isIntersecting ?? true;
              if (visible && !reduced) {
                if (!running) {
                  running = true;
                  renderLoop();
                }
              } else {
                running = false;
                cancelAnimationFrame(raf);
              }
            },
            { rootMargin: "10% 0px" }
          )
        : null;

    if (io) io.observe(container);

    // Renderiza um frame inicial mesmo com reduced motion (estático).
    if (reduced) {
      uniforms.iTime.value = 0;
      renderer.render(scene, camera);
    } else {
      renderLoop();
    }

    return () => {
      active = false;
      running = false;

      cancelAnimationFrame(raf);

      if (ro) ro.disconnect();
      if (io) io.disconnect();

      if (interactive) {
        renderer.domElement.removeEventListener("pointermove", handlePointerMove);
        renderer.domElement.removeEventListener("pointerleave", handlePointerLeave);
      }

      geometry.dispose();
      material.dispose();
      timer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    linesGradient,
    enabledWaves,
    lineCount,
    lineDistance,
    topWavePosition,
    middleWavePosition,
    bottomWavePosition,
    animationSpeed,
    interactive,
    bendRadius,
    bendStrength,
    mouseDamping,
    parallax,
    parallaxStrength,
    backgroundColor,
    lightMode,
    reduced,
  ]);

  return (
    <div
      ref={containerRef}
      className="floating-lines-container"
      style={{
        mixBlendMode: lightMode ? "normal" : mixBlendMode,
      }}
    />
  );
}