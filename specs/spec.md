# Race Pace Calculator — Spec

Oct 27, 2026 · @An

## 1. Why

Beginner runners usually know one race time but can't turn it into three things they need: a realistic goal for a longer race, how fast to run in training, and how to pace race day. Without that, most run every workout at the same medium effort.

**Who it's for:** beginner-to-intermediate runners with one recent race result.

**Why build it now:** it's a 2-week practice run for front-end work and test-first development, and its calculation module becomes the pace engine inside RunIt.

## 2. What

A single-page web app, live at a public Vercel URL, with a public GitHub repo. The runner enters one race result and gets predicted race times, training pace zones, and a splits table for a goal race.

### Features

Each feature has an ID so commits, tests, and tasks can reference it.

| ID | Feature | Acceptance criteria |
| --- | --- | --- |
| FR-1 | Race input | User picks a distance (5K, 10K, half, marathon, or custom number + unit) and enters a time as h, m, s. Results update without a page reload. |
| FR-2 | Race predictions | Shows predicted time and pace for 5K, 10K, half, marathon. The input distance shows the user's actual time, labeled "your time". |
| FR-3 | Training pace zones | Shows Interval, Tempo, Easy, Long run as a pace range (fast–slow). |
| FR-4 | Goal race splits | User picks a goal distance and goal time. Shows split number, split distance, cumulative time. Even pacing. |
| FR-5 | Unit toggle | min/km vs min/mi toggle converts every pace on screen. |

**Display formats:** times as `h:mm:ss` (or `mm:ss` under one hour); paces as `m:ss /mi` or `m:ss /km`. Round to the nearest second for display only.

### Domain rules

**Constants:** 1 mi = 1.609344 km · 5K = 5 km · 10K = 10 km · half = 21.0975 km · marathon = 42.195 km.

**Race prediction (Riegel):** T1 is the known time over distance D1; T2 is the predicted time over D2.

```latex
T_2 = T_1 \times \left(\frac{D_2}{D_1}\right)^{1.06}
```

**Pace:** pace (s/km) = time (s) ÷ distance (km). Pace (s/mi) = pace (s/km) × 1.609344.

**Training zones:** multipliers on the runner's 5K pace (predicted via Riegel if the input isn't a 5K). Above 1 means slower.

| Zone | 5K-pace multiplier (fast–slow) |
| --- | --- |
| Interval | 0.98 – 1.02 |
| Tempo | 1.08 – 1.12 |
| Easy | 1.25 – 1.40 |
| Long run | 1.30 – 1.45 |

**Worked example (your first test values)** — input: 5K in 28:00 (1680 s).

| Output | Expected |
| --- | --- |
| 5K pace | 5:36 /km · 9:01 /mi |
| Predicted 10K | 58:23 |
| Predicted half marathon | 2:08:48 |
| Predicted marathon | 4:28:33 |
| Interval zone | 8:50 – 9:12 /mi |
| Tempo zone | 9:44 – 10:06 /mi |
| Easy zone | 11:16 – 12:37 /mi |
| Long run zone | 11:43 – 13:04 /mi |

Riegel tends to be optimistic for beginners at the marathon, so the UI notes that predictions assume proper training for that distance.

### Validation

Invalid input never crashes the page and never shows `NaN`: results hide and an inline message explains the fix.

| Case | Rule | Message shown |
| --- | --- | --- |
| Empty or zero time | Total time must be > 0 s | "Enter your race time." |
| Minutes or seconds ≥ 60 | Reject; don't roll over | "Minutes and seconds must be 0–59." |
| Negative or non-numeric | Reject | "Use whole numbers only." |
| Custom distance ≤ 0 | Reject | "Distance must be greater than 0." |
| Custom distance < 1 km or > 100 km | Reject | "Distance must be between 1 and 100 km." |
| Pace faster than 2:30 /km | Reject as likely typo | "That's faster than the world record — check your time." |
| Goal distance not a whole number of splits | Last split is partial (a marathon in miles ends with 0.22 mi) | — |

### Interface contract

The functions `src/lib/` must export. Bodies are yours to write; see T7 if you'd rather design these yourself.

```ts
type Unit = "km" | "mi";

// time.ts
parseTime(h: number, m: number, s: number): number          // → seconds
formatDuration(seconds: number): string                      // "h:mm:ss" or "mm:ss"
formatPace(secondsPerKm: number, unit: Unit): string         // "m:ss /mi"

// predict.ts
predictTime(knownSec: number, knownKm: number, targetKm: number): number

// zones.ts
type Zone = { name: string; fastSecPerKm: number; slowSecPerKm: number };
trainingZones(fiveKSec: number): Zone[]

// splits.ts
type Split = { index: number; distanceKm: number; cumulativeSec: number };
evenSplits(goalSec: number, goalKm: number, splitKm: number): Split[]

// validate.ts
type Result = { ok: true } | { ok: false; message: string };
validateRaceInput(h: number, m: number, s: number, km: number): Result
```

### Definition of done

- Live on Vercel with a public URL
- Every `src/lib/` function has passing unit tests in CI
- Works at 375px phone width and on desktop
- README has a description, screenshot, live link, formulas, and run steps

## 3. Constraints

**Must**

- Do all math in seconds and kilometers; convert to miles or strings only at display time
- Keep `src/lib/` pure TypeScript: no React, DOM, or browser imports
- Write each `src/lib/` test before the function it tests
- Keep CI (lint, type-check, tests) green on `main`
- Work at 375px phone width with no horizontal scroll
- Use only the fixed stack: Vite, React, TypeScript, Vitest, ESLint, Prettier, GitHub Actions, Vercel

**Must not**

- Show `NaN`, `Infinity`, or a blank result for any input
- Round during calculation (display only)
- Add a feature, dependency, or behavior that isn't in this spec without updating the spec first
- Paste in code you didn't write and can't explain line by line; An writes the code, Claude reviews and hints

**Out of spec (v1)**

- Backend, database, user accounts, saved history
- Heart-rate zones, elevation, weather, or temperature adjustments
- Offline mode, installable app, multiple languages
- VDOT tables (unless chosen in T7)

## 4. Current state

No code exists yet as of Oct 27, 2026. The starting point is the Vite `react-ts` template. Update this section as modules land, so it always describes the repo as it really is.

**Target layout**

```
race-pace-calculator/
├── SPEC.md                 # this doc, exported
├── .github/workflows/ci.yml
├── src/
│   ├── lib/                # pure logic, no React
│   │   ├── units.ts        # km ↔ mi, distance constants
│   │   ├── time.ts         # parse + format times and paces
│   │   ├── predict.ts      # Riegel predictions
│   │   ├── zones.ts        # training pace zones
│   │   ├── splits.ts       # goal race splits
│   │   └── validate.ts     # rules from the Validation table
│   ├── components/         # RaceInput, Predictions, Zones, Splits, UnitToggle
│   └── App.tsx
└── tests/                  # <module>.test.ts, one per lib module
```

**Patterns to follow**

| Thing | Convention | Example |
| --- | --- | --- |
| Lib files | camelCase, one concern per file | `predict.ts` |
| Components | PascalCase, one per file | `RaceInput.tsx` |
| Tests | mirror the module name | `tests/predict.test.ts` |
| Commits | Conventional Commits + task or FR ID | `feat(FR-2): add Riegel prediction` |
| Data flow | components call `src/lib/`; lib never imports components | — |

**Modules done:** none yet.

## 5. Tasks

Done by Tue Nov 10, 2026. Each task is one commit and is finished only when its **Verify** check passes.

**Setup (Oct 27)**

- [ ] **T1** Create GitHub repo `race-pace-calculator`. *Verify:* repo page loads on GitHub.
- [ ] **T2** Scaffold Vite + React + TypeScript. *Verify:* `npm run dev` shows the starter page.
- [ ] **T3** Add Vitest with one placeholder test. *Verify:* `npm test` reports 1 passing.
- [ ] **T4** Add Prettier + `eslint-config-prettier`. *Verify:* `npm run lint` exits with no errors.
- [ ] **T5** Export this doc to `SPEC.md` and push. *Verify:* `SPEC.md` visible on `main`.
- [ ] **T6** Write `ci.yml` (lint, type-check, tests). *Verify:* green check on GitHub Actions.

**Core logic, test-first (Oct 28 – Nov 1)**

- [ ] **T7** Decide the open questions below and record answers here. *Verify:* every question has an answer.
  - Zone model: 5K-pace multipliers or VDOT tables?
  - Interface contract: keep the given signatures, or design your own?
  - Split length: fixed 1 km / 1 mi, or user-selectable?
  - Default unit: min/mi or min/km?
  - Goal time default: prefill with prediction, or empty?
  - Styling: plain CSS modules or Tailwind?
- [ ] **T8** `units.ts`. *Verify:* tests pass for 1 mi = 1.609344 km and marathon = 42.195 km.
- [ ] **T9** `parseTime` + `formatDuration`. *Verify:* (0, 28, 0) → 1680; 1680 → "28:00"; 16113 → "4:28:33"; round-trip test passes.
- [ ] **T10** `formatPace`. *Verify:* 336 s/km → "5:36 /km" and "9:01 /mi".
- [ ] **T11** `predictTime` (FR-2). *Verify:* all three predictions in the worked example match to the second.
- [ ] **T12** `trainingZones` (FR-3). *Verify:* all four zones match the worked example.
- [ ] **T13** `evenSplits` (FR-4). *Verify:* marathon in miles gives 27 splits, last is 0.22 mi, final cumulative time equals goal time.
- [ ] **T14** `validateRaceInput`. *Verify:* one passing test per Validation row.

**UI (Nov 2 – Nov 6)**

- [ ] **T15** RaceInput form (FR-1). *Verify:* entering 5K / 28:00 updates results with no reload; bad input shows its message.
- [ ] **T16** Predictions view (FR-2). *Verify:* shows 58:23 / 2:08:48 / 4:28:33; the 5K row says "your time".
- [ ] **T17** Zones view (FR-3). *Verify:* four ranges match the worked example.
- [ ] **T18** Splits view (FR-4). *Verify:* last row's cumulative time equals the goal time.
- [ ] **T19** Unit toggle (FR-5). *Verify:* every pace on screen switches units.
- [ ] **T20** Responsive layout. *Verify:* no horizontal scroll at 375px in browser dev tools.

**Ship (Nov 7 – Nov 10)**

- [ ] **T21** Deploy to Vercel from `main`. *Verify:* public URL loads; a new push redeploys.
- [ ] **T22** README. *Verify:* has description, screenshot, live link, formulas, run steps.
- [ ] **T23** Final check on a real phone and desktop. *Verify:* every Definition of done item holds.
