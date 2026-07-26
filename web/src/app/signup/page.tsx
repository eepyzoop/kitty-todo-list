import Link from "next/link";
import { signUp } from "../login/actions";
import ThemeToggle from "@/components/ThemeToggle";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="relative flex flex-1 items-center justify-center p-6">
      <div className="fixed top-4 right-4 z-40">
        <ThemeToggle />
      </div>
      <form
        action={signUp}
        className="w-full max-w-sm bg-card border border-line rounded-3xl p-8 flex flex-col gap-4"
      >
        <h1 className="text-2xl font-medium text-center mb-2">
          Task<span className="text-accent">Kitty</span>
        </h1>
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="rounded-full border border-line px-4 py-2 outline-none focus:border-accent"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          minLength={6}
          className="rounded-full border border-line px-4 py-2 outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-full bg-accent text-white py-2 font-medium hover:opacity-90 transition"
        >
          Sign up
        </button>
        <p className="text-sm text-center text-foreground/70">
          Already have an account?{" "}
          <Link href="/login" className="text-accent">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
