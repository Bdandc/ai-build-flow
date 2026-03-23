# Review: Align product with PRD — unify studio and AI generation flow

_Date: 2026-03-23_

## Scope and note

The request referenced `/ai/PRD.md`, but that file does not exist in this repository. I used `docs/ai-build-flow-prd.md` as the source PRD for this review.

## PRD direction recap

From the PRD, the intended MVP flow is:

1. User enters a natural-language prompt on landing.
2. System generates structured blocks (hero/stats/table/etc).
3. User edits those blocks in a single studio.
4. Live preview updates from the same data model.

The PRD also explicitly requires:

- one unified studio
- Zustand as single source of truth
- command input as a layer that modifies the same store
- React Flow as optional advanced mode (not separate product)

## Current divergence in `apps/web`

### 1) Duplicate studio implementations

There are two separate studio experiences:

- `pages/studio/[slug].tsx`: block-list + command composer + iframe preview using `localStorage`-based project state.
- `pages/studio/index.tsx`: PRD graph studio using Zustand store + React Flow + markdown editor.

These are separate architectures and data models, violating the single unified studio direction.

### 2) Landing flow bypasses Zustand and AI generation layer

Landing (`pages/index.tsx`) creates a project in `localStorage` and routes to `/studio/[slug]`.

That route creates only a default hero block from prompt and then relies on manual command parsing. There is no dedicated AI generation stage that translates prompt to structured blocks before first render.

### 3) Inconsistent block schemas

- `[slug].tsx` uses a local `Block` union (`hero|stats|table`) with index-based removal.
- Zustand store (`store/prdStore.ts`) uses `PRDBlock` graph nodes (`feature|page|flow|api|task`) with positional metadata and edges.

These can’t be shared without adapters, causing product drift.

### 4) Route-level product ambiguity

`/studio` currently opens a different product than `/studio/[slug]`. This increases user confusion and makes acceptance criteria “studio loads same project consistently” hard to satisfy.

## Minimal refactor plan (no large rewrites yet)

### Phase 0 — Stability and direction lock (small safe)

1. Keep `/studio/[slug]` as the canonical MVP studio route for now.
2. Convert `/studio` into a redirect back to landing (`/`) to remove the duplicate entry point while refactor is in progress.
3. Fix obvious studio rendering quality issues (done in this PR: duplicate text in recent project cards).

### Phase 1 — Unify data model behind a shared store

1. Introduce a single `StudioProject` Zustand store shape for prompt + block list + metadata.
2. Add serialization helpers in one place (load/save by slug).
3. Move `[slug].tsx` to consume only the shared store (no local component state as source of truth).

### Phase 2 — Add AI generation seam (without full model integration)

1. Add `generateBlocksFromPrompt(prompt)` interface in a dedicated module (e.g., `lib/ai/generateBlocks.ts`).
2. Start with deterministic local fallback mapping (template-based) to satisfy MVP behavior and keep builds stable.
3. Wire landing submit to call this generator before opening studio; persist generated blocks into shared store.

### Phase 3 — Optional advanced mode, not separate app

1. Reuse shared store in React Flow canvas.
2. Expose graph view via a toggle/tab inside the same studio route.
3. Keep command input/editor and graph editing as alternate views over identical data.

### Phase 4 — Cleanup and acceptance checks

1. Remove dead/legacy dual-studio code paths.
2. Add tests for:
   - prompt -> generated blocks
   - store persistence by slug
   - preview reflects block edits
3. Run build/lint to ensure Vercel compatibility.

## Small safe fixes included now

1. `/studio` now redirects to landing instead of rendering a second, divergent studio implementation.
2. Landing recent-project cards no longer render duplicate prompt/time rows.
3. Fixed a syntax issue in `[slug].tsx` (`summarizeBlock` closure) that could break compile/runtime.

## Risks / follow-up notes

- Redirecting `/studio` is intentionally conservative and may affect bookmarked links; canonical path should be communicated in release notes.
- AI generation remains a seam in this step; model-backed generation should be added behind the new interface in a later PR.
