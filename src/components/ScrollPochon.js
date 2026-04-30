"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";

/* ── Easing ── */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/* ── Single pochon image component ── */
function PochonImage({ src, alt, side, scrollData, introProgress, domRef }) {
  const internalRef = useRef(null);
  const ref = domRef || internalRef;
  const isLeft = side === "left";

  // Smooth values via refs for rAF interpolation
  const smooth = useRef({ x: 0, y: 100, rotate: 0, opacity: 0, scale: 1 });
  const raf = useRef(null);

  const update = useCallback(() => {
    if (!ref.current) return;

    const { exitProgress: phase, ctaProgress, endPhase } = scrollData.current;
    const intro = introProgress.current;

    // ── INTRO: rise from below + fade in ──
    const introY = 100 - intro * 55; // 100% -> 45% (encore plus bas)
    const introOpacity = intro;
    const baseTilt = isLeft ? -15 : 15;
    const introTilt = isLeft ? -30 * (1 - intro) + baseTilt * intro : 30 * (1 - intro) + baseTilt * intro;

    // ── EXIT: slide out to sides ──
    const p = Math.min(phase, 1);
    const exitX = isLeft ? -p * 55 : p * 55;
    const heroRotate = introTilt * (1 - p); // tilt du hero, diminue en sortant

    // ── CTA REAPPEAR ──
    const cta = ctaProgress;
    const ctaTargetX = isLeft ? -15 : 15;
    const ctaTargetY = 5;
    const ctaTargetRotate = isLeft ? -12 : 12;
    // Arrive avec le tilt dans le sens opposé puis se pose sur le target
    const ctaStartRotate = isLeft ? 20 : -20;

    // Seul le pochon gauche réapparaît au CTA
    const activeCta = isLeft ? cta : 0;

    const ctaX = exitX + activeCta * (ctaTargetX - exitX);
    const ctaY = introY + activeCta * (ctaTargetY - introY);
    const ctaRotate = ctaStartRotate + activeCta * (ctaTargetRotate - ctaStartRotate);
    const ctaOpacity = p < 0.99 ? introOpacity : activeCta;

    // Rotation: hero tilt quand pas en CTA, CTA tilt sinon
    const currentRotate = cta > 0.01 ? ctaRotate : heroRotate;

    // ── END PHASE: straighten + shrink + descend to bottom ──
    const end = Math.min(endPhase, 1);
    const finalRotate = currentRotate * (1 - end);
    const finalX = ctaX + (isLeft ? end * 10 : -end * 10);
    const finalY = ctaY * (1 - end); // descend vers 0% (collé en bas)
    const finalScale = 1 - end * 0.4; // réduit à 60% de la taille

    // Targets
    const targetX = finalX;
    const targetY = finalY;
    const targetRotate = finalRotate;
    const targetOpacity = ctaOpacity;
    const targetScale = finalScale;

    // Smooth interpolation
    const s = smooth.current;
    const lerp = 0.1;
    s.x += (targetX - s.x) * lerp;
    s.y += (targetY - s.y) * lerp;
    s.rotate += (targetRotate - s.rotate) * lerp;
    s.opacity += (targetOpacity - s.opacity) * lerp;
    s.scale += (targetScale - s.scale) * lerp;

    // Apply
    ref.current.style.transform = `translate(${s.x}vw, ${s.y}%) rotate(${s.rotate}deg) scale(${s.scale})`;
    ref.current.style.opacity = s.opacity;

    raf.current = requestAnimationFrame(update);
  }, [isLeft, scrollData, introProgress]);

  useEffect(() => {
    raf.current = requestAnimationFrame(update);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [update]);

  return (
    <div
      ref={ref}
      className="absolute"
      style={{
        bottom: 0,
        left: isLeft ? "15%" : undefined,
        right: isLeft ? undefined : "15%",
        width: "clamp(200px, 26vw, 450px)",
        opacity: 0,
        transformOrigin: "bottom center",
        willChange: "transform, opacity",
        filter: "drop-shadow(0 25px 40px rgba(0,0,0,0.5)) drop-shadow(0 10px 15px rgba(0,0,0,0.3))",
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={400}
        height={600}
        className="w-full h-auto select-none pointer-events-none"
        priority
      />
    </div>
  );
}

/* ── Showcase pochon (bottom section, scroll-driven) ── */
const SHOWCASE_ITEMS = [
  { src: "/pochons/pochon_image_rose.png", alt: "Pochon CBD Rose 1" },
  { src: "/pochons/pochon_image_rose.png", alt: "Pochon CBD Rose 2" },
  { src: "/pochons/pochon_image_rose.png", alt: "Pochon CBD Rose 3" },
  { src: "/pochons/pochon_image_rose.png", alt: "Pochon CBD Rose 4" },
];
const SHOWCASE_TILT = 15;

function ShowcasePochon({ index, item, scrollData, vertRef }) {
  const ref = useRef(null);
  const smooth = useRef({ y: 0, rotate: 0, opacity: 0 });
  const raf = useRef(null);

  const update = useCallback(() => {
    if (!ref.current || !vertRef.current) return;

    const progress = scrollData.current.showcaseProgress;

    // Lire la position et taille réelle du pochon vert
    const vertRect = vertRef.current.getBoundingClientRect();
    const vertRight = vertRect.right;
    const vertWidth = vertRect.width;
    const gap = 8;

    // Position X : à droite du vert, chaque pochon décalé
    const targetLeft = vertRight + gap + index * (vertWidth + gap);
    ref.current.style.left = `${targetLeft}px`;
    ref.current.style.width = `${vertWidth}px`;

    // Chaque pochon apparaît en décalé: stagger
    const stagger = 0.15;
    const start = index * stagger;
    const end = start + 0.5;
    const local = Math.max(0, Math.min((progress - start) / (end - start), 1));
    const eased = easeOutCubic(local);

    // Animation: monte depuis le bas, tilt se corrige, fade in
    const targetY = (1 - eased) * 100;
    const targetRotate = SHOWCASE_TILT * (1 - eased);
    const targetOpacity = eased;

    const s = smooth.current;
    const lerp = 0.12;
    s.y += (targetY - s.y) * lerp;
    s.rotate += (targetRotate - s.rotate) * lerp;
    s.opacity += (targetOpacity - s.opacity) * lerp;

    ref.current.style.transform = `translateY(${s.y}%) rotate(${s.rotate}deg)`;
    ref.current.style.opacity = s.opacity;

    raf.current = requestAnimationFrame(update);
  }, [index, scrollData, vertRef]);

  useEffect(() => {
    raf.current = requestAnimationFrame(update);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [update]);

  return (
    <div
      ref={ref}
      className="absolute"
      style={{
        bottom: 0,
        opacity: 0,
        transformOrigin: "bottom center",
        willChange: "transform, opacity",
        filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.45)) drop-shadow(0 8px 12px rgba(0,0,0,0.25))",
      }}
    >
      <Image
        src={item.src}
        alt={item.alt}
        width={400}
        height={600}
        className="w-full h-auto select-none pointer-events-none"
      />
    </div>
  );
}

export default function ScrollPochon() {
  const scrollData = useRef({ exitTarget: 0, exitProgress: 0, ctaTarget: 0, ctaProgress: 0, endPhase: 0, showcaseProgress: 0 });
  const introProgress = useRef(0);
  const vertRef = useRef(null);

  // Intro animation (time-based)
  useEffect(() => {
    const startTime = performance.now();
    const introDelay = 800;
    const introDuration = 1400;
    let raf;

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const raw = Math.max(0, Math.min((elapsed - introDelay) / introDuration, 1));
      introProgress.current = easeOutCubic(raw);
      if (raw < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Exit (reversible) + CTA (reversible) animations
  useEffect(() => {
    let raf;
    const exitLerp = 0.03;
    const ctaLerp = 0.03;

    const tick = () => {
      const d = scrollData.current;

      // Exit: lerp vers le target
      d.exitProgress += (d.exitTarget - d.exitProgress) * exitLerp;
      if (Math.abs(d.exitTarget - d.exitProgress) < 0.001) d.exitProgress = d.exitTarget;

      // CTA: lerp vers le target
      d.ctaProgress += (d.ctaTarget - d.ctaProgress) * ctaLerp;
      if (Math.abs(d.ctaTarget - d.ctaProgress) < 0.001) d.ctaProgress = d.ctaTarget;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Scroll handler
  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY;
      const vh = window.innerHeight;

      // Exit: scroll down = sortie, scroll back up = retour
      scrollData.current.exitTarget = sy > vh * 0.1 ? 1 : 0;

      const ctaSection = document.getElementById("section-cta");
      if (ctaSection) {
        const ctaStart = ctaSection.offsetTop;

        // CTA: réversible avec trigger
        const triggerPoint = ctaStart - vh * 0.7;
        scrollData.current.ctaTarget = sy >= triggerPoint ? 1 : 0;

        // End phase: straighten + descend
        const endStart = ctaStart - vh * 0.2;
        const endEnd = ctaStart + vh * 0.5;
        if (sy <= endStart || endEnd <= endStart) {
          scrollData.current.endPhase = 0;
        } else if (sy >= endEnd) {
          scrollData.current.endPhase = 1;
        } else {
          scrollData.current.endPhase = (sy - endStart) / (endEnd - endStart);
        }
      }

      // Showcase: 4 pochons apparaissent au scroll dans la section showcase
      const showcase = document.getElementById("section-showcase");
      if (showcase) {
        const sStart = showcase.offsetTop;
        const sHeight = showcase.offsetHeight - vh;
        if (sy <= sStart || sHeight <= 0) {
          scrollData.current.showcaseProgress = 0;
        } else if (sy >= sStart + sHeight) {
          scrollData.current.showcaseProgress = 1;
        } else {
          scrollData.current.showcaseProgress = (sy - sStart) / sHeight;
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-15 overflow-hidden">
      <PochonImage
        src="/pochons/pochon_image_vert.png"
        alt="Pochon CBD Vert"
        side="left"
        scrollData={scrollData}
        introProgress={introProgress}
        domRef={vertRef}
      />
      <PochonImage
        src="/pochons/pochon_image_rose.png"
        alt="Pochon CBD Rose"
        side="right"
        scrollData={scrollData}
        introProgress={introProgress}
      />
      {SHOWCASE_ITEMS.map((item, i) => (
        <ShowcasePochon
          key={i}
          index={i}
          item={item}
          scrollData={scrollData}
          vertRef={vertRef}
        />
      ))}
    </div>
  );
}
