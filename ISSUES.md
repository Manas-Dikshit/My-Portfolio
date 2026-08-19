# Portfolio Codebase Audit

Investigation of the `portfolio` codebase (Next.js 15 + Prisma 7 + better-auth).

## Security / Authorization

### 1. Guestbook DELETE has no role/ownership check
- **File:** `src/app/api/guestbook/route.ts:91`
- **Issue:** The DELETE endpoint only verifies that *any* session is logged in, then deletes whatever `id` is sent. Any authenticated user can delete anyone's entry.
- **Contrast:** The todo API correctly checks `role === "AUTHOR"` (`todo/route.ts:39`).
- **Fix:** Restrict to AUTHOR or the entry owner (`entry.userId === session.user.id`).

### 2. Guestbook POST unvalidated input — ✅ FIXED
- **File:** `src/app/api/guestbook/route.ts:53`
- **Status:** Fixed. Added a `typeof content !== "string"` guard, a `MAX_CONTENT_LENGTH = 500` cap, and an in-memory per-user rate limiter (5 posts / 60s, returns 429). Error shape normalized to `{ success, message }`.
- **Remaining:** The guestbook is disabled in the UI (`feature/guestbook.tsx` is a hardcoded "currently unavailable" placeholder), so the POST/DELETE surface is dead-but-live code. Rebuild the UI to actually use it.
- **Rate limiter caveat:** In-memory is best-effort across serverless instances. Upgrade to a shared store (Redis/DB) if you deploy multiple instances or abuse becomes an issue.
- **Note:** Stored-XSS was already mitigated (React auto-escapes, no `dangerouslySetInnerHTML`); skip a sanitizer unless the UI is rebuilt with raw HTML.

### 3. `BETTER_AUTH_SECRET!` non-null assertion
- **File:** `src/lib/auth.ts:14`
- **Issue:** Non-null assertion on a var that is optional in the env schema (`env.ts:28`). If the var is missing, `secret` is `undefined` — silent misconfiguration, undefined behavior in better-auth.

## API / Correctness Bugs

### 4. Wrong import: `Session` from `next-auth`
- **File:** `src/app/api/todo/route.ts:7`
- **Issue:** `next-auth` is not installed (deps use `better-auth`). This is a compile error / misleading dead type. The better-auth session is cast to it at lines 38, 68, 102.

### 5. Public GitHub fallback computes PR stats from events
- **File:** `src/app/api/github/route.ts:314`
- **Issue:** `calculateWeeklyPullRequests(events as any)` uses `events` whose `payload.size` is not a PR count; the "weekly PRs" trend is meaningless. Also `route.ts:349` hardcodes the stars trend to 0.

### 6. Fragile HTML scraping
- **File:** `src/app/api/github/route.ts:254`
- **Issue:** `fetchContributionDays` regex-scrapes `github.com/users/{u}/contributions` HTML. Breaks on any GitHub markup change.
- **Extra:** The public path makes 8+ upstream calls per request (user, repos, followers, 5 search queries, events, scrape) → fast rate-limit exhaustion.

### 7. Caching conflict
- **Files:** `src/app/api/github/route.ts:9` (`revalidate = 604800`, 7-day stale stats) vs `src/app/api/views/route.ts:5-6` (`cache="no-cache"`).
- **Issue:** Inconsistent caching behavior across API routes.

### 8. Inconsistent API error shapes
- **File:** `src/app/api/guestbook/route.ts:56`
- **Issue:** POST 400 returns `{ error: ... }` while DELETE returns `{ message }`. Client types only check `success`/`message` (`types/index.ts:43`). Callers can't rely on the contract.

### 9. Optimistic update ordering
- **Files:** `src/app/api/guestbook/route.ts:30` (orders by `createdAt: "asc"`) and `src/hooks/use-guestbook.ts:55` (optimistic-append).
- **Issue:** New entries are appended to a list displayed newest-first; the new entry appears out of place until refetch.

### 10. Debug leftover
- **File:** `src/hooks/use-guestbook.ts:54`
- **Issue:** `console.log({old})` left in production code.

## Config / Env

### 11. `PRISMA_ACCELERATE_URL` not in env schema
- **File:** `src/lib/prisma.ts:9`
- **Issue:** The var is read but absent from `env.ts`, so it's never validated/typed.

### 12. Netlify config broken — ✅ FIXED
- **File:** `netlify.toml:4`
- **Issue:** `functions = "netlify/functions"` points to a non-existent directory; `publish = ".next"` with no `@netlify/plugin-nextjs` plugin → Next.js won't deploy correctly on Netlify.
- **Status:** Fixed. `netlify.toml` now runs `npm run build` and declares the official `@netlify/plugin-nextjs` plugin (auto-installed by Netlify), which manages the publish dir and functions itself — removed the bogus `functions`/`publish` keys.

### 13. Two different emails — ✅ FIXED
- **Files:** `src/config/site.ts:13` (`manasranjandikshit01@gmail.com`) vs `src/lib/portfolio-data.ts:25` (`manasdikshit48@gmail.com`).
- **Issue:** JSON-LD in `layout.tsx:7` uses `portfolioData.contact.email`; the site config exposes the other. Confusing/inconsistent.
- **Status:** Fixed. Single preferred email `manasdikshit48@gmail.com` is now the only one in the codebase. It's exposed via `getEmail()` in `site.ts` which decodes it from char codes at runtime, so it never appears as plaintext in the HTML/JS bundle. All `mailto:` links (footer, home, contact) use `getEmail()`, and the email was removed from the JSON-LD structured data in `layout.tsx` (the main crawlable scrape vector).

### 14. Secret hygiene
- **Status:** Good. Real `.env` is gitignored (confirmed via `git check-ignore`); only `.env.example` is tracked.
- **Note:** `.env` itself contains live credentials (`DATABASE_URL`, `GITHUB_TOKEN`, `UMAMI_API_KEY`, OAuth secrets). Keep it out of builds/CI.

## Type / Quality Nits

- `as any` casts at `src/app/api/github/route.ts:314`, `src/components/pages/sections/projects.tsx:22-23`, `src/components/ui/playdate-console.tsx:219`.
- `src/lib/constant.ts` is an empty, unused file.

## Build Warnings / Errors

### W1. Turbopack workspace root inference
- **Issue:** `next build --turbopack` warns that it inferred the wrong workspace root (`C:\Users\manas\package-lock.json`) because multiple lockfiles were detected. Set `turbopack.root` in `next.config.*` or remove the stray lockfile.

### W2. Unused import — ✅ FIXED
- **File:** `src/components/pages/home.tsx:7`
- **Issue:** `LinkedinIcon` is imported but never used.
- **Status:** Fixed. Added a LinkedIn entry to `socialLinks` in `home.tsx` using `siteConfig.linkedin`, and updated `portfolio-data.ts` to the full `https://www.linkedin.com/in/manas-ranjan-dikshit/`.

### W3. Hook dependency warnings (`react-hooks/exhaustive-deps`)
- `src/components/pages/home.tsx:387` — `useCallback` missing dep `router`.
- `src/components/snake-game.tsx:208` — `useCallback` missing dep `playEatFood`.
- `src/components/snake-game.tsx:250` — `useEffect` missing deps `initGame` and `snake.length`.
- `src/components/ui/logo.tsx:107` — `useEffect` missing deps `controls`, `initialAnimation`, `startAnimation`.
- `src/components/ui/particles.tsx:236` — `useEffect` missing dep `particleColors`.
- `src/components/ui/typewriter.tsx:99` — `useEffect` missing dep `initialDelay`.

### W4. Better-Auth default secret
- **File:** `src/lib/auth.ts:14` (ties to #3)
- **Issue:** `BETTER_AUTH_SECRET` is not set, so better-auth falls back to its default secret — fails during page-data collection / server runtime. Runtime warning, does not fail the build.

### W5. GitHub API 401
- **File:** `src/app/api/github/route.ts`
- **Issue:** GitHub stats fetch returns 401 (`GITHUB_TOKEN` missing/invalid). Runtime error, does not fail the build.

## Priority

**Highest:**
- **#1** Guestbook authorization
- **#4** Broken `next-auth` import

Then: #3, #5, #6, #8.

**Done:**
- **#2** Guestbook POST validation (fixed).