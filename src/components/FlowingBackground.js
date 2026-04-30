"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Simplex noise implementation
function createNoise() {
  const grad3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
  ];
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  function dot(g, x, y) {
    return g[0] * x + g[1] * y;
  }

  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;

  return function noise2D(xin, yin) {
    let n0, n1, n2;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = perm[ii + perm[jj]] % 12;
    const gi1 = perm[ii + i1 + perm[jj + j1]] % 12;
    const gi2 = perm[ii + 1 + perm[jj + 1]] % 12;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0;
    else { t0 *= t0; n0 = t0 * t0 * dot(grad3[gi0], x0, y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0;
    else { t1 *= t1; n1 = t1 * t1 * dot(grad3[gi1], x1, y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0;
    else { t2 *= t2; n2 = t2 * t2 * dot(grad3[gi2], x2, y2); }
    return 70 * (n0 + n1 + n2);
  };
}

function marchingSquares(field, width, height, threshold) {
  const segments = [];

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      const tl = field[y * width + x];
      const tr = field[y * width + x + 1];
      const br = field[(y + 1) * width + x + 1];
      const bl = field[(y + 1) * width + x];

      const config =
        (tl >= threshold ? 8 : 0) |
        (tr >= threshold ? 4 : 0) |
        (br >= threshold ? 2 : 0) |
        (bl >= threshold ? 1 : 0);

      if (config === 0 || config === 15) continue;

      const lerp = (a, b) => (threshold - a) / (b - a);

      const top = { x: x + lerp(tl, tr), y };
      const right = { x: x + 1, y: y + lerp(tr, br) };
      const bottom = { x: x + lerp(bl, br), y: y + 1 };
      const left = { x, y: y + lerp(tl, bl) };

      switch (config) {
        case 1: case 14: segments.push([left, bottom]); break;
        case 2: case 13: segments.push([bottom, right]); break;
        case 3: case 12: segments.push([left, right]); break;
        case 4: case 11: segments.push([top, right]); break;
        case 5: segments.push([left, top], [bottom, right]); break;
        case 6: case 9: segments.push([top, bottom]); break;
        case 7: case 8: segments.push([left, top]); break;
        case 10: segments.push([top, right], [left, bottom]); break;
      }
    }
  }
  return segments;
}

export default function FlowingBackground() {
  const canvasRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const noise = createNoise();
    let animationId;
    let startTime = Date.now() - Math.random() * 60000;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const cellSize = 8;
    const numContours = 6;

    function render() {
      const w = canvas.width;
      const h = canvas.height;
      const cols = Math.ceil(w / cellSize) + 1;
      const rows = Math.ceil(h / cellSize) + 1;
      const time = (Date.now() - startTime) * 0.0005;

      ctx.clearRect(0, 0, w, h);

      // Build noise field
      const field = new Float32Array(cols * rows);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const nx = x * cellSize * 0.0008;
          const ny = y * cellSize * 0.0008;
          let val = 0;
          // Base layer - always present
          val += noise(nx * 1.0, ny * 1.0) * 0.4;
          // Morphing layers - stronger amplitudes for more interaction
          val += noise(nx * 0.7 + time * 0.025, ny * 0.7 - time * 0.018) * (0.3 + 0.5 * Math.sin(time * 0.3));
          val += noise(nx * 1.3 - time * 0.01, ny * 1.3 + time * 0.012) * (0.3 + 0.4 * Math.cos(time * 0.47 + 2.1));
          val += noise(nx * 2.0 + time * 0.006, ny * 2.0 - time * 0.008) * (0.2 + 0.3 * Math.sin(time * 0.71 + 4.3));
          field[y * cols + x] = val;
        }
      }

      // Draw contour lines
      const isHome = pathname === "/";
      ctx.strokeStyle = isHome ? "rgba(255, 255, 255, 0.07)" : "rgba(255, 255, 255, 0.13)";
      ctx.lineWidth = 1;

      for (let i = 0; i < numContours; i++) {
        const threshold = -0.8 + (i / numContours) * 1.6;
        const segments = marchingSquares(field, cols, rows, threshold);

        ctx.beginPath();
        for (const [a, b] of segments) {
          ctx.moveTo(a.x * cellSize, a.y * cellSize);
          ctx.lineTo(b.x * cellSize, b.y * cellSize);
        }
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [pathname]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}
