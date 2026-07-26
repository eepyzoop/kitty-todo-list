import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Task } from "../lib/types";

function catEmoji(percent: number, openCount: number) {
  if (percent === 100) return "🎉🐱";
  if (openCount > 8) return "🙀";
  if (percent === 0) return "😴";
  if (percent < 70) return "📖🐱";
  return "😺";
}

export default function TasksScreen({ user }: { user: User }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
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
  }, [user.id]);

  async function addTask() {
    const title = newTitle.trim();
    if (!title) return;
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

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const openCount = total - done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Task<Text style={{ color: "#8b7cc4" }}>Kitty</Text>
        </Text>
        <Pressable onPress={() => supabase.auth.signOut()}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{percent}%</Text>
        <Text style={styles.catEmoji}>{catEmoji(percent, openCount)}</Text>
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a task…"
          value={newTitle}
          onChangeText={setNewTitle}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <Pressable style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ gap: 8, paddingTop: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>No tasks yet — add one above.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.taskRow} onPress={() => toggleTask(item)}>
            <View style={[styles.checkbox, item.done && styles.checkboxDone]} />
            <Text style={[styles.taskTitle, item.done && styles.taskTitleDone]}>{item.title}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f2fb", paddingTop: 60, paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "600", color: "#59516b" },
  logout: { color: "#9c8fb0", fontSize: 13 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 20 },
  progressTrack: { flex: 1, height: 10, borderRadius: 999, backgroundColor: "#e6def5", overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#8b7cc4", borderRadius: 999 },
  progressLabel: { fontSize: 13, color: "#59516b", width: 36 },
  catEmoji: { fontSize: 22 },
  addRow: { flexDirection: "row", gap: 8, marginTop: 20 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e6def5",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addButton: { backgroundColor: "#8b7cc4", borderRadius: 999, paddingHorizontal: 18, justifyContent: "center" },
  addButtonText: { color: "#fff", fontWeight: "600" },
  empty: { textAlign: "center", color: "#9c8fb0", marginTop: 20 },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e6def5",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  checkbox: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#e6def5" },
  checkboxDone: { backgroundColor: "#8b7cc4", borderColor: "#8b7cc4" },
  taskTitle: { fontSize: 14, color: "#59516b" },
  taskTitleDone: { textDecorationLine: "line-through", color: "#9c8fb0" },
});
