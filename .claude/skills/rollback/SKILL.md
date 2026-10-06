---
name: rollback
description: Undo a bad Iron & Gold release or local change - "roll back prod", "testers are broken, revert", "go back to the last release", "undo my local changes". Use when the user wants an earlier version back, in beta (prod), dev or on this machine.
argument-hint: prod [web|app|functions|all] [--to <tag>] · dev · local
---

# Roll back

Arguments: `$ARGUMENTS` (empty -> ask: prod (testers), dev, or local).

## prod - put testers back on an earlier release
Every release is an annotated tag `beta-*` holding its web deployment id, app update group and
Supabase project; `scripts/ship.mjs rollback` reads them back.

1. `node scripts/ship.mjs rollback prod [web|app|functions|all] [--to <tag>]` -> ROLLBACK PLAN
   (dry run; default target is the release before the latest). `node scripts/ship.mjs status`
   and `git tag -n3 --sort=-creatordate 'beta-*'` list releases if the user wants to pick.
2. Show the plan and confirm with AskUserQuestion. Database migrations are **never** rolled back
   automatically - if the plan warns about them, explain that the old app must still work with the
   newer schema (migrations are kept additive for this reason) or a manual SQL fix is needed.
3. On yes: same command with `--yes`. Web flips instantly; app testers get it on their next
   open (close + reopen once more to apply).
4. Then fix forward on `main`: `git revert <bad commits>`, so the next `/deploy prod` doesn't
   re-ship the bug. Offer to do it.

## dev
Dev is disposable: check out the commit you want and redeploy it -
`git checkout <commit-or-tag> && node scripts/ship.mjs dev`, then `git checkout -` back.

## local (this machine)
Look first: `git status`, `git log --oneline -10`. Then pick the gentlest tool and confirm before
anything that discards work:
- try an older version without losing anything: `git stash` (uncommitted work) or
  `git switch --detach <commit|tag>`; come back with `git switch -` / `git stash pop`
- undo a commit but keep history: `git revert <commit>`
- throw away uncommitted edits to a file: `git restore <file>` (destructive - confirm)
Never `git reset --hard` or force-push without the user explicitly asking.
