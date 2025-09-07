# AI Build Flow

## Deployment

1. **Link the repository to Vercel**
   - Using the Vercel CLI: run `npx vercel link` from the repo root and select the `apps/web` directory when prompted.
   - Or connect the GitHub repository to a new Vercel project with root directory `apps/web`.
2. **Set environment variables**
   - In the Vercel dashboard or via the CLI, add any required variables with `vercel env add`.
   - Add a `VERCEL_TOKEN` secret to the GitHub repository for CI builds.
3. **Local production build**
   - Run `npx vercel build --cwd apps/web` to verify the build locally.


### Vercel deploy

The root-level `vercel.json` installs dependencies at the repo root, then installs and builds the app in `apps/web`. With this config, Vercel can deploy from any branch without setting a custom Root Directory, though pointing a project directly at `apps/web` still works.
