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

export default function HeaderBar() {
  const [topThreshold, setTopThreshold] = useState(1200);

  useEffect(() => {
    const compute = () => setTopThreshold(window.innerHeight - 80);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const { hidden, atTop } = useHideOnScroll({ topThreshold });

  return (
    <header
      className="fixed inset-x-0 z-50 h-16 flex items-center px-10 transition-[top,background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[top]"
      style={{
        top: hidden ? "-4rem" : "0",
        background: atTop ? "transparent" : "rgba(255,255,255,1)",
        borderBottom: atTop ? "1px solid transparent" : "1px solid rgba(255,255,255,0.1)",
        backdropFilter: atTop ? "blur(0px)" : "blur(34px)",
        WebkitBackdropFilter: atTop ? "blur(0px)" : "blur(34px)",
        boxShadow: atTop ? "none" : "0 4px 24px rgba(0, 0, 0, 0.16)",
      }}
    >
      <div className="flex-1 flex justify-start">
        <Logo className={atTop ? "text-white" : "text-black"} />
      </div>

      <nav className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className={`text-sm tracking-[0.18em] transition-colors duration-300 ${
              atTop ? "text-white/70 hover:text-white" : "text-black/70 hover:text-black"
            }`}
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex-1 flex justify-end">
        <BurgerMenu />
      </div>
    </header>
  );
}
