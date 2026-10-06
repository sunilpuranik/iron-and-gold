---
name: status
description: Show what Iron & Gold version is live where - beta release, dev URL, which branch you're on, what's unreleased. Use for "what's live", "what do testers have", "status", "what's not shipped yet".
---

# Status

Run `node scripts/ship.mjs status` and summarize it in a few lines:
- the branch you're on and uncommitted changes
- the live beta release (tag, date) and how many commits on `main` testers don't have yet
- `git log --oneline <latest beta tag>..dev` - what's waiting on `dev`
- dev environment: URL, online (own Supabase) or offline
- anything off: CLI linked to an unexpected Supabase project, `main` behind `origin/main`
