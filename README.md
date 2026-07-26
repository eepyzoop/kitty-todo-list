# TaskKitty

A cute todo app built as one idea across four surfaces — web, a Chrome
extension, Android (Expo), and desktop (Tauri) — all sharing one Supabase
backend. Add and check off tasks; a kawaii cat mascot reacts to your
progress; a Canvas-drawn ring + confetti celebrate completion. Tasks sync in
realtime everywhere.

## Live

- **Web app:** https://web-delta-one-68.vercel.app
- **Repo:** https://github.com/eepyzoop/kitty-todo-list

## Task → feature map

| Task | What it is | Where |
|---|---|---|
| 1 | Architecture — see notes below | (talking points, no code) |
| 2 | Auth + Tasks CRUD | `web/` |
| 3 | Realtime sync (`postgres_changes` on `tasks`) | `web/src/components/TaskApp.tsx` |
| 4 | Canvas progress ring + confetti + cat mascot | `web/src/components/ProgressPanel.tsx`, `Confetti.tsx`, `CatMascot.tsx`, `CatSection.tsx` |
| 5 | Chrome extension popup | `extension/` |
| 6 | Mobile (Expo) + Desktop (Tauri) | `mobile/`, `desktop/` |
| 7 | Public repo & deployment | this repo + the Vercel URL above |

## Architecture notes (Task 1 talking points)

Supabase Realtime rides Phoenix channels over a persistent WebSocket between
the browser/extension/app and Supabase directly — it does **not** go through
Vercel's serverless functions, which can't hold a long-lived connection open.
That's exactly why this architecture fits Vercel: the Next.js app is only
responsible for initial page render + auth; once the client has a Supabase
session, it opens its own WebSocket straight to Supabase and stays connected
for as long as the tab/popup/app is open, independent of any serverless
function lifecycle.

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

## Out of scope (by design)

Webcam/CV, content scripts, group features, tags/priorities/due-date
reminders, drag-and-drop reordering, 2FA/emails/reCAPTCHA, offline sync,
dark mode.

## Testing checklist

- [x] Incognito: Vercel URL, signup → login → add/edit/check/delete tasks.
- [x] Two windows side by side: checking a task in one updates the other
      instantly; same between the extension popup and the web app.
- [x] Canvas: ring animates to the correct %, confetti fires on check-off,
      full-screen celebration at 100%; devicePixelRatio-aware, redraws on
      resize; no libraries used for it.
- [x] Cat: all 3 coats correct (whiskers visible on Kuro/black), moods
      switch at the right thresholds (0% sleepy, 1–69% reading, 70–99%
      happy, 100% celebration, >8 open tasks → worried, regardless of %).
- [x] Mobile (Expo web smoke-tested; verify once more on a real device via
      Expo Go): adds a task that appears on web in realtime.
- [ ] Tauri: opens a window titled "TaskKitty" loading the live app
      (unverified in the build environment — no Rust toolchain installed
      there; verify on a machine with Rust set up).
- [x] Repo is public, no secrets committed, all links tested incognito.

