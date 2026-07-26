import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

function DownloadCard({
  title,
  blurb,
  action,
}: {
  title: string;
  blurb: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-0 bg-card border border-line rounded-3xl p-6 flex flex-col gap-3">
      <h2 className="text-lg font-medium">{title}</h2>
      <p className="text-sm text-foreground/70 flex-1">{blurb}</p>
      {action}
    </div>
  );
}

function BuildItYourself({ steps }: { steps: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-foreground/50">
        Not pre-built — build it yourself:
      </p>
      <pre className="text-xs bg-background border border-line rounded-xl p-3 overflow-x-auto">
        {steps}
      </pre>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <main className="flex flex-1 flex-col items-center p-6 gap-6">
      <header className="w-full max-w-4xl flex items-center justify-between">
        <h1 className="text-2xl font-medium">
          Task<span className="text-accent">Kitty</span>
        </h1>
        <div className="flex items-center gap-3 text-sm text-foreground/70">
          <Link href="/" className="hover:text-accent transition">
            Back to app
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <p className="w-full max-w-4xl text-sm text-foreground/70 -mt-2">
        Grab TaskKitty for your platform. All three talk to the same
        Supabase backend as the web app, in realtime.
      </p>

      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 items-stretch">
        <DownloadCard
          title="Chrome Extension"
          blurb="Popup-only: log in, quick-add a task, check it off, without leaving the tab you're on."
          action={
            <div className="flex flex-col gap-2">
              <a
                href="/downloads/taskkitty-extension.zip"
                download
                className="rounded-full bg-accent text-white px-5 py-2 font-medium text-center hover:opacity-90 transition"
              >
                Download .zip
              </a>
              <p className="text-xs text-foreground/50">
                Unzip it, then chrome://extensions → enable Developer mode →
                Load unpacked → select the unzipped folder.
              </p>
            </div>
          }
        />

        <DownloadCard
          title="Windows (.exe)"
          blurb="A Tauri window that stays pinned and visible while you work, loading the live web app."
          action={
            <BuildItYourself
              steps={"cd desktop\nnpm install\nnpm run tauri build\n# installer lands in\n# desktop/src-tauri/target/release/bundle/"}
            />
          }
        />

        <DownloadCard
          title="Android (.apk)"
          blurb="Add and check off tasks the second you think of them, away from a laptop."
          action={
            <BuildItYourself
              steps={"cd mobile\nnpm install\nnpx eas build -p android --profile preview\n# requires a free Expo account"}
            />
          }
        />
      </div>
    </main>
  );
}
