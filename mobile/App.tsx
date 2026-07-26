import { useEffect, useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./src/lib/supabase";
import LoginScreen from "./src/screens/LoginScreen";
import TasksScreen from "./src/screens/TasksScreen";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <View style={{ flex: 1, backgroundColor: "#faf7f2" }} />;

  return (
    <>
      {user ? <TasksScreen user={user} /> : <LoginScreen />}
      <StatusBar style="auto" />
    </>
  );
}
