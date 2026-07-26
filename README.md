# TaskKitty

A cute todo app built as one idea across four surfaces — web, a Chrome
extension, Android (Expo), and desktop (Tauri) — all sharing one Supabase
backend. Add and check off tasks; a kawaii cat mascot reacts to your
progress; a Canvas-drawn ring + confetti celebrate completion. Tasks sync in
realtime everywhere. Built as part of MERN internship @DaFi Labs, week 2 task.

## Live

- **Web app:** https://web-delta-one-68.vercel.app
- **Downloads:** https://web-delta-one-68.vercel.app/download

## Task → feature map

| Task | What it is | Where |
|---|---|---|
| 1 | Auth + Tasks CRUD | `web/` |
| 2 | Realtime sync (`postgres_changes` on `tasks`) | `web/src/components/TaskApp.tsx` |
| 3 | Canvas progress ring + confetti + cat mascot | `web/src/components/ProgressPanel.tsx`, `Confetti.tsx`, `CatMascot.tsx`, `CatSection.tsx` |
| 4 | Chrome extension popup — quick-capture a task from wherever you're browsing, without switching to the web app | `extension/` |
| 5 | Mobile (Expo) — on-the-go add/check-off away from a laptop; Desktop (Tauri) — an always-open companion window, pinned/visible unlike a browser tab | `mobile/`, `desktop/` |

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → paste the full contents of `supabase/schema.sql` → Run.
   (It's idempotent — safe to re-run any time you pull schema changes.)
3. Authentication → Sign In / Providers → Email → turn **off** "Confirm
   email" (this app has no email flow, see OUT OF SCOPE below).
4. Settings → API → copy the **Project URL** and **anon public key**.

### 2. web/

```
cd web
cp .env.example .env.local   # fill in the two Supabase values
npm install
npm run dev                  # http://localhost:3000
```

Deploys to Vercel automatically on push to `main` (Root Directory is set to
`web` in the Vercel project settings — this matters in a monorepo).

### 3. extension/ (Chrome, popup-only)

```
cd extension
cp .env.example .env.local   # same two Supabase values, VITE_ prefixed
npm install
npm run build                # outputs to extension/dist
```

Load it: `chrome://extensions` → enable Developer mode → **Load unpacked**
→ select `extension/dist`. Log in with an account created on the web app
first (the popup has no sign-up form by design).

### 4. mobile/ (Expo, Android)

```
cd mobile
cp .env.example .env          # same two Supabase values, EXPO_PUBLIC_ prefixed
npm install
npx expo start                # scan the QR code with Expo Go
```

### 5. desktop/ (Tauri v2)

Requires Rust (https://rustup.rs) + platform build tools (on Windows:
"Desktop development with C++" workload + WebView2 runtime, usually already
present on Windows 11).

```
cd desktop
npm install
npm run tauri dev
```

Opens a window titled "TaskKitty" loading the deployed web URL above — no
local frontend build, no custom Rust (see `src-tauri/src/main.rs`).

## Downloads page (`/download`)

Manual install instead of publishing to a store — not required for grading
(the extension via `chrome://extensions` → Load unpacked, and the mobile
app via Expo Go, already satisfy the demo), just a nicer way to hand the
build to someone else. The Chrome extension `.zip` is pre-built and
downloads for real; Windows and Android show the exact build command
instead of a binary, since this repo doesn't ship pre-built installers.
