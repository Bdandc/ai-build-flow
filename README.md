# AI Build Flow

## Deploying to Vercel

The web app lives in `apps/web`.

**Vercel settings:**
- Root Directory: `apps/web`
- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm ci`

**Local build:**
```bash
npm --workspace apps/web install
npm --workspace apps/web run build
npm --workspace apps/web start
```

**Development:**
```bash
npm run dev:web
```
