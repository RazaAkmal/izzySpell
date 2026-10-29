# IzzySpell — Complete Project Context

> Purpose of this document: give an AI assistant (or a new developer) a complete, accurate picture of the IzzySpell codebase — what it is, how it works, what has been changed, what is still broken, and how work on it is done. Last updated: 2026-10-19.

---

## 1. What IzzySpell is

IzzySpell is a **spelling-practice web app for children** (roughly ages 6–12, grades 1–6).

Core idea:
1. A parent/child **creates a spelling list**, either by uploading a file (PDF, Word, Excel/CSV, text, or a photo of a printed list) or by typing words manually.
2. **AI (OpenAI)** cleans the list (keeps only valid English words), suggests a list name, and generates practice material: syllable-split questions and word groups by spelling pattern.
3. The child **practises** the list in several modes:
   - **Study:** Default mode (drag/click scrambled letters to build the word), Syllables mode (choose the correct syllable split), Word Groups mode (type the missing letters of words grouped by spelling pattern).
   - **Quiz:** hear the word (text-to-speech), type it; optional timers; results and mistakes are saved; "Practice Mistakes" drills the wrong words.
   - **Extra games:** Flash Cards and Scramble Words (AI-generated on first use and cached), and Word Builder (uses a built-in static word set, not the child's list).
4. **Progress** is tracked per list (percentage across study modes), and quiz attempts are stored.

Business context: the developer (repo owner Raza Akmal, GitHub `RazaAkmal/izzySpell`) works on it for a **client via Upwork**, with a **PM** who focuses heavily on performance. Production is deployed on **Vercel** at `https://izzy-spell.vercel.app`.

---

## 2. Tech stack

| Area | Technology |
|---|---|
| Framework | **Next.js 15.0.7** (App Router), dev server uses **Turbopack** (`next dev --turbopack`) |
| UI | **React 18.3**, **TypeScript 5**, **Tailwind CSS 3.4** (custom palette), Headless UI, Heroicons, `tailwind-scrollbar`, `clsx` + `tailwind-merge` |
| Font | "Pally" (Regular 400 + Bold 700, woff2 in `public/fonts`), loaded via `next/font/local` as CSS variable `--font-pally` |
| Database | **PostgreSQL on Neon** (region **ap-southeast-1, Singapore**) |
| ORM | **Prisma 5.22** (`prisma generate` runs in `npm run build`) — pooled URL `PRISMA_URL` (pgbouncer) + `PRISMA_DIRECT_URL` for migrations |
| Auth | **NextAuth (Auth.js) v5 beta** — Credentials provider (username + password), **bcryptjs**, **JWT** sessions |
| AI | **OpenAI SDK v4** — `gpt-4o-mini` (word extraction) and `gpt-4` (list processing, flash cards, scramble words, quiz timer suggestions) |
| OCR | **AWS Textract** (`@aws-sdk/client-textract`) for image uploads via an API route |
| File parsing (browser) | `xlsx` (Excel/CSV), `mammoth` (DOCX), `react-pdftotext` (PDF), `react-dropzone` |
| Image storage | **Supabase Storage** (profile photos, bucket `izzyspell-bucket`) — **the Supabase project no longer exists** (see Known issues) |
| Games/UX | `react-dnd` (+ HTML5/touch backends), `js-confetti`, browser `speechSynthesis` for text-to-speech, `react-timer-hook`, `react-hook-form`, `zod`, `embla-carousel-react` (landing), `moment`, `lodash`, `uuid` |
| Hosting | **Vercel** — serverless functions run in **iad1 (Washington DC, US East)** — note the DB is in Singapore |
| Installed but unused | `tesseract.js` |

### Environment variable names (values are secret — never share them)
`PRISMA_URL`, `PRISMA_DIRECT_URL`, `DATABASE_URL`, `POSTGRES_*` (Neon/Vercel vars), `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (set to the production URL), `NEXT_PUBLIC_BASE_URL` (production URL), `OPENAI_API_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_KEY`, `VERCEL_OIDC_TOKEN`.
`.env` was pulled with the Vercel CLI. **Local `.env` points at the same database as production** — any write during local testing touches live data.

### Scripts
- `npm run dev` — `next dev --turbopack`
- `npm run build` — `prisma generate && next build`
- `npm run start`, `npm run lint`
- Prisma: `npx prisma generate`, `npx prisma migrate deploy`, `npx prisma studio`

---

## 3. Folder structure (key parts)

```
prisma/schema.prisma            # data model (+ migrations/)
public/fonts/                   # Pally fonts
public/images/                  # ~92 MB of images (some very large SVGs on landing page)
public/prompts/systempromt.txt  # system prompt for the main AI list-processing call
src/
  auth.ts                       # NextAuth setup (JWT callbacks, pages.signIn = '/sign-in')
  auth.config.ts                # Credentials provider; dev-only removal of NEXTAUTH_URL/AUTH_URL
  middleware.ts                 # route protection (see §6)
  app/
    layout.tsx                  # root layout; loads Pally via next/font/local
    page.tsx                    # marketing landing page
    globals.css
    (Authentications)/sign-in | signup | forgot-password
    (Home)/dashboard/           # dashboard page + loading.tsx
    lists/                      # all lists page; lists/[listId] = view words of a list
    profile/[id]/               # onboarding: profile form → card details form → success
    spellPractice/[listId]/     # practice hub + all modes/games (see §5)
    actions/                    # server actions ("use server")
    api/                        # REST route handlers
    utils/                      # fileReaderUtil (browser file parsing), supabaseClient, colors
  components/                   # ~47 components (games, modals, dashboard pieces, landing/)
  context/ListNameContext.tsx   # provides list name to mode/game pages
  data/wordBuilderData.ts       # static Word Builder word database (17 words)
  lib/                          # prisma singleton, baseUrl helper, listName helper, types, utils
docs/PROJECT_CONTEXT.md         # this document
```

---

## 4. Data model (Prisma)

- **User** (`users`): `id` (cuid), `name` (unique username — the login identifier; there is **no email**), `password` (bcrypt hash), `firstName`, `lastName`, `age` (e.g. "8-9"), `grade` (e.g. "3rd Grade"), `profileImage` (URL), `profileUpdated` (bool — onboarding complete), **card fields stored as plain text** (`cardNumber`, `cardName`, `expireMonth`, `expireYear`, `cardCVC`), timestamps.
- **SpellingList** (`spelling_list`): `id` (int), `listName`, `userId`, `progress` (Float, 0–100), `shortPaceDuration` / `mediumPaceDuration` / `generousPaceDuration` (AI quiz-timer suggestions, seconds per word, nullable), timestamps. Relations: words, groupedWords, syllableWords, flashCards, scrambleWords, quizAttempts.
- **Word** (`words`): `listId`, `word`, `difficultyLevel` (default "medium"), `type` (default "original"), `studied` (bool).
- **SyllableWord** (`syllable_words`): `listId`, `word`, `options` (JSON array of 4 syllable splits), `answer`, `studied`.
- **GroupedWord** (`grouped_words`): `listId`, `groupName` (e.g. "Group 1"), `word`, `studied`.
- **FlashCard** (`flash_cards`): `listId`, `originalWord`, `options` (JSON, 4 spellings), `correctIndex`, `definition`, `exampleSentence`.
- **ScrambleWord** (`scramble_words`): `listId`, `originalWord`, `scrambledOptions` (JSON, 4 options, exactly one valid anagram).
- **QuizAttempt** (`quiz_attempts`): `userId`, `spellingListId`, `totalQuestions`, `correctAnswers`, `incorrectAnswers`, `grade` (Decimal 5,2), `isTimed`, `timerType` ("word"/"list"/"none"), `timeAmount`, `timeElapsed`, `expiredWords`, timestamps.
- **QuizMistake** (`quiz_mistakes`): `quizAttemptId`, `wordId`, `userId`, `userAnswer`.
- Cascade deletes from list → children; indexes on listId/studied/groupName.

### Progress formula (unchanged business logic)
`updateListProgress(listId)` in `src/app/actions/prismaActions.ts`:
- regular % = studied words / total words
- syllable % = studied syllable words / total syllable words
- group % = (groups with **more than 1 studied word**) / (groups with **more than 1 word**) — single-word groups are ignored everywhere
- progress = round(average of the percentages of the **active** types only)
- `getColorForProgress` maps progress to a colour (purple ≤25, orange ≤50, green ≤75, blue >75, yellow for 0).

---

## 5. Pages and features (how each works)

### Landing page `/`
Marketing page (Navbar, Hero, Why Choose, See App in Action, How it works, Credibility, Real Progress, Testimonials, Vocabulary, Footer). Several footer/nav links are placeholders; testimonials look like placeholders; no Privacy/Terms page.

### Auth
- `/signup` → `POST /api/auth/signup` (bcrypt hash, create user) → **auto sign-in** via the `authenticate` server action → redirected to `/profile/[id]`.
- `/sign-in` → `authenticate` server action → NextAuth `signIn('credentials')`.
- `/forgot-password` → `POST /api/auth/resetPassword` with username + new password (**no verification** — known issue) → always returns a generic message.
- Onboarding: `DashboardLayout` (wraps every logged-in page) redirects to `/profile/[id]` until `profileUpdated` is true. Profile form (name, age, grade, photo upload to Supabase) → Card details form (mandatory; sets `profileUpdated` only when all card fields are present) → success screen.
- `PUT /api/auth/updateProfile` uses the **session user** (not a userId from the client).

### Dashboard `/dashboard`
- `DashboardClient`: **UploadWord** (drag-and-drop file upload), **WordList** (type words manually / bulk entry), **RecentList** ("My List" — newest 3 lists), Achievements footer (7 static placeholder icons — not functional).
- Upload pipeline (UploadWord): browser parses the file (`fileReaderUtil`; images go to `POST /api/textract`) → `extractWordsFromContent` (gpt-4o-mini: valid words + list name) → review modal (WordListModal) → `processFileWithAI` (gpt-4 with `public/prompts/systempromt.txt`: OriginalWords, SyllableWords, GroupedWords, SightWords; zod-validated) → `POST /api/save-words` (creates list + words + syllable words + grouped words; then awaits another gpt-4 call for quiz-timer suggestions if user has grade/age) → redirect to `/lists`. Progress bar during processing is simulated.
- Manual entry (WordList): calls `processFileWithAI` **before** the review modal, then saves via `/api/save-words`.
- RecentList prefetches each visible list's practice page (`router.prefetch(..., { kind: "auto" })`) so clicking is instant.

### Lists `/lists` and `/lists/[listId]`
- `/lists` (Listdata): each row has Start/Continue Learning, View All, Edit (pencil), Delete, Reset progress. Row hover/focus/touch prefetches that list's practice page (auto mode). Delete → `deleteList`; Reset → `resetListProgress`; both followed by `revalidateRoute("/lists")`.
- Edit (EditWordsModal): data from `fetchWordsForList` (now reads DB directly). Rename only → `PATCH /api/update-words`. Word changes → `processFileWithAI` again → `PATCH /api/update-words` (deletes syllable+group rows, updates/creates words one by one). Deleting a word inside the modal calls `DELETE /api/delete-word` immediately.
- `/lists/[listId]`: ShowWords — view/search all words of a list.

### Practice hub `/spellPractice/[listId]`
- `page.tsx` calls `preloadPracticeHubData(listId)` then renders `DashboardLayout` → `SpellPractice` (server) → `PracticeWordModal` (client).
- `practiceHubData.ts` (React `cache`): one parallel round — words (word + studied), studied syllable count, grouped `groupBy(['groupName','studied'])`, recent quiz attempts, flash-card count, scramble count.
- Tabs: **Study** (Default / Syllables / Word Groups cards with progress + Start/Continue/Begin Again), **Quiz** (Recent Attempts card, Start Quiz, Practice Mistakes with count), **Extra** (Scramble Words, Flash Cards, Word Builder). Flash Cards / Scramble are AI-generated on first click (`generateAndSaveFlashCards` / `generateAndSaveScrambleWords`, gpt-4) and stored; later visits reuse them.
- Navigation uses `?start=N` (resume) or `?start=0` (restart); the mode component reads and then strips it.

### Study modes
- **Default** (`DefualtModePratice` — folder name is misspelled in the codebase; keep it): `DefaultModePage` — scrambled letters, drag (react-dnd HTML5 backend) or click into slots; correct word auto-advances after 2s. Saving: on exit (X → "Yes, Save Progress") marks words up to the current page studied; completion modal "Save & Complete" marks all → `markWordsAsStudied`.
- **Syllables**: `SyllablesMode` — pick the correct syllable split from 4 options; saves via `markSyllableWordsAsStudied`.
- **Word Groups**: `GroupModePage` — for each group (≥2 words), type the missing letters (first 2 letters shown for words >2 letters); per-box inputs `#input-{row}-{box}`; Backspace handling moves back; typing auto-advances. Saves via `markGroupsAsStudied(groupNames[], listId)` (single call).

### Quiz & mistakes
- **Quiz** (`QuizModePage` + `QuizTimerModal`): timer options none / per word / whole list; AI pace suggestions (short/medium/generous per word) come from the list's saved durations (loaded with the page); "Generate AI Suggestions" calls gpt-4 if missing. Words are spoken via `speechSynthesis` (`TextToSpeach.tsx`); answers compared case-insensitively. On finish `saveQuizAttempt` stores the attempt + one mistake row per wrong word.
- **Practice Mistakes** (`MistakesModePractice`): unique mistaken words from the **last 3 attempts** (`getRecentQuizMistakes`); answering correctly deletes the mistake rows (`resolvePracticedMistake`); skip moves word to the end.
- `getRecentQuizAttempts`: single raw SQL (CTE) returning last 3 attempts + unique mistake count.

### Extra games
- **Flash Cards** (`FlashCardsGame`): pick the correct spelling among 4 cards; hints; definition + example sentence; confetti.
- **Scramble Words** (`ScrambleWordsGame`): pick the one valid anagram among 4 options (server validates anagram count after AI generation).
- **Word Builder** (`WordBuilderGameNew` + `components/WordBuilder/*`): drag-and-drop letter tiles; mode chosen by grade (picture / phonics / syllable / morphology); challenge modes (normal / timed / limited moves / hard with decoys); uses the **static** `src/data/wordBuilderData.ts` (17 words), not the child's list; personal best in `localStorage`.
- Game results are **not saved** and don't affect progress.

### Mode/game pages' data loading (current pattern)
Each page calls `preloadCurrentUserDetails()` (starts DashboardLayout's user lookup early; `getUserDetails` is wrapped in React `cache`), loads its data and the list name in one `Promise.all` (`getListName` in `src/lib/listName.ts`, or `list.listName` from `getWordsByListId`), and passes `initialListName` to `ListNameProvider` (provider only fetches client-side when the prop is missing).

---

## 6. Server actions & API routes

### Server actions (`src/app/actions`, files marked `"use server"` — every export is a public endpoint)
- `prismaActions.ts`: `deleteList`, `fetchWordsForList` (direct DB read; same JSON shape the old API returned), `getWordCountForEachExercise` (legacy, no longer used by the hub), `getListById`, `getWordsByListId`, `getSyllableWordsByListId`, `getGroupedWordsByListId`, `markWordsAsStudied`, `fetchSpellingLists`, `markSyllableWordsAsStudied`, `markGroupAsStudied` (wraps `markGroupsAsStudied`), `markGroupsAsStudied`, `updateListProgress` (internal), `resetListProgress`, `getFlashCardsByListId`, `checkFlashCardsExist`, `getScrambleWordsByListId`, `checkScrambleWordsExist`.
- `AiService.ts`: `extractWordsFromContent`, `processFileWithAI`, `getTimeDurationSuggestions`, `saveTimeDurationsToList`, `getTimeDurationsForList`, `generateAndSaveTimeDurations`, `generateFlashCards`, `generateAndSaveFlashCards`, `generateScrambleWords`, `generateAndSaveScrambleWords`, `regenerateScrambleWords`.
- Others: `authenticate`, `handleSignout`, `generateAiSuggestionsForList`, `getRecentQuizAttempts`, `getRecentQuizMistakes`, `resolvePracticedMistake`, `saveQuizAttempt`, `revalidateRoute`.
- `getUserDetails.ts` (NOT "use server"): cached `getUserDetails`, `preloadCurrentUserDetails`.
- `src/app/spellPractice/[listId]/practiceHubData.ts` and `src/lib/listName.ts` are server-only helpers (deliberately not in a "use server" file).

### API routes (`src/app/api`)
`POST /api/auth/signup`, `POST /api/auth/resetPassword`, `PUT /api/auth/updateProfile`, `/api/auth/[...nextauth]`, `POST /api/save-words`, `PATCH /api/update-words`, `GET /api/fetch-words` (still exists; no longer used by the app), `DELETE /api/delete-word`, `POST /api/textract`.

### Middleware (`src/middleware.ts`)
Skips `/api`. Logged-in users hitting `/`, `/sign-in`, `/signup`, `/forgot-password` → `/dashboard`. Logged-out users hitting `/dashboard`, `/profile`, `/lists`, `/spellPractice` → `/sign-in`.

### Local dev behaviour
`src/auth.config.ts` deletes `AUTH_URL`/`NEXTAUTH_URL` when `NODE_ENV === "development"` so auth redirects stay on localhost; `src/lib/baseUrl.ts` uses the request host in development for server-side self-fetches (only `AiService` prompt fetch still uses it). Production behaviour unchanged.

---

## 7. Work completed so far (chronological)

### A. Auth & sign-up fixes (committed)
1. `updateProfile` uses the session user (previously anyone could edit any profile by sending a userId).
2. `/spellPractice` added to middleware protection.
3. Forgot Password returns the same message whether or not the username exists; errors shown inline (no `alert()`).
4. Sign-up validates required fields server-side, logs real errors, friendly messages; profile/card steps show save errors.
5. Profile photo: PNG/JPEG ≤ 8 MB check (client-side), upload failures handled without crashing.
6. Auto sign-in after sign-up → profile setup; `pages.signIn` fixed from `/login` to `/sign-in`.
7. Local dev stays on localhost (see §6).

### B. Dashboard visual performance (committed)
- Title images / achievement badges had wrong declared `width`/`height` (40×40 squares for ~6:1 images) → layout shift. Fixed to real aspect ratios (also in `dashboard/loading.tsx`).
- Pally via `next/font/local` (preload, `display: swap`, size-matched fallback).
- Logo `priority` + `fetchPriority="high"`.
- Result: Lighthouse **78–80 → 98–100**, CLS **0.465 → 0.002**, pixel-identical screenshots.

### C. Practice hub speed (committed)
- A: dashboard prefetches visible lists' practice pages (auto mode — `router.prefetch` default is "full", which caches data for 5 min and would show stale progress; avoided).
- B: `practiceHubData.ts` — 4 queries in one parallel round instead of 9 across 3 sequential steps; started in parallel with the header; `getRecentQuizAttempts` single SQL.
- C: removed 3 client requests after load (list name, flash-card check, scramble check).
- Result (local prod build): server time 2.01s → 0.68–0.74s; click → loading screen 0.06s (live was 1.5–2s); live total settle was 10–12s.

### D. Other pages speed (committed)
- Part 1 — all 8 mode/game pages: header lookup in parallel, list name from server, Quiz AI suggestions with the page, Practice Mistakes 4 steps → 2. ~1.3s → ~0.7s (Mistakes 2.6s → 1.2s); 0 extra requests.
- Part 2 — saving progress: `updateListProgress` 5 counts in one parallel round (formula unchanged); `markWordsAsStudied` parallel lookup; Word Groups saves all groups in one call. Saves 5.6–16.5s → 2.3–3.7s.
- Part 3 — `fetchWordsForList` and `/lists/[listId]` read DB directly instead of calling `/api/fetch-words` over HTTP. 1.9s → 0.8s; Edit modal 2.2–2.5s → 0.8–1.0s.
- Part 4 — Lists page row hover/focus/touch prefetch (not on mount: one user has 40 lists). Continue Learning click 0.6–1.6s → 0.06s.

### E. Bug fix (committed)
- Word Groups Backspace: cursor used to jump forward after deleting (needed two presses per letter); also wrong box checked for 2-letter words. Fixed in `GroupModePage.tsx`.

All of the above were verified by before/after production builds, identical rendered output and data comparisons on the real database, and real browser click-throughs with temporary accounts (deleted afterwards). Git: work is on branch **`auth-fixes`** (latest commit `4a82072`).

---

## 8. Known issues still open (reported, not fixed — client decides)

### Login & sign-up
1. Anyone can reset any user's password just by knowing the username (no verification).
2. The bcrypt password hash is returned in the sign-up response and included in every logged-in user's session data.
3. Card number/CVC/expiry required to finish onboarding and stored in plain text (PCI issue; nothing is ever charged — there is no payment provider).
4. Changing the password doesn't invalidate existing sessions.
5. Weak password rules (6 chars on sign-up; reset accepts anything, no confirm check).
6. Most sign-up rules only checked in the browser.
7. No rate limiting / CAPTCHA.
8. No email on accounts → no real recovery.
9. Usernames are case-sensitive ("Raza" ≠ "raza").
10. Profile/card onboarding can't be skipped.
11. No parental-consent step (children's app; COPPA consideration).

### Payment/card flow
Nothing charged; no price/plan/terms shown; card fields unvalidated; CVC stored (not allowed); editing profile later overwrites card fields with the text "undefined" and forces the card step again; pricing section exists but is unused.

### Word lists
Editing words can wipe syllable/group exercises (route checks `SyllabusWords` but AI returns `SyllableWords`, after deleting); reordering triggers AI re-processing and isn't saved; deleting a word in the edit modal is immediate; deleting the last word divides by zero; Flash Cards/Scramble never regenerate after edits; manual-entry review edits don't get syllable/group data; long lists can hit AI token limits; scanned PDFs unsupported; list/word API routes and AI server actions don't check the session (cost abuse possible); no upload limits.

### Study / quiz / games
Progress only saved via X-confirm or completion modal (back/refresh loses it); "Practice Again" doesn't save; exit dialog's cancel also leaves; current unsolved word is marked studied on exit; resume opens last completed word; drag doesn't work on touch (tap does); quiz "Previous" adds duplicate answers; quiz order never shuffled; homophones indistinguishable; empty/0 custom timer allowed; scores computed client-side; mistakes from only last 3 quizzes; Word Builder ignores the child's list (17 static words); game results not saved; Flash Cards/Scramble AI output barely validated; scramble hints misleading.

### Infrastructure / other
- **Vercel functions in iad1 (US) vs Neon DB in Singapore** — every DB round trip crosses the globe (~1.1–1.4s per query step via the pooled connection). Moving the Vercel function region to `sin1` is the single biggest remaining speed win (client decision).
- **Supabase project for photo uploads no longer exists** (DNS NXDOMAIN) — uploads fail; existing photos broken. Needs a new project + env vars + `next.config.ts` `remotePatterns` update.
- Dashboard loads `xlsx` + `mammoth` up front (~260 KB) — planned: lazy-load on file drop.
- Landing page loads huge SVGs (9.6 MB, 5.7 MB) with `priority`; `public/images` is 92 MB.
- No Privacy Policy/Terms, placeholder footer/social links, placeholder testimonials, "Achievements" are static placeholders, no account deletion.
- AI uses slow `gpt-4` with no streaming; `save-words` waits on an extra AI call.

---

## 9. How work is done on this project (conventions & preferences)

- **Never commit or push** — the developer commits everything themselves. Leave changes uncommitted and say so.
- **Don't change functionality, UI or design** beyond the specific fix requested. Prove "nothing else changed" (identical rendered output / identical data / identical screenshots).
- **Work in small parts**: propose a plan split into parts, get approval, do one part, test, report, then ask before the next.
- **Never run `next build` or a second `next dev` in the project folder** — it corrupts the shared `.next` and breaks the developer's running `npm run dev` (Turbopack). For testing, copy the repo to a separate folder (symlink `node_modules`, copy `.env`) and build/run there on another port with `AUTH_TRUST_HOST=true NEXTAUTH_URL=http://localhost:<port>`.
- **Local `.env` = production database.** Use temporary test accounts (e.g. names starting `zz…`) for anything that writes, and delete them afterwards. Never change real users' data (test account `raza` exists; its password is provided separately by the developer).
- **Avoid triggering paid AI calls** in tests (Flash Cards/Scramble generation, list processing).
- Prefetching (`router.prefetch`) only works in production builds — not in `npm run dev`.
- **Client issue notes** must be a plain numbered list of one-line issues — no categories, no explanations, no formalities — and should skip trivial items (typos, tiny text fixes).
- Messages to the developer: short and clear; the developer is not a native English speaker.
- Verification toolbox used so far: TypeScript (`npx tsc --noEmit`), `next lint`, Lighthouse CLI (desktop preset, with session cookie header), headless Chrome via CDP scripts (timings, network requests, real key/mouse events, rendered-text comparison), Prisma scripts comparing old vs new query outputs across all lists.

---

## 10. Quick reference: important files

| Concern | File(s) |
|---|---|
| Auth config / session | `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts` |
| Logged-in page shell (header, onboarding redirect) | `src/components/DashboardLayout.tsx` |
| User lookup (cached + preload) | `src/app/actions/getUserDetails.ts` |
| Practice hub data | `src/app/spellPractice/[listId]/practiceHubData.ts`, `SpellPractice.tsx`, `src/components/PraticeWordModal.tsx`, `ModeCard.tsx` |
| List name | `src/lib/listName.ts`, `src/context/ListNameContext.tsx` |
| Progress & list data actions | `src/app/actions/prismaActions.ts` |
| AI | `src/app/actions/AiService.ts`, `public/prompts/systempromt.txt` |
| Upload & create list | `src/components/UploadWord.tsx`, `WordList.tsx`, `WordListModal.tsx`, `src/app/utils/fileReaderUtil.ts`, `src/app/api/save-words`, `src/app/api/textract` |
| Edit list | `src/components/Listdata.tsx`, `EditWordsModal.tsx`, `src/app/api/update-words`, `src/app/api/delete-word` |
| Modes | `DefaultModePage.tsx`, `SyllablesMode.tsx`, `GroupModePage.tsx`, `QuizModePage.tsx`, `QuizTimerModal.tsx`, `MistakesModePractice.tsx` |
| Games | `FlashCardsGame.tsx`, `ScrambleWordsGame.tsx`, `WordBuilderGameNew.tsx`, `components/WordBuilder/*`, `src/data/wordBuilderData.ts` |
| Profile/onboarding | `src/app/profile/[id]/*`, `src/app/api/auth/updateProfile` |
| Styling | `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx` |
