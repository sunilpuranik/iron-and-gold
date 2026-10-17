---
name: deploy
description: Run or ship Iron & Gold - "deploy local web", "deploy local app", "deploy dev", "deploy dev web/app", "deploy prod", "release to beta", "ship it". Use whenever the user asks to run the game locally, put a build in the cloud dev environment, or release to beta testers.
argument-hint: local web|app · dev [web|app|all] [--functions] [--db] · prod [web|app]
---

# Deploy Iron & Gold

Everything goes through `scripts/ship.mjs` (`npm run ship -- <args>`). It owns the environment
wiring, guards and smoke tests - never call `eas deploy`, `eas update`, `expo export` or
`supabase db push` directly, and never pass `--yes` without the user's go-ahead for that release.

Arguments: `$ARGUMENTS` (empty -> ask which target: local, dev or prod).

## Targets

| Target | What happens | Who sees it |
|---|---|---|
| `local web` | `expo start --web` on this Mac | only you, http://localhost:8081 |
| `local app` | `expo start` (QR for Expo Go; add `--tunnel` off-Wi-Fi) | your phone |
| `dev [web\|app\|all]` | web -> https://iron-and-gold--dev.expo.app (smoke-tested); app -> EAS branch `dev` | you and anyone you send the dev link |
| `prod [web\|app]` | full beta release from `main` (see below) | **beta testers** |

Local and dev builds use `.env.dev` (a separate dev Supabase project). Without it they run
**offline** (bots and pass-and-play only) - by design, so nothing here can touch testers' data.
`--functions` / `--db` on dev also deploy the game function / migrations to the dev project.

## local
Run in the background (Bash `run_in_background`, timeout 7200000) so the session stays usable:
`node scripts/ship.mjs local web` (or `local app`). Don't prefix it with `CI=1`: Expo turns file
watching off in CI mode, so edits silently stop showing up. Tell the user the URL / to scan the QR from the
output, and that edits hot-reload. Stop it with TaskStop when they're done.

## dev
1. Say which branch and commit is going out; uncommitted changes are fine for dev (say so).
2. `node scripts/ship.mjs dev <web|app|all> [--functions] [--db]` (foreground, timeout 600000).
3. Read the smoke screenshots (`.smoke/safari-iphone.png`, `.smoke/chrome.png`) and glance for
   anything broken. Report the dev URL / the Expo update link.

## prod (beta release)
Releases only from `main`, clean and pushed. On another branch, offer `/promote` first (merge `dev`
into `main`). For an urgent fix to what testers have: branch `hotfix/<name>` from `main`, fix,
merge to `main`, release, then merge `main` back into `dev`.

1. `node scripts/ship.mjs prod [web|app]` -> prints the RELEASE PLAN (dry run). Show it to the
   user in plain language: commits going out, whether the database or game rules change, any
   APK-rebuild warning.
2. Confirm with AskUserQuestion (release / cancel). Database migrations are hard to undo - call
   them out explicitly if present.
3. On yes: `node scripts/ship.mjs prod [web|app] --yes --message "<one-line summary>"`
   (timeout 600000). It runs tests, migrations, the game function if rules changed, deploys a web
   preview, smoke-tests it in Safari + Chrome, promotes it, publishes the app update and tags
   `beta-YYYY-MM-DD` with the ids rollback needs.
4. If the smoke test fails nothing was promoted - show the failing browser's screenshot from
   `.smoke/` and debug; don't retry blindly.
5. Report: tag, prod URL, update group, and "roll back with /rollback".
