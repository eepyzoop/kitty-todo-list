import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Task } from "../lib/types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskValue, setEditingTaskValue] = useState("");

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

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
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setDisplayName(data?.display_name ?? null);
        setProfileLoaded(true);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setTasks(data ?? []));

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

  async function deleteTask(task: Task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    await supabase.from("tasks").delete().eq("id", task.id);
  }

  function startEditTask(task: Task) {
    setEditingTaskId(task.id);
    setEditingTaskValue(task.title);
  }

  async function saveEditTask(task: Task) {
    const title = editingTaskValue.trim();
    setEditingTaskId(null);
    if (!title || title === task.title) return;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, title } : t)));
    await supabase.from("tasks").update({ title }).eq("id", task.id);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  async function saveName() {
    const trimmed = nameInput.trim();
    if (!trimmed || !user) return;
    setDisplayName(trimmed);
    setEditingName(false);
    await supabase.from("profiles").update({ display_name: trimmed }).eq("id", user.id);
  }

  function openEditName() {
    setNameInput(displayName ?? "");
    setEditingName(true);
  }

  if (loading) return null;

  if (!user) {
    return (
      <form onSubmit={login} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <h1 style={{ fontSize: 18, margin: "0 0 8px", textAlign: "center" }}>
          🐱 Task<span style={{ color: "#8b7cc4" }}>Kitty</span>
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

  if (!profileLoaded) return null;

  if (!displayName || editingName) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveName();
        }}
        style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}
      >
        <h1 style={{ fontSize: 18, margin: "0 0 8px", textAlign: "center" }}>
          🐱 Task<span style={{ color: "#8b7cc4" }}>Kitty</span>
        </h1>
        <p style={{ fontSize: 13, textAlign: "center", margin: 0, color: "#59516b" }}>
          What should I call you?
        </p>
        <input
          autoFocus
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Your name…"
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          {displayName ? "Save" : "Nice to meet you!"}
        </button>
        {displayName && (
          <button
            type="button"
            onClick={() => setEditingName(false)}
            style={{ border: "none", background: "none", color: "#9c8fb0", fontSize: 12, cursor: "pointer" }}
          >
            Cancel
          </button>
        )}
      </form>
    );
  }

  const greeting = `${displayName}'s todo`;

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTask();
        }}
        style={{ display: "flex", gap: 6 }}
      >
        <input
          autoFocus
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button type="submit" style={buttonStyle}>
          Add
        </button>
      </form>

      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          maxHeight: 220,
          overflowY: "auto",
        }}
      >
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
            {editingTaskId === task.id ? (
              <input
                autoFocus
                value={editingTaskValue}
                onChange={(e) => setEditingTaskValue(e.target.value)}
                onBlur={() => saveEditTask(task)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEditTask(task);
                  if (e.key === "Escape") setEditingTaskId(null);
                }}
                style={{ ...inputStyle, flex: 1, padding: "2px 8px" }}
              />
            ) : (
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  textDecoration: task.done ? "line-through" : "none",
                  color: task.done ? "#9c8fb0" : "#59516b",
                }}
              >
                {task.title}
              </span>
            )}
            {editingTaskId !== task.id && (
              <button
                onClick={() => startEditTask(task)}
                aria-label="Edit task"
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: "#9c8fb0",
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                ✎
              </button>
            )}
            <button
              onClick={() => deleteTask(task)}
              aria-label="Delete task"
              style={{
                border: "none",
                background: "none",
                padding: 0,
                cursor: "pointer",
                color: "#9c8fb0",
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </li>
        ))}
        {tasks.length === 0 && (
          <li style={{ fontSize: 12, color: "#9c8fb0", textAlign: "center", padding: "8px 0" }}>
            No tasks yet.
          </li>
        )}
      </ul>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#e6def5",
          borderRadius: 999,
          padding: "6px 10px",
        }}
      >
        <button
          onClick={openEditName}
          title="Edit name"
          style={{
            border: "none",
            background: "none",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
            fontSize: 12,
            fontWeight: 600,
            color: "#59516b",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {greeting}
        </button>
        <div style={{ flex: 1, height: 6, borderRadius: 999, background: "#fff", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${percent}%`,
              borderRadius: 999,
              background: "#8b7cc4",
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <span style={{ fontSize: 11, color: "#59516b", minWidth: 26, textAlign: "right" }}>{percent}%</span>
        <button
          onClick={logout}
          title="Log out"
          aria-label="Log out"
          style={{
            border: "none",
            background: "none",
            padding: 0,
            display: "flex",
            cursor: "pointer",
            color: "#59516b",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
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
