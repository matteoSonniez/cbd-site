"use client";

import { useEffect, useRef, useState } from "react";

export default function useHideOnScroll({
  threshold = 80,
  topThreshold = 80,
  delta = 6,
} = {}) {
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    setAtTop(window.scrollY < topThreshold);

    const onScroll = () => {
      const y = window.scrollY;
      const diff = y - lastY.current;

      setAtTop(y < topThreshold);

      if (y < threshold) {
        setHidden(false);
      } else if (diff > delta) {
        setHidden(true);
      } else if (diff < -delta) {
        setHidden(false);
      }

      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, topThreshold, delta]);

  return { hidden, atTop };
}
