import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";
import TaskApp from "@/components/TaskApp";
import UserGreeting from "@/components/UserGreeting";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("cat_choice, display_name")
    .eq("id", user!.id)
    .single();

  return (
    <main className="flex flex-1 flex-col items-center p-6 gap-6">
      <header className="w-full max-w-6xl flex items-center justify-between">
        <h1 className="text-2xl font-medium">
          Task<span className="text-accent">Kitty</span>
        </h1>
        <div className="flex items-center gap-2 text-sm text-foreground/70">
          <Link href="/download" className="hover:text-accent transition">
            Download apps
          </Link>
          <span>·</span>
          <UserGreeting
            userId={user!.id}
            email={user!.email!}
            initialDisplayName={profile?.display_name ?? null}
          />
          <span>·</span>
          <form action={signOut}>
            <button className="hover:text-accent transition">Log out</button>
          </form>
        </div>
      </header>
      <TaskApp
        userId={user!.id}
        initialTasks={tasks ?? []}
        initialCatChoice={profile?.cat_choice ?? "mikan"}
      />
    </main>
  );
}
