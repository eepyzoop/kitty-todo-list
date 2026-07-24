import Link from "next/link";
import { signIn } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <form
        action={signIn}
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
          className="rounded-full border border-line px-4 py-2 outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-full bg-accent text-white py-2 font-medium hover:opacity-90 transition"
        >
          Log in
        </button>
        <p className="text-sm text-center text-foreground/70">
          No account?{" "}
          <Link href="/signup" className="text-accent">
            Sign up
          </Link>
        </p>
      </form>
    </main>
  );
}
