# Iron & Gold

A frontier rail-town board game for 2–6 tycoons, built with Expo (SDK 58, plain JavaScript), running in **Expo Go**.
It plays as pass-and-play on one phone, or online across phones through a Supabase table.

> Frontier rail town, 1881. Build deeds on the town's 108 plots, charter companies, buy shares, and cash in when companies are bought out. When the closing bell rings, the tycoon with the most cash wins.

---

## Quick start

You need Node 22.13 or newer and the **Expo Go** app (SDK 58) on your phone.

```bash
git clone <this repo> iron-and-gold
cd iron-and-gold
npm install
npx expo start --tunnel
```

To open the game, scan the QR code: use the Camera app on iOS or Expo Go on Android.
Friends on other networks can scan the same QR code because `--tunnel` routes through ngrok. The first time you run it, Expo may ask to install `@expo/ngrok`; answer yes.
If everyone is on the same Wi-Fi, `npx expo start` without `--tunnel` is faster.

### Starting from a blank Expo app instead

To rebuild the project yourself rather than cloning it:

```bash
npx create-expo-app@latest iron-and-gold --template blank
cd iron-and-gold
npx expo install expo-haptics expo-audio expo-font @react-native-async-storage/async-storage \
  react-native-svg lucide-react-native react-native-safe-area-context \
  @expo-google-fonts/cinzel @expo-google-fonts/im-fell-english @expo-google-fonts/libre-franklin \
  @supabase/supabase-js react-native-url-polyfill
npx expo install -- --save-dev jest-expo jest
```

Then copy `App.js`, `src/`, `__tests__/`, `scripts/`, `supabase/` and the `jest` / `scripts` blocks of `package.json` into it.

---

## Online play (optional)

The app runs offline-only until `.env` has Supabase keys. Full setup, the Expo Go beta and its limits are in **[DEPLOYMENT.md](DEPLOYMENT.md)**. In short:

```bash
cp .env.example .env                 # add EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
npx supabase link --project-ref <ref>
npm run db:push                      # tables, members-only RLS, lobby functions, realtime
npm run deploy:functions             # the `game` Edge Function that checks every move
```

How online play works:

- Each phone signs in anonymously and keeps the session, so it stays the same tycoon. Home lists **Your tables** and marks the ones waiting on your move.
- Clients only read rooms they sit at. Lobby changes go through Postgres functions. Moves go to the `game` Edge Function, which replays them with the same engine and writes only if nobody moved first (`seq` check).
- Your own move shows immediately (the engine is deterministic), then the server confirms it.
- Bots move whenever anyone at the table has the game open.

---

## Pass-and-play

On Home, set up seats. You always take seat 1. Tap the person/robot icon to switch another seat between human and bot.
Between human turns, a full-screen **Hand to {name}** cover keeps each player's deeds private.
The game saves to AsyncStorage after every move. **Resume local game** on Home picks up where you left off.

### Map and Exchange

The switch in the header flips the main area between the **Map** and the **Exchange**. When your turn starts the game switches to the map, and the header reads *YOUR TURN* in gold. While other tycoons play it switches to the Exchange. You can flip between them at any time; a gold dot on the map icon means it's your move.

The Exchange shows:

- **Who is acting** and what they are doing, plus the turn number and deeds left.
- **Standings:** net worth, split into cash and shares.
- **Your position:** cash, share value, rank, and the bonus each majority or minority stake would pay.
- **The company race:** each company's size against the 11-plot trust mark and the 41-plot bell, its share price and its majority holder.
- **The closing bell gauge.**
- **The latest dispatches,** with a button that opens the full ticker.

### Charters and buyouts

When a company is chartered or bought out, everyone sees a full-screen moment framed like a share certificate:

- **Charter:** a *CHARTERED* stamp, a 3D company tile that flips up, and a gold seal, with the company's size, share price and the founder's share.
- **Buyout:** a *BUYOUT!* stamp, the absorbed tiles sliding into the survivor, a plot count that ticks up, a coin burst, and every bonus paid.

These stay on screen until you tap **Continue**. If several happen in a row, they queue (*Next · 1 more*). Bots wait while one is open.

### Share certificates

Tap any company plot on the map, a company in the **Market** tab, or a company in the Exchange's race, to open its engraved share certificate and share register.

### Turn dispatches

With **Turn dispatches** switched on (Home, or the switch at the top of the Ticker), each time another tycoon finishes a turn a telegram card drops in over the map. It says what they did: built, chartered, bought out, sold, swapped, bought. Tap it to dismiss it; it also hides itself after a few seconds.
In pass-and-play, the **Hand to {name}** screen also lists every turn since that player last played.

Dispatches are in-app only. Notifications while the app is closed need push notifications (`expo-notifications`, a development build and a small server to send them); see *Shipping* below.

---

## Shipping to the App Store and Google Play

Expo Go is for development. To give friends a real app icon on their phones, build with **EAS** (Expo Application Services). `app.json` and `eas.json` are already set up for it.

**Accounts you need**

- A free Expo account: `npx expo login`
- **Apple Developer Program**: $99 a year. Required for TestFlight and the App Store.
- **Google Play Console**: $25 one-off. Required for Play Store testing tracks and release.

**One-time setup**

```bash
npm install -g eas-cli
eas login
eas init            # links this project to your Expo account and writes its projectId into app.json
```

The bundle id is `com.ironandgold.game` (iOS `bundleIdentifier` and Android `package` in `app.json`). If Apple or Google says it is taken, change both to something you own, like `com.yourname.ironandgold`, before the first build.

**Friends-only testing (recommended first)**

- **Android:** `eas build -p android --profile preview` builds an `.apk`. Send friends the link EAS prints and they install it directly. No Play Store needed.
- **iOS:** `eas build -p ios --profile production`, then `eas submit -p ios`. The build lands in App Store Connect → **TestFlight**. Add friends as testers by email; they install through the TestFlight app. External testers need a one-time Beta App Review, usually about a day.

**Public release**

```bash
eas build --platform all --profile production
eas submit --platform ios       # App Store Connect
eas submit --platform android   # Play Console (needs a Google service-account key the first time)
```

Then, in App Store Connect and Play Console, add:

- screenshots
- a description
- an age rating
- a privacy policy URL
- a privacy questionnaire. Iron & Gold collects no personal data beyond a display name, and only if online play is on.

Submit for review. Apple usually replies in 1–3 days. Google's first review can take up to a week, and new personal developer accounts must first run a closed test with at least 12 testers for 14 days before they can publish to production.

**Before going public with online play**

- Replace the prototype's permissive RLS with Supabase **anonymous sign-in** plus policies that only let room members write their room.
- Move bot turns off the host's phone and onto a server, for example a Supabase Edge Function, so games don't stall when the host closes the app.
- For push notifications ("It's your turn"), add `expo-notifications`, store each player's push token in the room, and send from that same Edge Function. Push needs a development or production build; it does not work in Expo Go.

---

## Troubleshooting

**`CommandError: xcrun is not configured correctly`** when pressing `i`: the iOS Simulator needs the full **Xcode** app on a Mac (the command-line tools alone are not enough).

1. Install Xcode from the Mac App Store and open it once to accept the licence and install components.
2. Point the command-line tools at it: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
3. In Xcode → Settings → Components (called Platforms in older versions), install an iOS Simulator runtime.
4. Run `npx expo start` again and press `i`.

Alternatively, skip the simulator and scan the QR code with an iPhone.

**`No Android connected device found`** when pressing `a`: you need an Android Studio emulator for that key. Scan the QR code with Expo Go on a phone instead.

---

## Tests and simulation

```bash
npm test            # jest-expo: engine, invariants, server referee, online client, buttons
npm run simulate    # 200 bots-only games; checks that every game terminates
npm run simulate -- 300 0   # 300 games with 2–6 players (0 = cycle through player counts)
```

The tests cover:

- pricing
- dealing
- founding a company, including the 8th-company block
- flood-fill growth
- a 3-way buyout (bonus order, dispose queue, sell and swap limits)
- tied survivors
- bonus splits, including rounding up to $100
- trust safety
- dead-deed replacement
- buying rules
- every end condition
- full bots-only games for 2–6 players, with and without the closing bell
- invariants on every step of seeded games: tiles, shares and cash conserved, purity, determinism, JSON round trip, illegal input
- the server referee: who may start, move and nudge bots; stale and illegal moves
- the online client: anonymous session reuse, RPC arguments, error and 409 handling
- UI primitives: gold/iron fills cover the whole button, disabled and pressed states, the ingot's measured size

---

## Rules summary

| | |
|---|---|
| Board | 108 plots, rows A–I × columns 1–12, shown in portrait. Plots 1–4 are River Landing, 5–8 Foundry Row, 9–12 Main Street. |
| Setup | $6,000 and 6 deeds each. One random plot per tycoon is pre-surveyed. Seating is shuffled. |
| Turn | 1) Build one deed. 2) Buy up to 3 shares among active companies. 3) Draw back up to 6 deeds. |
| Build | A deed with no neighbours becomes a surveyed plot. Touching only loose plots charters a company (pick any unused one, get 1 free founder share). Touching one company grows it. Touching two or more companies triggers a buyout. |
| Buyout | The largest company survives; on a tie, the builder chooses. For each absorbed company, largest first, the majority holder gets 10× the share price and the minority holder 5×. Ties split the bonus, rounded up to $100, and a sole holder takes both bonuses. Then each holder, starting with the current tycoon, chooses to sell, swap 2-for-1 into the survivor, or hold. |
| Trust | A company with 11 or more plots is a trust and can't be absorbed. A deed that would merge two trusts is dead and is replaced at the start of your turn. A deed that would charter an 8th company is held until it can be played. |
| Price | `(2 + k + tier) × $100`, where k = 0,1,2,3 for sizes 2–5; 4 for 6–10; 5 for 11–20; 6 for 21–30; 7 for 31–40; 8 for 41+. |
| Closing bell | On your buy step, you may end the game if any company has 41+ plots or every active company is a trust. The game also ends when the deed pool is empty and nobody can build. Final bonuses are paid for every active company, all shares are sold, and the most cash wins. |

Companies:

| Company | Industry | Tier |
|---|---|---|
| Continental Wire | Telegraph | Frontier |
| Platte River Packet | Shipping | Frontier |
| Plains & Western Railway | Railroad | Growth |
| Red Mesa Oil | Oil | Growth |
| Arclight Electric | Electric light | Growth |
| Carbon Ridge Steel | Steel | Heavy |
| First Territorial Bank | Banking | Heavy |

---

## Project layout

```
App.js                      fonts, theme, simple screen switcher
src/game/data.js            board, districts, flavour text, companies, constants
src/game/rules.js           classify, price, sizes, bonuses, effectOf, canClose …
src/game/engine.js          newGame, applyAction (pure, no React) + re-exports
src/game/bot.js             botAction
src/game/useLocalGame.js    pass-and-play controller + AsyncStorage save
src/net/online.js           Supabase client, anonymous session, lobby RPCs, game ops, realtime
src/net/gameOps.js          server-side referee (start / move / bot), shared with the Edge Function
src/net/useOnlineGame.js    online controller (optimistic moves, anyone at the table nudges bots)
src/screens/                Home, Lobby, Game
src/components/game/        Board, Tile, Header, StatusStrip, Tabs (Deeds/Market/Tycoons), ActionBar, HandoffCover
src/components/sheets/      CompanySheet (charter / tied buyout), Settle shares, Invest, Closing bell, Ticker
src/components/Portrait.js  six banknote-cameo tycoon portraits (SVG), round gold-rimmed frame
src/components/game/Dispatch.js  turn dispatch: toast telegram, handoff recap, lines
src/components/game/EventOverlay.js  charter / buyout celebration
src/components/Certificate.js  engraved share certificate on bond paper
src/game/recap.js           turn summaries for dispatches
src/theme/brand.js          Plate (lacquer/iron/gold/bond), Rule, Seal (notary/coin), wordmark
src/components/CompanyMark.js  the one mark per company (flat or raised), used everywhere
src/theme/                  "Gilded Standard" tokens (lacquer default, bond light), UI primitives
src/feel/feel.js            haptics + playSting() stub
scripts/simulate.mjs        bots-only games in Node
__tests__/                  engine rules, engine invariants, server referee, online client, UI primitives
supabase/migrations/        rooms + members tables, RLS, lobby functions, realtime
supabase/functions/game/    Edge Function that checks and stores every move
```

### Engine API

```js
import { newGame, applyAction, botAction, actorOf, classify, price, sizeOf, effectOf } from './src/game/engine';

let s = newGame([{ id: 'a', name: 'Ada' }, { id: 'b', name: 'Bo', bot: true }]);
s = applyAction(s, actorOf(s), { type: 'place', tile: s.players[s.turn].hand[0] }); // new state, or null if illegal
```

Actions:

- `place{tile}`
- `found{company}`
- `survivor{company}`
- `dispose{sell, trade}`
- `buy{cart}`
- `close{cart?}`

The state carries a `log` (the ticker) and an `fx` marker `{kind: survey|build|found|buyout|bell, id, tile, seq}`. The board uses `fx` to flood the acquiring company's colour outward from the placed plot, with a delay of 70 ms per step of Manhattan distance, capped at 900 ms.

### Adding the buyout sting

`playSting()` in `src/feel/feel.js` is a stub. To give buyouts a sound, put a short file at `assets/sounds/sting.mp3` and follow the comment in that file to play it with `expo-audio`'s `createAudioPlayer`.
