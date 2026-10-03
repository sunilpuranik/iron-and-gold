# design-sync notes (Iron & Gold)

## How this repo syncs
- The app is Expo / React Native, plain JS, no dist and no .d.ts. `.design-sync/build-web.mjs` (cfg.buildCmd) compiles
  `.design-sync/web/index.js` (re-exports of src/) for the browser into `.design-sync/.cache/web/` (ESM + package.json +
  a symlink to `.ds-sync/node_modules` so the .d.ts extractor finds @types/react). The converter bundles that via cfg.entry.
- Run it BEFORE package-build/resync on every sync: `node .design-sync/build-web.mjs`.
  The resync driver does NOT run cfg.buildCmd - skip it and the cards render against a stale `.cache/web`
  (seen in the Gilded Standard sync: a new ThemeProvider prop was silently ignored).
- Aliases in build-web: react-native -> react-native-web (installed only in `.ds-sync/node_modules`, never in the app's
  package.json), `.web.js` resolution first, expo-haptics stubbed (no haptics in a browser).
- `.ds-sync` deps: `npm i esbuild ts-morph @types/react@19 react@<app's react> react-dom@<same> react-native-web@<app's rnw> playwright`
  then `npx playwright install chromium`. React/react-dom must match the app's react (19.3.0 since the SDK 58 upgrade) and
  react-native-web should match the app's own copy (0.21.3), so cards render like the live web app.
- This Mac's ~/.npm cache has root-owned entries (EACCES on rename). Pass `--cache <scratch dir>` to npm installs.
- build-web stubs `@react-native/assets-registry/registry`: react-native-svg still imports it, but RN 0.88 dropped the
  package (`@react-native/asset-utils` replaced it). No DS component renders a bundled image asset, so an empty registry is safe.
- build-web also stubs `@supabase/supabase-js`, `@react-native-async-storage/async-storage` and
  `react-native-url-polyfill/auto` (src/net/online.js requires them lazily inside db(); SaloonPanel imports online.js only for
  `myTurnAt`), and defines `process.env.EXPO_PUBLIC_SUPABASE_URL/ANON_KEY` as "" — without the defines the whole bundle dies
  at load with `ReferenceError: process is not defined` and every card reports "root empty" / [BUNDLE_EXPORT] 36/36.
  Any new `process.env.X` read in src/ needs the same define.
- Converter invocation: `--node-modules ./.ds-sync/node_modules` (the repo root node_modules has no react-dom).
- The public API contract is HAND-WRITTEN in `.design-sync/web/index.d.ts`. When a component's props change in src/,
  update index.d.ts too — nothing checks it against the JS. Same for new components: add to web/index.js AND index.d.ts.
- `RN` (react-native-web namespace) and `Icons` (the lucide icons the app uses) are exported for designs; both are
  excluded from cards via componentSrcMap null, as are ThemeProvider/SafeAreaProvider (provider chain in cfg.provider).
- Header.js is exported as `GameHeader` (a bare `Header` would be ambiguous in designs).

## Theme in cards
- cfg.provider pins `ThemeProvider scheme="dark"` (LACQUER). The capture browser reports a LIGHT colour scheme, so without the
  pin every card renders on bond paper (BOND_THEME) - the opposite of the house style. conventions.md tells designs to pass it too.
- Seal and Dispatch are `cardMode: column` ([GRID_OVERFLOW] wide on the Coin / toast cells).

## Previews
- `.design-sync/previews/_kit.tsx` is a shared fixture, not a component (build logs "stale preview: _kit" — harmless).
  It deals real states with the engine (`midGame()` = seed 7 after 90 bot actions; `inPhase(p, seed)`; `finished()`).
  Seed 7 reaches every phase; seed 11 reaches 'dispose' on seat 0. Edits to _kit do NOT re-key grades of the previews
  that import it — force a recapture (`--components`) of the game previews after changing it.
- Seats are shuffled by newGame, so seat 0 is "Widow Pike" for seed 7, not the first listed tycoon.
- The capture harness freezes Date.now; RN Animated measures time with it, so entrance animations park at frame 0.
  `liveClock()` in _kit re-bases Date.now on performance.now; call it at module top in any preview whose component
  animates in (EventOverlay, Dispatch). EventOverlay also stages content with real setTimeout delays (up to ~2s),
  so its harness frame is mid-animation — it was graded from a settled screenshot taken at 3.5–4s.
- Dispatch as="toast" auto-dismisses; its preview re-sends the dispatch on onDone so the card never goes blank.
- Sheets/HandoffCover are RN Modals (portal to body): cardMode single, viewport 400x760.

## Web layering gotcha
- On react-native-web a bare lucide icon (`<svg>`, position:static) placed as a direct child of a gold/iron `Plate` is painted
  UNDER the Plate's absolutely positioned GoldFill/IronFill — invisible on web, fine on native. Wrap it in a View (fixed in
  PlayCards' Chevron, 2026-10-01). Check this first when an icon is missing from a card.

## Known render warns
- [RENDER_THIN] "rendered height is 0px" on BellSheet, CertificateSheet, CompanySheet, HandoffCover, InvestSheet,
  SettleSheet, Sheet, TickerSheet — Modal portals outside the measured root; screenshots are complete.
- Sheet cards show a grey band above the sheet: the scrim over the capture page's white body. Harness-only.

## Gilded Standard (v2)
- 46 → 30 public components (the Gilded Standard handoff). v1 names (Card, Avatar, CompanyIcon, RaisedTile, Emblem,
  Ingot, DoubleRule, RailRule, Hairline, IconButton, ViewSwitch, CharterSheet, SurvivorSheet, DispatchLines/Toast/Recap,
  Tile, IronFill/GoldFill/Keyline/Rivets, LIGHT/DARK) are gone; stale cards for them should be removed on the next resync.
- The `Dispatch` data type in index.d.ts is now `TurnDispatch` (the name `Dispatch` is the component).

## Remote files not produced by this build
- `templates/gilded-standard/*`, `templates/splash/*` (the "Splash — Gold Rush" design, implemented in the app as
  src/components/home/{FrontierScene,WantedPoster,PlayCards}.js and synced as components since 2026-10-01), `uploads/` and `github.md` in the project were made by
  hand in Claude Design - never delete them in a sync.
- Font deletes are not in the diff's `deletePaths` (it tracks component files only): when a font leaves `fonts/`, review
  `list_files` and add the stale `fonts/<file>` to the plan's deletes by hand (done for IMFellEnglishSC in the v2 sync).

## Re-sync risks
- The app runs Expo SDK 58 on React Native 0.88.0-rc.3 (a release candidate). When RN 0.88 goes stable, bump the app, rebuild
  and expect a bundle-only upload; re-check that react-native-svg no longer needs the assets-registry stub.
- Splash components (FrontierScene, WantedPoster, NewGameCard, ContinueCard, SaloonPanel, FooterQuote) are exported and
  carded. Their props live in index.d.ts by hand (incl. the `SaloonRoom` row shape, mirroring online.js listMyRooms' select) —
  re-check when HomeScreen/PlayCards/online.js change. FrontierScene's preview calls liveClock() (title rises in; train/riders/
  coins loop), so its frame varies a little between captures.
- index.d.ts drift from src/ (hand-written contract; the most likely silent staleness).
- react-native-web / lucide / react-native-svg upgrades change the web rendering; re-verify visually if bumped.
- `.design-sync/.cache/web` is regenerated; if build-web.mjs is skipped the converter bundles a stale dist.
- Previews depend on engine determinism (seeded deals). Rule/bot changes in src/game shift every game preview's
  content; expect regrades of the game components after engine edits.
- Fonts come from node_modules/@expo-google-fonts (TTF) via `.design-sync/web/fonts.css`; family names must match
  src/theme/tokens.js FONTS.
