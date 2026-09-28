# Iron & Gold — how to build with it

Iron & Gold is a React Native game UI in **The Gilded Standard**: black lacquer, riveted iron, one gold and bond paper for documents. It is rendered on the web through react-native-web. Everything is on `window.IronGold`.

## The three laws

1. **Gold is earned, not sprinkled.** Gold leaf marks money, the ONE primary action per screen, and moments of wealth: charters, buyouts, the closing bell. If everything is gold, nothing is.
2. **Iron frames, lacquer holds.** The ground is black lacquer (`LACQUER`, the default theme). Iron is structure: frames, rivets, secondary controls.
3. **Paper is a document.** Bond paper appears only as things you own: share certificates, deeds, the final ledger. `BOND_THEME` exists for the system's light mode.

Square corners everywhere (`RADIUS` 0). Spacing on `SPACE`: 4 · 8 · 12 · 16 · 24 · 32. Every plate carries a gilt keyline (`KEYLINE`, inset 5).

## Setup: wrap once

Every component reads its palette from `ThemeProvider`. Sheets also need `SafeAreaProvider`. Wrap the whole design:

```jsx
const { ThemeProvider, SafeAreaProvider, Screen } = window.IronGold;
<ThemeProvider><SafeAreaProvider>
  <Screen>{/* your screen */}</Screen>
</SafeAreaProvider></ThemeProvider>
```

`ThemeProvider` gives `LACQUER` unless the system colour scheme is light (`BOND_THEME`). Fonts load from `styles.css`; nothing else to import.

## Styling idiom: React Native styles, no CSS classes

- **Layout glue:** use `RN.View`, `RN.ScrollView`, `RN.Pressable` (react-native-web) with RN style objects — camelCase, unitless numbers, `flexDirection: 'row'`, `gap`. Flex defaults to column. Don't use `div`s or class names; the app's code is React Native.
- **Colour:** never hex-code. Read the palette with `const th = useTheme()`:
  surfaces `th.ground` (page) · `th.raised` (sheets, rows, selected tabs) · `th.plate` (panels) · `th.rule` (hairlines) · `th.field` (input borders);
  text `th.ink` · `th.inkSoft` · `th.inkFaint`;
  gold roles `th.money` (money only) · `th.accent` (gilt rules, keylines, section labels) · `th.selection` (the chosen item);
  materials `th.gold.{shine,bright,leaf,deep,burnish,ink,edge}` · `th.iron.{hi,mid,lo,edge,rivet,text}` · `th.bond.{paper,vellum,ink,rule}`;
  jewels `th.jewel.lapis` (you / your turn) · `th.jewel.carnelian` / `carnelianText` (loss, errors — never red);
  `th.districts.{river,foundry,main}.{tint,accent,wash}` · `th.companies[id].{fill,ink,rim}` · `th.scrim`.
- **Text:** always `T`, never `RN.Text`. `v`: `hero` 34 (gilt) / `display` 24 / `title` 18 (Cinzel 700), `plate` 13 (Cinzel 600, always uppercase, wide tracking — labels on plates, buttons, section heads), `accent` 17 (IM Fell italic: subtitles, flavour), `body` 15 / `strong` 15 / `label` 12 / `small` 11 (Libre Franklin). Custom fonts only via `FONTS.*`.
- **Money:** always `Money`: `v="ingot"` for headline cash only (your wallet, winnings), `title` / `body` / `small` inline. `delta` signs it; negatives are carnelian. Never format dollars with plain text.
- **Surfaces:** `Plate` — `material` `lacquer` (default panel) · `iron` (structure) · `gold` (wealth moments only) · `bond` (documents only); `rivets` for iron fittings; `pad` for padding.
- **Dividers:** `Rule` — `gilt` under section titles, `hair` between list rows, `ornament` for set pieces (title screens, covers), `rail` on the map only.
- **Actions:** `Button` — `gold` (default) is the one primary per screen; `iron` for secondary; `ghost` for tertiary; `iconOnly` + `icon` + `label` for a bare 44pt icon button. `compact` when sharing a row. Icons come from `Icons.*` (lucide: Hammer, Landmark, Bell, Crown, ...). Touch targets ≥ `MIN_TARGET` (44).
- **Seals:** `Seal kind="coin"` is the Iron & Gold emblem; `Seal kind="notary" label="PWR"` stamps documents.
- **People and companies:** tycoons are always `Portrait` (`ring` for the acting or chosen one, `bot` for bots). Companies (`cw pp pw rm ae cr ft`) are always `CompanyMark` (`raised` for hero moments); names from `company(id)`.
- **Tabs:** `Tabs` underline for the Deeds / Market / Tycoons strip; `kind="switch"` with icon items for compact view switches.

## Game data

Game components (`Board`, `MarketTab`, `ExchangeView`, the sheets, ...) take a real `GameState`. Make one with the engine, don't hand-write it:

```js
const { newGame, applyAction, botAction, actorOf } = window.IronGold;
let s = newGame([{ id: 'a', name: 'Eleanor Vance', avatar: 5 }, { id: 'b', name: 'Col. Barlow', avatar: 0, bot: true }], { seed: 7 });
for (let i = 0; i < 90; i++) s = applyAction(s, actorOf(s), botAction(s)); // mid-game
```

Phase-specific sheets render only in their phase (`CompanySheet mode="charter"` 'found', `CompanySheet mode="survivor"` 'survivor', `InvestSheet` 'buy', `SettleSheet` 'dispose', `BellSheet` 'over'). Sheets and `HandoffCover` are full-screen modals. `Dispatch` takes `as="toast"` (absolutely positioned telegram), `as="recap"` or `as="lines"`.

## Where the truth lives

Per-component API and examples: `components/general/<Name>/<Name>.d.ts` and `.prompt.md`. Fonts: `fonts/fonts.css`.

## Example

```jsx
const { Plate, T, Money, Rule, Button, Icons, RN, useTheme } = window.IronGold;
function Position() {
  const th = useTheme();
  return (
    <Plate pad={20} style={{ gap: 8 }}>
      <T v="title">Your position</T>
      <T v="accent" color={th.inkSoft}>Net worth at today's prices</T>
      <Rule kind="gilt" style={{ marginVertical: 6 }} />
      <RN.View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <T>Cash on hand</T><Money amount={4200} size={16} />
      </RN.View>
      <Button title="Invest" icon={Icons.Landmark} style={{ marginTop: 12 }} />
    </Plate>
  );
}
```
