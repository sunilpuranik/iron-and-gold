# Gilded Standard — implementation handoff (Iron & Gold v2)

Repo: sunilpuranik/iron-and-gold · branch claude/iron-gold-game-prototype-ged47q
Spec: GildedStandard.dc.html (visual reference) · tokens: tokens.gilded.js

## Rules
1. Gold only for: money, the ONE primary action per screen, charter/buyout/bell moments.
2. Default theme = LACQUER (black). Cream "bond" paper only for documents (Certificate, deeds, final ledger).
3. Square corners. Spacing 4/8/12/16/24/32. Every plate carries a gilt keyline (rgba(207,166,74,.45), inset 5).
4. Visual only — do not touch src/game/*. Tests must stay green.

## Steps (one commit each, run `npm test` after each)
1. **Tokens** — replace src/theme/tokens.js with tokens.gilded.js. Keep old names as aliases (paper→ground, ledger→plate, gilt→money, giltSoft→gold.deep, goldLeaf→{hi:shine,mid:leaf,lo:deep,ink}) so nothing breaks. ThemeProvider: dark=LACQUER, light=BOND_THEME, default LACQUER.
2. **Text** — src/theme/text.js uses TYPE; add `hero`; `plate` renders uppercase.
3. **Primitives** (src/theme/ui.js, brand.js):
   - `Plate material="lacquer|iron|gold|bond" rivets pad` → replaces Card, IronFill, GoldFill, Keyline, Rivets (keep as internals).
   - `Rule kind="hair|gilt|ornament|rail"` → replaces DoubleRule, RailRule, Hairline. Section titles use `gilt`; `rail` only on the map.
   - `Money v="ingot|title|body|small" delta` → absorbs Ingot. Negative delta uses jewel.carnelianText.
   - `Button kind="gold|iron|ghost" iconOnly` → absorbs IconButton. Map old kinds: primary→gold, secondary→iron, tertiary→ghost. Gold = gold-leaf gradient, 1px edge #5C4012, 4px base, inner keyline.
   - `Seal kind="notary|coin"` → absorbs Emblem.
4. **Merges** — `Portrait` absorbs Avatar (size, ring); `CompanyMark id size raised` absorbs CompanyIcon + RaisedTile (gold rim); `Tabs kind="underline|switch"` absorbs ViewSwitch; `Dispatch as="toast|recap|lines"` absorbs DispatchLines/Recap/Toast; `CompanySheet mode="charter|survivor"` absorbs CharterSheet/SurvivorSheet; Tile becomes internal to Board.
5. **Screens** — restyle HomeScreen, InvestSheet, CertificateSheet/Certificate to match the spec mockups (§5). Wordmark: IRON in rivet grey, gilt italic "&", GOLD in gold gradient, all Cinzel.
6. **Cleanup** — remove old components + aliases; drop IMFellEnglishSC font from app.json/fonts.
7. **Design sync** — update .design-sync/web/index.js AND index.d.ts (hand-written!) with new names, remove old; update .design-sync/conventions.md; update previews; `node .design-sync/build-web.mjs` then `/design-sync`.

Final count: 46 → 30 public components.
