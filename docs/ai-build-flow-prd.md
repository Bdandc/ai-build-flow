# AI Build Flow — Product Requirement Document

## 1. Vision
Allow users to describe a digital product in plain English and instantly generate a structured UI, editable in a visual studio.

## 2. Core Problem
Non-technical users cannot turn ideas into working apps quickly.
Current tools require manual setup, design, and coding knowledge.

## 3. Solution
AI Build Flow converts natural language prompts into:
- structured UI blocks
- editable components
- live preview

## 4. Core Experience (MVP)

### Step 1 — Input
User enters:
"An investing dashboard with stats and a watchlist"

### Step 2 — AI Generation
System generates:
- hero section
- stats blocks
- table/list
- layout structure

### Step 3 — Studio Editing
User can:
- edit components
- rearrange layout
- add/remove blocks

### Step 4 — Live Preview
Rendered instantly in preview panel

---

## 5. Studio Direction (IMPORTANT)

There must be ONE unified studio.

Decision:
- Use Zustand store as single data model
- Command input becomes a layer that modifies the same store
- React Flow becomes optional "advanced mode"

---

## 6. Data Model

Blocks:
- id
- type (hero, stats, table, etc)
- content
- position

All UI is derived from this structure.

---

## 7. AI Responsibilities

AI must:
- parse prompt into structured blocks
- suggest layout
- populate content
- never hallucinate unsupported components

---

## 8. Constraints

- No duplicate studio implementations
- No inline styles (Tailwind only)
- No unused dependencies
- Must always build on Vercel

---

## 9. Acceptance Criteria

- User enters prompt → gets structured UI
- Studio loads same project consistently
- Editing updates preview instantly
- Vercel build passes
