"use client";

import { useEffect, useState } from "react";

export default function WhiteFrame() {
  const [size, setSize] = useState({ w: 1440, h: 900 });

  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const { w, h } = size;
  const b = 16;
  const r = 24;
  const cx = w / 2;

  const path = `
    M 0,0 L ${w},0 L ${w},${h} L 0,${h} Z
    M ${b + r},${b}
    L ${cx - 250},${b}
    C ${cx - 190},${b} ${cx - 120},${b + 55} ${cx - 90},${b + 55}
    L ${cx + 90},${b + 55}
    C ${cx + 120},${b + 55} ${cx + 190},${b} ${cx + 250},${b}
    L ${w - b - r},${b}
    Q ${w - b},${b} ${w - b},${b + r}
    L ${w - b},${h - b - r}
    Q ${w - b},${h - b} ${w - b - r},${h - b}
    L ${b + r},${h - b}
    Q ${b},${h - b} ${b},${h - b - r}
    L ${b},${b + r}
    Q ${b},${b} ${b + r},${b}
    Z
  `;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-17.5 flex items-center justify-center z-10">
        <span className="text-xl font-bold tracking-widest uppercase text-black/70">La Fleur</span>
      </div>
      <svg className="w-full h-full" viewBox={`0 0 ${w} ${h}`}>
        <path d={path} fill="white" fillRule="evenodd" />
      </svg>
    </div>
  );
}
