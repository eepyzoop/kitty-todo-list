"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UserGreeting({
  userId,
  initialDisplayName,
}: {
  userId: string;
  initialDisplayName: string | null;
}) {
  const [name, setName] = useState(initialDisplayName);
  const [asking, setAsking] = useState(!initialDisplayName);
  const [input, setInput] = useState("");

  async function save() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setName(trimmed);
    setAsking(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", userId);
    if (error) alert(error.message);
  }

  function openEdit() {
    setInput(name ?? "");
    setAsking(true);
  }

  return (
    <>
      {name && (
        <>
          <button onClick={openEdit} className="hover:text-accent transition">
            Hi, {name}
          </button>
          <span>·</span>
        </>
      )}
      {asking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 animate-modal-fade">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            className="bg-card border border-line rounded-3xl p-8 flex flex-col gap-4 items-center animate-modal-pop"
          >
            <p className="text-lg font-medium">What should I call you?</p>
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Your name…"
              className="rounded-full border border-line px-4 py-2 outline-none focus:border-accent text-center"
            />
            <button
              type="submit"
              className="rounded-full bg-accent text-white px-5 py-2 font-medium hover:opacity-90 transition"
            >
              Nice to meet you!
            </button>
          </form>
        </div>
      )}
    </>
  );
}
