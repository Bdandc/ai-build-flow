## Vercel install mode & workspaces

Vercel runs `npm ci` at the **repo root**. Whenever you change dependencies in any workspace (e.g., `apps/web`), you **must** regenerate the **root** `package-lock.json`:

```bash
rm -rf node_modules apps/web/node_modules
npm install --workspaces --no-audit --no-fund
git add package-lock.json
git commit -m "chore: sync root lockfile after workspace dep change"
```

### Avoiding install loops
- Ensure build machines have access to the public npm registry (no proxy/auth issues).
- Always re-run the root install after workspace dep changes so `npm ci` is in sync.
- Optionally set Vercel **Install Command** to `npm install` if you don’t want strict lockfile checks.
  - Vercel Project → Settings → Build & Development Settings → **Install Command** → `npm install`
  - (Do **not** change other settings.)

