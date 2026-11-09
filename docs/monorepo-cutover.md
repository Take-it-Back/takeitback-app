# Monorepo cutover (Phase 2)

Branch `phase-2-monorepo` moves the app to `apps/web` in a pnpm + Turborepo workspace. Nothing changes for users.

## Before merging (Claude)
- CI, Android and iPhone simulator checks green on the branch.
- Rebase onto the latest main right before the cutover.

## Cutover (Austin, about 5 minutes)
1. Vercel → each project that builds this repo (`app`, `takeitback-site`, `takeitback-admin`) → Settings → Build and Deployment →
   Root Directory = `apps/web`. Leave "Include files outside the root directory" on. Save (no redeploy yet).
2. Tell Claude to merge. The merge deploys all projects from `apps/web`.
3. Check www.takeitback.app and app.takeitback.app load, sign in works, and /api/health shows the same services as before.

## Rollback
Set Root Directory back to empty and revert the merge commit. Keep the old layout's last deploy as the rollback target in Vercel.
