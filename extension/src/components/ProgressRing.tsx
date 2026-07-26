import { useEffect, useRef, useState } from "react";

const SIZE = 56;

export default function ProgressRing({ percent }: { percent: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayed, setDisplayed] = useState(0);

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
      const r = SIZE / 2 - 6;
      ctx.lineWidth = 6;
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
    <div style={{ position: "relative", width: SIZE, height: SIZE }}>
      <canvas ref={canvasRef} style={{ display: "block" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {Math.round(displayed)}%
      </div>
    </div>
  );
}
