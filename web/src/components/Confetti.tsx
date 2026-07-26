"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export type ConfettiTrigger = { id: number; kind: "burst" | "celebrate" };

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vr: number;
  life: number;
  decay: number;
};

const COLORS = ["#8b7cc4", "#f3b8c0", "#ffd97d", "#a8d5ba", "#8ec5e8"];
const randomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export default function Confetti({
  trigger,
  originRef,
}: {
  trigger: ConfettiTrigger | null;
  originRef: RefObject<HTMLDivElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      canvas!.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (!trigger) return;

    if (trigger.kind === "celebrate") {
      const w = window.innerWidth;
      for (let i = 0; i < 90; i++) {
        particlesRef.current.push({
          x: Math.random() * w,
          y: -20 - Math.random() * 300,
          vx: (Math.random() - 0.5) * 2,
          vy: 1 + Math.random() * 2,
          size: 5 + Math.random() * 5,
          color: randomColor(),
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.3,
          life: 1,
          decay: 0.004,
        });
      }
    } else {
      const rect = originRef.current?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      for (let i = 0; i < 36; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
        const speed = 3 + Math.random() * 5;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4 + Math.random() * 4,
          color: randomColor(),
          rotation: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.3,
          life: 1,
          decay: 0.012,
        });
      }
    }

    if (rafRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const step = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const p of particlesRef.current) {
        p.vy += 0.18;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        p.life -= p.decay;
      }
      particlesRef.current = particlesRef.current.filter(
        (p) => p.life > 0 && p.y < window.innerHeight + 40,
      );
      for (const p of particlesRef.current) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = 0;
      }
    };
    rafRef.current = requestAnimationFrame(step);
  }, [trigger, originRef]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[60]"
    />
  );
}
