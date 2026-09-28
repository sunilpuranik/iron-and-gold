# design-sync notes (Iron & Gold)

## How this repo syncs
- The app is Expo / React Native, plain JS, no dist and no .d.ts. `.design-sync/build-web.mjs` (cfg.buildCmd) compiles
  `.design-sync/web/index.js` (re-exports of src/) for the browser into `.design-sync/.cache/web/` (ESM + package.json +
  a symlink to `.ds-sync/node_modules` so the .d.ts extractor finds @types/react). The converter bundles that via cfg.entry.
- Run it BEFORE package-build/resync on every sync: `node .design-sync/build-web.mjs`.
- Aliases in build-web: react-native -> react-native-web (installed only in `.ds-sync/node_modules`, never in the app's
  package.json), `.web.js` resolution first, expo-haptics stubbed (no haptics in a browser).
- `.ds-sync` deps: `npm i esbuild ts-morph @types/react@19 react@19.2.3 react-dom@19.2.3 react-native-web playwright`
  then `npx playwright install chromium`. React/react-dom versions must match the app's react (19.2.3).
- Converter invocation: `--node-modules ./.ds-sync/node_modules` (the repo root node_modules has no react-dom).
- The public API contract is HAND-WRITTEN in `.design-sync/web/index.d.ts`. When a component's props change in src/,
  update index.d.ts too — nothing checks it against the JS. Same for new components: add to web/index.js AND index.d.ts.
- `RN` (react-native-web namespace) and `Icons` (the lucide icons the app uses) are exported for designs; both are
  excluded from cards via componentSrcMap null, as are ThemeProvider/SafeAreaProvider (provider chain in cfg.provider).
- Header.js is exported as `GameHeader` (a bare `Header` would be ambiguous in designs).

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

## Known render warns
- [RENDER_THIN] "rendered height is 0px" on BellSheet, CertificateSheet, CompanySheet, HandoffCover, InvestSheet,
  SettleSheet, Sheet, TickerSheet — Modal portals outside the measured root; screenshots are complete.

## Gilded Standard (v2)
- 46 → 30 public components (the Gilded Standard handoff). v1 names (Card, Avatar, CompanyIcon, RaisedTile, Emblem,
  Ingot, DoubleRule, RailRule, Hairline, IconButton, ViewSwitch, CharterSheet, SurvivorSheet, DispatchLines/Toast/Recap,
  Tile, IronFill/GoldFill/Keyline/Rivets, LIGHT/DARK) are gone; stale cards for them should be removed on the next resync.
- The `Dispatch` data type in index.d.ts is now `TurnDispatch` (the name `Dispatch` is the component).

## Re-sync risks
- index.d.ts drift from src/ (hand-written contract; the most likely silent staleness).
- react-native-web / lucide / react-native-svg upgrades change the web rendering; re-verify visually if bumped.
- `.design-sync/.cache/web` is regenerated; if build-web.mjs is skipped the converter bundles a stale dist.
- Previews depend on engine determinism (seeded deals). Rule/bot changes in src/game shift every game preview's
  content; expect regrades of the game components after engine edits.
- Fonts come from node_modules/@expo-google-fonts (TTF) via `.design-sync/web/fonts.css`; family names must match
  src/theme/tokens.js FONTS.
