---
name: promote
description: Move tested work from the dev branch to main so it can be released - "promote dev", "merge dev into main", "get dev ready for prod". Use before a beta release when the work lives on dev or a feature branch.
argument-hint: "[branch to promote, default dev]"
---

# Promote to main

Branches: `main` = exactly what beta testers run (releases go out only from here). `dev` = the
working branch; features go on `feature/<name>` branches off `dev` and merge back when done.

1. Source branch: `$ARGUMENTS` or `dev`. It must be committed and pushed; `npx jest --silent` must pass on it.
2. Show what would go to testers: `git log --oneline main..<branch>` and `git diff --stat main..<branch>`.
   Flag anything under `supabase/migrations` (database change) or `src/game` / `src/net/gameOps.js`
   (rule change - the game function redeploys on release).
3. Confirm with AskUserQuestion, then:
   `git switch main && git pull --ff-only && git merge --no-ff <branch> -m "Promote <branch> to main" && git push origin main`.
   On conflicts, stop and show them - don't resolve rule or migration conflicts silently.
4. Switch back to the source branch, and offer `/deploy prod` (it starts with a dry-run plan).
