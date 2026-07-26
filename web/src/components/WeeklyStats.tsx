"use client";

import { useEffect, useRef, useState } from "react";
import type { Task } from "@/lib/types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CHART_W = 240;
const CHART_H = 64;
const BAR_GAP = 8;
const BAR_W = (CHART_W - BAR_GAP * 6) / 7;
const STAGGER_MS = 40;
const DURATION_MS = 450;

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function useCountUp(target: number, reduced: boolean) {
  const [value, setValue] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      setValue(Math.round(target * easeOutCubic(t)));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced]);
  return value;
}

function computeStats(tasks: Task[]) {
  const counts = new Map<string, number>();
  for (const t of tasks) {
    if (!t.done || !t.done_at) continue;
    const key = dateKey(new Date(t.done_at));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const cursor = new Date(today);
  if (!counts.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (counts.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const bestDay = counts.size ? Math.max(...counts.values()) : 0;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return {
      label: DAY_LABELS[d.getDay()],
      count: counts.get(dateKey(d)) ?? 0,
      isToday: i === 6,
    };
  });

  return { streak, bestDay, last7 };
}

export default function WeeklyStats({ tasks }: { tasks: Task[] }) {
  const reduced = usePrefersReducedMotion();
  const { streak, bestDay, last7 } = computeStats(tasks);
  const streakDisplay = useCountUp(streak, reduced);
  const bestDayDisplay = useCountUp(bestDay, reduced);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const max = Math.max(1, ...last7.map((d) => d.count));

    function draw(progressForBar: (i: number) => number) {
      const dpr = window.devicePixelRatio || 1;
      if (canvas!.width !== CHART_W * dpr) {
        canvas!.width = CHART_W * dpr;
        canvas!.height = CHART_H * dpr;
        canvas!.style.width = CHART_W + "px";
        canvas!.style.height = CHART_H + "px";
      }
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, CHART_W, CHART_H);
      last7.forEach((day, i) => {
        const targetH = (day.count / max) * (CHART_H - 4);
        const h = Math.max(targetH * progressForBar(i), 2);
        const x = i * (BAR_W + BAR_GAP);
        const y = CHART_H - h;
        ctx.fillStyle = day.isToday ? "#6f5da8" : "#8b7cc4";
        ctx.beginPath();
        ctx.roundRect(x, y, BAR_W, h, Math.min(4, BAR_W / 2));
        ctx.fill();
      });
    }

    const drawFinal = () => draw(() => 1);

    if (reduced) {
      drawFinal();
      window.addEventListener("resize", drawFinal);
      return () => window.removeEventListener("resize", drawFinal);
    }

    let raf = 0;
    const start = performance.now();
    function animate(now: number) {
      const elapsed = now - start;
      draw((i) => easeOutCubic(Math.min(1, Math.max(0, (elapsed - i * STAGGER_MS) / DURATION_MS))));
      if (elapsed - 6 * STAGGER_MS < DURATION_MS) {
        raf = requestAnimationFrame(animate);
      }
    }
    raf = requestAnimationFrame(animate);
    window.addEventListener("resize", drawFinal);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", drawFinal);
    };
  }, [tasks, reduced]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <p className="text-sm font-medium text-foreground/70">Weekly stats</p>

      <div className="flex items-center gap-1.5 text-base font-medium">
        <span>{streakDisplay} day streak</span>
        <span
          className={streak > 0 ? "inline-block animate-flame-pulse" : "inline-block"}
        >
          🔥
        </span>
      </div>

      <div>
        <canvas ref={canvasRef} className="block" />
        <div className="flex justify-between" style={{ width: CHART_W }}>
          {last7.map((day, i) => (
            <span
              key={i}
              className={`text-xs text-center ${
                day.isToday ? "font-semibold text-foreground" : "text-foreground/40"
              }`}
              style={{ width: BAR_W }}
            >
              {day.label}
            </span>
          ))}
        </div>
      </div>

      <p className="text-xs text-foreground/50">Best day: {bestDayDisplay} tasks</p>
    </div>
  );
}
