# Iron & Gold

A frontier rail-town board game for 2–6 tycoons, built with Expo (SDK 57, plain JavaScript), running in **Expo Go**.
It plays as pass-and-play on one phone, or online across phones through a Supabase table.

> Frontier rail town, 1881. Build deeds on the town's 108 plots, charter companies, buy shares, and cash in when companies are bought out. When the closing bell rings, the tycoon with the most cash wins.

---

## Quick start

You need Node 20 or newer and the **Expo Go** app (SDK 57) on your phone.

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
  @expo-google-fonts/im-fell-english-sc @expo-google-fonts/im-fell-english @expo-google-fonts/libre-franklin \
  @supabase/supabase-js react-native-url-polyfill
npx expo install -- --save-dev jest-expo jest
```

Then copy `App.js`, `src/`, `__tests__/`, `scripts/`, `supabase.sql` and the `jest` / `scripts` blocks of `package.json` into it.

---

## Online play (optional)

The app runs offline-only until you give it Supabase keys.

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste in `supabase.sql`, and run it. The script:
   - creates `rooms(code pk, lobby jsonb, state jsonb, seq int)`
   - turns on a permissive RLS policy, which is only suitable for a prototype
   - sets `replica identity full` and adds the table to the `supabase_realtime` publication
3. In **Project Settings → API**, copy the **Project URL** and the **anon public** key into `src/net/online.js`:
   ```js
   export const SUPABASE_URL = 'https://xxxx.supabase.co';
   export const SUPABASE_ANON_KEY = 'eyJ…';
   ```
4. Restart `npx expo start --tunnel`. On Home, **Host a room** gives you a 4-letter code to share. Friends enter it under **Join**.

How online play works:

- Every client subscribes to its room row over Supabase Realtime, and polls every 10 seconds as a fallback.
- A player's move is applied locally by the engine. The whole state is then written back with an optimistic check (`update … where seq = prev`). If another write landed first, the client refreshes instead of overwriting it.
- **The host's phone drives the bots.** Keep it open during a game that has bots.
- Anyone who holds the anon key can read and write rooms. Don't use this setup for anything beyond playing with friends.

---

## Pass-and-play

On Home, set up seats. You always take seat 1. Tap the person/robot icon to switch another seat between human and bot.
Between human turns, a full-screen **Hand to {name}** cover keeps each player's deeds private.
The game saves to AsyncStorage after every move. **Resume local game** on Home picks up where you left off.

---

## Tests and simulation

```bash
npm test            # jest-expo unit tests for the engine
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
src/net/online.js           Supabase config, rooms, optimistic writes, realtime
src/net/useOnlineGame.js    online controller (host drives bots)
src/screens/                Home, Lobby, Game
src/components/game/        Board, Tile, Silhouette, Header, StatusStrip, Tabs, ActionBar, HandoffCover
src/components/sheets/      Charter, Tied buyout, Settle shares, Invest, Closing bell
src/theme/                  "Engraver's Ink" tokens, light/dark, UI primitives
src/feel/feel.js            haptics + playSting() stub
scripts/simulate.mjs        bots-only games in Node
__tests__/engine.test.js    engine unit tests
supabase.sql                table, RLS, realtime publication
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
