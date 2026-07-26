import { useEffect, useState } from "react";
import type { CatChoice } from "@/lib/types";

export type CatMood = "sleepy" | "reading" | "happy" | "celebration" | "worried";

const OUTLINE = "#4a4045";

const COATS: Record<CatChoice, { coat: string; face: string; innerear: string; whisker: string }> = {
  mikan: { coat: "#f4a259", face: "#4a4045", innerear: "#f8c3b4", whisker: "#4a404573" },
  kuro: { coat: "#3d3741", face: "#f6f2ec", innerear: "#bb8f9c", whisker: "#f6f2ecd9" },
  latte: { coat: "#ffffff", face: "#4a4045", innerear: "#f3b8c0", whisker: "#4a404573" },
};

const BUBBLE: Record<CatMood, string | null> = {
  sleepy: "z Z z",
  reading: null,
  happy: null,
  celebration: "purrfect!",
  worried: "mrrp?",
};

export default function CatMascot({
  coat: coatChoice,
  mood,
  reactionId = 0,
}: {
  coat: CatChoice;
  mood: CatMood;
  /** Bump this on every check-off to trigger a brief smile + paw wave. */
  reactionId?: number;
}) {
  const { coat, face, innerear, whisker } = COATS[coatChoice];
  const eyesOpen = mood === "happy" || mood === "celebration" || mood === "worried";
  const browsVisible = mood === "worried";
  const bubble = BUBBLE[mood];

  const [waving, setWaving] = useState(false);
  useEffect(() => {
    if (reactionId <= 0) return;
    const onTimer = setTimeout(() => setWaving(true), 0);
    const offTimer = setTimeout(() => setWaving(false), 700);
    return () => {
      clearTimeout(onTimer);
      clearTimeout(offTimer);
    };
  }, [reactionId]);

  const smiling = mood === "celebration" || waving;

  return (
    <div className="relative flex flex-col items-center">
      {bubble && (
        <div
          className="absolute -top-1 -translate-y-full whitespace-nowrap rounded-xl border-2 bg-white px-3 py-1 text-xs"
          style={{ borderColor: OUTLINE, color: OUTLINE }}
        >
          {bubble}
        </div>
      )}
      <svg viewBox="335 175 330 310" className="w-28 h-28">
        <g className="cat-breathe" style={{ transformOrigin: "460px 430px" }}>
          <g className="cat-tail" style={{ transformOrigin: "588px 430px" }}>
            <path
              d="M588 432 q60 -10 54 -74 q-2 -22 -20 -30"
              fill="none"
              stroke={OUTLINE}
              strokeWidth={30}
              strokeLinecap="round"
            />
            <path
              d="M588 432 q60 -10 54 -74 q-2 -22 -20 -30"
              fill="none"
              stroke={coat}
              strokeWidth={24}
              strokeLinecap="round"
            />
          </g>

          <path
            d="M352 470 q-8 -74 108 -76 q116 2 108 76 Z"
            fill={coat}
            stroke={OUTLINE}
            strokeWidth={3.5}
          />

          <g style={{ transformOrigin: "460px 360px" }}>
            <g>
              <path
                d="M382 252 L370 184 Q416 204 436 236 Z"
                fill={coat}
                stroke={OUTLINE}
                strokeWidth={3.5}
                strokeLinejoin="round"
              />
              <path d="M390 238 L384 202 Q410 216 420 234 Z" fill={innerear} />
            </g>
            <g>
              <path
                d="M538 252 L550 184 Q504 204 484 236 Z"
                fill={coat}
                stroke={OUTLINE}
                strokeWidth={3.5}
                strokeLinejoin="round"
              />
              <path d="M530 238 L536 202 Q510 216 500 234 Z" fill={innerear} />
            </g>

            <ellipse cx={460} cy={312} rx={112} ry={90} fill={coat} stroke={OUTLINE} strokeWidth={3.5} />

            <ellipse cx={386} cy={336} rx={13} ry={7} fill="#f3b8c0" opacity={0.55} />
            <ellipse cx={534} cy={336} rx={13} ry={7} fill="#f3b8c0" opacity={0.55} />

            <g
              stroke={face}
              strokeWidth={3.6}
              strokeLinecap="round"
              fill="none"
              className="transition-opacity duration-200"
              style={{ opacity: browsVisible ? 1 : 0 }}
            >
              <path d="M400 293 L426 301" />
              <path d="M494 301 L520 293" />
            </g>

            <g
              className="transition-opacity duration-200"
              style={{ opacity: eyesOpen ? 0 : 1 }}
            >
              <g stroke={face} strokeWidth={4} strokeLinecap="round" fill="none">
                <path d="M406 318 q9 8 18 0" />
                <path d="M496 318 q9 8 18 0" />
              </g>
              <g stroke={face} strokeWidth={3} strokeLinecap="round" fill="none">
                <path d="M406 317 l-3 -7" />
                <path d="M412 315 l-1 -8" />
                <path d="M514 317 l3 -7" />
                <path d="M508 315 l1 -8" />
              </g>
            </g>

            <g
              className="transition-all duration-200"
              style={{
                opacity: eyesOpen ? 1 : 0,
                transform: mood === "worried" ? "scaleY(.68) translateY(2px)" : undefined,
                transformOrigin: "460px 316px",
              }}
            >
              <g fill={face}>
                <ellipse cx={415} cy={316} rx={4.6} ry={7} />
                <ellipse cx={505} cy={316} rx={4.6} ry={7} />
              </g>
              <g stroke={face} strokeWidth={2.8} strokeLinecap="round" fill="none">
                <path d="M412 310 l-3 -7" />
                <path d="M416 309 l-1 -8" />
                <path d="M508 310 l3 -7" />
                <path d="M504 309 l1 -8" />
              </g>
            </g>

            <path
              d="M448 340 q6 6 12 0 q6 6 12 0"
              fill="none"
              stroke={face}
              strokeWidth={3.6}
              strokeLinecap="round"
              className="transition-opacity duration-200"
              style={{ opacity: smiling ? 0 : 1 }}
            />
            <path
              d="M432 334 Q460 368 488 334"
              fill="none"
              stroke={face}
              strokeWidth={4.5}
              strokeLinecap="round"
              className="transition-opacity duration-200"
              style={{ opacity: smiling ? 1 : 0 }}
            />

            <g stroke={whisker} strokeWidth={2.4} strokeLinecap="round">
              <path d="M352 322 h-26" />
              <path d="M354 336 q-14 2 -25 7" />
              <path d="M568 322 h26" />
              <path d="M566 336 q14 2 25 7" />
            </g>
          </g>

          <g>
            <rect x={408} y={442} width={36} height={30} rx={15} fill={coat} stroke={OUTLINE} strokeWidth={3.5} />
            <path d="M420 458 v8 M432 458 v8" stroke={OUTLINE} strokeWidth={2.4} strokeLinecap="round" />
          </g>
          <g
            key={reactionId}
            className={waving ? "cat-paw-wave" : undefined}
            style={{ transformOrigin: "494px 442px" }}
          >
            <rect x={476} y={442} width={36} height={30} rx={15} fill={coat} stroke={OUTLINE} strokeWidth={3.5} />
            <path d="M488 458 v8 M500 458 v8" stroke={OUTLINE} strokeWidth={2.4} strokeLinecap="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}
