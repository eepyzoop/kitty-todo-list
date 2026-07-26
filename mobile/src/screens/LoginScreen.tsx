import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login() {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Task<Text style={{ color: "#8b7cc4" }}>Kitty</Text>
      </Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable style={styles.button} onPress={login} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Logging in…" : "Log in"}</Text>
      </Pressable>
      <Text style={styles.hint}>Sign up on the TaskKitty web app first.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f2fb", justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 26, fontWeight: "600", textAlign: "center", marginBottom: 12, color: "#59516b" },
  error: { color: "#e05a5a", textAlign: "center" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e6def5",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  button: { backgroundColor: "#8b7cc4", borderRadius: 999, paddingVertical: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  hint: { textAlign: "center", color: "#9c8fb0", fontSize: 12, marginTop: 8 },
});
