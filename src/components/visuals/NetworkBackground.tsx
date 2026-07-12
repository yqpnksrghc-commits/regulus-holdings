"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle drifting node-and-edge field rendered on canvas. Deliberately quiet:
 * low node count, thin lines, slow motion. It pauses when scrolled out of view
 * (IntersectionObserver) and renders a single static frame under reduced
 * motion, so it never costs battery on an idle tab.
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

    type Node = { x: number; y: number; vx: number; vy: number };
    let nodes: Node[] = [];

    const color = () => {
      // Read the resolved ink color so the field matches the active theme.
      const styles = getComputedStyle(document.documentElement);
      const ink = styles.getPropertyValue("--accent").trim() || "47 86 200";
      return ink.replace(/\s+/g, ",");
    };
    let rgb = color();

    const density = () => {
      const area = width * height;
      // ~1 node per 22k px², capped for performance on large screens.
      return Math.max(18, Math.min(64, Math.round(area / 22000)));
    };

    function seed() {
      const count = density();
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
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

    const LINK = 132;

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      // Edges
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK) {
            const alpha = (1 - dist / LINK) * 0.22;
            ctx!.strokeStyle = `rgba(${rgb},${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }
      // Nodes
      for (const n of nodes) {
        ctx!.fillStyle = `rgba(${rgb},0.6)`;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function step() {
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
