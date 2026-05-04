"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import BurgerMenu from "./BurgerMenu";
import useHideOnScroll from "@/lib/useHideOnScroll";

const NAV_LINKS = [
  { label: "Les produits", href: "/products" },
  { label: "Faq", href: "/#faq" },
  { label: "Notre histoire", href: "/#histoire" },
];

/* ─────────── Outline icons (consistent stroke, rounded caps) ─────────── */
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function SearchIcon(props) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="20.5" y1="20.5" x2="16.65" y2="16.65" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20.5c.8-3.8 3.9-6 7.5-6s6.7 2.2 7.5 6" />
    </svg>
  );
}

/* ─────────── Glass icon button ─────────── */
function GlassIconButton({
  href,
  onClick,
  ariaLabel,
  atTop,
  children,
}) {
  const Comp = href ? Link : "button";
  return (
    <Comp
      href={href}
      onClick={onClick}
      aria-label={ariaLabel}
      type={href ? undefined : "button"}
      className="group relative flex items-center justify-center w-[26px] h-[26px] rounded-[5px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.06] active:scale-[0.97] cursor-pointer"
      style={{
        background: atTop
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.55)",
        border: `1px solid ${
          atTop ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.75)"
        }`,
        backdropFilter: "blur(18px) saturate(180%)",
        WebkitBackdropFilter: "blur(18px) saturate(180%)",
        boxShadow: atTop
          ? "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(255,255,255,0.06), 0 4px 14px rgba(0,0,0,0.18)"
          : "inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.45), 0 6px 18px rgba(40,30,72,0.08)",
        color: atTop ? "rgba(255,255,255,0.95)" : "rgba(40,30,72,0.85)",
      }}
    >
      <span className="w-[12px] h-[12px] flex items-center justify-center transition-transform duration-500 group-hover:rotate-[2deg]">
        {children}
      </span>
    </Comp>
  );
}

/* ─────────── Header ─────────── */
export default function HeaderBar() {
  const [topThreshold, setTopThreshold] = useState(1200);

  useEffect(() => {
    const compute = () => setTopThreshold(window.innerHeight - 80);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const { hidden, atTop } = useHideOnScroll({ topThreshold });

  const pillStyle = {
    borderRadius: 0,
    background: atTop ? "rgba(20,16,32,0.06)" : "rgba(255,255,255,0.06)",
    border: "none",
    borderTop: `1px solid ${
      atTop ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.7)"
    }`,
    backdropFilter: "blur(10px) saturate(200%)",
    WebkitBackdropFilter: "blur(10px) saturate(200%)",
    boxShadow: atTop
      ? "0 14px 40px -10px rgba(0,0,0,0.42), 0 4px 12px rgba(0,0,0,0.18)"
      : "0 14px 36px -10px rgba(91,74,138,0.22), 0 32px 60px -28px rgba(91,74,138,0.20)",
  };

  return (
    <header
      className="fixed inset-x-0 z-50 px-6 md:px-10 transition-[top,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[top]"
      style={{ top: hidden ? "-5rem" : "0.75rem" }}
    >
      <div className="flex items-center justify-center">
        {/* Centered Glass pill (logo + nav + icons) */}
        <div
          className="relative h-12 flex items-center pl-[31px] pr-[13px] transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={pillStyle}
        >
          {/* Logo */}
          <Logo className={atTop ? "text-white" : "text-[#1a142e]"} />

          {/* Subtle divider between logo and nav */}
          <span
            aria-hidden
            className="hidden md:block mx-[22px] h-[18px] w-px"
            style={{
              background: atTop
                ? "rgba(255,255,255,0.18)"
                : "rgba(40,30,72,0.12)",
            }}
          />

          <nav className="hidden md:flex items-center gap-11">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group relative py-2 text-[12px] uppercase tracking-[0.22em] transition-colors duration-300"
                style={{
                  color: atTop ? "rgba(255,255,255,0.78)" : "rgba(40,30,72,0.78)",
                  fontFamily: "var(--font-heading)",
                }}
              >
                <span
                  className="transition-colors duration-300 group-hover:text-white"
                  style={{ color: "inherit" }}
                >
                  {link.label}
                </span>
                <span
                  aria-hidden
                  className="absolute left-1/2 -translate-x-1/2 bottom-0.5 h-px w-0 group-hover:w-[70%] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    background: atTop
                      ? "rgba(255,255,255,0.85)"
                      : "rgba(40,30,72,0.7)",
                  }}
                />
              </Link>
            ))}
          </nav>

          {/* Subtle divider between nav and icons */}
          <span
            aria-hidden
            className="hidden md:block mx-[22px] h-[18px] w-px"
            style={{
              background: atTop
                ? "rgba(255,255,255,0.18)"
                : "rgba(40,30,72,0.12)",
            }}
          />

          <div className="flex items-center gap-1.5">
            <GlassIconButton
              ariaLabel="Recherche"
              atTop={atTop}
              onClick={() => {}}
            >
              <SearchIcon />
            </GlassIconButton>
            <GlassIconButton
              ariaLabel="Mon compte"
              href="/auth/login"
              atTop={atTop}
            >
              <UserIcon />
            </GlassIconButton>
            <BurgerMenu atTop={atTop} />
          </div>
        </div>
      </div>
    </header>
  );
}
