"use client";

import { useEffect, useRef, useState } from "react";
import type { Task } from "@/lib/types";
import Confetti, { type ConfettiTrigger } from "./Confetti";

const SIZE = 96;

export default function ProgressPanel({ tasks }: { tasks: Task[] }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayed, setDisplayed] = useState(0);
  const prevDoneRef = useRef(done);
  const [confettiTrigger, setConfettiTrigger] = useState<ConfettiTrigger | null>(
    null,
  );

  useEffect(() => {
    if (done > prevDoneRef.current) {
      setConfettiTrigger({
        id: Date.now(),
        kind: total > 0 && done === total ? "celebrate" : "burst",
      });
    }
    prevDoneRef.current = done;
  }, [done, total]);

  // ease the displayed value toward the real percent
  useEffect(() => {
    let raf = 0;
    const animate = () => {
      let reached = false;
      setDisplayed((d) => {
        const diff = percent - d;
        if (Math.abs(diff) < 0.15) {
          reached = true;
          return percent;
        }
        return d + diff * 0.12;
      });
      if (!reached) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [percent]);

  // draw the ring: devicePixelRatio-aware, redraws on resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function draw() {
      const dpr = window.devicePixelRatio || 1;
      if (canvas!.width !== SIZE * dpr) {
        canvas!.width = SIZE * dpr;
        canvas!.height = SIZE * dpr;
        canvas!.style.width = SIZE + "px";
        canvas!.style.height = SIZE + "px";
      }
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, SIZE, SIZE);
      const cx = SIZE / 2;
      const cy = SIZE / 2;
      const r = SIZE / 2 - 8;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#eee7de";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "#f4a259";
      ctx.beginPath();
      const start = -Math.PI / 2;
      const end = start + (displayed / 100) * Math.PI * 2;
      ctx.arc(cx, cy, r, start, end);
      ctx.stroke();
    }
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [displayed]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={wrapperRef} className="relative" style={{ width: SIZE, height: SIZE }}>
        <canvas ref={canvasRef} className="block" />
        <div className="absolute inset-0 flex items-center justify-center text-lg font-medium">
          {Math.round(displayed)}%
        </div>
      </div>
      <p className="text-xs text-foreground/50">
        {done}/{total || 0} done
      </p>
      <Confetti trigger={confettiTrigger} originRef={wrapperRef} />
    </div>
  );
}
