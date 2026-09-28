# Iron & Gold — how to build with it

Iron & Gold is a React Native game UI ("Engraver's Ink": paper, ink, riveted iron, gold leaf), rendered on the web through react-native-web. Everything is on `window.IronGold`.

## Setup: wrap once

Every component reads its palette from `ThemeProvider`. Without it they render with the light palette but `useTheme()` in your own code gets no provider. Sheets also need `SafeAreaProvider`. Wrap the whole design:

```jsx
const { ThemeProvider, SafeAreaProvider, Screen } = window.IronGold;
<ThemeProvider><SafeAreaProvider>
  <Screen>{/* your screen */}</Screen>
</SafeAreaProvider></ThemeProvider>
```

`ThemeProvider` follows the system colour scheme (LIGHT or DARK). Fonts load from `styles.css`; nothing else to import.

## Styling idiom: React Native styles, no CSS classes

- **Layout glue:** use `RN.View`, `RN.ScrollView`, `RN.Pressable` (react-native-web) with RN style objects — camelCase, unitless numbers, `flexDirection: 'row'`, `gap`. Flex defaults to column. Don't use `div`s or class names; the app's code is React Native.
- **Colour:** never hex-code. Read the palette with `const th = useTheme()`: `th.paper` (page), `th.ledger` (raised surface), `th.ink`, `th.inkSoft`, `th.rule` (hairlines), `th.gilt` (money, highlights, selection), `th.onInk`, `th.scrim`, `th.iron.{hi,mid,lo,rivet,text}`, `th.goldLeaf.{hi,mid,lo,ink}`, `th.districts.{river,foundry,main}.{tint,accent,wash}`, `th.companies[id].{ink,fill}`.
- **Text:** always `T`, never `RN.Text`. `v`: `display` 22 / `title` 18 (IM Fell SC), `accent` 15 (IM Fell italic, for subtitles and flavour), `body` 14 / `strong` 14 / `label` 12 / `small` 11 (Libre Franklin), `plate` 15 (Cinzel engraved caps, headings on plates and sections). Custom fonts only via `FONTS.*`.
- **Money:** `Money` inline (gold Cinzel), `Ingot` for headline cash. Never format dollars with plain text.
- **Dividers:** `DoubleRule` (rail track) under section titles; `Hairline` between list rows.
- **Surfaces:** `Card` (riveted iron frame, gilt keyline). Build custom plates with `IronFill`/`GoldFill` + `Rivets` + `Keyline` inside a `View` with `overflow: 'hidden'`.
- **Actions:** `Button` kinds `primary` (iron), `secondary` (gold leaf, celebratory/closing), `tertiary` (outline, secondary choices); `compact` when sharing a row. Icons come from `Icons.*` (lucide: Hammer, Landmark, Bell, Crown, ...). Touch targets ≥ `MIN_TARGET` (44).
- **Companies** (`cw pp pw rm ae cr ft`): always show with `CompanyIcon` (or `RaisedTile` for hero moments); names from `company(id)`.

## Game data

Game components (`Board`, `MarketTab`, `ExchangeView`, the `*Sheet`s, ...) take a real `GameState`. Make one with the engine, don't hand-write it:

```js
const { newGame, applyAction, botAction, actorOf } = window.IronGold;
let s = newGame([{ id: 'a', name: 'Eleanor Vance', avatar: 5 }, { id: 'b', name: 'Col. Barlow', avatar: 0, bot: true }], { seed: 7 });
for (let i = 0; i < 90; i++) s = applyAction(s, actorOf(s), botAction(s)); // mid-game
```

Phase-specific sheets render only in their phase (`CharterSheet` 'found', `InvestSheet` 'buy', `SurvivorSheet` 'survivor', `SettleSheet` 'dispose', `BellSheet` 'over'). Sheets and `HandoffCover` are full-screen modals.

## Where the truth lives

Per-component API and examples: `components/general/<Name>/<Name>.d.ts` and `.prompt.md`. Fonts: `fonts/fonts.css`.

## Example

```jsx
const { Card, T, Money, DoubleRule, Button, Icons, RN, useTheme } = window.IronGold;
function Position() {
  const th = useTheme();
  return (
    <Card>
      <T v="title">Your position</T>
      <T v="accent" color={th.inkSoft}>Net worth at today's prices</T>
      <DoubleRule style={{ marginVertical: 10 }} />
      <RN.View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <T>Cash on hand</T><Money amount={4200} />
      </RN.View>
      <Button title="Invest" icon={Icons.Landmark} style={{ marginTop: 12 }} />
    </Card>
  );
}
```
