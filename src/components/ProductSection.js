"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useCallback, useEffect } from "react";
import * as THREE from "three";

const PRODUCTS = [
  { id: 0, x: -7, name: "Amnesia Haze", description: "Un classique revisité en version CBD. L'Amnesia Haze offre des arômes citronnés intenses avec des notes terreuses. Parfaite pour une session de détente en journée, cette variété est appréciée pour son profil terpénique riche et sa douceur en bouche.", cbd: "16%", thc: "<0.3%", color: "#1a3d2b", image: "/pochons/pochon_image_rose.png" },
  { id: 1, x: -3.5, name: "Lemon Haze", description: "Explosif en saveurs ! Le Lemon Haze CBD délivre un bouquet d'agrumes frais et pétillants. Chaque pochon renferme des fleurs soigneusement sélectionnées pour leur qualité et leur taux de CBD élevé. Une expérience gustative unique.", cbd: "18%", thc: "<0.3%", color: "#3d3a10", image: "/pochons/pochon_image_rose.png" },
  { id: 2, x: 0, name: "OG Kush", description: "La légende californienne en version CBD. L'OG Kush se distingue par ses arômes boisés et épicés, avec une touche de pin. Un incontournable pour les connaisseurs qui recherchent un goût authentique et puissant.", cbd: "20%", thc: "<0.3%", color: "#2e1e12", image: "/pochons/pochon_image_rose.png" },
  { id: 3, x: 3.5, name: "Purple Haze", description: "Visuellement spectaculaire avec ses teintes violettes, la Purple Haze CBD offre des saveurs fruitées et sucrées. Un produit d'exception cultivé avec soin pour garantir une expérience premium à chaque utilisation.", cbd: "15%", thc: "<0.3%", color: "#2a1538", image: "/pochons/pochon_image_rose.png" },
  { id: 4, x: 7, name: "White Widow", description: "La White Widow CBD est reconnue pour sa puissance aromatique et son goût terreux caractéristique. Des cristaux de CBD recouvrent chaque fleur, témoignant d'une qualité supérieure et d'un savoir-faire artisanal.", cbd: "22%", thc: "<0.3%", color: "#12243d", image: "/pochons/pochon_image_rose.png" },
];

const DEFAULT_BG = "#042D24";

const GRID_Y = -1.6;
const OFF_SCREEN = 30;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function Pochon({ x, id, image, selectedId, onSelect, navDirectionRef }) {
  const texture = useTexture(image);
  const planeArgs = useMemo(() => {
    const img = texture.image;
    if (!img) return [4, 4];
    const aspect = img.width / img.height;
    const height = 6;
    return [height * aspect, height];
  }, [texture]);

  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  const isSelected = selectedId === id;
  const isAnySelected = selectedId !== null;

  // Animation state
  const elapsedRef = useRef(0);
  const prevSelectedRef = useRef(selectedId);
  const startRef = useRef({ x: 0, y: GRID_Y, scale: 1.3, rz: 0 });
  const snapshotRef = useRef(false);
  const idleRef = useRef(false);

  // Intro
  const introRef = useRef(true);
  const introElapsedRef = useRef(0);
  const centerId = Math.floor(PRODUCTS.length / 2);
  const distFromCenter = Math.abs(id - centerId);
  const introDir = id < centerId ? -1 : 1;
  const introStartX = x + introDir * OFF_SCREEN;
  const introStagger = distFromCenter * 0.12;

  // Navigation
  const wasSelectedRef = useRef(false);
  const navDirRef = useRef(0);

  // Exit stagger
  const distFromSelected = selectedId !== null ? Math.abs(id - selectedId) : 0;
  const exitStagger = (PRODUCTS.length - 1 - distFromSelected) * 0.06;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function snapshot() {
    if (!ref.current || snapshotRef.current) return;
    startRef.current = {
      x: ref.current.position.x,
      y: ref.current.position.y,
      scale: ref.current.scale.x,
      rz: ref.current.rotation.z,
    };
    snapshotRef.current = true;
  }

  useFrame((_, delta) => {
    if (!ref.current) return;

    // --- Intro ---
    if (introRef.current) {
      introElapsedRef.current += delta;
      const t = easeInOutCubic(Math.min(Math.max(0, introElapsedRef.current - introStagger) / 1.2, 1));
      ref.current.position.x = lerp(introStartX, x, t);
      ref.current.position.y = GRID_Y;
      const sc = lerp(1.3, 1, t);
      ref.current.scale.set(sc, sc, sc);
      if (t >= 1) { introRef.current = false; idleRef.current = true; }
      return;
    }

    // --- Detect selection change ---
    if (prevSelectedRef.current !== selectedId) {
      const wasSelected = prevSelectedRef.current === id;
      const isNav = navDirectionRef.current !== 0 && prevSelectedRef.current !== null && selectedId !== null;
      wasSelectedRef.current = wasSelected && isNav;
      navDirRef.current = isNav ? navDirectionRef.current : 0;
      prevSelectedRef.current = selectedId;
      idleRef.current = false;
      elapsedRef.current = 0;
      snapshotRef.current = false;

      // Nav enter: start off-screen at screen center height
      if (navDirRef.current !== 0 && selectedId === id) {
        ref.current.position.x = navDirRef.current * 16;
        ref.current.position.y = 0;
        ref.current.scale.set(1.05, 1.05, 1.05);
      }
      snapshot();
    }
    if (!snapshotRef.current) snapshot();

    elapsedRef.current += delta;
    const s = startRef.current;

    // --- Nav: previous selection slides out ---
    if (wasSelectedRef.current && navDirRef.current !== 0) {
      const t = easeInOutCubic(Math.min(elapsedRef.current / 1.1, 1));
      ref.current.position.x = lerp(s.x, -navDirRef.current * 18, t);
      ref.current.position.y = lerp(s.y, 0, t);
      const sc = lerp(s.scale, 1.05, t);
      ref.current.scale.set(sc, sc, sc);
      return;
    }

    if (isAnySelected) {
      if (isSelected) {
        if (navDirRef.current !== 0) {
          // Nav: new selection slides in to center of screen
          const t = easeInOutCubic(Math.min(elapsedRef.current / 1.1, 1));
          ref.current.position.x = lerp(s.x, 0, t);
          ref.current.position.y = lerp(s.y, 0, t);
          ref.current.rotation.z = lerp(s.rz, 0, t);
          const sc = lerp(1.05, 1.6, t);
          ref.current.scale.set(sc, sc, sc);
        } else {
          // Click select: move to center of screen + scale up
          const t = easeInOutCubic(Math.min(Math.max(0, elapsedRef.current - 0.15) / 1.4, 1));
          ref.current.position.x = lerp(s.x, 0, t);
          ref.current.position.y = lerp(s.y, 0, t);
          ref.current.rotation.z = lerp(s.rz, 0, t);
          const sc = lerp(s.scale, 1.6, t);
          ref.current.scale.set(sc, sc, sc);
        }
      } else if (navDirRef.current !== 0) {
        return; // Non-involved pochons stay frozen
      } else {
        // Staggered exit left/right
        const t = easeInOutCubic(Math.min(Math.max(0, elapsedRef.current - exitStagger) / 1.2, 1));
        const dir = id < selectedId ? -1 : 1;
        ref.current.position.x = lerp(s.x, x + dir * OFF_SCREEN, t);
        const sc = lerp(s.scale, 1.3, t);
        ref.current.scale.set(sc, sc, sc);
      }
    } else if (idleRef.current) {
      // Hover
      const targetY = hovered ? GRID_Y + 1.2 : GRID_Y;
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.06);
      const targetRot = hovered ? -0.04 : 0;
      ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, targetRot, 0.06);
    } else {
      // Return to grid
      const t = easeInOutCubic(Math.min(elapsedRef.current / 0.8, 1));
      ref.current.position.x = lerp(s.x, x, t);
      ref.current.position.y = lerp(s.y, GRID_Y, t);
      const sc = lerp(s.scale, 1, t);
      ref.current.scale.set(sc, sc, sc);
      if (t >= 1) idleRef.current = true;
    }
  });

  return (
    <group
      ref={ref}
      position={[introStartX, GRID_Y, 0]}
      scale={[1.3, 1.3, 1.3]}
      onClick={(e) => { e.stopPropagation(); onSelect(id); }}
      onPointerEnter={() => { setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = "auto"; }}
    >
      <mesh>
        <planeGeometry args={planeArgs} />
        <meshBasicMaterial map={texture} transparent alphaTest={0.01} />
      </mesh>
    </group>
  );
}

function SplitText({ text, staggerMs = 30, durationMs = 500, delayMs = 0, mode = "chars" }) {
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setReveal(true));
      });
    }, delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs]);

  if (mode === "words") {
    const words = text.split(" ");
    return (
      <>
        {words.map((word, wi) => (
          <span key={wi} className="inline-block overflow-hidden" style={{ marginRight: "0.3em" }}>
            <span
              className="inline-block"
              style={{
                transform: reveal ? "translateY(0)" : "translateY(100%)",
                opacity: reveal ? 1 : 0,
                transition: `transform ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1) ${wi * staggerMs}ms, opacity ${durationMs * 0.5}ms ease ${wi * staggerMs}ms`,
              }}
            >
              {word}
            </span>
          </span>
        ))}
      </>
    );
  }

  const words = text.split(" ");
  let charIndex = 0;

  return (
    <>
      {words.map((word, wi) => (
        <span key={wi} className="inline-flex overflow-hidden" style={{ marginRight: "0.25em" }}>
          {word.split("").map((char) => {
            const i = charIndex++;
            return (
              <span
                key={i}
                className="inline-block"
                style={{
                  transform: reveal ? "translateY(0)" : "translateY(110%)",
                  opacity: reveal ? 1 : 0,
                  transition: `transform ${durationMs}ms cubic-bezier(0.22, 1, 0.36, 1) ${i * staggerMs}ms, opacity ${durationMs * 0.6}ms ease ${i * staggerMs}ms`,
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </>
  );
}

function darkenHex(hex, amount = 0.4) {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * (1 - amount));
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * (1 - amount));
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * (1 - amount));
  return `rgb(${r},${g},${b})`;
}

function CbdBar({ label, value, max, delayMs = 0, color }) {
  const [fill, setFill] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setFill(true));
      });
    }, delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs]);

  const percent = Math.min((value / max) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-white/60 text-xs font-medium w-8 shrink-0">{label}</span>
      <div
        className="relative overflow-hidden"
        style={{
          width: "12rem",
          height: "0.25rem",
          background: "rgba(255,255,255,0.15)",
          borderRadius: "8px 2px 8px 2px",
        }}
      >
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: fill ? `${percent}%` : "0%",
            background: color ? darkenHex(color) : "#f4a261",
            borderRadius: "8px 2px 8px 2px",
            transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>
      <span className="text-white/50 text-xs w-10 shrink-0">{value}%</span>
    </div>
  );
}

function MarqueeText({ text }) {
  return (
    <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none select-none z-12">
      <div className="animate-marquee whitespace-nowrap flex">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={`${text}-${i}`}
            className="text-[10vw] font-black uppercase tracking-wide mx-4"
            style={{ color: "#EFDDEE", fontFamily: "Glorify", WebkitTextStroke: "6px #EFDDEE", opacity: 0.75 }}
          >
            <SplitText text={text} staggerMs={50} durationMs={750} delayMs={400} />
          </span>
        ))}
      </div>
    </div>
  );
}

function DetailOverlay({ product, onClose, onPrev, onNext }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      className={`absolute inset-0 z-20 pointer-events-auto transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
    >

      {/* Description */}
      <div className="absolute left-8 bottom-24 max-w-md z-20 pointer-events-none">
        <p key={`desc-${product.id}`} className="text-white/90 text-base leading-relaxed">
          <SplitText
            text={product.description}
            mode="words"
            staggerMs={40}
            durationMs={600}
            delayMs={300}
          />
        </p>
        <div key={`stats-${product.id}`} className="mt-6">
          <CbdBar label="CBD" value={parseInt(product.cbd)} max={30} delayMs={600} color={product.color} />
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={onPrev}
        className="group absolute left-6 top-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-full backdrop-blur-sm flex items-center justify-center text-white pointer-events-auto cursor-pointer overflow-hidden"
        style={{ left: "10rem", background: "rgba(255,255,255,0.15)" }}
      >
        <span
          className="absolute inset-0 rounded-full bg-white transition-transform duration-300 ease-out origin-bottom scale-y-0 group-hover:scale-y-100"
        />
        <svg className="relative z-10 transition-colors duration-300 group-hover:stroke-green-900" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        onClick={onNext}
        className="group absolute right-6 top-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-full backdrop-blur-sm flex items-center justify-center text-white pointer-events-auto cursor-pointer overflow-hidden"
        style={{ right: "10rem", background: "rgba(255,255,255,0.15)" }}
      >
        <span
          className="absolute inset-0 rounded-full bg-white transition-transform duration-300 ease-out origin-bottom scale-y-0 group-hover:scale-y-100"
        />
        <svg className="relative z-10 transition-colors duration-300 group-hover:stroke-green-900" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Bottom bar — liquid glass */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-2 py-2 rounded-full  transition-all duration-700 delay-500 pointer-events-auto ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:scale-105 hover:bg-white transition-all pointer-events-auto cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
          </svg>
        </button>
        <button className="px-8 py-3 rounded-full bg-white/80 backdrop-blur-sm text-green-900 font-bold flex items-center gap-3 hover:scale-105 hover:bg-white transition-all pointer-events-auto cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          AJOUTER AU PANIER
        </button>
        <button className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:scale-105 hover:bg-white transition-all pointer-events-auto cursor-pointer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function FloatingImage({ src, className, baseStyle, mouseXRef, mouseYRef, strength }) {
  const innerRef = useRef();
  const posRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let raf;
    const animate = () => {
      const targetX = mouseXRef.current * strength;
      const targetY = mouseYRef.current * strength;
      posRef.current.x += (targetX - posRef.current.x) * 0.05;
      posRef.current.y += (targetY - posRef.current.y) * 0.05;
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [mouseXRef, mouseYRef, strength]);

  return (
    <div className={className} style={baseStyle}>
      <img
        ref={innerRef}
        src={src}
        alt=""
        className="w-full h-full"
      />
    </div>
  );
}

export default function ProductSection({ onSelectionChange }) {
  const [selectedId, setSelectedId] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("fleurs");
  const navDirectionRef = useRef(0); // -1 = prev, +1 = next, 0 = no nav

  useEffect(() => {
    onSelectionChange?.(selectedId !== null);
  }, [selectedId, onSelectionChange]);

  const handleSelect = useCallback((id) => {
    if (selectedId !== null) return;
    navDirectionRef.current = 0;
    setSelectedId(id);
    setTimeout(() => setDetailProduct(PRODUCTS[id]), 400);
  }, [selectedId]);

  const handleClose = useCallback(() => {
    navDirectionRef.current = 0;
    setDetailProduct(null);
    setSelectedId(null);
  }, []);

  const handlePrev = useCallback(() => {
    const newId = selectedId <= 0 ? PRODUCTS.length - 1 : selectedId - 1;
    navDirectionRef.current = -1;
    setSelectedId(newId);
    setDetailProduct(PRODUCTS[newId]);
  }, [selectedId]);

  const handleNext = useCallback(() => {
    const newId = selectedId >= PRODUCTS.length - 1 ? 0 : selectedId + 1;
    navDirectionRef.current = 1;
    setSelectedId(newId);
    setDetailProduct(PRODUCTS[newId]);
  }, [selectedId]);

  const handleGridPrev = useCallback(() => {
    navDirectionRef.current = 0;
    setSelectedId(0);
    setTimeout(() => setDetailProduct(PRODUCTS[0]), 400);
  }, []);

  const handleGridNext = useCallback(() => {
    const lastId = PRODUCTS.length - 1;
    navDirectionRef.current = 0;
    setSelectedId(lastId);
    setTimeout(() => setDetailProduct(PRODUCTS[lastId]), 400);
  }, []);

  // Track mouse position normalized to [-1, 1]
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);
  const handleMouseMove = useCallback((e) => {
    mouseXRef.current = (e.clientX / window.innerWidth) * 2 - 1;
    mouseYRef.current = (e.clientY / window.innerHeight) * 2 - 1;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        backgroundColor: selectedId !== null ? PRODUCTS[selectedId].color : DEFAULT_BG,
        transition: "background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 14], fov: 50 }}
        className="absolute! inset-0 z-13"
      >
        <Suspense fallback={null}>
          {PRODUCTS.map((config) => (
            <Pochon
              key={config.id}
              {...config}
              selectedId={selectedId}
              onSelect={handleSelect}
              navDirectionRef={navDirectionRef}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* Marquee behind the 3D pochon */}
      {detailProduct && <MarqueeText text={detailProduct.name} />}

      {/* Detail overlay */}
      {detailProduct && (
        <DetailOverlay
          product={detailProduct}
          onClose={handleClose}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}

      {/* Decorative weed images — left behind marquee, right in front */}
      {detailProduct && (
        <>
          <FloatingImage
            src="/weedpng.png"
            className="absolute z-11 pointer-events-none select-none animate-[fadeSlideLeft_1s_ease_0.2s_both]"
            baseStyle={{ left: "2%", top: "35%", width: "38vw", filter: "blur(3px)" }}
            mouseXRef={mouseXRef}
            mouseYRef={mouseYRef}
            strength={12}
          />
          <FloatingImage
            src="/weedpng.png"
            className="absolute z-15 pointer-events-none select-none animate-[fadeSlideRight_1s_ease_0.4s_both]"
            baseStyle={{ right: "2%", top: "30%", width: "46vw", filter: "none" }}
            mouseXRef={mouseXRef}
            mouseYRef={mouseYRef}
            strength={18}
          />
        </>
      )}

      {/* Grid view title */}
      {selectedId === null && (
        <>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-8">
            {/* Fleurs */}
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => setActiveCategory("fleurs")} className="group w-20 h-20 rounded-full border-2 flex items-center justify-center cursor-pointer overflow-hidden relative transition-all duration-300" style={{ borderColor: activeCategory === "fleurs" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)", background: activeCategory === "fleurs" ? "rgba(255,255,255,0.15)" : "transparent" }}>
                <span className="absolute inset-0 rounded-full bg-white transition-transform duration-300 ease-out origin-bottom scale-y-0 group-hover:scale-y-100" />
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="relative z-10 text-white transition-colors duration-300 group-hover:text-green-900">
                  <path d="M12 2C12 2 14.5 5.5 14.5 8.5C14.5 10.5 13.5 12 12 12C10.5 12 9.5 10.5 9.5 8.5C9.5 5.5 12 2 12 2Z" />
                  <path d="M5.6 5.6C5.6 5.6 9.5 6.8 11.2 9.3C12.3 10.9 12.2 12.7 11 13.5C9.8 14.3 8 13.8 6.9 12.2C5.2 9.7 5.6 5.6 5.6 5.6Z" />
                  <path d="M18.4 5.6C18.4 5.6 14.5 6.8 12.8 9.3C11.7 10.9 11.8 12.7 13 13.5C14.2 14.3 16 13.8 17.1 12.2C18.8 9.7 18.4 5.6 18.4 5.6Z" />
                  <path d="M3 12C3 12 6.8 12.2 9 14.3C10.5 15.7 10.8 17.5 9.8 18.5C8.8 19.5 7 19.2 5.5 17.7C3.5 15.6 3 12 3 12Z" />
                  <path d="M21 12C21 12 17.2 12.2 15 14.3C13.5 15.7 13.2 17.5 14.2 18.5C15.2 19.5 17 19.2 18.5 17.7C20.5 15.6 21 12 21 12Z" />
                  <line x1="12" y1="13" x2="12" y2="22" />
                </svg>
              </button>
              <span className={`text-xs font-medium tracking-wide uppercase transition-opacity duration-300 ${activeCategory === "fleurs" ? "text-white" : "text-white/50"}`}>Fleurs</span>
            </div>

            {/* Résines */}
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => setActiveCategory("resines")} className="group w-20 h-20 rounded-full border-2 flex items-center justify-center cursor-pointer overflow-hidden relative transition-all duration-300" style={{ borderColor: activeCategory === "resines" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)", background: activeCategory === "resines" ? "rgba(255,255,255,0.15)" : "transparent" }}>
                <span className="absolute inset-0 rounded-full bg-white transition-transform duration-300 ease-out origin-bottom scale-y-0 group-hover:scale-y-100" />
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="relative z-10 text-white transition-colors duration-300 group-hover:text-green-900">
                  <path d="M12 3C8 3 5 6 5 10C5 14 8 19 12 21C16 19 19 14 19 10C19 6 16 3 12 3Z" />
                  <path d="M12 7C10.5 7 9 8.5 9 10.5C9 12.5 10.5 14 12 15C13.5 14 15 12.5 15 10.5C15 8.5 13.5 7 12 7Z" />
                </svg>
              </button>
              <span className={`text-xs font-medium tracking-wide uppercase transition-opacity duration-300 ${activeCategory === "resines" ? "text-white" : "text-white/50"}`}>Résines</span>
            </div>

            {/* Huiles */}
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => setActiveCategory("huiles")} className="group w-20 h-20 rounded-full border-2 flex items-center justify-center cursor-pointer overflow-hidden relative transition-all duration-300" style={{ borderColor: activeCategory === "huiles" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)", background: activeCategory === "huiles" ? "rgba(255,255,255,0.15)" : "transparent" }}>
                <span className="absolute inset-0 rounded-full bg-white transition-transform duration-300 ease-out origin-bottom scale-y-0 group-hover:scale-y-100" />
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="relative z-10 text-white transition-colors duration-300 group-hover:text-green-900">
                  <path d="M10 2L8 8H16L14 2H10Z" />
                  <rect x="7" y="8" width="10" height="14" rx="2" />
                  <path d="M12 12C12 12 14 14 14 16C14 17.1 13.1 18 12 18C10.9 18 10 17.1 10 16C10 14 12 12 12 12Z" fill="currentColor" stroke="currentColor" />
                </svg>
              </button>
              <span className={`text-xs font-medium tracking-wide uppercase transition-opacity duration-300 ${activeCategory === "huiles" ? "text-white" : "text-white/50"}`}>Huiles</span>
            </div>

            {/* Goodies */}
            <div className="flex flex-col items-center gap-2">
              <button onClick={() => setActiveCategory("goodies")} className="group w-20 h-20 rounded-full border-2 flex items-center justify-center cursor-pointer overflow-hidden relative transition-all duration-300" style={{ borderColor: activeCategory === "goodies" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)", background: activeCategory === "goodies" ? "rgba(255,255,255,0.15)" : "transparent" }}>
                <span className="absolute inset-0 rounded-full bg-white transition-transform duration-300 ease-out origin-bottom scale-y-0 group-hover:scale-y-100" />
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="relative z-10 text-white transition-colors duration-300 group-hover:text-green-900">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="3" x2="12" y2="8" />
                  <line x1="12" y1="16" x2="12" y2="21" />
                  <line x1="3" y1="12" x2="8" y2="12" />
                  <line x1="16" y1="12" x2="21" y2="12" />
                </svg>
              </button>
              <span className={`text-xs font-medium tracking-wide uppercase transition-opacity duration-300 ${activeCategory === "goodies" ? "text-white" : "text-white/50"}`}>Goodies</span>
            </div>
          </div>

          <p className="absolute top-44 left-1/2 -translate-x-1/2 z-0 text-white text-center text-sm max-w-2xl leading-relaxed" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Découvrez notre sélection de produits CBD de qualité premium, cultivés avec soin et testés en laboratoire pour garantir une expérience exceptionnelle.
          </p>

          {/* Grid navigation arrows */}
          <button
            onClick={handleGridPrev}
            className="group absolute left-6 top-[55%] -translate-y-1/2 z-30 w-16 h-16 rounded-full backdrop-blur-sm flex items-center justify-center text-white pointer-events-auto cursor-pointer overflow-hidden"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <span
              className="absolute inset-0 rounded-full bg-white transition-transform duration-300 ease-out origin-bottom scale-y-0 group-hover:scale-y-100"
            />
            <svg className="relative z-10 transition-colors duration-300 group-hover:stroke-green-900" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={handleGridNext}
            className="group absolute right-6 top-[55%] -translate-y-1/2 z-30 w-16 h-16 rounded-full backdrop-blur-sm flex items-center justify-center text-white pointer-events-auto cursor-pointer overflow-hidden"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <span
              className="absolute inset-0 rounded-full bg-white transition-transform duration-300 ease-out origin-bottom scale-y-0 group-hover:scale-y-100"
            />
            <svg className="relative z-10 transition-colors duration-300 group-hover:stroke-green-900" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}
