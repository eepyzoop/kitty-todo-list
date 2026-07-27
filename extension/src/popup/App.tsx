import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { CatChoice, Task } from "../lib/types";
import CatMascot, { type CatMood } from "../components/CatMascot";
import ProgressRing from "../components/ProgressRing";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [catChoice, setCatChoice] = useState<CatChoice>("mikan");
  const [newTitle, setNewTitle] = useState("");

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
    if (done > prevDoneRef.current) setReactionId((id) => id + 1);
    prevDoneRef.current = done;
  }, [done]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setTasks(data ?? []));

    supabase
      .from("profiles")
      .select("cat_choice")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setCatChoice((data?.cat_choice as CatChoice) ?? "mikan"));

    const channel = supabase
      .channel(`tasks-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as Task;
            setTasks((prev) => (prev.some((t) => t.id === row.id) ? prev : [...prev, row]));
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as Task;
            setTasks((prev) => prev.map((t) => (t.id === row.id ? row : t)));
          } else if (payload.eventType === "DELETE") {
            const oldId = (payload.old as { id: string }).id;
            setTasks((prev) => prev.filter((t) => t.id !== oldId));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
  }

  async function addTask() {
    const title = newTitle.trim();
    if (!title || !user) return;
    setNewTitle("");
    const { data, error } = await supabase
      .from("tasks")
      .insert({ user_id: user.id, title })
      .select()
      .single();
    if (!error && data) setTasks((prev) => [...prev, data]);
  }

  async function toggleTask(task: Task) {
    const done = !task.done;
    const done_at = done ? new Date().toISOString() : null;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done, done_at } : t)));
    await supabase.from("tasks").update({ done, done_at }).eq("id", task.id);
  }

  if (loading) return null;

  if (!user) {
    return (
      <form onSubmit={login} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <h1 style={{ fontSize: 18, margin: "0 0 8px", textAlign: "center" }}>
          Task<span style={{ color: "#8b7cc4" }}>Kitty</span>
        </h1>
        {loginError && <p style={{ color: "#e05a5a", fontSize: 12, margin: 0 }}>{loginError}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Log in
        </button>
        <p style={{ fontSize: 11, color: "#9c8fb0", textAlign: "center", margin: 0 }}>
          Sign up on the TaskKitty web app first.
        </p>
      </form>
    );
  }

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <ProgressRing percent={percent} />
        <CatMascot coat={catChoice} mood={mood} reactionId={reactionId} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTask();
        }}
        style={{ display: "flex", gap: 6 }}
      >
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button type="submit" style={buttonStyle}>
          Add
        </button>
      </form>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {tasks.map((task) => (
          <li key={task.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => toggleTask(task)}
              aria-label={task.done ? "Mark as not done" : "Mark as done"}
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                border: `2px solid ${task.done ? "#8b7cc4" : "#e6def5"}`,
                background: task.done ? "#8b7cc4" : "transparent",
                flexShrink: 0,
                cursor: "pointer",
              }}
            />
            <span
              style={{
                fontSize: 13,
                textDecoration: task.done ? "line-through" : "none",
                color: task.done ? "#9c8fb0" : "#59516b",
              }}
            >
              {task.title}
            </span>
          </li>
        ))}
        {tasks.length === 0 && (
          <li style={{ fontSize: 12, color: "#9c8fb0", textAlign: "center", padding: "8px 0" }}>
            No tasks yet.
          </li>
        )}
      </ul>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: "1.5px solid #e6def5",
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: 13,
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  padding: "6px 14px",
  fontSize: 13,
  fontWeight: 600,
  background: "#8b7cc4",
  color: "#fff",
  cursor: "pointer",
};
