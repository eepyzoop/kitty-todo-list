"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CatChoice, Task } from "@/lib/types";
import CatMascot, { type CatMood } from "./CatMascot";

const CAT_OPTIONS: { id: CatChoice; label: string; color: string }[] = [
  { id: "mikan", label: "Mikan", color: "#f4a259" },
  { id: "kuro", label: "Kuro", color: "#3d3741" },
  { id: "latte", label: "Shiro", color: "#ffffff" },
];

export default function CatSection({
  userId,
  initialCatChoice,
  tasks,
}: {
  userId: string;
  initialCatChoice: CatChoice;
  tasks: Task[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [catChoice, setCatChoice] = useState<CatChoice>(initialCatChoice);

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const openCount = total - done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const mood: CatMood =
    percent === 100
      ? "celebration"
      : openCount > 8
        ? "worried"
        : percent === 0
          ? "sleepy"
          : percent < 70
            ? "reading"
            : "happy";

  const prevDoneRef = useRef(done);
  const [reactionId, setReactionId] = useState(0);
  useEffect(() => {
    if (done > prevDoneRef.current) {
      setReactionId((id) => id + 1);
    }
    prevDoneRef.current = done;
  }, [done]);

  async function pickCat(choice: CatChoice) {
    setCatChoice(choice);
    const { error } = await supabase
      .from("profiles")
      .update({ cat_choice: choice })
      .eq("id", userId);
    if (error) alert(error.message);
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <CatMascot coat={catChoice} mood={mood} reactionId={reactionId} />
      <div className="flex gap-2">
        {CAT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => pickCat(opt.id)}
            aria-label={opt.label}
            aria-pressed={catChoice === opt.id}
            title={opt.label}
            className={`w-6 h-6 rounded-full border-2 transition ${
              catChoice === opt.id ? "border-accent scale-110" : "border-line"
            }`}
            style={{ background: opt.color }}
          />
        ))}
      </div>
    </div>
  );
}
