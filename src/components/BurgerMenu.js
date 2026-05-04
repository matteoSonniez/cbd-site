"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

function SplitText({ text, staggerMs = 40, durationMs = 600, delayMs = 0 }) {
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setReveal(true));
      });
    }, delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs]);

  let charIndex = 0;
  const words = text.split(" ");

  return (
    <>
      {words.map((word, wi) => (
        <span key={wi} className="inline-flex" style={{ marginRight: "0.25em", clipPath: "inset(-20% 0 0 0)" }}>
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

const LINKS = [
  { label: "Fleurs", href: "/products" },
  { label: "Huiles", href: "/products" },
  { label: "Résines", href: "/products" },
  { label: "Nouveautés", href: "/products" },
];

const PANEL_TRANSITION_MS = 700;

function MenuButton({ open, onClick, className = "", atTop = false, floating = false, ...props }) {
  // When the menu is open OR the button is the floating one (over dark overlay),
  // we always render the dark-glass variant so it stays visible on the dark backdrop.
  const dark = atTop || open || floating;

  const barColor = dark ? "rgba(255,255,255,0.95)" : "rgba(40,30,72,0.85)";

  return (
    <button
      onClick={onClick}
      aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
      className={`group flex items-center justify-center w-[26px] h-[26px] rounded-[5px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.06] active:scale-[0.97] cursor-pointer ${className}`}
      style={{
        background: dark
          ? "rgba(255,255,255,0.10)"
          : "rgba(255,255,255,0.55)",
        border: `1px solid ${
          dark ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.75)"
        }`,
        backdropFilter: "blur(18px) saturate(180%)",
        WebkitBackdropFilter: "blur(18px) saturate(180%)",
        boxShadow: dark
          ? "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(255,255,255,0.06), 0 4px 14px rgba(0,0,0,0.20)"
          : "inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.45), 0 6px 18px rgba(40,30,72,0.08)",
      }}
      {...props}
    >
      <div className="flex flex-col items-center justify-center gap-[3.5px]">
        <span
          className={`block h-[1.5px] w-[12px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-y-[5px] rotate-45" : ""
          }`}
          style={{ background: barColor }}
        />
        <span
          className={`block h-[1.5px] w-[8px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "-translate-y-[5px] -rotate-45 w-[12px]" : ""
          }`}
          style={{ background: barColor }}
        />
      </div>
    </button>
  );
}

export default function BurgerMenu({ atTop = false }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setShowFloatingButton(true);
      return undefined;
    }

    const timeout = setTimeout(() => {
      setShowFloatingButton(false);
    }, PANEL_TRANSITION_MS);

    return () => clearTimeout(timeout);
  }, [open]);

  return (
    <>
      {/* Bouton burger */}
      <MenuButton
        open={open}
        atTop={atTop}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="relative z-50"
        aria-hidden={showFloatingButton}
        tabIndex={showFloatingButton ? -1 : 0}
      />

      {mounted &&
        createPortal(
          <>
            {showFloatingButton && (
              <MenuButton
                open={open}
                floating
                onClick={() => setOpen((isOpen) => !isOpen)}
                className="fixed right-8 top-[18px] z-100"
              />
            )}

            {/* Overlay sombre */}
            <div
              className={`fixed inset-0 z-60 bg-black/50 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => setOpen(false)}
            />

            {/* Panel latéral */}
            <div
              className={`fixed top-0 right-0 z-70 h-full w-2/3 bg-white/10 backdrop-blur-2xl shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <nav className="flex flex-col justify-center gap-8 h-full px-10" style={{ fontFamily: "Glorify" }}>
                {open &&
                  LINKS.map((link, i) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-8xl uppercase text-white/80 inline-block hover:translate-x-10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                    >
                      <SplitText
                        text={link.label}
                        staggerMs={35}
                        durationMs={600}
                        delayMs={300 + i * 120}
                      />
                    </a>
                  ))}
              </nav>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
