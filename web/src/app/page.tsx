import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      <section className="w-full max-w-2xl bg-card border border-line rounded-3xl p-8">
        <p className="text-foreground/70">
          Tasks are coming in the next step. You&apos;re signed in.
        </p>
      </section>
    </main>
  );
}
