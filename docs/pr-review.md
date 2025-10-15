# Pull Request Audit

_Date: 2025-10-15_

I reviewed the merge history on the `work` branch to identify which pull requests still deliver active functionality and which ones were transient maintenance efforts that can be archived. Merge metadata comes from `git log --merges`.【f6bc5a†L1-L49】

## Summary

- **Keep / still relevant:** Feature, security, dependency, tooling, and mobile PRs that are directly reflected in the current codebase.
- **Archive:** Temporary lockfile resets and conflict-resolution PRs that no longer require active follow-up.

## Keep

| PRs | Focus | Evidence | Recommendation |
| --- | --- | --- | --- |
| #48 | Feature node popover menu for PRD graph | Popover actions (edit, change type, delete) are rendered in `FeatureNode` and wired to the store.【F:apps/web/components/prd/FeatureNode.tsx†L24-L152】 | Continue to keep; it powers the PRD canvas UX. |
| #46, #45, #43 | Sanitizer package & XSS hardening | The editor sanitizes Markdown previews with the shared sanitizer package to block script injection and unsafe URLs.【F:apps/web/components/prd/PRDEditor.tsx†L1-L43】【F:packages/sanitizer/index.js†L1-L23】 | Keep; security-critical. |
| #42 | Download helper accepts MIME overrides | Export actions use the download helper with JSON and Markdown MIME types.【F:apps/web/pages/studio/index.tsx†L12-L43】【F:apps/web/lib/prdMarkdown.ts†L22-L34】 | Keep; required for PRD export/import UX. |
| #41, #32 | Tailwind-based marketing/home experience | The landing page relies on Tailwind utility classes for layout and styling.【F:apps/web/pages/index.tsx†L49-L118】 | Keep; still the entry point for project creation. |
| #34, #33 | PRD studio canvas & block engine | The studio page and dynamic block parser persist projects, parse commands, and render HTML previews.【F:apps/web/pages/studio/index.tsx†L6-L50】【F:apps/web/pages/studio/[slug].tsx†L1-L200】 | Keep; core product flow. |
| #31, #30 | Shared layout & Tailwind setup | Layout and dashboard components plus Tailwind config continue to define the shared shell/UI system.【F:apps/web/components/Layout.tsx†L1-L33】【F:apps/web/pages/dashboard.tsx†L1-L14】【F:apps/web/tailwind.config.js†L1-L9】 | Keep; structural. |
| #40, #39, #38 | Dependency additions (`uuid`, `marked`, `@types/marked`) | Dependencies remain in the workspace manifests.【F:apps/web/package.json†L1-L34】【F:package.json†L1-L32】 | Keep; required for current builds. |
| #20, #18, #19, #15, #14, #1 | CI pipelines & Vercel configuration | GitHub workflows, Vercel configs, and single-React enforcement are still in use.【F:.github/workflows/ci.yml†L1-L49】【F:.github/workflows/lint.yml†L1-L38】【F:vercel.json†L1-L5】【F:apps/web/vercel.json†L1-L4】【F:.nvmrc†L1-L1】 | Keep; ensures build & deploy health. |
| #12, #11 | Mobile Expo project setup | Mobile app, Expo build profiles, and metro config remain checked in.【F:apps/mobile/App.js†L1-L20】【F:apps/mobile/eas.json†L1-L8】【F:apps/mobile/metro.config.js†L1-L2】【F:apps/mobile/package.json†L1-L20】 | Keep; mobile workspace is intact. |

## Archive

| PRs | Focus | Rationale |
| --- | --- | --- |
| #37 | Remove & recreate lockfile | One-off lockfile reset; no ongoing code references.【f6bc5a†L11-L15】 |
| #29 | Fix missing web lockfile | Addressed a historical packaging issue; no active follow-up.【f6bc5a†L17-L23】 |
| #28 | Emergency web build fix | Resolved Pages vs. App router conflict during migration; the underlying issue is closed.【f6bc5a†L20-L24】 |
| #27, #26, #25, #24, #23, #22 | Early repository repairs | These PRs fixed transient repository misconfigurations and have no continuing tasks.【f6bc5a†L23-L33】 |
| #21 | Vercel build & lockfile hotfix | Resolved specific deploy incident; no additional work required now.【f6bc5a†L29-L33】 |
| #9, #8, #7, #6, #5, #4, #3 | Legacy tooling conflicts | Merge-conflict and setup cleanups from initial project bootstrap; safe to archive.【f6bc5a†L40-L49】 |

