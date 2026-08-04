"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CatChoice, Task } from "@/lib/types";
import ProgressPanel from "./ProgressPanel";
import CatSection from "./CatSection";
import WeeklyStats from "./WeeklyStats";

export default function TaskApp({
  userId,
  initialTasks,
  initialCatChoice,
}: {
  userId: string;
  initialTasks: Task[];
  initialCatChoice: CatChoice;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [completedOpen, setCompletedOpen] = useState(true);

  useEffect(() => {
    const channel = supabase
      .channel(`tasks-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as Task;
            setTasks((prev) =>
              prev.some((t) => t.id === row.id) ? prev : [...prev, row],
            );
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as Task;
            setTasks((prev) =>
              prev.map((t) => (t.id === row.id ? row : t)),
            );
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
  }, [supabase, userId]);

  const active = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);

  async function addTask() {
    const title = newTitle.trim();
    if (!title) return;
    setNewTitle("");
    const { data, error } = await supabase
      .from("tasks")
      .insert({ user_id: userId, title })
      .select()
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    setTasks((prev) => [...prev, data]);
  }

  async function toggleTask(task: Task) {
    const done = !task.done;
    const done_at = done ? new Date().toISOString() : null;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done, done_at } : t)),
    );
    const { error } = await supabase
      .from("tasks")
      .update({ done, done_at })
      .eq("id", task.id);
    if (error) {
      alert(error.message);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }
  }

  async function deleteTask(task: Task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      alert(error.message);
      setTasks((prev) => [...prev, task]);
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditingValue(task.title);
  }

  async function saveEdit(task: Task) {
    const title = editingValue.trim();
    setEditingId(null);
    if (!title || title === task.title) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, title } : t)),
    );
    const { error } = await supabase
      .from("tasks")
      .update({ title })
      .eq("id", task.id);
    if (error) {
      alert(error.message);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    }
  }

  return (
    <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 items-start">
      <aside className="w-full md:w-auto shrink-0 bg-card border border-line rounded-3xl p-6 flex flex-col items-center">
        <ProgressPanel tasks={tasks} />
        <CatSection userId={userId} initialCatChoice={initialCatChoice} tasks={tasks} />
      </aside>
      <section className="flex-1 w-full bg-card border border-line rounded-3xl p-8 flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTask();
        }}
        className="flex gap-2"
      >
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 rounded-full border border-line px-4 py-2 outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-full bg-accent text-white px-5 py-2 font-medium hover:opacity-90 transition"
        >
          Add
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {active.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            editing={editingId === task.id}
            editingValue={editingValue}
            onEditingValueChange={setEditingValue}
            onToggle={() => toggleTask(task)}
            onDelete={() => deleteTask(task)}
            onStartEdit={() => startEdit(task)}
            onSaveEdit={() => saveEdit(task)}
            onCancelEdit={() => setEditingId(null)}
          />
        ))}
        {active.length === 0 && (
          <li className="text-center text-sm text-foreground/50 py-4">
            No tasks yet — add one above.
          </li>
        )}
      </ul>

      {completed.length > 0 && (
        <div className="border-t border-line pt-4">
          <button
            onClick={() => setCompletedOpen((v) => !v)}
            className="text-sm text-foreground/60 hover:text-accent transition flex items-center gap-1"
          >
            <span className={`transition-transform ${completedOpen ? "rotate-90" : ""}`}>
              ›
            </span>
            Completed ({completed.length})
          </button>
          {completedOpen && (
            <ul className="flex flex-col gap-2 mt-3">
              {completed.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  editing={editingId === task.id}
                  editingValue={editingValue}
                  onEditingValueChange={setEditingValue}
                  onToggle={() => toggleTask(task)}
                  onDelete={() => deleteTask(task)}
                  onStartEdit={() => startEdit(task)}
                  onSaveEdit={() => saveEdit(task)}
                  onCancelEdit={() => setEditingId(null)}
                />
              ))}
            </ul>
          )}
        </div>
      )}
      </section>
      <aside className="w-full md:w-72 shrink-0 bg-card border border-line rounded-3xl p-6">
        <WeeklyStats tasks={tasks} />
      </aside>
    </div>
  );
}

function TaskRow({
  task,
  editing,
  editingValue,
  onEditingValueChange,
  onToggle,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: {
  task: Task;
  editing: boolean;
  editingValue: string;
  onEditingValueChange: (v: string) => void;
  onToggle: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  return (
    <li className="flex items-center gap-3 group">
      <button
        onClick={onToggle}
        aria-label={task.done ? "Mark as not done" : "Mark as done"}
        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.done
            ? "bg-accent border-accent"
            : "border-line hover:border-accent"
        }`}
      >
        {task.done && (
          <svg
            key={task.id + task.done_at}
            className="w-3.5 h-3.5 text-white animate-check-pop"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {editing ? (
        <input
          autoFocus
          value={editingValue}
          onChange={(e) => onEditingValueChange(e.target.value)}
          onBlur={onSaveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSaveEdit();
            if (e.key === "Escape") onCancelEdit();
          }}
          className="flex-1 rounded-full border border-accent px-3 py-1 outline-none"
        />
      ) : (
        <span
          onClick={onStartEdit}
          className={`flex-1 cursor-text transition-colors duration-200 ${
            task.done ? "line-through text-foreground/40" : ""
          }`}
        >
          {task.title}
        </span>
      )}

      {!editing && (
        <button
          onClick={onStartEdit}
          aria-label="Edit task"
          className="shrink-0 text-foreground/30 hover:text-accent transition opacity-0 group-hover:opacity-100"
        >
          ✎
        </button>
      )}
      <button
        onClick={onDelete}
        aria-label="Delete task"
        className="shrink-0 text-foreground/30 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
      >
        ✕
      </button>
    </li>
  );
}
