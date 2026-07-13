"use client";

import { useEffect, useRef } from "react";

/**
 * A quiet gold constellation rendered on canvas. Deliberately calm: low star
 * count, barely-there drift, slow twinkle, thin connective lines that fade with
 * distance — order that reveals itself rather than particles that demand
 * attention. Pauses when scrolled out of view (IntersectionObserver) and renders
 * a single static frame under reduced motion, so it never costs battery idle.
 */
export function NetworkBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let visible = true;
    let t = 0; // frame counter drives the slow twinkle (no Date needed)

    type Node = { x: number; y: number; vx: number; vy: number; r: number; phase: number; tw: number };
    let nodes: Node[] = [];

    const color = () => {
      // Read the resolved gold so the constellation matches the active theme.
      const styles = getComputedStyle(document.documentElement);
      const gold = styles.getPropertyValue("--gold").trim() || "224 178 96";
      return gold.replace(/\s+/g, ",");
    };
    let rgb = color();

    const density = () => {
      const area = width * height;
      // Sparser than a network — a night sky, ~1 star per 30k px², capped low.
      return Math.max(14, Math.min(42, Math.round(area / 30000)));
    };

    function seed() {
      const count = density();
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        // Barely-there drift — the sky turns slowly.
        vx: (Math.random() - 0.5) * 0.06,
        vy: (Math.random() - 0.5) * 0.06,
        // A few brighter stars among many faint ones.
        r: Math.random() < 0.22 ? 2.1 : 1.3,
        phase: Math.random() * Math.PI * 2,
        tw: 0.004 + Math.random() * 0.006, // twinkle speed
      }));
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      rgb = color();
      seed();
    }

    const LINK = 150;

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      // Connective lines — faint, gold, fading with distance (relationships).
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK) {
            const alpha = (1 - dist / LINK) * 0.16;
            ctx!.strokeStyle = `rgba(${rgb},${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }
      // Stars — each gently twinkling around its own baseline.
      for (const n of nodes) {
        const twinkle = 0.55 + 0.35 * Math.sin(n.phase + t * n.tw);
        ctx!.fillStyle = `rgba(${rgb},${twinkle.toFixed(3)})`;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function step() {
      t += 1;
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }
      draw();
      raf = requestAnimationFrame(step);
    }

    resize();
    if (reduce) {
      draw();
    } else {
      raf = requestAnimationFrame(step);
    }

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (reduce) return;
        if (visible && !raf) raf = requestAnimationFrame(step);
        if (!visible && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    // React to theme changes (class flips on <html>).
    const mo = new MutationObserver(() => {
      rgb = color();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      window.removeEventListener("resize", onResize);
      io.disconnect();
      mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
