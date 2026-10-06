# Iron & Gold: closed beta deployment plan

The goal: friends open Iron & Gold in **Expo Go**, host or join tables with a 4-letter code, close the app, and pick their games up later from **Your tables** on Home. Games can run over hours or days.

**Backend:** Supabase. You do **not** need Firebase. The app already runs on Supabase, the free tier covers a closed beta, and it doesn't need a billing card.

---

## 1. What changed and how it fits together

```
 Phone (Expo Go)                               Supabase
 ─────────────────                             ─────────────────────────────────────────
 anonymous sign-in, session saved  ─────────►  Auth (anonymous users)
 lobby: create/join/add bot/remove ─────────►  Postgres functions (create_room, join_room, …)
 game moves + "move the bot"       ─────────►  Edge Function `game`
                                                 └─ replays the move with the same engine
                                                    (src/game, copied in at deploy) and
                                                    writes it only if seq still matches
 reads its own rooms + live updates ◄────────  rooms table (RLS: members only) + Realtime
```

| Before (prototype) | Now (beta) |
|---|---|
| Anyone with the anon key could read or overwrite any room | Players can read only the rooms they sit at. Nobody can write to a room directly. |
| The client wrote the whole game state | The server re-checks every move with the engine; illegal or stale moves are refused (422/409) |
| Identity was a random id in AsyncStorage | Anonymous Supabase user with a saved session, so each phone keeps the same tycoon |
| The host's phone ran the bots; if the host left, the game stalled | Any player with the table open moves the bots, through the server |
| No way back into a game after leaving it | **Your tables** on Home lists every unfinished table and marks the ones waiting on you |
| Keys were pasted into `src/net/online.js` | `.env` (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`) |

Files:

- `supabase/migrations/20260928000000_online_rooms.sql`: tables, RLS, lobby functions, realtime, optional cleanup job. **It drops the old prototype `rooms` table.**
- `supabase/functions/game/index.js`: the move referee. Its rules live in `src/net/gameOps.js`, which the jest tests cover.
- `supabase/config.toml`: function entrypoint and JWT check.
- `scripts/sync-engine.mjs`: copies `src/game/*` and `src/net/gameOps.js` into the function before deploy.

---

## 2. What I need from you (checklist)

- [ ] A Supabase project (free), with its **Project URL** and **anon public key**
- [ ] **Anonymous sign-ins** switched on in that project
- [ ] The Supabase CLI logged in on your Mac (`npx supabase login`)
- [ ] An Expo account, plus a free **Expo organization** that owns the project
- [ ] Each tester's Expo account (username or email), so you can invite them to that organization. See the warning in step 5 for why.

You don't need to give me any secrets. The anon key and URL go in your local `.env`, which is git-ignored. The service-role key never leaves Supabase: the Edge Function reads it from its environment automatically.

---

## 3. Supabase setup (about 15 minutes, once)

1. **Create the project.** On [supabase.com](https://supabase.com) → New project. Pick a region near your friends and save the database password.
2. **Turn on anonymous sign-ins.** Go to Authentication → Sign In / Providers → **Allow anonymous sign-ins** → on.
   - Optional but recommended: in Authentication → Attack Protection, turn on CAPTCHA or keep the default rate limits. Anonymous sign-ins are rate-limited per IP by default.
3. **Put the keys in `.env`.** Go to Project Settings → API:
   ```bash
   cp .env.example .env
   # then edit .env:
   # EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   # EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
   ```
4. **Link the repo and push the schema:**
   ```bash
   npx supabase login
   npx supabase link --project-ref <ref>      # the <ref> in your project URL
   npx supabase db push                       # applies supabase/migrations/* (first time; releases do it after)
   ```
   If you'd rather not use the CLI, paste the migration file into Dashboard → SQL Editor and run it.
5. **Deploy the move referee:**
   ```bash
   npm run sync:engine && npx supabase functions deploy game   # first time; releases redeploy it when rules change
   ```
   After the first setup, `npm run ship -- prod` (or `/deploy prod` in Claude) redeploys it automatically whenever `src/game/*` or `src/net/gameOps.js` changed, so the server and the app play by the same rules.
6. **Optional: cleanup.** In Database → Extensions, enable `pg_cron`, then re-run the last block of the migration. It deletes tables untouched for 14 days.

**Smoke test (on your own devices).** Run `npx expo start`, then open the game on the iOS simulator and on your phone.

- [ ] Home shows the **Telegraph table** section with **Host a room** (not "Online play is off").
- [ ] Host a room on one device, and join it with the code on the other.
- [ ] Add a bot, then start. Moves show up on both devices within about a second.
- [ ] The bot plays while either device has the game open.
- [ ] Force-quit one device and reopen it. The table shows under **Your tables**, marked **Your move** when it's your turn, and tapping it drops you back in.
- [ ] In Dashboard → Table Editor → `rooms`, `status`, `seq` and `turn_of` change with every move.

---

## 4. Getting the app to friends through Expo Go

> ⚠️ **Read this first: Expo Go needs a login (since SDK 57).**
> From SDK 57, Expo Go on **iOS** only runs a project when the person is logged in to an Expo account that has access to it. Expo says Android will follow. A public QR code no longer works for people outside your account. ([Expo changelog](https://expo.dev/changelog/expo-go-57-login), [Expo blog post](https://dev.to/expo/running-an-expo-sdk-57-app-in-expo-go-you-now-need-to-be-logged-in-on-both-ends-32ef))
> So for an Expo Go beta, **each friend needs a free Expo account and must be a member of the organization that owns the project.** Please check the current invite rules on expo.dev before inviting people. If this is too much friction, see **Fallback** below.

One-time setup:

```bash
npm install -g eas-cli
eas login
# On expo.dev: create an organization (for example "iron-and-gold-beta"), then invite each tester's
# Expo account as a member (the "Viewer"/"Developer" role is enough to open the app).
eas init                  # link this project; pick the organization as owner
eas update:configure      # installs expo-updates, adds updates.url + runtimeVersion to app.json
```

> ⚠️ **Then fix the runtime version for Expo Go.** `eas update:configure` writes `"runtimeVersion": { "policy": "appVersion" }`, which publishes updates as runtime `1.0.0`. Expo Go rejects those with *"not compatible with this version of Expo Go"*. Expo Go only loads updates made for its SDK, so in `app.json` set:
> ```json
> "runtimeVersion": { "policy": "sdkVersion" }
> ```
> After publishing, `npx eas update:list --branch beta --limit 1` should show **Runtime Version `exposdk:58.0.0`**. The Android beta APK uses the same runtime so it can share the `beta` branch. For store builds, switch to `appVersion` or `fingerprint`.

Publish a beta build of the JavaScript:

```bash
npm test                               # 97 tests: engine, invariants, server referee, online client, buttons
npm run ship -- prod                   # prints the release plan; add --yes to release (or /deploy prod in Claude)
```

`eas update` bundles your local `.env` into the update, so publish from a machine that has the real keys.

Testers:

- **iPhone (easiest): use the web version (section 4a).** Open the link in Safari, then Share → **Add to Home Screen**. No Expo account, no install.
- **iPhone, native:** install **Expo Go** from the App Store, log in with the Expo account you invited, then open the project from Expo Go's home screen (under the organization) or scan the QR code on the update's page at expo.dev.
- **Android:** install the beta APK (below), or use the web version. No Expo account is needed. Android Expo Go is unreliable here. On SDK 57 it marked every update *"not compatible"* and failed with *"Failed to download remote update"* on physical phones, because it didn't send the login with update requests ([expo/expo#50139](https://github.com/expo/expo/issues/50139), fixed in [#50498](https://github.com/expo/expo/pull/50498)). Expo Go 58.0.2 (28 Sep 2026) came out after that fix, so Expo Go may work on SDK 58, but it hasn't been confirmed on a real phone yet.
- **Each Expo Go build runs one SDK.** When Expo ships a new SDK, the stores move testers' Expo Go to it and the project must be upgraded too (`npx expo install expo@^<next> --fix`), then republished and the APK rebuilt.

Then enter a name and portrait, and pick **Play with friends** (host or join an online room) or **Play with bots**.

**Android APK (one-time per native change):**

```bash
eas build -p android --profile preview   # ~15 min on EAS; prints an install link to share
```

- The `preview` profile reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from the **preview** environment on EAS (`eas env:list --environment preview`). Cloud builds never see your local `.env`.
- The `preview` channel is pointed at the `beta` branch (`eas channel:edit preview --branch beta`), so APK testers get the same updates as Expo Go testers.
- Rebuild the APK whenever you add or upgrade a native package (anything installed with `npx expo install` that has native code). The `sdkVersion` runtime policy doesn't detect those changes, so an old APK would receive JS that needs native code it doesn't have.

To ship a fix, release from `main` with `/deploy prod` (or `npm run ship -- prod --yes`). It redeploys the game function first if the rules changed. Testers on both platforms get it the next time they open the app (close and reopen once more to apply it). See README → *Branches, environments and shipping*.

### 4a. The web version (recommended for iPhone friends)

The same game runs in a browser, hosted free on EAS Hosting. It uses the same Supabase backend, so web, APK and Expo Go players can share a table.

```bash
npm run ship -- prod web --yes   # export, preview deploy, Safari + Chrome smoke test, then promote
```

- The first deploy asks you to pick a subdomain, for example `https://iron-and-gold.expo.app`.
- Put that URL in `.env` as `EXPO_PUBLIC_WEB_URL=https://…expo.app` and add it to EAS too (`eas env:create --environment preview --name EXPO_PUBLIC_WEB_URL --value https://…expo.app --visibility plaintext`). Then release again (`npm run ship -- prod --yes`). After that, **Share code** in a lobby sends a link like `https://…expo.app/?room=ABCD`, which opens straight onto the join screen with the code filled in.
- Friends on iPhone: open the link in **Safari**, then Share → **Add to Home Screen**. It opens full screen with the game's icon. Their anonymous session is kept in Safari's storage for that home-screen app, so their tables are still there next time.
- `npm run ship -- prod` updates both web and app in one release.
- Limits: no haptics on the web, and iOS may clear a home-screen web app's storage if it goes unused for a few weeks, which forgets that player's tables.

---

## 5. Limits and costs for a friends beta

| Thing | Free tier | What it means here |
|---|---|---|
| Supabase database | 500 MB | Each game is about 30–60 KB, so tens of thousands of games fit. |
| Edge Function calls | 500k / month | About 1 call per move. A full 4-player game is a few hundred calls. |
| Realtime | 200 concurrent connections | Plenty. |
| **Project pausing** | **Free projects pause after about 7 days with no activity** | If nobody plays for a week, open the dashboard and click *Restore*. |
| EAS Update | Free plan monthly update quota | Fine for a beta. |

---

## 6. Known beta limitations (by design, for now)

- **Hidden deeds aren't hidden from a determined player.** Members can read the whole game row, including other tycoons' hands. The app never shows them, but a friend with devtools could. The fix is to split private hands into a members-only-by-seat table. Worth doing before any public release.
- **Bots only move while someone has the table open.** For async games that's fine: whoever opens it next watches the bots catch up.
- **No push notifications yet.** "Your move" shows on Home under **Your tables**. Push needs `expo-notifications` plus a development or store build. Remote push no longer works in Expo Go on Android.
- **One tycoon per phone.** Anonymous sessions live on the device; deleting the app, or clearing its data, forgets that player's tables. Upgrading to email or Apple/Google sign-in later keeps the same user id (`linkIdentity`), so nothing needs migrating.
- **Guests can leave a lobby; hosts can't.** The host's table just waits under **Your tables**.

---

## 7. After the beta (not needed now)

1. Private hands table plus an RLS policy by seat (see above).
2. Push notifications: store Expo push tokens per user, and send one from the `game` function when `turn_of` changes to a human.
3. Server-driven bots for tables nobody is watching: a scheduled Edge Function that nudges games stuck on a bot.
4. Real accounts (link email or Apple/Google to the anonymous user).
5. Store builds: `eas build` plus TestFlight or Play internal testing (see `README.md` → *Shipping*).

---

## 8. Rollback

- **App only:** `npm run ship -- rollback prod app --yes`.
- **Everything:** `/rollback prod` (or `npm run ship -- rollback prod --yes`) re-promotes the previous release's web deployment, republishes its app update and redeploys its game function if the rules differ.
- **Database:** the migration drops the prototype `rooms` table. There was no production data, so there is nothing to roll back to. Future migrations should be additive.
