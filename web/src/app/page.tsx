import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";
import TaskApp from "@/components/TaskApp";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <main className="flex flex-1 flex-col items-center p-6 gap-6">
      <header className="w-full max-w-2xl flex items-center justify-between">
        <h1 className="text-2xl font-medium">
          Task<span className="text-accent">Kitty</span>
        </h1>
        <form action={signOut}>
          <button className="text-sm text-foreground/70 hover:text-accent transition">
            {user?.email} · Log out
          </button>
        </form>
      </header>
      <TaskApp userId={user!.id} initialTasks={tasks ?? []} />
    </main>
  );
}
