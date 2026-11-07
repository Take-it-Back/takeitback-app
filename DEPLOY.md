# Deploys

This repo deploys to Vercel projects in the Take it Back team. Every push to `main` builds both.

| Part | Vercel project | Address |
|---|---|---|
| Site | takeitback-site | www.takeitback.app (takeitback.app redirects here) |
| App | app | app.takeitback.app |
| Admin | takeitback-admin | Empty until an admin is built |

## Still to do

The site and app are one build today. Next: send signed-in pages from the site address to app.takeitback.app,
add app.takeitback.app to Supabase sign-in addresses, and point the phone apps at the new address.

## Keys

- Each project needs the keys its part uses. Secret keys aren't shared between projects, so add them to each one.
- Only the App project gets `CRON_SECRET`.
