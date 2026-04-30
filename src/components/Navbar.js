"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 p-4">
      <nav
        className="mx-auto max-w-4xl flex items-center justify-between rounded-lg border px-8 py-2.5"
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        }}
      >
        {/* Left links */}
        <div className="hidden md:flex items-center gap-6">
          {["Fleurs", "Huiles", "Résines"].map((label) => (
            <Link
              key={label}
              href="/products"
              className="text-base font-medium tracking-wide text-white/70 hover:text-white duration-0"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Center logo */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-lg font-black uppercase tracking-[0.2em] text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          La Fleur
        </Link>

        {/* Right links */}
        <div className="hidden md:flex items-center gap-6">
          {["Nouveautés"].map((label) => (
            <Link
              key={label}
              href="/products"
              className="text-base font-medium tracking-wide text-white/70 hover:text-white duration-0"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="px-5 py-1.5 text-base font-medium tracking-wide rounded-full border text-white"
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
          >
            Connexion
          </Link>
        </div>
      </nav>
    </header>
  );
}
